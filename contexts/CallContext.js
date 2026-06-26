'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'toastflux';
import IncomingCallModal from '@/components/calling/IncomingCallModal';
import ActiveCallUI from '@/components/calling/ActiveCallUI';
import OutgoingCallScreen from '@/components/calling/OutgoingCallScreen';

const CallContext = createContext({});

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export function CallProvider({ children }) {
  const { profile } = useAuth();
  const [callState, setCallState] = useState('idle'); // idle, ringing, calling, in-call
  const [activeCall, setActiveCall] = useState(null); // The call_history record
  const [callerProfile, setCallerProfile] = useState(null); // Details of the other person

  const {
    localStream,
    remoteStream,
    initPeerConnection,
    getMediaStream,
    attachTracks,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    cleanupWebRTC,
    sendSignal
  } = useWebRTC(profile);

  // Auto-cleanup on unload
  useEffect(() => {
    window.addEventListener('beforeunload', handleEndCall);
    return () => window.removeEventListener('beforeunload', handleEndCall);
  }, [activeCall]);

  // Listen to Call History for incoming calls
  useEffect(() => {
    if (!profile) return;

    const historySub = supabase.channel('public:call_history')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_history', filter: `receiver_id=eq.${toUUID(profile.id)}` }, async (payload) => {
        if (callState !== 'idle') {
          // Busy
          await sendSignal(payload.new.id, payload.new.caller_id, 'busy', {});
          return;
        }

        // Fetch caller info dynamically if needed, or rely on passed data
        // For simplicity, we just use the payload and wait for accept
        setActiveCall(payload.new);
        setCallState('ringing');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_history', filter: `caller_id=eq.${toUUID(profile.id)}` }, (payload) => {
         // Handle end call from remote for outgoing caller
         if (payload.new.status === 'completed' || payload.new.status === 'rejected' || payload.new.status === 'missed') {
           resetCall();
         }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_history', filter: `receiver_id=eq.${toUUID(profile.id)}` }, (payload) => {
         // Handle end call from remote for receiver
         if (payload.new.status === 'completed' || payload.new.status === 'missed') {
           resetCall();
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(historySub);
    };
  }, [profile, callState]);

  // Listen to WebRTC Signals
  useEffect(() => {
    if (!profile || !activeCall) return;

    const signalSub = supabase.channel('public:call_signals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals', filter: `receiver_id=eq.${toUUID(profile.id)}` }, async (payload) => {
        const signal = payload.new;
        if (signal.call_id !== activeCall.id) return;

        try {
          switch (signal.type) {
            case 'offer':
              await handleIncomingOffer(signal.payload, signal.sender_id);
              break;
            case 'answer':
              await handleAnswer(signal.payload);
              break;
            case 'ice_candidate':
              await handleIceCandidate(signal.payload);
              break;
            case 'reject':
              setCallState('idle');
              resetCall();
              break;
            case 'busy':
              setCallState('idle');
              resetCall();
              break;
            case 'end':
              resetCall();
              break;
            case 'accept':
              setCallState('in-call');
              break;
          }
        } catch (err) {
          console.error("Error handling signal", err);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(signalSub);
    };
  }, [profile, activeCall, localStream]);

  const handleIncomingOffer = async (offer, callerId) => {
    // Only answer if we accepted the call
    // When the user clicks Accept, we initialize PC, get stream, attach tracks, and then wait for offer?
    // Usually Offer comes immediately after Accept, or Offer comes first and we store it.
    // For this flow: Caller creates Call -> Caller sends Offer -> Receiver Rings.
    // If Receiver accepts, they create Answer.
    const pc = initPeerConnection();
    if (localStream) {
      attachTracks(pc, localStream);
    }
    await createAnswer(activeCall.id, callerId, offer);
    setCallState('in-call');
  };

  const startCall = async (receiver, type) => {
    try {
      const stream = await getMediaStream(type);
      setCallState('calling');
      setCallerProfile(receiver);

      // 1. Create history record
      const { data: callData, error } = await supabase.from('call_history').insert({
        caller_id: toUUID(profile.id),
        receiver_id: toUUID(receiver.id),
        type,
        status: 'ongoing'
      }).select('*').single();

      if (error) throw error;
      setActiveCall(callData);

      // 2. Initialize PC and create Offer
      const pc = initPeerConnection();
      attachTracks(pc, stream);
      await createOffer(callData.id, receiver.id);

    } catch (err) {
      console.error("Failed to start call", err);
      toast.error(err?.message || 'Failed to start the call.');
      resetCall();
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await getMediaStream(activeCall.type);
      await sendSignal(activeCall.id, activeCall.caller_id, 'accept', {});
      setCallState('in-call');
      // The offer might have already arrived and been queued, or will arrive shortly.
      // We rely on the signal listener to process the offer and send the answer.
    } catch (err) {
      console.error("Failed to accept call", err);
      toast.error(err?.message || 'Failed to accept the call.');
      rejectCall();
    }
  };

  const rejectCall = async () => {
    if (activeCall) {
      await sendSignal(activeCall.id, activeCall.caller_id, 'reject', {});
      await supabase.from('call_history').update({ status: 'rejected' }).eq('id', activeCall.id);
    }
    resetCall();
  };

  const handleEndCall = async () => {
    if (activeCall) {
      const otherUser = activeCall.caller_id === toUUID(profile?.id) ? activeCall.receiver_id : activeCall.caller_id;
      await sendSignal(activeCall.id, otherUser, 'end', {});
      await supabase.from('call_history').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', activeCall.id);
    }
    resetCall();
  };

  const resetCall = () => {
    cleanupWebRTC();
    setCallState('idle');
    setActiveCall(null);
    setCallerProfile(null);
  };

  return (
    <CallContext.Provider value={{
      callState,
      activeCall,
      callerProfile,
      localStream,
      remoteStream,
      startCall,
      acceptCall,
      rejectCall,
      endCall: handleEndCall
    }}>
      {children}
      
      {/* Call Overlays */}
      {callState === 'ringing' && <IncomingCallModal onAccept={acceptCall} onReject={rejectCall} call={activeCall} />}
      {callState === 'calling' && <OutgoingCallScreen onCancel={handleEndCall} receiver={callerProfile} />}
      {callState === 'in-call' && <ActiveCallUI localStream={localStream} remoteStream={remoteStream} onEndCall={handleEndCall} />}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);
