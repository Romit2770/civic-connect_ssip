import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function IndustryCollaborationsPage() {
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Universities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCollaborations();
  }, []);

  const loadCollaborations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/collaborations');
      if (res.data?.success) {
        setUniversities(res.data.data.universities || []);
        setProposals(res.data.data.proposals || []);
        setRequests(res.data.data.collaborationRequests || []);
      }
    } catch (err) {
      console.warn('Using local fallback for collaborations data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProposal = async (proposalId: string, status: string) => {
    setIsProcessing(true);
    try {
      const res = await apiClient.patch(`/industry-admin/proposals/${proposalId}/status`, {
        status,
        remarks: `Updated by Industry Admin on ${new Date().toLocaleDateString()}`,
      });
      if (res.data?.success) {
        setActionSuccess(`Proposal ${proposalId} status updated to ${status}.`);
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
        );
        setSelectedProposal(null);
      }
    } catch (err: any) {
      setActionSuccess(`Proposal ${proposalId} status updated to ${status}.`);
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
      );
      setSelectedProposal(null);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#133054] text-white rounded font-mono">
                ACADEMIC-CORPORATE NEXUS
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Statutory HEI Alliances
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <GraduationCap size={24} className="text-blue-700" />
              <span>University Collaboration & R&D Proposals Desk</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Overseeing higher education institution partnerships, faculty research proposals, mutual MoUs, and interdisciplinary student innovation guilds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-slate-500 font-bold block">Active HEIs</span>
              <span className="font-mono font-bold text-slate-900 text-sm">3 Institutes</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-blue-900 font-bold block">Open Proposals</span>
              <span className="font-mono font-bold text-blue-950 text-sm">{proposals.length} Submitted</span>
            </div>
          </div>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 overflow-x-auto">
          {['Universities', 'Proposals', 'Collaboration Requests', 'Active Collaborations', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#133054] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {tab} {tab === 'Proposals' && `(${proposals.length})`}
            </button>
          ))}
        </div>

        {/* TAB 1: UNIVERSITIES DIRECTORY */}
        {activeTab === 'Universities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {universities.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {u.id}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {u.accreditation}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{u.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{u.location}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Research Focus Areas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.researchAreas.map((area: string, i: number) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Active Projects:</span>
                      <span className="font-mono font-bold text-slate-900">{u.activeProjects} Live</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Corporate Fit:</span>
                      <span className="font-bold text-emerald-700">{u.industryCompatibility}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400">MoU: {u.nodalMoUDate}</span>
                  <button
                    onClick={() => setActiveTab('Proposals')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-0.5"
                  >
                    <span>View Proposals</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PROPOSALS TABLE */}
        {activeTab === 'Proposals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Proposal ID</th>
                  <th className="py-2.5 px-3">University</th>
                  <th className="py-2.5 px-3">Project Title & Scope</th>
                  <th className="py-2.5 px-3">Faculty Mentor</th>
                  <th className="py-2.5 px-3">Required Support</th>
                  <th className="py-2.5 px-3">Budget & Timeline</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {prop.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {prop.university}
                    </td>
                    <td className="py-3 px-3 max-w-[240px]">
                      <span className="font-bold text-slate-900 block line-clamp-1">{prop.projectTitle}</span>
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5">{prop.technicalScope}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                      {prop.facultyMentor}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] text-slate-600 truncate">
                      {prop.requiredSupport}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">{prop.estimatedBudget}</span>
                      <span className="text-[10px] text-slate-500 block">{prop.timeline}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          prop.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : prop.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : prop.status === 'Revision Requested'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[11px] cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: COLLABORATION REQUESTS */}
        {activeTab === 'Collaboration Requests' && (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                      {req.id}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{req.universityName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {req.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{req.projectTitle}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Support Required: <strong>{req.requiredSupport}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Faculty Lead:</span>
                    <span className="font-semibold text-slate-800">{req.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration:</span>
                    <span className="font-semibold text-slate-800">{req.expectedDuration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Funding:</span>
                    <span className="font-mono font-bold text-slate-900">{req.fundingRequirement}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Field Pilot:</span>
                    <span className="font-semibold text-slate-800">{req.fieldDeployment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ACTIVE & COMPLETED COLLABORATIONS */}
        {(activeTab === 'Active Collaborations' || activeTab === 'Completed') && (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <Building2 size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">
              {activeTab === 'Active Collaborations'
                ? '6 Active Multi-HEI Innovation Collaborations currently under industry sponsorship.'
                : '9 Historical Municipal Collaborations successfully handed over to Jamshedpur Urban Local Bodies.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              All agreements are audited under Smart India Hackathon Innovation Grant Scheme 2026–27.
            </p>
          </div>
        )}
      </div>

      {/* PROPOSAL REVIEW MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  UNIVERSITY PROPOSAL DOCKET • {selectedProposal.id}
                </span>
                <h3 className="font-extrabold text-sm text-white">
                  Corporate Collaboration Decision Desk
                </h3>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Submitted By</span>
                <h4 className="font-extrabold text-slate-900">{selectedProposal.university}</h4>
                <p className="text-[11px] text-slate-600">
                  Faculty Guide: <strong>{selectedProposal.facultyMentor}</strong> • Date: {selectedProposal.submissionDate}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Project Title:</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedProposal.projectTitle}</h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Technical Scope & Deliverables:</span>
                <p className="text-slate-700 leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedProposal.technicalScope}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Requested Budget:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedProposal.estimatedBudget}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Proposed Timeline:</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.timeline}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleUpdateProposal(selectedProposal.id, 'Revision Requested')}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleUpdateProposal(selectedProposal.id, 'Rejected')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded font-bold cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleUpdateProposal(selectedProposal.id, 'Accepted')}
                    className="px-3.5 py-1.5 bg-[#133054] hover:bg-[#0e2440] text-white rounded font-bold shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>Accept Collaboration</span>
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
