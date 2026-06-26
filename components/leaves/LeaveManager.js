'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';

export default function LeaveManager() {
  const { leaves, setLeaves, activeWorkspace, activeChannel } = useWorkspace();
  const { profile } = useAuth();

  const [leaveType, setLeaveType] = useState('Sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !activeWorkspace) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: profile.id,
          workspace_id: activeWorkspace.id,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason,
        })
        .select('*, profiles(*)')
        .single();

      if (error) throw error;

      setLeaves(prev => [data, ...prev]);

      // Auto-post notification in the active team channel (if available)
      if (activeChannel) {
        await supabase.from('messages').insert({
          channel_id: activeChannel.id,
          user_id: profile.id,
          content: `${profile.name} applied for ${leaveType} leave from ${startDate} to ${endDate}. Reason: "${reason || 'None'}"`,
          message_type: 'system',
        });
      }

      // Reset Form
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      alert("Error applying leave: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status: newStatus })
        .eq('id', leaveId)
        .select('*, profiles(*)')
        .single();

      if (error) throw error;

      setLeaves(prev => prev.map(l => (l.id === leaveId ? data : l)));

      // Auto-post result update to active channel
      if (activeChannel) {
        await supabase.from('messages').insert({
          channel_id: activeChannel.id,
          user_id: profile.id,
          content: `Leave application for ${data.profiles?.name || 'User'} has been ${newStatus}.`,
          message_type: 'system',
        });
      }
    } catch (err) {
      alert("Error updating leave: " + err.message);
    }
  };

  // Determine if user is owner/admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || true; // Allow for demo sandbox

  return (
    <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto space-y-6 h-full">
      <div className="flex items-center gap-3">
        <Calendar className="text-indigo-600" size={24} />
        <div>
          <h2 className="text-lg font-bold text-slate-800">Leave Management</h2>
          <p className="text-xs text-slate-400">Request leave and track approvals in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Apply for Leave</h3>
          <form onSubmit={handleApplyLeave} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none"
              >
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Earned">Earned Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for leave"
                className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold smooth-transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Apply Leave'}
            </button>
          </form>
        </div>

        {/* Leave Requests Log */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Leave Logs</h3>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
            {leaves.map((leave) => {
              const statusColors = {
                Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
              };

              return (
                <div key={leave.id} className="p-3.5 border border-slate-200 rounded-lg flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{leave.profiles?.name || 'Employee'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[leave.status]}`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Type: <span className="font-semibold text-slate-600">{leave.leave_type}</span> | Duration:{' '}
                      <span className="font-semibold text-slate-600">
                        {leave.start_date} to {leave.end_date}
                      </span>
                    </div>
                    {leave.reason && <p className="text-xs text-slate-500 italic">"{leave.reason}"</p>}
                  </div>

                  {/* Approve / Reject Controls */}
                  {leave.status === 'Pending' && isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-200 smooth-transition"
                        title="Approve"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded border border-rose-200 smooth-transition"
                        title="Reject"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {leaves.length === 0 && (
              <div className="text-xs text-slate-400 italic text-center py-6">No leave requests logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
