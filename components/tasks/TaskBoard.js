'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Kanban, List, Calendar, Plus, User, Clock, Trash, CheckSquare } from 'lucide-react';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

export default function TaskBoard() {
  const { tasks, setTasks, activeTeam, members } = useWorkspace();
  const { profile } = useAuth();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'calendar'
  const [showAddModal, setShowAddModal] = useState(false);

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Todo');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !activeTeam) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          team_id: activeTeam.id,
          title,
          description,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
          status,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTasks(prev => [...prev, data]);

      // Reset form
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setDueDate('');
      setStatus('Todo');
      setShowAddModal(false);

      // Create activity feed entry
      await supabase.from('activity_logs').insert({
        workspace_id: activeTeam.project_id, // fallback or retrieve project workspace
        user_id: profile.id,
        action: 'task_created',
        details: { task_id: data.id, task_title: data.title },
      });
    } catch (err) {
      alert("Error creating task: " + err.message);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistic Update
    const originalTasks = [...tasks];
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: targetStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Log movement to activity feed
      const movedTask = tasks.find(t => t.id === taskId);
      await supabase.from('activity_logs').insert({
        workspace_id: activeTeam.project_id,
        user_id: profile.id,
        action: 'task_moved',
        details: { task_id: taskId, task_title: movedTask?.title, to_status: targetStatus },
      });
    } catch (err) {
      setTasks(originalTasks);
      alert("Failed to move task: " + err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* Task Header */}
      <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Task Dashboard</h2>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 smooth-transition ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 smooth-transition ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 smooth-transition ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Calendar size={13} />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold smooth-transition shadow-sm"
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main Board Viewport */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-4 gap-4 h-full min-w-[800px]">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col);

              return (
                <div
                  key={col}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col)}
                  className="bg-slate-100/60 border border-slate-200/80 rounded-xl p-3 flex flex-col h-full"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col}</span>
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Tasks */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {colTasks.map(task => {
                      const assignee = members.find(m => m.id === task.assignee_id);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing smooth-transition group relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{task.title}</h4>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 smooth-transition"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock size={10} />
                              <span>{task.due_date || 'No Date'}</span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <User size={10} />
                              <span>{assignee ? assignee.name : 'Unassigned'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3">Task Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const assignee = members.find(m => m.id === task.assignee_id);
                  return (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/50 smooth-transition">
                      <td className="p-3 font-semibold text-slate-800">{task.title}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-55 text-indigo-700 border border-indigo-100">
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{assignee ? assignee.name : 'Unassigned'}</td>
                      <td className="p-3 text-slate-500">{task.due_date || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-sm">
            <Calendar className="mx-auto text-indigo-600 mb-2" size={36} />
            <h3 className="text-sm font-bold text-slate-700">Calendar view</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Track tasks, deadlines and leaves synchronously. Filter due dates seamlessly.
            </p>
            <div className="grid grid-cols-7 gap-2 mt-6 max-w-xl mx-auto border border-slate-100 p-3 rounded-lg bg-slate-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white rounded border border-slate-200/50 flex flex-col justify-between p-1 hover:border-indigo-400 smooth-transition"
                >
                  <span className="text-[10px] text-slate-400">{i + 1}</span>
                  {tasks.some(t => t.due_date && new Date(t.due_date).getDate() === i + 1) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mx-auto mb-1"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckSquare className="text-indigo-600" />
              <span>Create Task</span>
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed task description..."
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-600 h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
