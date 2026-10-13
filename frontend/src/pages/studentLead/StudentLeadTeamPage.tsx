import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  CheckSquare,
  Activity,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function StudentLeadTeamPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Quick Task Assignment Modal State
  const [assigningTo, setAssigningTo] = useState<any | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-05');
  const [expectedDeliverable, setExpectedDeliverable] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/student-lead/team');
      if (res.data.success) {
        setTeam(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setAssignError('Task title is required.');
      return;
    }
    if (!taskDueDate) {
      setAssignError('Due date is required.');
      return;
    }

    try {
      setAssignSubmitting(true);
      setAssignError(null);

      const res = await apiClient.post('/student-lead/tasks', {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedTo: assigningTo.studentName,
        priority: taskPriority,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: taskDueDate,
        milestoneId: 'MLS-05',
        expectedDeliverable: expectedDeliverable.trim() || 'Technical deliverable',
      });

      if (res.data.success) {
        setAssignSuccess(`Task assigned successfully to ${assigningTo.studentName}.`);
        setTimeout(() => {
          setAssignSuccess(null);
          setAssigningTo(null);
          setTaskTitle('');
          setTaskDescription('');
          setExpectedDeliverable('');
          fetchTeam();
        }, 1500);
      }
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || 'Failed to assign task.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Loading Student Team Roster...</p>
      </div>
    );
  }

  const members = team?.members || [];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              STUDENT ROSTER
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {team?.teamName || 'Smart Water Guild'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            MY STUDENT TEAM
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Manage team members, responsibilities and assigned work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs">
            {members.length} Multidisciplinary Members Active
          </span>
        </div>
      </div>

      {/* 2. Team Overview Card */}
      <div className="gov-card p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Innovation Guild</span>
          <div className="font-extrabold text-slate-900 text-sm">{team?.teamName}</div>
          <p className="text-slate-600">{team?.projectTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty Mentor</span>
            <strong className="text-slate-900 font-bold">{team?.facultyMentor}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry Partner</span>
            <strong className="text-slate-900 font-bold">{team?.industryPartner}</strong>
          </div>
        </div>
      </div>

      {/* 3. Government-Style Dense Team Table */}
      <div className="gov-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Team Member Roster
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">6 Members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10.5px]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Skills</th>
                <th className="py-3 px-3">Assigned Tasks</th>
                <th className="py-3 px-3">Task Progress</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {members.map((m: any) => (
                <tr key={m.studentId} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name */}
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {m.studentName.charAt(0)}
                      </div>
                      <span className="font-extrabold text-blue-950">{m.studentName}</span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                    {m.studentId}
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {m.department}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.role === 'Student Lead'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>

                  {/* Skills */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {m.skills.map((sk: string) => (
                        <span
                          key={sk}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[9.5px] border border-slate-200 font-mono"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Assigned Tasks */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {m.assignedTasksCount} Tasks
                  </td>

                  {/* Task Progress */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="space-y-1 w-24">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-slate-900">{m.taskProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-blue-900 rounded-full"
                          style={{ width: `${m.taskProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {m.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => setSelectedMember(m)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      title="View Member Dossier"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => setAssigningTo(m)}
                      className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold text-xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      title="Assign New Task to Member"
                    >
                      <Plus size={12} />
                      <span>Assign Task</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: Team Member Details */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-900" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Team Member Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Member Card */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-blue-900 text-white font-extrabold text-base flex items-center justify-center shrink-0">
                  {selectedMember.studentName.charAt(0)}
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <h4 className="text-base font-extrabold text-slate-900">
                    {selectedMember.studentName}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      ID: {selectedMember.studentId}
                    </span>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                      {selectedMember.role}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{selectedMember.department}</p>
                </div>
              </div>

              {/* Contact & Progress */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email & Phone</span>
                  <div className="font-mono text-[11px] text-slate-800">{selectedMember.email}</div>
                  <div className="font-mono text-[11px] text-slate-600">{selectedMember.phone}</div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Task Execution Progress</span>
                  <div className="font-mono text-base font-extrabold text-blue-900">
                    {selectedMember.taskProgress}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedMember.completedTasks.length} Completed • {selectedMember.pendingTasks.length} Pending
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Technical Competencies & Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.skills.map((sk: string) => (
                    <span
                      key={sk}
                      className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded text-xs font-mono font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Assigned Tasks */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Current Assigned Tasks
                </span>
                <div className="space-y-1.5">
                  {selectedMember.currentTasks.map((t: string, i: number) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800 flex items-center gap-2"
                    >
                      <CheckSquare size={13} className="text-blue-900 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Tasks */}
              {selectedMember.completedTasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                    Completed Deliverables
                  </span>
                  <div className="space-y-1.5">
                    {selectedMember.completedTasks.map((t: string, i: number) => (
                      <div
                        key={i}
                        className="p-2 bg-emerald-50/60 rounded border border-emerald-200 text-emerald-950 flex items-center gap-2"
                      >
                        <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Latest Team Activity
                </span>
                <p className="text-slate-800">{selectedMember.recentActivity}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Student Innovation Cell</span>
              <button
                onClick={() => {
                  const target = selectedMember;
                  setSelectedMember(null);
                  setAssigningTo(target);
                }}
                className="gov-button-primary text-xs px-3.5 h-8 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Assign New Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Assign Task to Member */}
      {assigningTo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Assign Project Task
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Assignee: <strong className="text-blue-900">{assigningTo.studentName}</strong> ({assigningTo.studentId})
                </p>
              </div>
              <button
                onClick={() => setAssigningTo(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAssign} className="p-5 space-y-4 text-xs">
              {assignError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-700 shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              {assignSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  <span>{assignSuccess}</span>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Solder amplifier daughterboard for node 4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Task Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe technical implementation requirements..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                />
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium"
                  >
                  </input>
                </div>
              </div>

              {/* Deliverable */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Expected Deliverable</label>
                <input
                  type="text"
                  value={expectedDeliverable}
                  onChange={(e) => setExpectedDeliverable(e.target.value)}
                  placeholder="e.g. Assembled daughterboard test log"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningTo(null)}
                  className="gov-button-secondary text-xs px-3 h-8 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} />
                  <span>{assignSubmitting ? 'Assigning...' : 'Assign Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
