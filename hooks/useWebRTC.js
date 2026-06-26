'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Google STUN servers for WebRTC
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Deterministic UUID converter (matching existing project style)
const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export function useWebRTC(currentUser) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);

  // Initialize WebRTC PeerConnection
  const initPeerConnection = useCallback(() => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;

    // Handle remote tracks
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  }, []);

  // Get User Media (Camera/Mic)
  const getMediaStream = async (type) => {
    const constraints = type === 'video' ? { video: true, audio: true } : { video: false, audio: true };

    if (typeof navigator === 'undefined') {
      const err = new Error('Media devices are unavailable: navigator is undefined.');
      console.error(err);
      throw err;
    }

    const mediaDevices = navigator.mediaDevices;
    const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
    const getUserMedia = mediaDevices?.getUserMedia?.bind(mediaDevices)
      || navigator.webkitGetUserMedia?.bind(navigator)
      || navigator.mozGetUserMedia?.bind(navigator)
      || navigator.msGetUserMedia?.bind(navigator);

    if (!getUserMedia) {
      const err = new Error(
        'getUserMedia is not supported in this browser or context. Ensure this app is loaded over HTTPS or localhost, and that the browser allows camera/microphone access.'
      );
      console.error(err, { isSecureContext, isLocalhost, mediaDevices });
      throw err;
    }

    try {
      const stream = await getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      throw err;
    }
  };

  // Attach local tracks to PC
  const attachTracks = (pc, stream) => {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
  };

  // Send Signal to Supabase
  const sendSignal = async (callId, receiverId, type, payload) => {
    if (!currentUser || !callId) return;
    await supabase.from('call_signals').insert({
      call_id: callId,
      sender_id: toUUID(currentUser.id),
      receiver_id: toUUID(receiverId),
      type,
      payload
    });
  };

  // Create Offer
  const createOffer = async (callId, receiverId) => {
    const pc = peerConnection.current;
    if (!pc) return;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(callId, receiverId, 'ice_candidate', event.candidate);
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal(callId, receiverId, 'offer', offer);
  };

  // Create Answer
  const createAnswer = async (callId, callerId, offer) => {
    const pc = peerConnection.current;
    if (!pc) return;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(callId, callerId, 'ice_candidate', event.candidate);
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await sendSignal(callId, callerId, 'answer', answer);
  };

  // Handle Answer
  const handleAnswer = async (answer) => {
    const pc = peerConnection.current;
    if (pc && pc.signalingState !== 'stable') {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  // Handle ICE Candidate
  const handleIceCandidate = async (candidate) => {
    const pc = peerConnection.current;
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('Error adding ICE candidate', err);
      }
    }
  };

  // Cleanup WebRTC
  const cleanupWebRTC = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  }, [localStream]);

  return {
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
  };
}
