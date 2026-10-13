import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Users,
  GraduationCap,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  RefreshCw,
  Search,
  X,
  Copy,
  Check,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityCredentialsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'faculty_mentor' | 'student_lead'>('faculty_mentor');
  const [formDesignation, setFormDesignation] = useState('Assistant Professor');
  const [formUsername, setFormUsername] = useState('');
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/credentials');
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.warn('Fallback credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/university/credentials', {
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        designation: formDesignation,
        username: formUsername,
      });
      if (res.data.success) {
        setCreatedResult(res.data.data);
        setActionSuccess('Internal university credential issued successfully.');
        loadCredentials();
      }
    } catch (err: any) {
      alert('Failed to issue credential');
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const res = await apiClient.patch(`/university/credentials/${user._id}/status`, {
        isActive: !user.isActive,
      });
      if (res.data.success) {
        setActionSuccess(`Account ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
        loadCredentials();
      }
    } catch (err: any) {
      alert('Failed to update account status');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.adminId?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Internal University Credential Management
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Authorized University Admin Control: Provision and govern institutional access for Faculty Mentors & Student Innovation Leads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadCredentials()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setCreatedResult(null);
              setFormName('');
              setFormEmail('');
              setFormUsername('');
              setCreateModalOpen(true);
            }}
            className="gov-button-primary text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Account</span>
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

      {/* RBAC Notice Banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield size={16} className="text-blue-700 shrink-0" />
          <span>
            <strong>Institutional Authorization Scope:</strong> As University Main Admin, you may issue credentials for internal <strong>Faculty Mentors</strong> and <strong>Student Leads</strong>. Government and Industry accounts are managed independently by Super Admins.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold whitespace-nowrap">
          RBAC Tier 2
        </span>
      </div>

      {/* Table Card */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            Registered Academic Users ({filteredUsers.length})
          </span>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty or students..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#133054] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Academic Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Internal ID</th>
                <th className="px-4 py-3">Institutional Role</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Official Email</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No academic users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 text-blue-900 border border-slate-200 px-2 py-0.5 rounded">
                        {u.adminId || 'UNIV-USER'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'faculty_mentor' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {u.role === 'faculty_mentor' ? 'Faculty Mentor' : 'Student Lead'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.designation || 'Academic Member'}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700">{u.email}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded transition-colors ${u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.isActive ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Credential */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={17} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Issue Academic Credential</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {createdResult ? (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 size={16} />
                    <span>Academic Account Created Successfully</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Provide these temporary credentials to the faculty mentor or student lead. Passwords are never saved in cleartext.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">User ID:</span>
                    <strong className="text-blue-900">{createdResult.adminId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Username:</span>
                    <strong className="text-slate-900">@{createdResult.username}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-sans">Temporary Setup Key:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {createdResult.temporaryPassword}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdResult.temporaryPassword, 'tempKey')}
                        className="p-1 text-slate-500 hover:text-slate-800"
                        title="Copy Key"
                      >
                        {copiedText === 'tempKey' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full py-2.5 gov-button-primary text-xs font-bold rounded-lg"
                >
                  Done & Return to Roster
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCredential} className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Role *</label>
                  <select
                    value={formRole}
                    onChange={(e: any) => {
                      setFormRole(e.target.value);
                      setFormDesignation(e.target.value === 'faculty_mentor' ? 'Assistant Professor' : 'Innovation Lead');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold"
                  >
                    <option value="faculty_mentor">Faculty Mentor (Research Guide)</option>
                    <option value="student_lead">Student Innovation Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Prof. Ananya Sen"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. mentor@university.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="e.g. ananya_sen"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
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
                    Issue Credential
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
