'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ChevronDown, Plus } from 'lucide-react';

export default function ProjectSwitcher() {
  const { projects, activeProject, setActiveProject, createProject } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await createProject(newProjName, newProjDesc);
      setNewProjName('');
      setNewProjDesc('');
      setShowCreateModal(false);
    } catch (err) {
      alert("Error creating project: " + err.message);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 smooth-transition border border-slate-200"
      >
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {activeProject ? activeProject.name.substring(0, 2).toUpperCase() : 'PR'}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</div>
            <div className="text-sm font-bold truncate max-w-[120px]">
              {activeProject ? activeProject.name : 'Select Project'}
            </div>
          </div>
        </div>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              setActiveProject({ id: 'all', name: 'All Projects' });
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${activeProject?.id === 'all' ? 'font-bold bg-indigo-50/50 text-indigo-600' : ''
              }`}
          >
            <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              AL
            </span>
            <span className="truncate font-semibold">All Projects</span>
          </button>
          <div className="border-t border-slate-100 my-1"></div>

          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProject(proj);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${activeProject?.id === proj.id ? 'font-bold bg-indigo-50/50 text-indigo-600' : ''
                }`}
            >
              <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                {proj.name.substring(0, 2).toUpperCase()}
              </span>
              <span className="truncate">{proj.name}</span>
            </button>
          ))}
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 font-medium smooth-transition"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Create Project</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                placeholder="Project name"
                className="w-full border border-slate-200 p-2 rounded-lg mb-3 text-sm focus:outline-none focus:border-indigo-600"
                required
              />
              <textarea
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Description"
                className="w-full border border-slate-200 p-2 rounded-lg mb-4 text-sm focus:outline-none focus:border-indigo-600 h-20 resize-none"
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
