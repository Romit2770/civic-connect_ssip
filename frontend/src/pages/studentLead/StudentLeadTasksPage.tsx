import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Save,
  User,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function StudentLeadTasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my_tasks' | 'assigned' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Create Task Form State
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createAssignedTo, setCreateAssignedTo] = useState('Aakash Verma');
  const [createPriority, setCreatePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [createStartDate, setCreateStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [createDueDate, setCreateDueDate] = useState('2026-10-05');
  const [createMilestoneId, setCreateMilestoneId] = useState('MLS-05');
  const [createDeliverable, setCreateDeliverable] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit Task State
  const [editStatus, setEditStatus] = useState<string>('in_progress');
  const [editProgress, setEditProgress] = useState<number>(50);
  const [editPriority, setEditPriority] = useState<string>('high');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const teamAssignees = [
    'Aakash Verma',
    'Priya Sharma',
    'Rohan Banerjee',
    'Sneha Ghosh',
    'Vikram Patel',
    'Ankit Ray',
  ];

  const milestonesList = [
    { id: 'MLS-01', name: 'MLS-01: Problem Definition & Literature Benchmark' },
    { id: 'MLS-02', name: 'MLS-02: Sensor Circuit Design & PCB Fabrication' },
    { id: 'MLS-03', name: 'MLS-03: Laboratory Bench Testing & Sensor Calibration' },
    { id: 'MLS-04', name: 'MLS-04: LoRaWAN Gateway Integration & Cloud Telemetry' },
    { id: 'MLS-05', name: 'MLS-05: Enclosure Weatherproofing & IP68 Certification' },
    { id: 'MLS-06', name: 'MLS-06: Ward 4 Bistupur Pilot Installation' },
    { id: 'MLS-07', name: 'MLS-07: Comparative SCADA Data Validation' },
    { id: 'MLS-08', name: 'MLS-08: Final Solution Report & SIH Submission' },
  ];

  useEffect(() => {
    fetchTasks();
  }, [activeTab, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/student-lead/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleOpenTaskDetails = (task: any) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setEditProgress(task.progress);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate);
    setEditAssignedTo(task.assignedTo);
    setEditNotes(task.notes || '');
    setEditSuccess(null);
    setEditError(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      setCreateError('Task title is mandatory.');
      return;
    }
    if (!createAssignedTo.trim()) {
      setCreateError('Assignee is mandatory.');
      return;
    }
    if (!createDueDate) {
      setCreateError('Due date is mandatory.');
      return;
    }

    try {
      setCreateSubmitting(true);
      setCreateError(null);

      const res = await apiClient.post('/student-lead/tasks', {
        title: createTitle.trim(),
        description: createDescription.trim(),
        assignedTo: createAssignedTo.trim(),
        priority: createPriority,
        startDate: createStartDate,
        dueDate: createDueDate,
        milestoneId: createMilestoneId,
        expectedDeliverable: createDeliverable.trim() || 'Milestone verification output',
      });

      if (res.data.success) {
        setCreateSuccess(`Task ${res.data.data.id} created successfully.`);
        setTimeout(() => {
          setCreateSuccess(null);
          setShowCreateModal(false);
          setCreateTitle('');
          setCreateDescription('');
          setCreateDeliverable('');
          fetchTasks();
        }, 1500);
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create task.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setEditSubmitting(true);
      setEditError(null);

      const res = await apiClient.patch(`/student-lead/tasks/${selectedTask.id}`, {
        status: editStatus,
        progress: editProgress,
        priority: editPriority,
        dueDate: editDueDate,
        assignedTo: editAssignedTo,
        notes: editNotes,
      });

      if (res.data.success) {
        setEditSuccess('Task updated successfully.');
        setTimeout(() => {
          setEditSuccess(null);
          setSelectedTask(null);
          fetchTasks();
        }, 1200);
      }
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'Failed to update task.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p.toLowerCase()) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-900 border border-rose-300">CRITICAL</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
            <CheckCircle2 size={10} className="text-emerald-700" />
            <span>COMPLETED</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>IN PROGRESS</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-900 border border-purple-300">
            <Clock size={10} className="text-purple-700" />
            <span>SUBMITTED</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-900 border border-rose-300">
            <AlertCircle size={10} className="text-rose-700" />
            <span>OVERDUE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>NOT STARTED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              SPRINT EXECUTION
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PRJ-CH-2026-089
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            TASK MANAGEMENT
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Assign work, track individual student progress, and monitor sprint deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setCreateError(null);
            setCreateSuccess(null);
          }}
          className="gov-button-primary text-xs px-4 h-9 font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus size={14} />
          <span>+ Create Task</span>
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-px">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'all', label: 'All Tasks', count: 18 },
            { id: 'my_tasks', label: 'My Tasks', count: 5 },
            { id: 'assigned', label: 'Assigned', count: 18 },
            { id: 'in_progress', label: 'In Progress', count: 4 },
            { id: 'completed', label: 'Completed', count: 12 },
            { id: 'overdue', label: 'Overdue', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeTab === tab.id ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search and Priority Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Task ID, title, assignee..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Filter Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-900"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 4. Professional Government Dense Tasks Table */}
      <div className="gov-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10.5px]">
                <th className="py-3 px-3.5">Task ID</th>
                <th className="py-3 px-3.5 min-w-[220px]">Task Title & Deliverable</th>
                <th className="py-3 px-3.5">Assigned To</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Due Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No tasks found matching the selected filters.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Task ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-950 whitespace-nowrap">
                      {t.id}
                    </td>

                    {/* Task Title & Deliverable */}
                    <td className="py-3 px-3.5">
                      <div className="font-extrabold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">
                        {t.expectedDeliverable || t.milestoneName}
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{t.assignedTo}</span>
                      <span className="block font-mono text-[10px] text-slate-400">
                        {t.assignedStudentId}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getPriorityBadge(t.priority)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {t.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusBadge(t.status)}
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="space-y-1 w-20">
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {t.progress}%
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              t.progress === 100 ? 'bg-emerald-600' : 'bg-blue-900'
                            }`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenTaskDetails(t)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: Create Project Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-blue-900" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  CREATE PROJECT TASK
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              {createError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-700 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  <span>{createSuccess}</span>
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
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Calibrate ultrasonic transducers against test rig"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Task Description
                </label>
                <textarea
                  rows={2}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Detailed technical instructions and acceptance criteria..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                />
              </div>

              {/* Assignee & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Assign To *</label>
                  <select
                    value={createAssignedTo}
                    onChange={(e) => setCreateAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    {teamAssignees.map((mem) => (
                      <option key={mem} value={mem}>
                        {mem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e: any) => setCreatePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={createDueDate}
                    onChange={(e) => setCreateDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>
              </div>

              {/* Milestone & Deliverable */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Linked Milestone</label>
                <select
                  value={createMilestoneId}
                  onChange={(e) => setCreateMilestoneId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  {milestonesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Expected Deliverable</label>
                <input
                  type="text"
                  value={createDeliverable}
                  onChange={(e) => setCreateDeliverable(e.target.value)}
                  placeholder="e.g. Validated SPICE simulation curve / Gerber files"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="gov-button-secondary text-xs px-3 h-8 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} />
                  <span>{createSubmitting ? 'Creating...' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Task Details & Progress Management */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-blue-900" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    TASK DETAILS • {selectedTask.id}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Created on {selectedTask.createdAt}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="p-5 overflow-y-auto space-y-4 text-xs">
              {editSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={14} className="text-red-700 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title & Description */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">
                  {selectedTask.title}
                </span>
                <p className="text-slate-600 text-xs">
                  {selectedTask.description || 'No detailed scope provided.'}
                </p>
                <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Milestone:</span>
                  <span className="font-bold text-blue-900">{selectedTask.milestoneName}</span>
                </div>
              </div>

              {/* Status & Progress Updates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Execution Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="not_started">NOT STARTED</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="submitted">SUBMITTED</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Progress: <span className="font-mono text-blue-900">{editProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full accent-blue-900 mt-2"
                  />
                </div>
              </div>

              {/* Reassign & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Reassign Student</label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    {teamAssignees.map((mem) => (
                      <option key={mem} value={mem}>
                        {mem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Change Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Deliverables */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Update Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Student Lead Work Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record sprint updates, testbench findings, impediment notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="gov-button-secondary text-xs px-3 h-8 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{editSubmitting ? 'Saving...' : 'Update Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
