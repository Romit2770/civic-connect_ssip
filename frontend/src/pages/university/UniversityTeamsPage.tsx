import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  FolderGit2,
  BookOpen,
  UserCheck,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityTeamsPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'faculty' | 'students'>('teams');
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [mentor, setMentor] = useState('');
  const [leadStudent, setLeadStudent] = useState('');
  const [departments, setDepartments] = useState('CSE, Civil Engineering, ECE');
  const [activeProject, setActiveProject] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/teams');
      if (res.data.success) {
        setTeams(res.data.data.multidisciplinaryTeams || []);
        setFaculty(res.data.data.facultyMentors || []);
        setStudents(res.data.data.studentLeads || []);
      }
    } catch (err) {
      console.warn('Fallback teams loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/university/teams', {
        name: teamName,
        facultyMentor: mentor,
        leadStudent,
        departments: departments.split(',').map((d) => d.trim()),
        activeProject,
      });
      if (res.data.success) {
        setActionSuccess('Multidisciplinary team registered successfully.');
        setCreateModalOpen(false);
        setTeamName('');
        setMentor('');
        setLeadStudent('');
        loadTeams();
      }
    } catch (err: any) {
      alert('Failed to create team');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Academic Innovation Teams
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Faculty mentors, student leads and cross-departmental multidisciplinary engineering teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTeams()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh Teams"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="gov-button-primary text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Team</span>
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
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-3 sm:p-4 bg-slate-50/70 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-[#133054] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Multidisciplinary Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faculty'
                ? 'bg-[#133054] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Faculty Mentors ({faculty.length || 18})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#133054] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Student Innovation Leads ({students.length || 24})
          </button>
        </div>

        {/* Tab 1: Teams Grid */}
        {activeTab === 'teams' && (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-700 transition-colors shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {t.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faculty Guide: <strong className="text-slate-800">{t.facultyMentor}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Student Lead: <strong className="text-slate-800">{t.leadStudent}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Integrated Disciplines:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {t.departments?.map((dept: string) => (
                      <span key={dept} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-xs text-blue-900 font-semibold truncate border-t border-slate-100">
                  📌 {t.activeProject}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Faculty Mentors */}
        {activeTab === 'faculty' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Dr. Ramesh Kumar', dept: 'Civil & Structural Engineering', designation: 'Dean (Academic & R&D)', projects: 2 },
                { name: 'Prof. Ananya Sen', dept: 'Computer Science & IoT Labs', designation: 'Associate Professor', projects: 1 },
                { name: 'Dr. Sunita Murmu', dept: 'Environmental & Bio-Chemical Engineering', designation: 'Head of Department', projects: 1 },
                { name: 'Prof. K. Rajagopal', dept: 'Electrical & Power Systems', designation: 'Professor', projects: 1 },
                { name: 'Dr. Alok Verma', dept: 'Mechanical Engineering & CAD/CAM', designation: 'Associate Professor', projects: 1 },
              ].map((f) => (
                <div key={f.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{f.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
                      {f.projects} Active Project{f.projects > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{f.designation}</p>
                  <p className="text-[10px] text-slate-500">{f.dept}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Students */}
        {activeTab === 'students' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Aakash Verma', dept: 'B.Tech Computer Science (Final Year)', role: 'Smart Water Guild Lead' },
                { name: 'Pooja Iyer', dept: 'M.Tech Robotics & Automation', role: 'Aerial Photogrammetry Lead' },
                { name: 'Deepak Roy', dept: 'B.Tech Environmental Engineering', role: 'Bio-Composting Lead' },
                { name: 'Simran Kaur', dept: 'B.Tech Electrical & Renewable Energy', role: 'Smart Grid Lead' },
              ].map((s) => (
                <div key={s.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{s.name}</span>
                  <p className="text-[11px] text-blue-900 font-semibold">{s.role}</p>
                  <p className="text-[10px] text-slate-500">{s.dept}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Multidisciplinary Team */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Form Multidisciplinary Team</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Smart Mobility Innovation Unit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Mentor *</label>
                <input
                  type="text"
                  required
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Lead *</label>
                <input
                  type="text"
                  required
                  value={leadStudent}
                  onChange={(e) => setLeadStudent(e.target.value)}
                  placeholder="e.g. Aakash Verma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departments (Comma-separated)</label>
                <input
                  type="text"
                  value={departments}
                  onChange={(e) => setDepartments(e.target.value)}
                  placeholder="CSE, Mechanical, Civil"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Project / Challenge</label>
                <input
                  type="text"
                  value={activeProject}
                  onChange={(e) => setActiveProject(e.target.value)}
                  placeholder="e.g. Low-Cost IoT Sensor Network"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="gov-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gov-button-primary text-xs py-2 px-4"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
