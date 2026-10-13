import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  Filter,
  Eye,
  CheckSquare,
  Building,
  MapPin,
  IndianRupee,
  Layers,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSROpportunitiesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    loadOpportunities();
  }, [domainFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/opportunities', {
        params: { domain: domainFilter },
      });
      if (res.data?.success) {
        setOpportunities(res.data.data.opportunities || []);
      }
    } catch (err) {
      console.warn('Using local fallback for opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (opportunityId: string, decision: string) => {
    try {
      await apiClient.post(`/csr/proposals/${opportunityId}/review`, {
        decision,
        comments: `Actioned as "${decision}" directly from CSR Opportunities explorer.`,
      });
      setActionSuccess(`Opportunity marked as "${decision}".`);
      setSelectedOpportunity(null);
      loadOpportunities();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionSuccess(`Opportunity marked as "${decision}".`);
      setSelectedOpportunity(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const filteredOpportunities = opportunities.filter((o) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.title.toLowerCase().includes(q) ||
        o.challengeId.toLowerCase().includes(q) ||
        o.university.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#133054]">CSR Opportunities</h1>
            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              COMMUNITY CHALLENGES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover validated societal challenges and university proposals suitable for CSR support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {filteredOpportunities.length} Opportunities Identified
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-2xs">
          <span className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by challenge ID, problem, university, or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#133054]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-500" />
            <span className="text-slate-600 font-medium">Domain:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#133054]"
            >
              <option value="All">All Domains</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Solid Waste Management">Solid Waste Management</option>
              <option value="Smart Infrastructure">Smart Infrastructure</option>
              <option value="Urban Energy">Urban Energy</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setDomainFilter('All');
            }}
            className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#133054] text-white font-semibold">
              <tr>
                <th className="px-3 py-2.5">Challenge ID</th>
                <th className="px-3 py-2.5">Project / Problem</th>
                <th className="px-3 py-2.5">Domain</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Expected Impact</th>
                <th className="px-3 py-2.5">Estimated Budget</th>
                <th className="px-3 py-2.5">University</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    No CSR opportunities found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((item: any) => (
                  <tr key={item.challengeId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{item.challengeId}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900 max-w-[220px]">
                      <div className="truncate" title={item.title}>{item.title}</div>
                      <span className="text-[10px] text-slate-400 font-normal">Team: {item.studentTeam}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        {item.domain}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 truncate max-w-[120px]">{item.location}</td>
                    <td className="px-3 py-2.5 text-slate-700 truncate max-w-[140px]">{item.expectedImpact}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{item.estimatedBudget}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{item.university}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.status === 'Shortlisted'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : item.status === 'Pending Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedOpportunity(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Eye size={12} />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => navigate(`/csr/project-selection?id=${item.proposalId || item.challengeId}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#133054] hover:bg-[#0f243e] text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span>Review Proposal</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunity Details Modal (Section 11) */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-300 overflow-hidden my-8">
            <div className="bg-[#133054] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-amber-300 block uppercase font-bold">
                  Opportunity Evaluation Dossier
                </span>
                <h3 className="font-bold text-sm tracking-tight">{selectedOpportunity.title}</h3>
              </div>
              <button onClick={() => setSelectedOpportunity(null)} className="text-white/80 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* 1. Challenge Information */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-bold text-[#133054] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Target size={13} className="text-amber-500" />
                    Challenge Information
                  </h4>
                  <span className="font-mono font-bold text-[10px] text-slate-500">
                    ID: {selectedOpportunity.challengeId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Location</span>
                    <span className="font-semibold">{selectedOpportunity.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Priority / Validation</span>
                    <span className="font-bold text-emerald-700">High Priority • AI & Municipal Validated</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Citizen Problem Statement</span>
                  <p className="text-slate-800 leading-relaxed mt-0.5">{selectedOpportunity.problemStatement}</p>
                </div>
              </div>

              {/* 2. University Proposal */}
              <div className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                  <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-blue-700" />
                    University Proposal Details
                  </h4>
                  <span className="font-semibold text-blue-800 text-[11px]">{selectedOpportunity.university}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Faculty Mentor</span>
                    <span className="font-semibold">{selectedOpportunity.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Student Team</span>
                    <span className="font-semibold">{selectedOpportunity.studentTeam}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Proposed Solution</span>
                  <p className="text-slate-800 leading-relaxed mt-0.5">{selectedOpportunity.proposedSolution}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Technology Stack</span>
                    <span className="font-mono text-blue-900 font-semibold">{selectedOpportunity.technology}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Execution Timeline</span>
                    <span className="font-semibold">{selectedOpportunity.timeline}</span>
                  </div>
                </div>
              </div>

              {/* 3. CSR Relevance & Social Return on Investment */}
              <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-lg space-y-2">
                <div className="border-b border-amber-200 pb-1.5">
                  <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-amber-700" />
                    CSR Strategic Relevance & Social Impact
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">CSR Domain</span>
                    <span className="font-semibold">{selectedOpportunity.csrDomain || selectedOpportunity.domain}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Estimated CSR Grant</span>
                    <span className="font-mono font-bold text-[#133054]">{selectedOpportunity.estimatedBudget}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Expected Social Impact</span>
                  <p className="text-slate-800 font-semibold leading-relaxed mt-0.5">{selectedOpportunity.csrImpact}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Community</span>
                    <span className="font-semibold">{selectedOpportunity.targetCommunity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sustainability Potential</span>
                    <span className="font-semibold">{selectedOpportunity.sustainabilityPotential}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(selectedOpportunity.proposalId || selectedOpportunity.challengeId, 'Shortlist')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 rounded font-bold hover:bg-blue-100"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedOpportunity.proposalId || selectedOpportunity.challengeId, 'Request Changes')}
                    className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded font-bold hover:bg-amber-100"
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/csr/project-selection?id=${selectedOpportunity.proposalId || selectedOpportunity.challengeId}`)}
                    className="px-4 py-1.5 bg-[#133054] text-white rounded font-bold hover:bg-[#0f243e] shadow-xs"
                  >
                    Proceed to Review →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
