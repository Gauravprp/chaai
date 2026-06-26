'use client';

import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Plus } from 'lucide-react';

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export default function ProjectSwitcherSidebar() {
  const { projects, activeProject, setActiveProject, directChatSummary } = useWorkspace();

  return (
    <aside className="w-[72px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-5 h-full shrink-0 z-20 relative">

      {/* Scrollable Container with Fade-out */}
      <div
        className="project-scroll-container flex flex-col items-center gap-4 w-full overflow-y-auto shrink-0 pb-8 pt-2"
        style={{
          maxHeight: '430px', /* ~6-7 items */
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `.project-scroll-container::-webkit-scrollbar { display: none; }` }} />
        {projects.map((proj) => {
          const isActive = activeProject?.id === proj.id;
          const initials = proj.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          const projectUnreadCount = proj.employees?.reduce((sum, empId) => {
            const summary = directChatSummary?.[toUUID(empId)];
            return sum + (summary?.unreadCount || 0);
          }, 0) || 0;

          return (
            <div key={proj.id} className="relative group flex items-center justify-center w-full mt-2">
              {isActive && (
                <div className="absolute left-0 w-1 h-10 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
              )}

              <div className="relative">
                <button
                  onClick={() => setActiveProject(proj)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 overflow-hidden ${isActive
                    ? 'bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/30 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105 border border-slate-700/50'
                    }`}
                  title={proj.name}
                >
                  {initials}
                </button>
                {projectUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold min-w-[20px] px-1 h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-sm">
                    {projectUnreadCount}
                  </span>
                )}
              </div>
              <div className="absolute left-[80px] px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-200 border border-slate-700">
                {proj.name}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-8 h-[1px] bg-slate-800 my-4 shrink-0"></div>

      <div className="relative group flex items-center justify-center w-full">
        <button
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-slate-800 text-slate-400 hover:bg-primary-500/20 hover:text-primary-400 border border-slate-700/50 hover:border-primary-500/50"
          title="Add workspace"
          onClick={() => {
            alert("Create project functionality can be triggered here.");
          }}
        >
          <Plus size={24} />
        </button>
        <div className="absolute left-[80px] px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-200 border border-slate-700">
          Add workspace
        </div>
      </div>
    </aside>
  );
}
