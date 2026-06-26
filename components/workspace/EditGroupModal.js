'use client';
import React, { useState, useRef } from 'react';
import { X, Check, Camera } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';

export default function EditGroupModal({ channel, members, currentUser, onClose, onSave }) {
  const [groupName, setGroupName] = useState(channel?.name || '');
  // Extract initial members if we have them (this would require conversation_members)
  // For now, we'll start with just current members or all available members. 
  // Normally you'd pass `channelMembers` array. Assuming we pass it or just let them select.
  // We'll just default to empty if not provided.
  const initialMembers = channel?.memberIds || [];
  const [selectedMembers, setSelectedMembers] = useState(initialMembers);
  const [groupAvatar, setGroupAvatar] = useState(channel?.avatar_url || '');
  const fileInputRef = useRef(null);

  const availableMembers = members.filter(m => m.id !== currentUser?.id);

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(mId => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSave(groupName.trim(), selectedMembers, groupAvatar);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to object URL for immediate preview.
    // In a real app, you would upload this to Supabase Storage and get a public URL.
    const url = URL.createObjectURL(file);
    setGroupAvatar(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Group Icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={groupAvatar || generateAvatar(groupName || 'Group')} 
                  alt="Group Icon"
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700 shadow-sm transition-opacity group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">Change Icon</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Design Team, Marketing Sync..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Add / Remove Members</label>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  {selectedMembers.length} selected
                </span>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {availableMembers.map(member => {
                  const isSelected = selectedMembers.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' 
                          : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar_url || generateAvatar(member.name || 'User')} 
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                        />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{member.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{member.role || 'Member'}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700'
                      }`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
                {availableMembers.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 italic">No other members in this project.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
