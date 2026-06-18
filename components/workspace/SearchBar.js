'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Search, Folder, User, MessageSquare } from 'lucide-react';

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
    <div ref={containerRef} className="relative w-80 max-w-xs z-50">
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
          className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 smooth-transition"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Projects (First Priority) */}
          {results.projects.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Projects</div>
              {results.projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-left text-xs text-slate-700 smooth-transition"
                >
                  <Folder size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Employees (Second Priority) */}
          {results.employees.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Employees</div>
              {results.employees.map(e => (
                <button
                  key={e.id}
                  onClick={() => handleSelectEmployee(e)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-left text-xs text-slate-700 smooth-transition"
                >
                  <User size={14} className="text-slate-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({e.role})</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chats (Third Priority) */}
          {results.chats.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Messages</div>
              {results.chats.map(c => (
                <div
                  key={c.id}
                  className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-left text-xs text-slate-700 smooth-transition cursor-pointer"
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                >
                  <MessageSquare size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-600 text-[10px]">{c.profiles?.name || 'User'}</div>
                    <div className="truncate text-slate-500 italic">"{c.content}"</div>
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
