import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function ActiveCallUI({ localStream, remoteStream, onEndCall }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [duration, setDuration] = useState(0);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStream.getAudioTracks()[0]?.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(localStream.getVideoTracks()[0]?.enabled);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white font-medium tracking-wide">Secure Call</div>
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-emerald-400 font-mono text-sm shadow-inner">
          {formatTime(duration)}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Remote Video (Full Screen) */}
        {remoteStream ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/50 text-lg animate-pulse">Connecting to peer...</div>
        )}

        {/* Local Video (PiP) */}
        <div className="absolute bottom-28 right-6 w-28 h-40 md:w-48 md:h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-20 transition-transform hover:scale-105">
          {localStream ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
          ) : null}
          {!isVideoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
              <VideoOff size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center gap-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
        <button 
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-800/80 text-white hover:bg-slate-700'} backdrop-blur-md shadow-lg`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 transition-transform hover:scale-110"
        >
          <PhoneOff size={28} />
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isVideoEnabled ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-800/80 text-white hover:bg-slate-700'} backdrop-blur-md shadow-lg`}
        >
          {!isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
      </div>

    </div>
  );
}
