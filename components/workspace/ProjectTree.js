'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Folder, Plus, Hash } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';
import CreateGroupModal from './CreateGroupModal';
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
    activeProject,
    channels,
    activeChannel,
    setActiveChannel,
    getOrCreateDMChannel,
    createCustomGroup,
    directChatSummary,
    isFetchingTasks,
  } = useWorkspace();
  const { user } = useAuth();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleMemberClick = async (memberId) => {
    await getOrCreateDMChannel(memberId);
    onSelectView('chat');
  };

  // Sort members by last message timestamp in directChatSummary (newest on top)
  const projectMembers = members.filter(m =>
    !activeProject?.employees ||
    activeProject?.employees?.includes(m.id) ||
    activeProject?.id === 'all' ||
    activeProject?.id === 'prp-webs-default'
  );

  const sortedMembers = [...projectMembers].sort((a, b) => {
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

  // Safely find the project group chat
  const groupChannel = channels.find(c => c.name === 'general');
  const customGroups = channels.filter(c => c.name !== 'general' && !c.name?.startsWith('dm_') && !c.name?.startsWith('dm-'));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto py-4 px-2 space-y-4">
          {/* 0. Group Chat Section */}
          {groupChannel && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveChannel(groupChannel);
                  onSelectView('chat');
                }}
                className={`relative w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-sm group transition-colors duration-200 ${activeChannel?.id === groupChannel.id ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
              >
                {activeChannel?.id === groupChannel.id && (
                  <div
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all duration-300"
                  />
                )}
                <div className="relative shrink-0 z-10">
                  <img
                    src={activeProject?.avatar_url || generateAvatar(activeProject?.name || 'Project')}
                    alt={activeProject?.name || 'Project Group Chat'}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{activeProject?.name || 'Project'} Group Chat</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span>All Project Members</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Custom Groups Section */}
          {customGroups.length > 0 && (
            <div className="space-y-1 mt-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder size={12} />
                  Groups
                </span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {customGroups.length}
                </span>
              </div>
              {customGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveChannel(group);
                    onSelectView('chat');
                  }}
                  className={`relative w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-sm group transition-colors duration-200 ${activeChannel?.id === group.id ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                >
                  {activeChannel?.id === group.id && (
                    <div
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all duration-300"
                    />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 z-10 border border-indigo-100/50">
                    <Hash size={14} className="text-indigo-500" />
                  </div>
                  <div className="truncate flex-1 z-10">
                    <span className="truncate font-medium">{group.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}



      {/* 1. Employees Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 mt-4">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            <span>Members</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Create new group chat"
            >
              <Plus size={12} strokeWidth={3} />
              <span className="text-[10px] font-bold">Group</span>
            </button>
            <span className="text-[10px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
              {sortedMembers.length}
            </span>
          </div>
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
                className={`relative w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-sm group transition-colors duration-200 ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
              >
                {isSelected && (
                  <div
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all duration-300"
                  />
                )}
                <div className="relative shrink-0 z-10">
                  <img
                    src={member.avatar_url || generateAvatar(member.name || 'User')}
                    alt={member.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  {(() => {
                    const isOnline = member.id.toString().charCodeAt(0) % 2 === 0 || member.name.includes("Rahul") || member.name.includes("Gaurav");
                    return (
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    );
                  })()}
                </div>
                <div className="truncate flex-1 z-10">
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium'}`}>{member.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    {lastMsg || unreadCount > 0 ? (
                      <span className={`truncate ${unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-slate-500'}`}>
                        {unreadCount > 0
                          ? (unreadCount > 4 ? '4+ new messages' : (unreadCount === 1 ? '1 new message' : `${unreadCount} new messages`))
                          : (lastMsg ? lastMsg.content : '')
                        }
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

      {showCreateGroup && (
        <CreateGroupModal
          members={projectMembers}
          currentUser={user}
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (name, selectedMembers) => {
            await createCustomGroup(name, selectedMembers);
            setShowCreateGroup(false);
            onSelectView('chat');
          }}
        />
      )}
    </div>
  );
}
