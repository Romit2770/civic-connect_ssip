import React, { useState, useEffect } from 'react';
import {
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function StudentLeadMilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'in_progress' | 'completed' | 'delayed'>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);

  // Milestone Update State
  const [updateProgressVal, setUpdateProgressVal] = useState<number>(0);
  const [submissionDesc, setSubmissionDesc] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchMilestones();
  }, [activeTab]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab === 'upcoming') params.status = 'Upcoming';
      if (activeTab === 'in_progress') params.status = 'In Progress';
      if (activeTab === 'completed') params.status = 'Completed';
      if (activeTab === 'delayed') params.status = 'Delayed';

      const res = await apiClient.get('/student-lead/milestones', { params });
      if (res.data.success) {
        setMilestones(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMilestone = (m: any) => {
    setSelectedMilestone(m);
    setUpdateProgressVal(m.completionPercentage);
    setSubmissionDesc('');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleUpdateProgress = async () => {
    if (!selectedMilestone) return;
    try {
      setSubmittingDeliverable(true);
      setActionError(null);
      const res = await apiClient.patch(`/student-lead/milestones/${selectedMilestone.id}/progress`, {
        progress: updateProgressVal,
      });
      if (res.data.success) {
        setActionSuccess(`Milestone progress updated to ${updateProgressVal}%.`);
        setTimeout(() => {
          setActionSuccess(null);
          fetchMilestones();
        }, 1500);
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to update progress.');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleSubmitMilestone = async () => {
    if (!selectedMilestone) return;
    if (!submissionDesc.trim()) {
      setActionError('Please provide submission notes describing the completed deliverables.');
      return;
    }

    try {
      setSubmittingDeliverable(true);
      setActionError(null);

      const res = await apiClient.post(`/student-lead/milestones/${selectedMilestone.id}/submit`, {
        description: submissionDesc.trim(),
        files: [
          { name: `${selectedMilestone.id}_Deliverable_Report.pdf`, size: '3.6 MB' },
          { name: `${selectedMilestone.id}_Verification_Data.csv`, size: '1.2 MB' },
        ],
      });

      if (res.data.success) {
        setActionSuccess('Milestone submitted successfully to Faculty Mentor Prof. Ananya Sen for academic evaluation.');
        setTimeout(() => {
          setActionSuccess(null);
          setSelectedMilestone(null);
          fetchMilestones();
        }, 2000);
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to submit milestone.');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              ACADEMIC DELIVERABLES
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PRJ-CH-2026-089
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            PROJECT MILESTONES
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Track statutory milestone completion, submit verification deliverables, and review faculty feedback.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg shadow-2xs">
          <CheckCircle2 size={15} className="text-emerald-700" />
          <span>5 / 8 Milestones Formally Approved</span>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto pb-px">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'all', label: 'All Milestones', count: 8 },
            { id: 'in_progress', label: 'In Progress', count: 2 },
            { id: 'completed', label: 'Completed', count: 5 },
            { id: 'upcoming', label: 'Upcoming', count: 1 },
            { id: 'delayed', label: 'Delayed', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeTab === tab.id ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Milestones Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => {
          const isCompleted = m.status === 'Completed';
          const isInProgress = m.status === 'In Progress';

          return (
            <div
              key={m.id}
              className={`gov-card p-5 bg-white border rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isCompleted
                  ? 'border-emerald-300/80'
                  : isInProgress
                  ? 'border-blue-300 ring-1 ring-blue-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {m.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {m.submissionStatus === 'Pending Faculty Review' ? (
                      <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                        Pending Faculty Review
                      </span>
                    ) : isCompleted ? (
                      <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-700" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                        {m.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Name */}
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {m.name}
                </h3>

                {/* Target Date & Tasks */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Date</span>
                    <span className="font-mono font-bold text-slate-800">{m.targetDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Tasks</span>
                    <span className="font-semibold text-slate-700">{m.assignedTasksCount} Linked Tasks</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-slate-500">Completion</span>
                    <span className="text-blue-900">{m.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-emerald-600' : 'bg-blue-900'
                      }`}
                      style={{ width: `${m.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {m.assignedTeamMembers?.length || 3} Guild Assignees
                </span>
                <button
                  onClick={() => handleOpenMilestone(m)}
                  className="gov-button-primary text-xs px-3.5 h-8 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Milestone Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL: Milestone Details & Submission */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-blue-900" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    MILESTONE DETAILS • {selectedMilestone.id}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Target: {selectedMilestone.targetDate}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {actionSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={15} className="text-red-700 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Title Card */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {selectedMilestone.name}
                </h4>
                <div className="text-slate-600 leading-relaxed text-xs">
                  {selectedMilestone.requiredDeliverables}
                </div>
              </div>

              {/* Mandatory Faculty Approval Notice */}
              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Academic Evaluation Protocol</strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Formal academic review and statutory approval is strictly governed by Faculty Mentor <strong>Prof. Ananya Sen</strong>. The Student Lead updates execution progress and submits deliverables for verification.
                  </p>
                </div>
              </div>

              {/* Faculty Review Status & Feedback */}
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1.5">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wide block">
                  Faculty Mentor Feedback & Status
                </span>
                <div className="font-semibold text-slate-800 text-xs">
                  {selectedMilestone.facultyReviewStatus}
                </div>
                {selectedMilestone.facultyComments && (
                  <p className="text-slate-600 text-[11px] italic bg-white p-2 rounded border border-blue-100">
                    "{selectedMilestone.facultyComments}"
                  </p>
                )}
              </div>

              {/* Update Progress Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    Update Team Completion Progress:
                  </label>
                  <span className="font-mono text-sm font-extrabold text-blue-900">
                    {updateProgressVal}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updateProgressVal}
                  onChange={(e) => setUpdateProgressVal(Number(e.target.value))}
                  className="w-full accent-blue-900"
                />
                <button
                  type="button"
                  onClick={handleUpdateProgress}
                  disabled={submittingDeliverable}
                  className="gov-button-secondary text-xs px-3 h-7 font-bold mt-1 cursor-pointer disabled:opacity-50"
                >
                  Save Progress Percentage
                </button>
              </div>

              {/* Deliverable Submission Box */}
              {selectedMilestone.submissionStatus !== 'Approved' && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Submit Milestone Deliverable to Faculty Mentor
                  </span>
                  <textarea
                    rows={2}
                    value={submissionDesc}
                    onChange={(e) => setSubmissionDesc(e.target.value)}
                    placeholder="Describe laboratory test data, testbench findings, Git branch commits, or verification slips..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      Standard deliverables attached: .pdf, .csv
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitMilestone}
                      disabled={submittingDeliverable}
                      className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{submittingDeliverable ? 'Submitting...' : 'Submit to Faculty Mentor'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="gov-button-secondary text-xs px-4 h-8 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
