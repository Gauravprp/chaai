'use client';

import React, { useState } from 'react';
import ProjectTree from './ProjectTree';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LogOut, Settings, User } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';

export default function Sidebar({ currentView, onSelectView }) {
  const { profile, logout, updateProfile } = useAuth();
  const { activeProject } = useWorkspace();
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [role, setRole] = useState(profile?.role || '');
  const [department, setDepartment] = useState(profile?.department || '');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, role, department });
      setShowSettings(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-[#4a154b] text-white">
        <h2 className="text-lg font-bold truncate">{activeProject?.name || 'Project'}</h2>
      </div>

      {/* Main Navigation Project Tree */}
      <ProjectTree onSelectView={onSelectView} />

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-2">
        <button
          onClick={() => {
            setName(profile?.name || '');
            setRole(profile?.role || '');
            setDepartment(profile?.department || '');
            setShowSettings(true);
          }}
          className="flex items-center gap-2 text-left hover:bg-slate-50 p-1.5 rounded-lg flex-1 truncate smooth-transition"
        >
          <img
            src={profile?.avatar_url || generateAvatar(profile?.name || 'User')}
            alt="Profile Avatar"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-800 truncate">{profile?.name || 'User'}</div>
            <div className="text-[10px] text-slate-400 truncate">{profile?.role || 'Member'}</div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg smooth-transition"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg smooth-transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-indigo-600" />
              <h3 className="text-lg font-bold">Edit Profile</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Role / Job Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2 text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
