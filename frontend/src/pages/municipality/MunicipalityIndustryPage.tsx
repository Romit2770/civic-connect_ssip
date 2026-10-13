import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FolderGit2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';

export default function MunicipalityIndustryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [industryPartners, setIndustryPartners] = useState<any[]>([]);
  const [csrProjects, setCsrProjects] = useState<any[]>([]);

  const loadIndustryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/industry');
      if (res.data.success) {
        setIndustryPartners(res.data.data.industryPartners || []);
        setCsrProjects(res.data.data.csrProjects || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustryData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              INDUSTRY & CSR
            </span>
            <span className="text-xs text-slate-500 font-semibold">Corporate Civic Innovation Capital</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Industry Collaboration
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor corporate partners, CSR capital deployments, technical mentorship, and equipment provision for municipal projects.
          </p>
        </div>

        <button
          onClick={loadIndustryData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Alliances</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadIndustryData} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. CSR CAPITAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL CSR COMMITTED</span>
            <DollarSign size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹1,27,50,000
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Corporate innovation capital committed to Anand ULB
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">FUNDS DISBURSED</span>
            <TrendingUp size={16} className="text-blue-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹68,50,000
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Active lab & prototyping expenditures released
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">INDUSTRY PARTNERS</span>
            <Building2 size={16} className="text-purple-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            6 Organizations
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Amul, Elecon, GMM Pfaudler, L&T, Adani, TCS
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">SUPPORTED PROJECTS</span>
            <FolderGit2 size={16} className="text-indigo-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            18 Civic Pilots
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Directly addressing verified municipal challenges
          </p>
        </div>
      </div>

      {/* 3. CSR-SUPPORTED MUNICIPAL PROJECTS SECTION */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderGit2 size={16} className="text-blue-900" />
            <span>CSR-Supported Municipal Projects</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active civic engineering and infrastructure prototypes co-funded by Corporate Social Responsibility frameworks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Industry / CSR Partner</th>
                <th className="py-2.5 px-3">University Partner</th>
                <th className="py-2.5 px-3">Linked Challenge</th>
                <th className="py-2.5 px-3">Funding</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Impact Area</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {csrProjects.map((prj: any, idx: number) => {
                const isCompleted = prj.status === 'Completed';

                return (
                  <tr
                    key={prj.id}
                    className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate" title={prj.project}>
                      {prj.project}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-950">
                      {prj.industryPartner}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {prj.university}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {prj.challenge}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {prj.funding}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${isCompleted ? 'bg-emerald-600' : 'bg-blue-700'}`}
                            style={{ width: `${prj.progress}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[10px] text-slate-700">
                          {prj.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {prj.impactArea}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}
                      >
                        {prj.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate('/municipality-admin/projects')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Project</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. INDUSTRY PARTNERS TABLE */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 size={16} className="text-blue-900" />
            <span>Corporate & Industry Partners Registry</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Organizations providing capital, fabrication labs, testing facilities, and specialized engineering domain mentorship.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Industry Partner</th>
                <th className="py-2.5 px-3">Supported Project</th>
                <th className="py-2.5 px-3">Linked Challenge</th>
                <th className="py-2.5 px-3">Support Type</th>
                <th className="py-2.5 px-3">Funding Committed</th>
                <th className="py-2.5 px-3">Technical Support</th>
                <th className="py-2.5 px-3">Project Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {industryPartners.map((ind: any, idx: number) => (
                <tr
                  key={ind.id}
                  className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {ind.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium max-w-xs truncate" title={ind.supportedProject}>
                    {ind.supportedProject}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-blue-900 font-semibold">
                    {ind.linkedChallenge}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {ind.supportType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {ind.funding}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[200px] truncate" title={ind.technicalSupport}>
                    {ind.technicalSupport}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        ind.projectStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}
                    >
                      {ind.projectStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate('/municipality-admin/projects')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
