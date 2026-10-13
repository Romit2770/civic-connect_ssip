import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderGit2,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Camera,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FieldWorkerProjectsPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completion'>('all');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const params: any = { tab: activeTab };
      if (search) params.search = search;
      const res = await apiClient.get('/field-worker/projects', { params });
      if (res.data.success && res.data.data?.projects) {
        setProjects(res.data.data.projects);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const tabs = [
    { key: 'all', label: 'All Projects' },
    { key: 'active', label: 'Active Implementation' },
    { key: 'completion', label: 'Completion Verification' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-900 text-white">
            <FolderGit2 size={18} className="text-amber-400" />
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Project Monitoring
          </h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Monitor physical implementation of assigned civic innovation projects across Anand Municipality.
        </p>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project ID, title, university, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* 4. Projects Table & Cards */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-900" />
            <span>Loading assigned innovation projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FolderGit2 size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No active project monitoring assignments found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Project ID</th>
                    <th className="py-2.5 px-4">Project Name</th>
                    <th className="py-2.5 px-4">University & Industry</th>
                    <th className="py-2.5 px-4">Site Location</th>
                    <th className="py-2.5 px-4">Progress</th>
                    <th className="py-2.5 px-4">Current Milestone</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{p.projectId}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block font-bold">{p.name}</strong>
                        <span className="text-[10px] text-slate-500">{p.linkedChallenge}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1 font-semibold">
                          <GraduationCap size={13} className="text-blue-900 shrink-0" />
                          <span className="truncate max-w-[180px]">{p.university}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{p.industryPartner}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span>{p.location?.site} ({p.location?.ward})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-xs">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{p.currentMilestone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'COMPLETION_VERIFICATION'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/field-worker/projects/${p.id}`}
                            className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                            title="View Project Milestones"
                          >
                            <Eye size={13} />
                          </Link>
                          <Link
                            to={`/field-worker/projects/${p.id}#visit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] shadow-2xs transition-colors"
                          >
                            <Camera size={12} className="text-amber-400" />
                            <span>Site Visit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-200">
              {projects.map((p) => (
                <div key={p.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-900">{p.projectId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'COMPLETION_VERIFICATION'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-blue-900 shrink-0" />
                      <span>{p.university}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{p.location?.site} ({p.location?.ward})</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span>Progress: <strong className="font-mono text-emerald-700">{p.progress}%</strong></span>
                    <span className="truncate max-w-[170px] text-slate-500 text-[11px]">{p.currentMilestone}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/field-worker/projects/${p.id}`}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      <span>Milestones</span>
                    </Link>
                    <Link
                      to={`/field-worker/projects/${p.id}#visit`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 shadow-xs"
                    >
                      <Camera size={13} className="text-amber-400" />
                      <span>Site Visit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
