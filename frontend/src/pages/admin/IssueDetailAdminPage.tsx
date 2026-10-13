import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Lock,
  Film,
  Camera,
  HardHat,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import ComplaintTimeline from '../../components/common/ComplaintTimeline';
import EvidenceVerificationPanel from '../../components/common/EvidenceVerificationPanel';
import { Complaint, ComplaintStatus, User as UserType } from '../../types';

export default function IssueDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [officers, setOfficers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative Dispatch State
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status Override State
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Comment State
  const [adminComment, setAdminComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadCaseFile();
    loadOfficers();
  }, [id]);

  const loadCaseFile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
        if (res.data.data.assignedOfficerId?._id) {
          setSelectedOfficerId(res.data.data.assignedOfficerId._id);
        }
      }
    } catch (e) {
      console.warn('Failed to load case file');
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async () => {
    try {
      const res = await apiClient.get('/officers');
      if (res.data.success) {
        setOfficers(res.data.data || []);
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleAssignOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedOfficerId) return;

    setAssigning(true);
    try {
      const res = await apiClient.post(`/complaints/${complaint._id}/assign`, {
        officerId: selectedOfficerId,
        instructions: 'Assigned via Municipal Operations Desk',
      });
      if (res.data.success) {
        alert('Officer dispatched successfully!');
        loadCaseFile();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await apiClient.put(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        note: statusNote || 'Manual status change by operations officer',
      });
      if (res.data.success) {
        setNewStatus('');
        setStatusNote('');
        loadCaseFile();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePostAdminComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !adminComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/complaints/${complaint._id}/comments`, {
        message: adminComment.trim(),
        isInternal,
      });
      if (res.data.success) {
        setAdminComment('');
        setIsInternal(false);
        loadCaseFile();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-700" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Case Record Not Found</h2>
        <Link to="/admin/issues" className="gov-button-primary text-xs py-2 px-4 inline-flex">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/issues')}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {complaint.complaintNumber}
              </span>
              <PriorityBadge priority={complaint.priority} size="sm" />
              <StatusBadge status={complaint.status} size="sm" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 mt-1">{complaint.title}</h1>
          </div>
        </div>

        <SLAIndicator slaState={complaint.slaState} deadline={complaint.slaDeadline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Evidence, AI Inspection, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description & Location Card */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Citizen Grievance Submission
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed">
              {complaint.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                <strong className="text-slate-900 capitalize">{complaint.category}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Reported By</span>
                <strong className="text-slate-900">{complaint.reportedBy?.name || 'Citizen'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Location</span>
                <strong className="text-slate-900">{complaint.location?.address || 'City Coordinates'}</strong>
              </div>
            </div>
          </div>

          {/* AI Multimodal Analysis Card */}
          {complaint.aiAnalysisId && (
            <div className="gov-card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-950 uppercase tracking-wider">
                <Sparkles size={16} className="text-amber-500" />
                <span>AI Automated Multimodal Quality Audit</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{complaint.aiAnalysisId.summary}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 font-semibold text-slate-800">
                <div>Severity: <span className="font-mono font-bold text-amber-900">{complaint.aiAnalysisId.severity}/10</span></div>
                <div>Confidence: <span className="font-mono font-bold text-blue-900">{Math.round(complaint.aiAnalysisId.confidence * 100)}%</span></div>
                <div>Method: <span className="font-mono text-slate-600 uppercase">{complaint.aiAnalysisId.analysisMethod}</span></div>
              </div>
            </div>
          )}

          {/* Evidence Photos */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Photographic & Video Evidence Comparison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Citizen Evidence (Before)</span>
                {complaint.photos && complaint.photos.length > 0 ? (
                  <img
                    src={complaint.photos[0]}
                    alt="Before"
                    className="w-full h-48 object-cover rounded-lg border border-slate-300"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>Officer Remediation (After Proof)</span>
                  </span>
                  {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold border border-emerald-300">
                      LIVE GEOTAGGED
                    </span>
                  )}
                </span>
                {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 ? (
                  <div className="space-y-2 bg-emerald-50/50 p-2 rounded-lg border-2 border-emerald-500">
                    <div className="relative group rounded-md overflow-hidden">
                      <img
                        src={complaint.resolutionEvidence.photos[0]}
                        alt="After"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-emerald-950/80 text-white text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                        <Camera size={10} className="text-emerald-400" />
                        <span>FIELD WORKER LIVE CAPTURE</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-800 font-bold border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1">
                          <HardHat size={12} className="text-emerald-700" />
                          <span>
                            {typeof complaint.resolutionEvidence.resolvedBy === 'object' && complaint.resolutionEvidence.resolvedBy?.name
                              ? complaint.resolutionEvidence.resolvedBy.name
                              : complaint.assignedOfficerId?.name || 'Assigned Field Officer'}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {complaint.resolutionEvidence.resolvedAt
                            ? new Date(complaint.resolutionEvidence.resolvedAt).toLocaleString()
                            : 'Closed'}
                        </span>
                      </div>

                      {complaint.resolutionEvidence.capturedLocation && (
                        <div className="text-[10px] font-mono text-blue-900 bg-blue-50/60 px-1.5 py-0.5 rounded flex items-center justify-between">
                          <span>
                            📍 {complaint.resolutionEvidence.capturedLocation.latitude.toFixed(4)}° N,{' '}
                            {complaint.resolutionEvidence.capturedLocation.longitude.toFixed(4)}° E
                          </span>
                          <span className="text-slate-500">
                            ±{complaint.resolutionEvidence.capturedLocation.accuracy || 3.5}m
                          </span>
                        </div>
                      )}

                      {complaint.resolutionEvidence.description && (
                        <p className="text-[11px] text-slate-700 italic">
                          "{complaint.resolutionEvidence.description}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    Remediation proof not yet submitted
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Video Evidence (if provided) */}
            {complaint.videos && complaint.videos.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Film size={14} className="text-amber-700" />
                  <span>Citizen Video Evidence ({complaint.videos.length})</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {complaint.videos.map((vidUrl, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-slate-400 bg-black">
                      <video src={vidUrl} controls className="w-full h-48 object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Evidence Authenticity & Forensic Inspection Panel */}
          <EvidenceVerificationPanel
            verification={complaint.evidenceVerificationId}
            complaintId={complaint._id}
            isOfficer={true}
            onUpdate={loadCaseFile}
          />

          {/* Timeline */}
          <ComplaintTimeline status={complaint.status} statusHistory={complaint.statusHistory} />
        </div>

        {/* Right 1 Col: Dispatch, Status Override, Internal Communications */}
        <div className="space-y-6">
          {/* Officer Dispatch Widget */}
          <div className="gov-card p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={16} className="text-blue-900" />
              <span>Officer Dispatch</span>
            </h3>

            <form onSubmit={handleAssignOfficer} className="space-y-3 text-xs">
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
              >
                <option value="">Select Field Officer...</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} ({o.department?.name || 'Municipal Staff'})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={assigning || !selectedOfficerId}
                className="gov-button-primary w-full text-xs py-2 shadow-2xs font-bold disabled:opacity-50"
              >
                {assigning ? 'Dispatching...' : 'Assign Field Officer'}
              </button>
            </form>
          </div>

          {/* Status Override Widget */}
          <div className="gov-card p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={16} className="text-amber-700" />
              <span>Manual Status Override</span>
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
              >
                <option value="">Select New State...</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved & Closed</option>
                <option value="reopened">Reopened</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Reason / Note for status override..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-700"
              />

              <button
                type="submit"
                disabled={updatingStatus || !newStatus}
                className="gov-button-secondary w-full text-xs py-2 font-bold disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Apply Status Change'}
              </button>
            </form>
          </div>

          {/* Internal Staff Notes & Communication */}
          <div className="gov-card p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={16} className="text-blue-900" />
              <span>Staff Communication</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {complaint.comments?.map((c) => (
                <div
                  key={c._id}
                  className={`p-2.5 rounded-lg space-y-1 ${
                    c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900 text-[11px]">
                    <span>{c.authorName}</span>
                    {c.isInternal && (
                      <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.5 rounded flex items-center gap-0.5">
                        <Lock size={9} /> Internal Note
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700">{c.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostAdminComment} className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                rows={2}
                placeholder="Post an official note or reply..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Internal Staff Only</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingComment || !adminComment.trim()}
                  className="gov-button-primary text-xs py-1.5 px-3"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
