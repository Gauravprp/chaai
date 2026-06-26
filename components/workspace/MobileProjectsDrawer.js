import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { X, Folder, Plus } from 'lucide-react';

export default function MobileProjectsDrawer({ isOpen, onClose }) {
  const [render, setRender] = useState(isOpen);
  const { projects, activeProject, setActiveProject, directChatSummary } = useWorkspace();

  const toUUID = (str) => {
    if (!str) return '00000000-0000-0000-0000-000000000000';
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;
    const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
    const padded = clean.padEnd(32, '0').slice(0, 32);
    return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
  };

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  return (
    render ? (
        <>
          <div
            onClick={onClose}
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            onTransitionEnd={onAnimationEnd}
            className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-[70] md:hidden flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Projects</h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-safe p-4 space-y-2">
              {projects.map(proj => {
                const isActive = activeProject?.id === proj.id;
                
                const projectUnreadCount = proj.employees?.reduce((sum, empId) => {
                  const summary = directChatSummary?.[toUUID(empId)];
                  return sum + (summary?.unreadCount || 0);
                }, 0) || 0;

                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-primary-50 border border-primary-200 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Folder size={20} />
                      </div>
                      <div className="flex flex-col items-start truncate">
                        <span className={`font-semibold truncate ${isActive ? 'text-primary-900' : 'text-slate-700'}`}>
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {proj.description || 'No description'}
                        </span>
                      </div>
                    </div>
                    
                    {projectUnreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold min-w-[20px] px-1.5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm ml-2">
                        {projectUnreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  alert("Create project functionality can be triggered here.");
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 mt-4 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                  <Plus size={20} />
                </div>
                <span className="font-medium">Add New Project</span>
              </button>
            </div>
          </div>
        </>
    ) : null
  );
}
