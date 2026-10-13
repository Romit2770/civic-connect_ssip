import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  FileCheck2,
  FileText,
  X,
  Check,
  MessageSquare,
  AlertTriangle,
  FolderGit2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FacultyMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REQUEST REVISION' | 'REJECT' | 'ADD COMMENT' | null>(null);
  const [mentorComment, setMentorComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Milestone Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMlsForm, setNewMlsForm] = useState({
    name: '',
    projectId: 'PRJ-CH-2026-089',
    projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    assignedTeam: 'Smart Water Guild',
    dueDate: '',
    assignedTasks: '',
  });

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faculty/milestones');
      if (res.data.success) {
        setMilestones(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedSubmission || !reviewAction) return;

    if (reviewAction === 'REQUEST REVISION' && !mentorComment.trim()) {
      alert('A mentor comment explaining what needs to be changed is required when requesting revision.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiClient.post(`/faculty/submissions/${selectedSubmission.id}/review`, {
        action: reviewAction,
        comment: mentorComment,
      });

      if (res.data.success) {
        setActionSuccess(`Submission evaluation recorded successfully.`);
        setSelectedSubmission(null);
        setSelectedMilestone(null);
        setMentorComment('');
        setReviewAction(null);
        loadMilestones();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/faculty/milestones', newMlsForm);
      if (res.data.success) {
        setActionSuccess('Project milestone created successfully.');
        setShowCreateModal(false);
        setNewMlsForm({
          name: '',
          projectId: 'PRJ-CH-2026-089',
          projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
          assignedTeam: 'Smart Water Guild',
          dueDate: '',
          assignedTasks: '',
        });
        loadMilestones();
      }
    } catch (err) {
      alert('Failed to create milestone');
    }
  };

  const filtered = milestones.filter((m) => {
    if (activeTab === 'all') return true;
    return m.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Project Milestone Management
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Monitor deliverables, deadlines and student progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMilestones()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={15} />
            <span>Create Milestone</span>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Milestones' },
          { id: 'Upcoming', label: 'Upcoming' },
          { id: 'In Progress', label: 'In Progress' },
          { id: 'Completed', label: 'Completed' },
          { id: 'Delayed', label: 'Delayed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Milestones Cards / Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No milestones found matching current status.
          </div>
        ) : (
          filtered.map((m) => {
            const hasPendingSub = m.submissions?.some((s: any) => s.status === 'Pending Review');
            const latestSub = m.submissions?.[0];

            return (
              <div
                key={m.id}
                className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {m.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Project: {m.projectTitle}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{m.name}</h3>
                    <p className="text-xs text-slate-600">{m.assignedTasks}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        m.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : m.status === 'Delayed'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar & metadata */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Deliverable Completion: <strong className="text-slate-900">{m.completionPercentage}%</strong>
                    </span>
                    <span className="font-mono text-slate-500">Target Due Date: <strong>{m.dueDate}</strong></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        m.completionPercentage === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${m.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Team & Submission Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span>
                      Team: <strong className="text-slate-800">{m.assignedTeam}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Submission Status:{' '}
                      <span
                        className={`font-semibold ${
                          m.submissionStatus === 'Approved'
                            ? 'text-emerald-700'
                            : m.submissionStatus === 'Pending Review'
                            ? 'text-amber-700 font-bold'
                            : m.submissionStatus === 'Revision Required'
                            ? 'text-orange-700 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {m.submissionStatus}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {latestSub && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(latestSub);
                          setSelectedMilestone(m);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
                          hasPendingSub
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <FileCheck2 size={13} />
                        <span>{hasPendingSub ? 'Review Submission' : 'View Submission Log'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* STUDENT SUBMISSION REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <FileCheck2 size={18} className="text-amber-400" />
                <div>
                  <span className="font-mono text-xs text-amber-300 font-bold block">
                    {selectedSubmission.id}
                  </span>
                  <h3 className="text-sm font-extrabold tracking-tight">Student Submission Evaluation Console</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setSelectedMilestone(null);
                  setReviewAction(null);
                  setMentorComment('');
                }}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-800">
              {/* Submission Overview */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Milestone</span>
                  <span className="font-mono text-[10px] text-slate-500">Submitted: {selectedSubmission.submittedDate}</span>
                </div>
                <h2 className="text-sm font-extrabold text-slate-900">{selectedSubmission.milestoneName}</h2>
                <div className="flex items-center gap-3 text-slate-600 pt-0.5">
                  <span>
                    Team: <strong className="text-slate-900">{selectedSubmission.studentTeam}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Current Review State:{' '}
                    <strong className="text-amber-800">{selectedSubmission.status}</strong>
                  </span>
                </div>
              </div>

              {/* Description & Progress Update */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Student Technical Narrative & Progress
                </label>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedSubmission.description}
                </p>
                {selectedSubmission.progressUpdate && (
                  <p className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 text-blue-900 font-medium text-[11px]">
                    <strong>Progress Metrics:</strong> {selectedSubmission.progressUpdate}
                  </p>
                )}
              </div>

              {/* Submitted Files */}
              {selectedSubmission.submittedFiles?.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Attached Files & Measurement Logs
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSubmission.submittedFiles.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={16} className="text-blue-700 shrink-0" />
                          <span className="font-medium text-slate-800 truncate text-[11px]">{f.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">{f.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photographic Evidence */}
              {selectedSubmission.evidence?.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Photographic Proof & Lab Test Benches
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSubmission.evidence.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt="Test evidence"
                        className="h-32 w-full object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Prior Mentor Comments if any */}
              {selectedSubmission.mentorComments?.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Previous Mentor Comments
                  </label>
                  <div className="space-y-1">
                    {selectedSubmission.mentorComments.map((c: string, idx: number) => (
                      <p key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
                        {c}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor Actions Panel */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Mentor Evaluation Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVE')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all cursor-pointer ${
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    ✓ APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('REQUEST REVISION')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all cursor-pointer ${
                      reviewAction === 'REQUEST REVISION'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    ↺ REQUEST REVISION
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECT')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all cursor-pointer ${
                      reviewAction === 'REJECT'
                        ? 'bg-red-700 text-white border-red-800 shadow-xs'
                        : 'bg-white text-red-800 border-red-300 hover:bg-red-50'
                    }`}
                  >
                    ✕ REJECT
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mentor Feedback Comment {reviewAction === 'REQUEST REVISION' && <span className="text-red-600">* (Mandatory for Revision)</span>}
                  </label>
                  <textarea
                    value={mentorComment}
                    onChange={(e) => setMentorComment(e.target.value)}
                    placeholder={
                      reviewAction === 'REQUEST REVISION'
                        ? 'Example: Sensor calibration report requires additional pressure accuracy measurements under cyclic load...'
                        : 'Enter mentor guidance or validation notes...'
                    }
                    rows={3}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubmission(null);
                      setSelectedMilestone(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reviewAction || submittingReview}
                    onClick={handleReviewSubmit}
                    className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {submittingReview ? 'Processing...' : 'Confirm Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MILESTONE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={18} className="text-amber-400" />
                <h3 className="text-sm font-extrabold tracking-tight">Create Deliverable Milestone</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white p-1 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="p-5 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Milestone Name
                </label>
                <input
                  type="text"
                  required
                  value={newMlsForm.name}
                  onChange={(e) => setNewMlsForm({ ...newMlsForm, name: e.target.value })}
                  placeholder="e.g. Field Deployment & LoRa Packet Telemetry Test"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newMlsForm.dueDate}
                  onChange={(e) => setNewMlsForm({ ...newMlsForm, dueDate: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Assigned Team Tasks & Deliverables
                </label>
                <textarea
                  required
                  value={newMlsForm.assignedTasks}
                  onChange={(e) => setNewMlsForm({ ...newMlsForm, assignedTasks: e.target.value })}
                  placeholder="Detail specific tasks the student team must complete and upload for this deliverable..."
                  rows={3}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
