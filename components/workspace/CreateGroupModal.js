'use client';
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';

export default function CreateGroupModal({ members, currentUser, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Filter out current user from the list as they are implicitly added
  const availableMembers = members.filter(m => m.id !== currentUser?.id);

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(mId => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    onCreate(groupName.trim(), selectedMembers);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create Group Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Design Team, Marketing Sync..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Members</label>
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
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
