import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  Send,
  Sparkles,
  RotateCcw,
  MessageSquare,
  Clock,
  AlertTriangle,
  Film,
  Camera,
  HardHat,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import ComplaintTimeline from '../../components/common/ComplaintTimeline';
import { Complaint } from '../../types';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment Box State
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Verification & Rating Modal State
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadComplaintDetail();
  }, [id]);

  const loadComplaintDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !complaint) return;

    setCommentSubmitting(true);
    try {
      const res = await apiClient.post(`/complaints/${complaint._id}/comments`, {
        message: newComment.trim(),
      });
      if (res.data.success) {
        setNewComment('');
        loadComplaintDetail();
      }
    } catch (e) {
      alert('Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleVerifyResolution = async (isVerified: boolean) => {
    if (!complaint) return;
    setIsVerifying(true);
    try {
      const res = await apiClient.post(`/complaints/${complaint._id}/verify`, {
        isVerified,
        rating: isVerified ? rating : undefined,
        feedback: feedbackText,
      });
      if (res.data.success) {
        setFeedbackText('');
        loadComplaintDetail();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="gov-container py-16 text-center text-slate-500 text-xs">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-700" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="gov-container max-w-xl py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-700 flex items-center justify-center">
          <XCircle size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{t('track.notFound')}</h2>
        <p className="text-xs text-slate-500">{error || t('track.notFoundDesc')}</p>
        <Link to="/track" className="gov-button-primary text-xs py-2 px-4 shadow-sm inline-flex">
          {t('track.searchBtn')}
        </Link>
      </div>
    );
  }

  const isReporter = user?._id && complaint.reportedBy?._id && user._id === complaint.reportedBy._id;
  const isVerificationPending =
    complaint.status === 'verification_pending' || complaint.status === 'resolution_submitted';

  return (
    <div className="gov-container max-w-4xl py-8 space-y-8">
      {/* Back Link & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('common.back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Official Case Record Card */}
      <div className="gov-card p-6 bg-white border border-slate-200 shadow-xs space-y-6">
        {/* Field Resolution Alert Banner */}
        {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-400 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">
                  Field Work Completed & Geotagged Proof Submitted
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Assigned Field Engineer has completed physical remediation on ground and submitted verified live photographic proof.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/90 border border-emerald-300 px-3 py-1.5 rounded-lg text-emerald-900 font-mono text-[11px] font-bold">
              <span>Status: Resolved</span>
            </div>
          </div>
        )}

        {/* Title & Metadata Top Grid */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded border border-blue-200">
              {complaint.complaintNumber}
            </span>
            <SLAIndicator slaState={complaint.slaState} deadline={complaint.slaDeadline} />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
            {complaint.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {complaint.description}
          </p>
        </div>

        {/* Nodal Officer & Department Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('common.category')}</span>
            <strong className="text-slate-900 capitalize">{t(`categories.${complaint.category}`)}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('common.department')}</span>
            <strong className="text-slate-900">{complaint.departmentId?.name || 'Public Works'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('common.ward')}</span>
            <strong className="text-slate-900">
              {complaint.wardId ? `Ward ${complaint.wardId.wardNumber} (${complaint.wardId.name})` : 'Central'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('admin.tableOfficer')}</span>
            <strong className="text-blue-900">
              {complaint.assignedOfficerId?.name || 'Inspection Pending'}
            </strong>
          </div>
        </div>

        {/* AI Advisory Assessment Callout */}
        {complaint.aiAnalysisId && (
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-lg space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-blue-950 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles size={14} className="text-amber-500" />
              <span>{t('report.aiAdvisoryBadge')}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{complaint.aiAnalysisId.summary}</p>
            <p className="text-[10px] text-slate-500 italic">
              {t('report.aiDisclaimer')}
            </p>
          </div>
        )}

        {/* Evidence Photos Comparison (Before vs After) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('common.evidence')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>{t('detail.evidenceBefore')}</span>
              </span>
              {complaint.photos && complaint.photos.length > 0 ? (
                <div className="rounded-lg overflow-hidden border border-slate-300">
                  <img
                    src={complaint.photos[0]}
                    alt="Original Defect"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border border-slate-200">
                  No before photograph uploaded
                </div>
              )}
            </div>

            {/* After Photo (Resolution Proof) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>{t('detail.evidenceAfter')} (Live Field Proof)</span>
                </span>
                {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold border border-emerald-300">
                    GEOTAG VERIFIED
                  </span>
                )}
              </span>
              {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 ? (
                <div className="rounded-lg overflow-hidden border-2 border-emerald-500 shadow-sm space-y-2 bg-emerald-50/40 p-2">
                  <div className="relative group rounded-md overflow-hidden">
                    <img
                      src={complaint.resolutionEvidence.photos[0]}
                      alt="Resolution Evidence"
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      <Camera size={11} className="text-emerald-400" />
                      <span>LIVE CAPTURE AUDIT</span>
                    </div>
                  </div>

                  {/* Geotagged & Officer Metadata */}
                  <div className="bg-white p-2.5 rounded border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-800 font-bold border-b border-slate-100 pb-1">
                      <span className="flex items-center gap-1 text-slate-900">
                        <HardHat size={13} className="text-emerald-600" />
                        <span>
                          {typeof complaint.resolutionEvidence.resolvedBy === 'object' && complaint.resolutionEvidence.resolvedBy?.name
                            ? complaint.resolutionEvidence.resolvedBy.name
                            : complaint.assignedOfficerId?.name || 'Assigned Field Officer'}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {complaint.resolutionEvidence.resolvedAt
                          ? new Date(complaint.resolutionEvidence.resolvedAt).toLocaleString()
                          : 'Remediated & Verified'}
                      </span>
                    </div>

                    {complaint.resolutionEvidence.capturedLocation && (
                      <div className="text-[11px] font-mono text-blue-900 bg-blue-50/60 px-2 py-0.5 rounded flex items-center justify-between">
                        <span>
                          📍 {complaint.resolutionEvidence.capturedLocation.latitude.toFixed(4)}° N,{' '}
                          {complaint.resolutionEvidence.capturedLocation.longitude.toFixed(4)}° E
                        </span>
                        <span className="text-slate-500">
                          ±{complaint.resolutionEvidence.capturedLocation.accuracy || 3.5}m GPS
                        </span>
                      </div>
                    )}

                    {complaint.resolutionEvidence.description && (
                      <p className="text-[11px] text-slate-700 italic pt-0.5">
                        "{complaint.resolutionEvidence.description}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 rounded-lg bg-slate-50 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300">
                  Remediation proof pending field officer submission
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Citizen Verification & Resolution Confirmation Action Box */}
        {isVerificationPending && isReporter && (
          <div className="gov-card p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm sm:text-base">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span>{t('detail.verificationRequired')}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {t('detail.verificationPrompt')}
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {t('detail.ratingLabel')}
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={22}
                      className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('detail.feedbackComment')}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleVerifyResolution(true)}
                disabled={isVerifying}
                className="gov-button-success text-xs py-2.5 px-4 shadow-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>{t('detail.confirmButton')}</span>
              </button>
              <button
                onClick={() => handleVerifyResolution(false)}
                disabled={isVerifying}
                className="gov-button-danger text-xs py-2.5 px-4 shadow-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>{t('detail.reopenButton')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('detail.timelineTitle')}
          </h3>
          <ComplaintTimeline status={complaint.status} statusHistory={complaint.statusHistory} />
        </div>

        {/* Official Communication & Comment Thread */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-900" />
            <span>{t('detail.commentsTitle')}</span>
          </h3>

          {/* Comments List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((comment: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs space-y-1 ${
                    comment.isInternal
                      ? 'bg-amber-50 border border-amber-200 text-amber-950 ml-4'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>{comment.author?.name || 'Municipal Officer'}</span>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{comment.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No messages in official thread.</p>
            )}
          </div>

          {/* New Comment Box */}
          <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('detail.addCommentPlaceholder')}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-700 focus:bg-white"
            />
            <button
              type="submit"
              disabled={commentSubmitting || !newComment.trim()}
              className="gov-button-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>{t('detail.sendComment')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
