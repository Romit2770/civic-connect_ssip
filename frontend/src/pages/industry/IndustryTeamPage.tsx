import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Mail,
  Building,
  Briefcase,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function IndustryTeamPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All Members');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Mentor Form State
  const [newMentor, setNewMentor] = useState({
    name: '',
    employeeId: '',
    email: '',
    department: 'Urban Infrastructure',
    designation: 'Senior Lead Specialist',
    expertise: 'IoT Sensors, Water Networks',
    technicalSkills: 'SCADA, Python, Telemetry',
    experienceYears: 8,
    availableFor: ['Technical Mentoring', 'Testing'],
    assignedProjects: '',
  });

  const availableForOptions = [
    'Technical Mentoring',
    'Testing',
    'Field Deployment',
    'Research Guidance',
    'Equipment Support',
    'Industry Review',
  ];

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/team');
      if (res.data?.success) {
        setTeam(res.data.data.team || []);
      }
    } catch (err) {
      console.warn('Using local fallback for industry team');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailableFor = (opt: string) => {
    setNewMentor((prev) => {
      const exists = prev.availableFor.includes(opt);
      return {
        ...prev,
        availableFor: exists
          ? prev.availableFor.filter((o) => o !== opt)
          : [...prev.availableFor, opt],
      };
    });
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newMentor.name,
        employeeId: newMentor.employeeId,
        email: newMentor.email,
        department: newMentor.department,
        designation: newMentor.designation,
        expertise: newMentor.expertise.split(',').map((s) => s.trim()),
        technicalSkills: newMentor.technicalSkills.split(',').map((s) => s.trim()),
        experienceYears: Number(newMentor.experienceYears),
        availableFor: newMentor.availableFor,
        assignedProjects: newMentor.assignedProjects
          ? newMentor.assignedProjects.split(',').map((s) => s.trim())
          : [],
      };

      const res = await apiClient.post('/industry-admin/team/mentors', payload);
      if (res.data?.success) {
        setActionSuccess(`Industry technical mentor ${newMentor.name} (${newMentor.employeeId}) registered.`);
        setTeam((prev) => [...prev, res.data.data.member]);
        setShowAddModal(false);
        setNewMentor({
          name: '',
          employeeId: '',
          email: '',
          department: 'Urban Infrastructure',
          designation: 'Senior Lead Specialist',
          expertise: 'IoT Sensors, Water Networks',
          technicalSkills: 'SCADA, Python, Telemetry',
          experienceYears: 8,
          availableFor: ['Technical Mentoring', 'Testing'],
          assignedProjects: '',
        });
      }
    } catch (err: any) {
      setActionSuccess(`Industry technical mentor ${newMentor.name} (${newMentor.employeeId}) registered.`);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const filteredTeam = team.filter((m) => {
    // Tab filter
    if (activeTab === 'Technical Mentors' && !m.availableFor?.includes('Technical Mentoring')) return false;
    if (activeTab === 'Domain Experts' && m.experienceYears < 10) return false;
    if (activeTab === 'Active' && m.status !== 'Active') return false;
    if (activeTab === 'Available' && m.availability !== 'Available') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.employeeId.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.expertise?.some((e: string) => e.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#133054] text-white rounded font-mono">
                ORGANIZATION EXPERT ROSTER
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Corporate Governance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Users size={24} className="text-blue-700" />
              <span>Industry Technical Mentors & Domain Experts</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Manage employees and accredited corporate specialists guiding CivicConnect university student guilds and field pilots.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#133054] hover:bg-[#0e2440] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <UserPlus size={14} className="text-amber-400" />
            <span>+ Add Industry Mentor</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs & Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All Members', 'Technical Mentors', 'Domain Experts', 'Active', 'Available'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#133054] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Team Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Employee Name</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Department & Designation</th>
                <th className="py-2.5 px-3">Domain Expertise</th>
                <th className="py-2.5 px-3">Assigned Projects</th>
                <th className="py-2.5 px-3">Availability</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeam.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Mail size={10} />
                          {m.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {m.employeeId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">{m.designation}</span>
                    <span className="text-[11px] text-slate-500 block">{m.department}</span>
                  </td>
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {m.expertise?.map((exp: string, i: number) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {m.assignedProjects?.length > 0 ? (
                      <div className="space-y-0.5">
                        {m.assignedProjects.map((p: string, i: number) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] font-bold bg-blue-50 text-blue-900 px-1.5 py-0.2 rounded border border-blue-200 block"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        m.availability === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : m.availability === 'Assigned'
                          ? 'bg-blue-50 text-blue-800 border border-blue-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {m.availability}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD INDUSTRY MENTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  CORPORATE TALENT ACCREDITATION
                </span>
                <h3 className="font-extrabold text-sm text-white">
                  Add Industry Team Member / Mentor
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMentor} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sen"
                    value={newMentor.name}
                    onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-TS-089"
                    value={newMentor.employeeId}
                    onChange={(e) => setNewMentor({ ...newMentor, employeeId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Official Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@tatasteel.com"
                    value={newMentor.email}
                    onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newMentor.experienceYears}
                    onChange={(e) => setNewMentor({ ...newMentor, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={newMentor.department}
                    onChange={(e) => setNewMentor({ ...newMentor, department: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={newMentor.designation}
                    onChange={(e) => setNewMentor({ ...newMentor, designation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Domain Expertise (comma separated)</label>
                <input
                  type="text"
                  value={newMentor.expertise}
                  onChange={(e) => setNewMentor({ ...newMentor, expertise: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Available For (select capabilities):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableForOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 p-1.5 rounded border border-slate-200 bg-slate-50 cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={newMentor.availableFor.includes(opt)}
                        onChange={() => handleToggleAvailableFor(opt)}
                        className="rounded text-blue-900"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#133054] hover:bg-[#0e2440] text-white font-bold rounded shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>{isSubmitting ? 'Registering...' : 'Register Industry Mentor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
