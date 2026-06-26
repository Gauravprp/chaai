'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Search, Folder, User, MessageSquare } from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';

export default function SearchBar({ onSelectView }) {
  const { projects, members, messages, setActiveProject, getOrCreateDMChannel } = useWorkspace();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ projects: [], employees: [], chats: [] });
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], employees: [], chats: [] });
      return;
    }

    const q = query.toLowerCase();

    // 1. Search projects (first priority)
    const matchingProjects = projects.filter(
      p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );

    // 2. Search employees (second priority)
    const matchingEmployees = members.filter(
      m => m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.department?.toLowerCase().includes(q)
    );

    // 3. Search chats (third priority)
    const matchingChats = messages.filter(
      msg => msg.message_type === 'text' && msg.content?.toLowerCase().includes(q)
    );

    setResults({
      projects: matchingProjects,
      employees: matchingEmployees,
      chats: matchingChats,
    });
  }, [query, projects, members, messages]);

  const handleSelectProject = (proj) => {
    setActiveProject(proj);
    if (onSelectView) onSelectView('chat');
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectEmployee = async (emp) => {
    await getOrCreateDMChannel(emp.id);
    if (onSelectView) onSelectView('chat');
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = results.projects.length > 0 || results.employees.length > 0 || results.chats.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg z-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search projects, users, chat..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-96 overflow-y-auto p-2 space-y-3 z-50">
          {/* Projects (First Priority) */}
          {results.projects.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Projects</div>
              {results.projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="p-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-500 shrink-0">
                    <Folder size={14} />
                  </div>
                  <span className="truncate font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Employees (Second Priority) */}
          {results.employees.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Employees</div>
              {results.employees.map(e => (
                <button
                  key={e.id}
                  onClick={() => handleSelectEmployee(e)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {e.avatar_url ? (
                    <img src={e.avatar_url} alt={e.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600" />
                  ) : (
                    <img src={generateAvatar(e.name || 'User')} alt={e.name} className="w-8 h-8 rounded-full shrink-0 border border-slate-200 dark:border-slate-600" />
                  )}
                  <div className="truncate flex flex-col">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{e.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chats (Third Priority) */}
          {results.chats.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Messages</div>
              {results.chats.map(c => (
                <div
                  key={c.id}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                >
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500 shrink-0 mt-0.5">
                    <MessageSquare size={14} />
                  </div>
                  <div className="truncate flex flex-col">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{c.profiles?.name || 'User'}</div>
                    <div className="truncate text-slate-500 dark:text-slate-400 italic text-[11px]">"{c.content}"</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasResults && (
            <div className="p-4 text-center text-xs text-slate-400 italic">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
