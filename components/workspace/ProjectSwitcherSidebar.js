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
    <aside className="w-16 bg-[#4a154b] border-r border-[#3a0f3a] flex flex-col items-center py-4 h-full shrink-0 z-10">
      
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
        <style dangerouslySetInnerHTML={{__html: `.project-scroll-container::-webkit-scrollbar { display: none; }`}} />
        {projects.map((proj) => {
        const isActive = activeProject?.id === proj.id;
        // Generate initials
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
          <div key={proj.id} className="relative group flex items-center justify-center w-full">
            {isActive && (
              <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg"></div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setActiveProject(proj)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-white text-[#4a154b] shadow-md border-2 border-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border-2 border-transparent'
                }`}
                title={proj.name}
              >
                {initials}
              </button>
              {projectUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-[#4a154b]">
                  {projectUnreadCount > 9 ? '9+' : projectUnreadCount}
                </span>
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {proj.name}
            </div>
          </div>
        );
        })}
      </div>

      <div className="w-8 h-[1px] bg-white/20 my-4 shrink-0"></div>

      <div className="relative group flex items-center justify-center w-full">
        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border-2 border-transparent border-dashed"
          title="Add workspace"
          onClick={() => {
            // Ideally open a modal to create a project, similar to what was in WorkspaceSwitcher
            alert("Create project functionality can be triggered here.");
          }}
        >
          <Plus size={24} />
        </button>
        <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Add workspace
        </div>
      </div>
    </aside>
  );
}
