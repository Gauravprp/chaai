'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/workspace/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import TaskBoard from '@/components/tasks/TaskBoard';
import LeaveManager from '@/components/leaves/LeaveManager';
import SearchBar from '@/components/workspace/SearchBar';
import { Bell, Compass, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function WorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const { activeWorkspace, activeProject, notifications, setNotifications } = useWorkspace();
  const router = useRouter();

  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'tasks', 'leaves'
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const markAllRead = async () => {
    if (!activeWorkspace || !user) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', user.id);
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Compass className="animate-spin text-indigo-600" size={32} />
        <span className="text-sm font-semibold text-slate-500">Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onSelectView={setCurrentView} />

      {/* Main Screen Layout Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workspace Shell Topbar Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{activeWorkspace?.name || 'Workspace'}</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-500">{activeProject?.name || 'Loading project...'}</span>
          </div>

          {/* Global prioritized search */}
          <SearchBar onSelectView={setCurrentView} />

          <div className="flex items-center gap-4 relative">
            {/* Notification trigger button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg smooth-transition relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Panel Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b border-slate-50 text-xs flex items-start gap-2.5 hover:bg-slate-50/50 smooth-transition ${
                        !notif.read ? 'bg-indigo-50/10 font-semibold' : ''
                      }`}
                    >
                      <div className="mt-0.5 text-indigo-600">
                        {notif.type === 'task' ? <CheckCircle size={14} /> : <FileText size={14} />}
                      </div>
                      <div>
                        <div className="text-slate-800">{notif.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{notif.content}</div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 italic">No notifications yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* View Grid Switcher */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'chat' && <ChatWindow />}
          {currentView === 'tasks' && <TaskBoard />}
          {currentView === 'leaves' && <LeaveManager />}
        </div>
      </div>
    </div>
  );
}
