import React from 'react';
import { PhoneOff } from 'lucide-react';

export default function OutgoingCallScreen({ receiver, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        
        <div className="relative mb-8">
          {/* Avatar Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-ping" style={{ animationDelay: '150ms' }}></div>
          
          <img 
            src={receiver?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${receiver?.name || 'User'}`} 
            alt="Receiver" 
            className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-slate-800 shadow-2xl"
          />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{receiver?.name || 'Unknown User'}</h2>
        <p className="text-emerald-400 font-medium tracking-wide mb-12 animate-pulse">Calling...</p>

        <button 
          onClick={onCancel}
          className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 transition-transform hover:scale-110"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
}
