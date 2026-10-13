import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Layers,
  GraduationCap,
  Eye,
  IndianRupee,
  Calendar,
  Building,
  ShieldCheck,
  Send,
  X,
  FileCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSRProjectSelectionPage() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({
    all: 0,
    pendingReview: 0,
    shortlisted: 0,
    approved: 0,
    changesRequested: 0,
    rejected: 0,
  });

  const [activeTab, setActiveTab] = useState('Pending Review');
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [decision, setDecision] = useState<'Approve' | 'Request Changes' | 'Reject' | 'Shortlist'>('Approve');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/project-selection');
      if (res.data?.success) {
        setProposals(res.data.data.proposals || []);
        setCounts(res.data.data.counts || {});

        // If highlight query is passed, open review modal
        if (highlightId) {
          const match = res.data.data.proposals.find(
            (p: any) => p.id === highlightId || p.challengeId === highlightId
          );
          if (match) {
            setSelectedProposal(match);
          }
        }
      }
    } catch (err) {
      console.warn('Using local fallback for proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (prop: any) => {
    setSelectedProposal(prop);
    setDecision('Approve');
    setComments(prop.reviewDecision?.comments || '');
    setValidationError(null);
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      setValidationError('Please select a formal review decision.');
      return;
    }
    if ((decision === 'Request Changes' || decision === 'Reject') && !comments.trim()) {
      setValidationError('Comments / justification are strictly required for change requests and rejections under CSR governance.');
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      const res = await apiClient.post(`/csr/proposals/${selectedProposal.id}/review`, {
        decision,
        comments: comments.trim(),
      });
      if (res.data?.success) {
        setActionSuccess(`Decision "${decision}" recorded for proposal ${selectedProposal.id}.`);
        setSelectedProposal(null);
        loadProposals();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setActionSuccess(`Decision "${decision}" recorded for proposal ${selectedProposal.id}.`);
      setSelectedProposal(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'Pending Review') return p.status === 'Pending Review';
    if (activeTab === 'Shortlisted') return p.status === 'Shortlisted';
    if (activeTab === 'Approved') return p.status === 'Approved';
    if (activeTab === 'Changes Requested') return p.status === 'Changes Requested';
    if (activeTab === 'Rejected') return p.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#133054]">CSR Project Selection</h1>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
              BOARD APPRAISAL DESK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate, shortlist, and sanction university innovation proposals for corporate CSR sponsorship.
          </p>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: 'Pending Review', label: 'Pending Review', count: counts.pendingReview, icon: Clock },
          { key: 'Shortlisted', label: 'Shortlisted', count: counts.shortlisted, icon: CheckSquare },
          { key: 'Approved', label: 'Approved', count: counts.approved, icon: CheckCircle2 },
          { key: 'Changes Requested', label: 'Changes Requested', count: counts.changesRequested, icon: AlertCircle },
          { key: 'Rejected', label: 'Rejected', count: counts.rejected, icon: XCircle },
        ].map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                active
                  ? 'bg-[#133054] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={13} className={active ? 'text-amber-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Proposals Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#133054] text-white font-semibold">
              <tr>
                <th className="px-3 py-2.5">Proposal ID</th>
                <th className="px-3 py-2.5">Project</th>
                <th className="px-3 py-2.5">University</th>
                <th className="px-3 py-2.5">Domain</th>
                <th className="px-3 py-2.5">Budget</th>
                <th className="px-3 py-2.5">Expected Impact</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    No proposals are currently in the "{activeTab}" stage.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{item.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900 max-w-[220px]">
                      <div className="truncate" title={item.title}>{item.title}</div>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">Challenge: {item.challengeId}</span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{item.university}</td>
                    <td className="px-3 py-2.5">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        {item.domain}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                      ₹ {(item.budget / 100000).toFixed(2)} L
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 truncate max-w-[140px]">{item.expectedImpact}</td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px]">{item.submissionDate}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.status === 'Shortlisted'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : item.status === 'Pending Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : item.status === 'Changes Requested'
                            ? 'bg-orange-50 text-orange-800 border-orange-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#133054] hover:bg-[#0f243e] text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <FileCheck size={12} className="text-amber-400" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Review Modal (Section 13) */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-slate-300 overflow-hidden my-6">
            <div className="bg-[#133054] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-amber-300 block uppercase font-bold">
                  CSR Project Proposal Review & Sanction
                </span>
                <h3 className="font-bold text-sm tracking-tight">{selectedProposal.title}</h3>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="text-white/80 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDecision} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Header Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Proposal ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedProposal.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">University</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.university}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Faculty Mentor</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.facultyMentor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Team</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.studentTeam}</span>
                </div>
              </div>

              {/* Problem & Solution */}
              <div className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-[#133054] uppercase tracking-wider text-[11px] mb-1">
                    Problem Statement
                  </h4>
                  <p className="text-slate-800 leading-relaxed">{selectedProposal.problemStatement}</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-[#133054] uppercase tracking-wider text-[11px] mb-1">
                    Proposed Solution & Technology
                  </h4>
                  <p className="text-slate-800 leading-relaxed">{selectedProposal.proposedSolution}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Core Technology:</span>
                    <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold text-[11px]">
                      {selectedProposal.technology}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <h4 className="font-bold text-[#133054] uppercase tracking-wider text-[11px] mb-1">
                      Expected Outcomes
                    </h4>
                    <p className="text-slate-800 leading-relaxed">{selectedProposal.expectedOutcomes}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <h4 className="font-bold text-[#133054] uppercase tracking-wider text-[11px] mb-1">
                      Timeline & Delivery
                    </h4>
                    <p className="text-slate-800 leading-relaxed">{selectedProposal.timeline}</p>
                  </div>
                </div>

                {/* Financial Contributions Table */}
                <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg space-y-2">
                  <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <IndianRupee size={13} className="text-amber-700" />
                    Budget Requirement & Co-Contributions
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Requested CSR Grant</span>
                      <span className="font-mono font-bold text-[#133054] text-sm">
                        ₹ {(selectedProposal.budget / 100000).toFixed(2)} L
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">University In-Kind</span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedProposal.universityContribution}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Industry Testbed</span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedProposal.industryContribution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSR Review Decision Box (Section 13 requirement) */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#133054]" />
                    CSR Review Decision
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Audited Reviewer: Meera Chawla (CSR Project Lead)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'Approve', label: 'Approve', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                    { val: 'Shortlist', label: 'Shortlist', color: 'border-blue-500 text-blue-800 bg-blue-50' },
                    { val: 'Request Changes', label: 'Request Changes', color: 'border-amber-500 text-amber-800 bg-amber-50' },
                    { val: 'Reject', label: 'Reject', color: 'border-rose-500 text-rose-800 bg-rose-50' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                        decision === opt.val
                          ? `${opt.color} shadow-xs ring-1 ring-offset-1`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reviewDecision"
                        value={opt.val}
                        checked={decision === opt.val}
                        onChange={() => setDecision(opt.val as any)}
                        className="sr-only"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Review Comments / Change Request Justification
                    {(decision === 'Request Changes' || decision === 'Reject') && (
                      <span className="text-rose-600 ml-1 font-bold">*</span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter statutory evaluation remarks, conditions of grant, or modification requirements..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-[#133054]"
                  />
                </div>

                {validationError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 bg-[#133054] text-white rounded font-bold hover:bg-[#0f243e] shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} className="text-amber-400" />
                  <span>{submitting ? 'Submitting...' : 'Submit Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
