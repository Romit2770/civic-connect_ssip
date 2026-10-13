import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Camera,
  Cpu,
  Fingerprint,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Info,
} from 'lucide-react';
import { EvidenceVerification, HumanReviewDecision } from '../../types';
import { apiClient, getErrorMessage } from '../../api/client';
import EvidenceVerificationBadge from './EvidenceVerificationBadge';

interface EvidenceVerificationPanelProps {
  verification?: EvidenceVerification | null;
  complaintId?: string;
  isOfficer?: boolean;
  onUpdate?: () => void;
}

export default function EvidenceVerificationPanel({
  verification,
  complaintId,
  isOfficer = false,
  onUpdate,
}: EvidenceVerificationPanelProps) {
  const { t } = useTranslation();
  const [overrideDecision, setOverrideDecision] = useState<HumanReviewDecision>('ACCEPTED');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!verification) {
    return (
      <div className="gov-card p-4 bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info size={16} className="text-blue-700 shrink-0" />
        <span>Evidence authenticity verification pending or unavailable for this record.</span>
      </div>
    );
  }

  const handleHumanReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification?._id) return;

    setSubmitting(true);
    setActionSuccess(null);
    try {
      const res = await apiClient.post(`/evidence/${verification._id}/human-review`, {
        decision: overrideDecision,
        notes: overrideNotes.trim(),
      });
      if (res.data.success) {
        setActionSuccess(`Human review decision (${overrideDecision}) recorded in official audit log.`);
        setOverrideNotes('');
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gov-card p-5 bg-white border border-slate-200 shadow-xs space-y-5 rounded-xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Fingerprint size={20} className="text-blue-900" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Civic Evidence Authenticity & Verification
            </h3>
            <p className="text-[11px] text-slate-500">
              Multi-Signal AI Forensics, Metadata, Perceptual Hash & Defect Consistency
            </p>
          </div>
        </div>

        <EvidenceVerificationBadge
          status={verification.verificationStatus}
          riskScore={verification.overallRiskScore}
          showScore={true}
          size="md"
        />
      </div>

      {/* Citizen or Public Assessment Callout */}
      <div
        className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
          verification.verificationStatus === 'PASS'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : verification.verificationStatus === 'REVIEW'
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
        }`}
      >
        <p className="font-bold text-xs mb-0.5">
          {verification.citizenMessage}
        </p>
        <p className="text-[11px] opacity-85">
          {verification.officerNotes}
        </p>
      </div>

      {/* 4 Multi-Signal Summary Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Signal 1: AI Visual Authenticity */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase">
            <Cpu size={13} className="text-blue-700" />
            <span>Visual Realism</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {verification.aiVisual?.authenticityStatus?.replace('_', ' ') || 'LIKELY REAL'}
          </p>
          <p className="text-[10px] text-slate-500">
            Synthetic Risk: {Math.round((verification.aiVisual?.syntheticProbability || 0) * 100)}%
          </p>
        </div>

        {/* Signal 2: Civic Relevance */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase">
            <FileCheck2 size={13} className="text-emerald-700" />
            <span>Civic Relevance</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {verification.civicRelevance?.isCivicIssueVisible ? 'Defect Visible' : 'No Issue Seen'}
          </p>
          <p className="text-[10px] text-slate-500">
            Confidence: {Math.round((verification.civicRelevance?.relevanceConfidence || 0.9) * 100)}%
          </p>
        </div>

        {/* Signal 3: EXIF Metadata */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase">
            <Camera size={13} className="text-amber-600" />
            <span>EXIF Metadata</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {verification.metadata?.available ? 'Available' : 'Stripped / Web'}
          </p>
          <p className="text-[10px] text-slate-500">
            {verification.metadata?.hasEditingSoftware ? 'Editing Flagged' : 'No Tampering Tag'}
          </p>
        </div>

        {/* Signal 4: Perceptual Fingerprint */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase">
            <Fingerprint size={13} className="text-purple-700" />
            <span>Perceptual Hash</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {verification.duplicateCheck?.isDuplicate ? 'Possible Reused' : 'Unique Image'}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {verification.perceptualHash ? `#${verification.perceptualHash.substring(0, 8)}...` : 'Generated'}
          </p>
        </div>
      </div>

      {/* Forensic Details Accordion/List */}
      <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          Forensic Signal Breakdown
        </h4>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-[11px] text-slate-700">
          <div>
            <strong className="text-slate-900">AI Visual Reasoning: </strong>
            <span>{verification.aiVisual?.reasoningSummary}</span>
          </div>

          <div>
            <strong className="text-slate-900">Civic Defect Assessment: </strong>
            <span>{verification.civicRelevance?.reasoning}</span>
          </div>

          {verification.metadata?.findings && verification.metadata.findings.length > 0 && (
            <div>
              <strong className="text-slate-900">Metadata Observations: </strong>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
                {verification.metadata.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {verification.duplicateCheck?.findings && (
            <div>
              <strong className="text-slate-900">Image Fingerprint Match: </strong>
              <span>{verification.duplicateCheck.findings}</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Human Review Audit State (if already reviewed) */}
      {verification.humanReview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1 text-blue-950">
          <div className="flex items-center gap-1.5 font-bold">
            <UserCheck size={15} className="text-blue-700" />
            <span>Authorized Officer Review Completed</span>
          </div>
          <p>
            Decision: <strong className="uppercase">{verification.humanReview.decision}</strong> by {verification.humanReview.reviewerName} ({verification.humanReview.reviewerRole?.replace('_', ' ')}) on {new Date(verification.humanReview.reviewedAt).toLocaleString()}
          </p>
          {verification.humanReview.notes && (
            <p className="italic text-[11px]">Notes: "{verification.humanReview.notes}"</p>
          )}
        </div>
      )}

      {/* Officer Human-In-The-Loop Action Bar (Staff Portal) */}
      {isOfficer && (
        <form onSubmit={handleHumanReview} className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
              <UserCheck size={15} />
              <span>Municipal Officer Evidence Determination</span>
            </h4>
            <span className="text-[10px] text-slate-400">Human-in-the-loop override</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Official Determination
              </label>
              <select
                value={overrideDecision}
                onChange={(e) => setOverrideDecision(e.target.value as HumanReviewDecision)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-semibold focus:outline-none focus:border-amber-400 text-xs"
              >
                <option value="ACCEPTED">ACCEPT — Validated Civic Evidence</option>
                <option value="MARKED_FOR_REVIEW">MARK FOR REVIEW — Additional Inspection</option>
                <option value="REQUESTED_NEW_EVIDENCE">REQUEST NEW EVIDENCE — Ask Citizen to Re-upload</option>
                <option value="REJECTED">REJECT — Fabricated or Irrelevant</option>
                <option value="OVERRIDDEN">OVERRIDE AI — Approved by Municipal Code</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Officer Justification & Audit Remarks
              </label>
              <input
                type="text"
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Confirmed genuine on-site during ward inspection"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>{submitting ? 'Recording Audit...' : 'Submit Official Determination'}</span>
            </button>
          </div>

          {actionSuccess && (
            <p className="text-[11px] text-emerald-400 font-semibold pt-1">
              ✓ {actionSuccess}
            </p>
          )}
        </form>
      )}

      {/* Statutory Disclaimer */}
      <p className="text-[10px] text-slate-400 italic text-center">
        CivicConnect AI-assisted evidence assessment. No automated rejection occurs solely based on model uncertainty. Authorized human officer review retains statutory authority.
      </p>
    </div>
  );
}
