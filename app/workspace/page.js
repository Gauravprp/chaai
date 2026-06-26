'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/workspace/Sidebar';
import ProjectSwitcherSidebar from '@/components/workspace/ProjectSwitcherSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import TaskBoard from '@/components/tasks/TaskBoard';
import LeaveManager from '@/components/leaves/LeaveManager';
import SearchBar from '@/components/workspace/SearchBar';
import BottomNav from '@/components/workspace/BottomNav';
import MobileProjectsDrawer from '@/components/workspace/MobileProjectsDrawer';
import ProjectTree from '@/components/workspace/ProjectTree';
import ProfileModal from '@/components/workspace/ProfileModal';
import { Bell, Compass, FileText, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateAvatar } from '@/utils/avatar';

const getTaskBadgeColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('not started') || s.includes('not_started')) return "bg-rose-50 text-rose-700 border-rose-200";
  if (s.includes('in progress') || s.includes('in_progress')) return "bg-blue-50 text-blue-700 border-blue-200";
  if (s.includes('pending')) return "bg-slate-50 text-slate-600 border-slate-200";
  if (s.includes('block')) return "bg-orange-50 text-orange-700 border-orange-200";
  if (s.includes('review') || s.includes('hold')) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

function GlobalTaskCounts() {
  const { user, profile } = useAuth();
  const { activeProject } = useWorkspace();
  const [counts, setCounts] = useState({});
  const [tasksByStatus, setTasksByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [projectFilterActive, setProjectFilterActive] = useState(false);

  // The fixed list of statuses to always display, plus any dynamic ones found
  const STANDARD_STATUSES = ['Not Started Yet', 'Pending', 'In Progress', 'Blocked'];

  useEffect(() => {
    const fetchCounts = async () => {
      const employeeId = user?.dyzoId?.toString() || profile?.id?.toString() || '';
      const companyId = user?.companyId?.toString() || '1';
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/tasks/counts?employeeId=${employeeId}&companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.counts) {
            setCounts(data.counts);
            setTasksByStatus(data.tasksByStatus || {});

            // Set first standard status as active tab
            setActiveTab(STANDARD_STATUSES[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch global tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCounts();
    }
  }, [user, profile]);

  const filteredTasksByStatus = useMemo(() => {
    if (!projectFilterActive || !activeProject || activeProject.id === 'all') {
      return tasksByStatus;
    }
    const filtered = {};
    for (const status in tasksByStatus) {
      filtered[status] = tasksByStatus[status].filter(t => t.project_id?.toString() === activeProject.id?.toString());
    }
    return filtered;
  }, [tasksByStatus, projectFilterActive, activeProject]);

  const filteredCounts = useMemo(() => {
    const newCounts = {};
    for (const status in filteredTasksByStatus) {
      newCounts[status] = filteredTasksByStatus[status].length;
    }
    return newCounts;
  }, [filteredTasksByStatus]);

  if (loading) {
    return <div className="hidden md:flex gap-2"><div className="animate-pulse h-8 w-24 bg-slate-200 rounded-full"></div></div>;
  }


  // Combine standard statuses with any other unexpected statuses that might exist in the data
  const allStatusesFound = Object.keys(filteredCounts);
  const displayStatuses = Array.from(new Set([...STANDARD_STATUSES, ...allStatusesFound]))
    .filter(status => !['completed', 'done', 'complete', 'archived'].includes(status.toLowerCase()));

  const currentTabTasks = filteredTasksByStatus[activeTab] || [];

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  return (
    <div className="md:relative z-[60]">
      {/* Mobile: Floating WhatsApp-like FAB | Desktop: Normal Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:static flex items-center justify-center gap-2 w-14 h-14 md:w-auto md:h-auto md:px-4 md:py-2 rounded-full md:rounded-xl bg-indigo-600 md:bg-white text-white md:text-slate-700 border-none md:border md:border-slate-200 shadow-xl md:shadow-sm hover:bg-indigo-700 md:hover:bg-slate-50 md:hover:border-indigo-300 md:hover:text-indigo-700 transition-all font-semibold text-sm z-[60]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle md:w-4 md:h-4 md:text-indigo-600 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
        <span className="hidden md:inline">My Tasks</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`hidden md:block transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop to close when clicking outside & blur background */}
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[65] md:hidden transition-opacity" onClick={() => setIsOpen(false)} />

          {/* Popup Container: Centered Modal on Mobile | Dropdown on Desktop */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:absolute md:top-full md:left-0 md:transform-none md:mt-2 md:w-[420px] md:inset-auto bg-white border border-slate-200 rounded-2xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] md:max-h-[500px] z-[70]">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-slate-100 bg-slate-50 shrink-0">
              {displayStatuses.map(status => {
                const count = filteredCounts[status] || 0;
                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === status
                        ? 'bg-white shadow-sm text-indigo-700 border border-slate-200 ring-1 ring-slate-100'
                        : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200 hover:text-slate-700'
                      }`}
                  >
                    {status} <span className={`ml-1 ${count > 0 ? 'opacity-80' : 'opacity-40'}`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Project Filter Checkbox */}
            {activeProject && activeProject.id !== 'all' && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
                <input 
                  type="checkbox" 
                  id="projectFilter" 
                  checked={projectFilterActive} 
                  onChange={(e) => setProjectFilterActive(e.target.checked)} 
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 cursor-pointer"
                />
                <label htmlFor="projectFilter" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Show tasks only for <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1">{activeProject.name}</span>
                </label>
              </div>
            )}
            
            {/* List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-white">
              {currentTabTasks.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">No tasks</div>
                  <div className="text-xs text-slate-500 mt-1">You don't have any tasks in this status.</div>
                </div>
              ) : (
                currentTabTasks.map(task => {
                  const employeeId = user?.dyzoId?.toString() || profile?.id?.toString() || '';
                  const cleanDesc = stripHtml(task.description);
                  return (
                    <a
                      key={task.id}
                      href={`https://dyzo.ai/tasks?userId=${employeeId}&taskId=${task.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="block p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-indigo-500 shrink-0 mt-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                      </div>
                      {cleanDesc && (
                        <div className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{cleanDesc}</div>
                      )}
                    </a>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    activeWorkspace,
    activeProject,
    notifications,
    setNotifications,
    activeChannel,
    tasks,
    members,
    overallTaskCounts,
    isFetchingTaskCounts
  } = useWorkspace();
  const router = useRouter();

  const currentMember = members?.find(m => m.id?.toString() === user?.dyzoId?.toString() || m.id?.toString() === profile?.id?.toString());
  const userIdStr = user?.dyzoId?.toString() || profile?.id?.toString() || '';

  const myTasks = tasks?.filter(t => {
    if (!t.assignee_id) return true; // Keep if we couldn't determine the assignee
    const assigneeStr = t.assignee_id.toString();
    return assigneeStr === currentMember?.id?.toString() || assigneeStr === userIdStr;
  }) || [];

  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'tasks', 'leaves', 'search', 'profile'
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTasksPopup, setShowTasksPopup] = useState(false);
  const [isProjectsDrawerOpen, setIsProjectsDrawerOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      {/* Mobile Drawer */}
      <MobileProjectsDrawer
        isOpen={isProjectsDrawerOpen}
        onClose={() => setIsProjectsDrawerOpen(false)}
      />

      {/* Project Switcher Sidebar (Slack workspaces style) */}
      <div className="hidden md:flex">
        <ProjectSwitcherSidebar />
      </div>

      {/* Sidebar Navigation */}
      <div className="hidden md:flex">
        <Sidebar currentView={currentView} onSelectView={setCurrentView} />
      </div>

      {/* Main Screen Layout Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Workspace Shell Topbar Header */}
        <header className="relative h-14 border-b border-slate-200 bg-white px-3 md:px-6 flex items-center justify-between shrink-0 z-50 gap-2">
          {/* Left: Project Switcher (Mobile) + Global Task Counts */}
          <div className="flex items-center gap-2 shrink-0 relative">
            <div className="md:hidden flex items-center shrink-0">
              <button onClick={() => setIsProjectsDrawerOpen(true)} className="flex items-center gap-1 font-bold text-slate-800 text-sm bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <span className="truncate max-w-[80px]">{activeProject?.name || 'Projects'}</span>
                <ChevronDown size={14} className="text-slate-500 shrink-0" />
              </button>
            </div>

            {/* Global Task Counts (Mobile & Desktop) */}
            <div className="flex items-center">
              <GlobalTaskCounts />
            </div>
          </div>

          {/* Center: SearchBar (Mobile & Desktop) */}
          <div className="flex-1 flex items-center justify-center min-w-0 px-1 md:px-4">
            <div className="w-full max-w-md">
              <SearchBar onSelectView={setCurrentView} />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Notification trigger button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg smooth-transition relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
              )}
            </button>

            {/* Profile Icon (Mobile & Desktop) */}
            <button onClick={() => setShowProfileModal(true)} className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <img src={profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || generateAvatar(profile?.name || user?.email || 'User')} alt="Profile" className="w-full h-full object-cover bg-slate-50" />
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
                      className={`p-3 border-b border-slate-50 text-xs flex items-start gap-2.5 hover:bg-slate-50/50 smooth-transition ${!notif.read ? 'bg-indigo-50/10 font-semibold' : ''
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
        <div className="flex-1 overflow-hidden relative">
          {/* Mobile Routing Logic for Chat: Show ProjectTree if no active channel, else ChatWindow */}
          {currentView === 'chat' && (
            <>
              {/* Desktop rendering: Always show ChatWindow (it handles its own dummy state) */}
              <div className="hidden md:flex h-full w-full">
                <ChatWindow />
              </div>

              {/* Mobile rendering: Swap between ChatList and ChatWindow */}
              <div className="md:hidden flex flex-col h-full w-full">
                {activeChannel ? (
                  <ChatWindow />
                ) : (
                  <div className="flex-1 bg-white overflow-hidden flex flex-col">
                    <ProjectTree onSelectView={setCurrentView} />
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'tasks' && <TaskBoard />}
          {currentView === 'leaves' && <LeaveManager />}
          {currentView === 'search' && (
            <div className="p-4 md:hidden flex flex-col gap-4">
              <h2 className="text-xl font-bold">Search</h2>
              <div className="relative">
                <SearchBar onSelectView={setCurrentView} autoFocus />
              </div>
            </div>
          )}
        </div>

        {/* Desktop only BottomNav placeholder if needed, or remove completely. Hidden on mobile. */}
        <div className="hidden md:block">
          {/* <BottomNav /> */}
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
