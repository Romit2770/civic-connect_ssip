import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  CheckCircle,
  Activity,
  RefreshCw,
  Search,
  Eye,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  TreePine,
  DollarSign,
  Clock,
  X,
  FileCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSRImpactPage() {
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState<any>({
    metrics: {
      peopleBenefited: 24850,
      villagesCovered: 14,
      projectsCompleted: 5,
      problemsAddressed: 12,
    },
    impactRecords: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/impact');
      if (res.data?.success) {
        setImpactData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching CSR impact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  const filteredRecords = (impactData.impactRecords || []).filter((r: any) => {
    const matchSearch =
      r.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetCommunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDomain = domainFilter === 'All' || r.domain === domainFilter;
    return matchSearch && matchDomain;
  });

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'Third-Party Audited':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'MoE Validated':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Field Verified':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Social Return on Investment (SROI)
            </span>
            <span className="text-xs text-slate-500 font-medium">Ground-Truthed Field Metrics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Impact & Outcomes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verifiable societal dividends, citizen reach, and environmental sustainability outcomes across all CSR initiatives.
          </p>
        </div>

        <button
          onClick={fetchImpact}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* 4 Top Metric Cards (Section 19) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">People Benefited</div>
            <div className="text-xl font-black text-slate-900">
              {impactData.metrics.peopleBenefited.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400">Direct citizens served</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Villages / Areas Covered</div>
            <div className="text-xl font-black text-slate-900">{impactData.metrics.villagesCovered}</div>
            <div className="text-[10px] text-slate-400">Gram Panchayats & Wards</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Projects Completed</div>
            <div className="text-xl font-black text-slate-900">{impactData.metrics.projectsCompleted}</div>
            <div className="text-[10px] text-slate-400">100% Milestone sign-off</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Problems Addressed</div>
            <div className="text-xl font-black text-slate-900">{impactData.metrics.problemsAddressed}</div>
            <div className="text-[10px] text-slate-400">Citizen challenges solved</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by community or project..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#133054] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Domain:</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#133054] focus:outline-none bg-white"
          >
            <option value="All">All Domains</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Smart Infrastructure & Road Safety">Smart Infrastructure & Road Safety</option>
            <option value="Waste Management & Circular Economy">Waste Management & Circular Economy</option>
            <option value="Urban Energy & Solar">Urban Energy & Solar</option>
          </select>
        </div>
      </div>

      {/* Impact Table (Section 19) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Direct Field Beneficiaries & Measured Dividends</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> project impact records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Project & Institution</th>
                <th className="py-3 px-3">Target Community</th>
                <th className="py-3 px-3 text-right">People Benefited</th>
                <th className="py-3 px-3 text-center">Areas Covered</th>
                <th className="py-3 px-4">Measured Outcome</th>
                <th className="py-3 px-3 text-center">Verification Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#133054] mb-2" />
                    <span>Loading impact metrics...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching impact records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r: any) => (
                  <tr key={r.projectId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.projectTitle}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-600">{r.projectId}</span>
                        <span>•</span>
                        <GraduationCap className="w-3 h-3 text-slate-400" />
                        <span>{r.university}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800 max-w-[180px]">
                      {r.targetCommunity}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold font-mono text-slate-900">
                      {Number(r.peopleBenefited).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                        {r.villagesCovered} {r.villagesCovered === 1 ? 'Area' : 'Areas'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[280px]">
                      <div className="line-clamp-2">{r.measuredOutcome}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getVerificationBadge(
                          r.verificationStatus
                        )}`}
                      >
                        {r.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Details Modal / Drawer (Section 19) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  CSR Social Impact Dossier
                </span>
                <h3 className="text-base font-bold">{selectedRecord.projectTitle}</h3>
                <div className="text-xs text-blue-100 mt-0.5">
                  {selectedRecord.projectId} • {selectedRecord.university}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Header metrics */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-center">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Target Beneficiaries</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {Number(selectedRecord.peopleBenefited).toLocaleString('en-IN')} Citizens
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Geographic Reach</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {selectedRecord.villagesCovered} Wards / Panchayats
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Audit Status</div>
                  <div className="text-xs font-bold text-emerald-800 mt-1">
                    {selectedRecord.verificationStatus}
                  </div>
                </div>
              </div>

              {/* Comprehensive Impact Details */}
              <div className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5 text-blue-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    Infrastructure Created
                  </div>
                  <p className="text-slate-700 font-medium">{selectedRecord.infrastructureCreated}</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5 text-emerald-900">
                    <TreePine className="w-3.5 h-3.5 text-emerald-700" />
                    Environmental Impact & Carbon Abatement
                  </div>
                  <p className="text-slate-700">{selectedRecord.environmentalImpact}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5 text-amber-900">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      Public Service Improvement
                    </div>
                    <p className="text-slate-700">{selectedRecord.serviceImprovement}</p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5 text-purple-900">
                      <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                      Civic Cost Reduction
                    </div>
                    <p className="text-slate-700">{selectedRecord.costReduction}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">
                    Primary Measured Outcome
                  </div>
                  <p className="text-slate-800 font-semibold">{selectedRecord.measuredOutcome}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Data reported under CSR Schedule VII Social Audit Protocol
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
