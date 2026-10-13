import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  FolderGit2,
  Check,
  X,
  Target,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FacultyTeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Active' | 'Forming' | 'Completed'>('all');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<'Pending' | 'In Progress' | 'Under Review' | 'Completed'>('In Progress');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faculty/teams');
      if (res.data.success) {
        setTeams(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load faculty teams');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async () => {
    if (!selectedTeam || !editingMember) return;
    setUpdatingTask(true);
    try {
      const res = await apiClient.patch(
        `/faculty/teams/${selectedTeam.id}/members/${editingMember.studentId}/task`,
        {
          task: newTask,
          taskStatus: newTaskStatus,
        }
      );

      if (res.data.success) {
        setActionSuccess(`Task updated for ${editingMember.studentName}.`);
        setEditingMember(null);
        setNewTask('');
        loadTeams();

        // Update selected team state in-modal
        const updatedMembers = selectedTeam.members.map((m: any) =>
          m.studentId === editingMember.studentId
            ? { ...m, assignedTasks: newTask, taskStatus: newTaskStatus }
            : m
        );
        setSelectedTeam({ ...selectedTeam, members: updatedMembers });
      }
    } catch (err) {
      alert('Failed to update task.');
    } finally {
      setUpdatingTask(false);
    }
  };

  const filteredTeams = teams.filter((t) => {
    if (activeTab === 'all') return true;
    return t.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Innovation Teams
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Manage multidisciplinary student teams working on your assigned challenges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTeams()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            title="Refresh Teams"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Teams' },
          { id: 'Active', label: 'Active Teams' },
          { id: 'Forming', label: 'Forming Teams' },
          { id: 'Completed', label: 'Completed Teams' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {filteredTeams.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No active student teams found.
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: ID, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {team.id}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {team.membersCount || team.members?.length || 4} Members
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {team.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      team.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : team.status === 'Forming'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                {/* Team Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Faculty Mentor</span>
                    <span className="font-semibold text-slate-900">{team.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Student Lead</span>
                    <span className="font-semibold text-slate-900">{team.leadStudent}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Linked Challenge / Project</span>
                    <span className="font-semibold text-blue-900 line-clamp-1">
                      {team.activeProject || team.linkedChallengeId}
                    </span>
                  </div>
                </div>

                {/* Departments */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Departments
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.departments?.map((dept: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {team.skills?.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-mono border border-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress & Stage */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">
                      Current Stage: <strong className="text-slate-900">{team.currentStage || 'Prototyping'}</strong>
                    </span>
                    <span className="font-mono font-extrabold text-blue-700">{team.progress || 85}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${team.progress || 85}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedTeam(team)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  <span>View Team</span>
                </button>
                <button
                  onClick={() => navigate('/faculty/projects')}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FolderGit2 size={13} />
                  <span>View Project</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Users size={18} className="text-amber-400" />
                <div>
                  <span className="font-mono text-xs text-amber-300 font-bold block">{selectedTeam.id}</span>
                  <h3 className="text-sm font-extrabold tracking-tight">Team Overview & Member Delegation</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  setEditingMember(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6 text-xs text-slate-800">
              {/* Team Overview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">{selectedTeam.name}</h2>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Status: {selectedTeam.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Faculty Mentor</span>
                    <span className="font-bold text-slate-900">{selectedTeam.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Student Lead</span>
                    <span className="font-bold text-slate-900">{selectedTeam.leadStudent}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Linked Challenge</span>
                    <span className="font-semibold text-blue-900">{selectedTeam.activeProject}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Departments:</span>
                  {selectedTeam.departments?.map((d: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-slate-700 rounded text-[10px] font-semibold border border-slate-300">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* TEAM MEMBERS TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-blue-700" />
                    Team Members & Task Delegation
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedTeam.members?.length || 0} Registered Members
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a2540] text-white uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="px-3 py-2.5">Student Name</th>
                        <th className="px-3 py-2.5">Student ID</th>
                        <th className="px-3 py-2.5">Department</th>
                        <th className="px-3 py-2.5">Role</th>
                        <th className="px-3 py-2.5">Skills</th>
                        <th className="px-3 py-2.5">Assigned Tasks</th>
                        <th className="px-3 py-2.5">Task Status</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {(!selectedTeam.members || selectedTeam.members.length === 0) ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            No member data found for this team.
                          </td>
                        </tr>
                      ) : (
                        selectedTeam.members.map((member: any) => (
                          <tr key={member.studentId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">
                              {member.studentName}
                            </td>
                            <td className="px-3 py-3 font-mono text-slate-600 whitespace-nowrap">
                              {member.studentId}
                            </td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                              {member.department}
                            </td>
                            <td className="px-3 py-3 font-semibold text-blue-900 whitespace-nowrap">
                              {member.role}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1 max-w-[140px]">
                                {member.skills?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-1 py-0.2 bg-slate-100 text-slate-700 text-[9px] rounded font-mono">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-3 max-w-xs text-slate-700">
                              <span className="line-clamp-2">{member.assignedTasks || 'No task assigned'}</span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  member.taskStatus === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : member.taskStatus === 'Under Review'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : member.taskStatus === 'In Progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {member.taskStatus}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setNewTask(member.assignedTasks || '');
                                  setNewTaskStatus(member.taskStatus || 'In Progress');
                                }}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                title="Assign or Update Task"
                              >
                                <Edit size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task Edit Form Panel */}
              {editingMember && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-950 text-xs">
                      Assign / Update Task for {editingMember.studentName} ({editingMember.studentId})
                    </span>
                    <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-700">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Task Description / Sprint Deliverable
                      </label>
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="e.g. Calibrate FFT frequency filter for piezoelectric sensor..."
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Task Progress Status
                      </label>
                      <select
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value as any)}
                        className="p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingMember(null)}
                        className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={updatingTask}
                        onClick={handleTaskUpdate}
                        className="px-4 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                      >
                        {updatingTask ? 'Saving...' : 'Save Task'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
