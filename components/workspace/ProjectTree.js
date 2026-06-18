'use client';

import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Users, Folder } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';
const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export default function ProjectTree({ onSelectView }) {
  const {
    members,
    activeChannel,
    getOrCreateDMChannel,
    directChatSummary,
  } = useWorkspace();

  const handleMemberClick = async (memberId) => {
    await getOrCreateDMChannel(memberId);
    onSelectView('chat');
  };

  // Sort members by last message timestamp in directChatSummary (newest on top)
  const getSortedMembers = () => {
    return [...members].sort((a, b) => {
      const uuidA = toUUID(a.id);
      const uuidB = toUUID(b.id);
      const summaryA = directChatSummary?.[uuidA];
      const summaryB = directChatSummary?.[uuidB];
      
      const timeA = summaryA?.lastMessage?.created_at ? new Date(summaryA.lastMessage.created_at).getTime() : 0;
      const timeB = summaryB?.lastMessage?.created_at ? new Date(summaryB.lastMessage.created_at).getTime() : 0;
      
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      
      // Fallback to alphabetical sorting of names
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  const sortedMembers = getSortedMembers();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto py-4 px-2 space-y-4">
      {/* 1. Employees Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            <span>Employees Chat</span>
          </span>
          <span className="text-[10px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
            {sortedMembers.length}
          </span>
        </div>

        <div className="space-y-1 overflow-y-auto flex-1 pr-1 mt-2">
          {sortedMembers.map((member) => {
            const memberUuid = toUUID(member.id);
            const isSelected = activeChannel?.name?.startsWith('dm_') && activeChannel.name.includes(memberUuid);
            const summary = directChatSummary?.[memberUuid];
            const unreadCount = summary?.unreadCount || 0;
            const lastMsg = summary?.lastMessage;

            return (
              <button
                key={member.id}
                onClick={() => handleMemberClick(member.id)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-sm ${
                  isSelected ? 'bg-indigo-50/60 text-indigo-600 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                } smooth-transition`}
              >
                <div className="relative shrink-0">
                  <img
                    src={member.avatar_url || generateAvatar(member.name || 'User')}
                    alt={member.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{member.name}</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-4 text-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    {lastMsg || unreadCount > 0 ? (
                      <span className="text-slate-500 truncate font-normal">
                        {unreadCount <= 1 ? (lastMsg ? lastMsg.content : '') : unreadCount > 4 ? '4+ new messages' : `${unreadCount} new messages`}
                      </span>
                    ) : (
                      <>
                        <span>{member.role || 'Member'}</span>
                        <span>•</span>
                        <span>{member.department || 'Tech'}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {sortedMembers.length === 0 && (
            <div className="text-xs text-slate-400 italic px-2 py-2">No employees found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
