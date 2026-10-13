import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityIndustryPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'requests'>('matches');
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalPartner, setRequestModalPartner] = useState<any | null>(null);
  const [projectTitle, setProjectTitle] = useState('Low-Cost IoT Sensor Network for Pipeline Leakage');
  const [requestedSupport, setRequestedSupport] = useState('Acoustic Pipe Test Benches & Municipal Pilot Deployment');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/industry-matching');
      if (res.data.success) {
        setMatches(res.data.data.matches || []);
        setRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.warn('Fallback industry matching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalPartner) return;
    try {
      const res = await apiClient.post('/university/industry-requests', {
        industryName: requestModalPartner.name,
        projectTitle,
        requestedSupport,
      });
      if (res.data.success) {
        setActionSuccess(`Collaboration request sent to ${requestModalPartner.name}.`);
        setRequestModalPartner(null);
        loadData();
      }
    } catch (err: any) {
      alert('Failed to send collaboration request');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Industry Collaboration & AI Matching
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              AI-assisted partner matching comparing academic solution proposals against corporate industrial capabilities.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData()}
          className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
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
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'bg-[#133054] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>AI-Recommended Partners ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-[#133054] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Send size={14} />
            <span>Collaboration Requests ({requests.length})</span>
          </button>
        </div>

        {/* Tab 1: AI Recommended Partners */}
        {activeTab === 'matches' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-700 transition-colors shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                      {item.id}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-600" />
                      {item.matchPercentage}% Compatibility
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <p className="text-[11px] text-slate-500">{item.type} • {item.location}</p>
                    <p className="text-xs text-blue-900 font-semibold mt-1">
                      Domain: {item.domain}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <strong className="text-slate-800 block text-[11px]">Match Explanation:</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{item.reason}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Industrial Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.capabilities?.map((c: string) => (
                        <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">Contact: {item.contactPerson}</span>
                    <button
                      onClick={() => setRequestModalPartner(item)}
                      className="gov-button-primary text-xs py-1.5 px-3 shadow-2xs"
                    >
                      <Send size={12} />
                      <span>Request Collaboration</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Collaboration Requests */}
        {activeTab === 'requests' && (
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#133054] text-white uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Innovation Project</th>
                    <th className="px-4 py-3">Target Industry Partner</th>
                    <th className="px-4 py-3">Requested Support</th>
                    <th className="px-4 py-3">Date Dispatched</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-blue-900">{r.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{r.project}</td>
                      <td className="px-4 py-3 text-slate-700">{r.industry}</td>
                      <td className="px-4 py-3 text-slate-600">{r.requestedSupport}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{r.date}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Dispatch Collaboration Request */}
      {requestModalPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={17} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Send Collaboration Request</h3>
              </div>
              <button onClick={() => setRequestModalPartner(null)} className="p-1 rounded-lg text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Target Industry:</span>
                <span className="font-bold text-slate-900 text-sm block">{requestModalPartner.name}</span>
                <span className="text-[11px] text-emerald-700 font-semibold">{requestModalPartner.matchPercentage}% AI Compatibility Score</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select University Project</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested Collaboration Support *</label>
                <textarea
                  rows={3}
                  required
                  value={requestedSupport}
                  onChange={(e) => setRequestedSupport(e.target.value)}
                  placeholder="e.g. Hardware testing equipment, field pilot deployment, CSR funding support"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRequestModalPartner(null)}
                  className="gov-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gov-button-primary text-xs py-2 px-4"
                >
                  Dispatch Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
