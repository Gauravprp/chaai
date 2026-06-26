import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function IncomingCallModal({ call, onAccept, onReject }) {
  // If call is not loaded yet, just show a generic message
  if (!call) return null;

  const isVideo = call.type === 'video';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Caller Avatar (Placeholder or fetched) */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 p-1 mb-6 animate-pulse">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
            <span className="text-4xl">📞</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Incoming Call
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          {isVideo ? 'Incoming Video Call...' : 'Incoming Audio Call...'}
        </p>

        <div className="flex items-center justify-center gap-8 w-full">
          <button 
            onClick={onReject}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 transition-transform group-hover:scale-110">
              <PhoneOff size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Decline</span>
          </button>

          <button 
            onClick={onAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110 animate-bounce">
              {isVideo ? <Video size={24} /> : <Phone size={24} className="fill-current" />}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accept</span>
          </button>
        </div>
        
        {/* Ringing Sound (Optional, browser autoplay policies might block it without interaction) */}
        <audio src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" autoPlay loop muted={false} className="hidden" />
      </div>
    </div>
  );
}
