import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  X,
  Building,
  GraduationCap,
  Calendar,
  Hash,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSRFundingPage() {
  const [loading, setLoading] = useState(true);
  const [fundingData, setFundingData] = useState<any>({
    summary: {
      totalAllocated: 18500000,
      totalReleased: 11200000,
      totalUtilized: 9640000,
      totalRemaining: 7300000,
    },
    projectFunding: [],
    releases: [],
  });

  const [selectedLedgerProject, setSelectedLedgerProject] = useState<any | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [fundingPhase, setFundingPhase] = useState('Tranche 2 - Prototype & Lab Validation');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const fetchFunding = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/funding');
      if (res.data?.success) {
        setFundingData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching CSR funding:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunding();
  }, []);

  const handleOpenReleaseModal = (project?: any) => {
    setFormError('');
    if (project) {
      setSelectedProjectId(project.projectId);
    } else if (fundingData.projectFunding.length > 0) {
      setSelectedProjectId(fundingData.projectFunding[0].projectId);
    }
    setReleaseAmount('');
    setReferenceNumber(`UTR-TSUISL-${Math.floor(100000 + Math.random() * 900000)}`);
    setNotes('');
    setShowReleaseModal(true);
  };

  const handleSubmitRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProjectId) {
      setFormError('Please select an active CSR innovation project.');
      return;
    }

    const amountNum = Number(releaseAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid positive grant release amount.');
      return;
    }

    const project = fundingData.projectFunding.find((p: any) => p.projectId === selectedProjectId);
    if (project) {
      const remainingUnreleased = project.approvedBudget - project.released;
      if (amountNum > remainingUnreleased) {
        setFormError(
          `Release amount (₹ ${amountNum.toLocaleString('en-IN')}) cannot exceed unreleased approved balance of ₹ ${remainingUnreleased.toLocaleString('en-IN')}.`
        );
        return;
      }
    }

    if (!releaseDate) {
      setFormError('Release disbursement date is required.');
      return;
    }

    if (!referenceNumber.trim()) {
      setFormError('Bank UTR / Transaction Reference number is required for audit trails.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/csr/funding/release', {
        projectId: selectedProjectId,
        releaseAmount: amountNum,
        releaseDate,
        fundingPhase,
        referenceNumber,
        notes,
      });

      if (res.data?.success) {
        setSuccessToast(`Disbursement of ₹ ${amountNum.toLocaleString('en-IN')} successfully logged and verified.`);
        setShowReleaseModal(false);
        fetchFunding();
        setTimeout(() => setSuccessToast(''), 5000);
      } else {
        setFormError(res.data?.error?.message || 'Failed to record funding release.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'An error occurred while processing disbursement.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Released':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Partially Released':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Under Utilization Review':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const currentSelectedProject = fundingData.projectFunding.find((p: any) => p.projectId === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Schedule VII Fiscal Oversight
            </span>
            <span className="text-xs text-slate-500 font-medium">MCA Section 135 Compliant</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR Funding Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer grant releases, track milestone-linked tranches, and audit university utilization ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFunding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleOpenReleaseModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Funding Release
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Approved CSR Allocation</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            ₹ {(fundingData.summary.totalAllocated / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Approved across 12 initiatives</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Disbursed / Released</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-2">
            ₹ {(fundingData.summary.totalReleased / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {((fundingData.summary.totalReleased / fundingData.summary.totalAllocated) * 100).toFixed(1)}% of total pool
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Utilized by Universities</span>
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            ₹ {(fundingData.summary.totalUtilized / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {((fundingData.summary.totalUtilized / fundingData.summary.totalReleased) * 100).toFixed(1)}% release spent
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Unreleased Pool Balance</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800 mt-2">
            ₹ {(fundingData.summary.totalRemaining / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending milestone verifications</div>
        </div>
      </div>

      {/* Main Table: CSR Funding By Project */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Project Grant Ledgers & Disbursement Tranches</h2>
            <p className="text-xs text-slate-500">
              Institutional breakdown of approved budget ceilings, dispatches, and audited campus expenditures.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{fundingData.projectFunding.length}</span> active project ledgers
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Project & Institution</th>
                <th className="py-3 px-3 text-right">Approved Budget</th>
                <th className="py-3 px-3 text-right">Released (Tranches)</th>
                <th className="py-3 px-3 text-right">Utilized (Audited)</th>
                <th className="py-3 px-3 text-right">Unreleased Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#133054] mb-2" />
                    <span>Loading funding ledgers...</span>
                  </td>
                </tr>
              ) : fundingData.projectFunding.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                    <span>No funding records found in the CSR registry.</span>
                  </td>
                </tr>
              ) : (
                fundingData.projectFunding.map((p: any) => {
                  const percentReleased = p.approvedBudget > 0 ? (p.released / p.approvedBudget) * 100 : 0;
                  return (
                    <tr key={p.projectId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.projectTitle}</div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                          <span className="font-mono text-slate-600">{p.projectId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            {p.university}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {p.approvedAmountDisplay}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-emerald-700">{p.releasedDisplay}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {percentReleased.toFixed(0)}% disbursed
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-slate-800">{p.utilizedDisplay}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.released > 0 ? ((p.utilized / p.released) * 100).toFixed(0) : 0}% spent
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                        {p.remainingDisplay}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLedgerProject(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
                            title="View Tranche History & Ledger"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {p.approvedBudget - p.released > 0 && (
                            <button
                              onClick={() => handleOpenReleaseModal(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition"
                              title="Release Next Tranche"
                            >
                              <Plus className="w-3 h-3" />
                              Release
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Disbursal Audit Trail Log */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Official CSR Disbursement Audit Trail
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">NEFT / RTGS Corporate Treasury Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Tranche ID</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Funding Phase</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Reference No.</th>
                <th className="py-2.5 px-3">Signoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fundingData.releases && fundingData.releases.length > 0 ? (
                fundingData.releases.map((rel: any) => (
                  <tr key={rel.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{rel.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[220px] truncate">
                      {rel.projectTitle}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{rel.university}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                        {rel.fundingPhase}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      ₹ {Number(rel.releaseAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{rel.releaseDate}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{rel.referenceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {rel.recordedBy || 'Meera Chawla'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No release transactions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Project Ledger */}
      {selectedLedgerProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  CSR Grant Utilization Ledger
                </span>
                <h3 className="text-base font-bold">{selectedLedgerProject.projectTitle}</h3>
                <div className="text-xs text-blue-100 flex items-center gap-2 mt-0.5">
                  <span>{selectedLedgerProject.projectId}</span>
                  <span>•</span>
                  <span>{selectedLedgerProject.university}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLedgerProject(null)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-center">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Approved Budget</div>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    {selectedLedgerProject.approvedAmountDisplay}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Total Disbursed</div>
                  <div className="text-sm font-black text-emerald-700 mt-1">
                    {selectedLedgerProject.releasedDisplay}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Campus Utilized</div>
                  <div className="text-sm font-black text-blue-900 mt-1">
                    {selectedLedgerProject.utilizedDisplay}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Unreleased Balance</div>
                  <div className="text-sm font-black text-amber-700 mt-1">
                    {selectedLedgerProject.remainingDisplay}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-700" />
                  Disbursement Tranches for this Project
                </h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Phase / Tranche</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3">Ref / UTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fundingData.releases.filter((r: any) => r.projectId === selectedLedgerProject.projectId)
                        .length > 0 ? (
                        fundingData.releases
                          .filter((r: any) => r.projectId === selectedLedgerProject.projectId)
                          .map((r: any) => (
                            <tr key={r.id}>
                              <td className="py-2 px-3 text-slate-600">{r.releaseDate}</td>
                              <td className="py-2 px-3 font-medium text-slate-900">{r.fundingPhase}</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700">
                                ₹ {Number(r.releaseAmount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-700">{r.referenceNumber}</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            No historical tranches recorded for this initiative.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Audited in accordance with Ministry of Corporate Affairs CSR Rules 2014
              </span>
              <button
                onClick={() => setSelectedLedgerProject(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Funding Release */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Fiscal Grant Disbursement
                </span>
                <h3 className="text-base font-bold">Record Funding Release</h3>
              </div>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRelease} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Project Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select CSR Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {fundingData.projectFunding.map((p: any) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectId}: {p.projectTitle} ({p.university})
                    </option>
                  ))}
                </select>
                {currentSelectedProject && (
                  <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">
                      Approved: <strong className="text-slate-900">{currentSelectedProject.approvedAmountDisplay}</strong>
                    </span>
                    <span className="text-slate-600">
                      Disbursed: <strong className="text-emerald-700">{currentSelectedProject.releasedDisplay}</strong>
                    </span>
                    <span className="text-slate-600">
                      Max Releaseable:{' '}
                      <strong className="text-amber-800 font-bold">
                        ₹ {((currentSelectedProject.approvedBudget - currentSelectedProject.released) / 100000).toFixed(2)} L
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Release Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={releaseAmount}
                      onChange={(e) => setReleaseAmount(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full border border-slate-300 rounded p-2 pl-7 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                      required
                    />
                  </div>
                  {releaseAmount && !isNaN(Number(releaseAmount)) && (
                    <div className="text-[10px] text-slate-500 mt-1">
                      In Words: ₹ {(Number(releaseAmount) / 100000).toFixed(2)} Lakhs
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Release Date *</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Funding Phase & Ref Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Funding Phase / Tranche</label>
                  <select
                    value={fundingPhase}
                    onChange={(e) => setFundingPhase(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                  >
                    <option value="Tranche 1 - Inception & Hardware BOM">Tranche 1 - Inception & Hardware BOM</option>
                    <option value="Tranche 2 - Prototype & Lab Validation">Tranche 2 - Prototype & Lab Validation</option>
                    <option value="Tranche 3 - Pilot Field Deployment">Tranche 3 - Pilot Field Deployment</option>
                    <option value="Tranche 4 - Final Impact Verification">Tranche 4 - Final Impact Verification</option>
                    <option value="Special Contingency Grant">Special Contingency Grant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference Number (UTR / Bank Ref) *</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UTR-TSUISL-948192"
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-[#133054] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Disbursement Remarks / Review Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Disbursed against verified milestone MLS-02 test report."
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Recording Disbursement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Record Release
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
