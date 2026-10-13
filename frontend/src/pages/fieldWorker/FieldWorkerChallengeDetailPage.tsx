import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  Camera,
  Video,
  ShieldCheck,
  User,
  Compass,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  RotateCcw,
  Check,
  Sparkles,
  Play,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import { EvidenceRecord } from '../../utils/evidenceValidator';

// Fix Leaflet marker icons in React
const customPinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function FieldWorkerChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Camera Resolution State (STRICTLY NO ARBITRARY UPLOAD)
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [capturedEvidence, setCapturedEvidence] = useState<EvidenceRecord | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionCategory, setResolutionCategory] = useState('Completed Work');

  const loadChallenge = async () => {
    try {
      const res = await apiClient.get(`/field-worker/challenges/${id}`);
      if (res.data.success && res.data.data) {
        setChallenge(res.data.data.challenge);
        setVerifications(res.data.data.verifications || []);
      }
    } catch (err) {
      console.error('Error loading challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [id]);

  const handleStartWork = async () => {
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await apiClient.post(`/field-worker/challenges/${id}/start-work`);
      if (res.data.success) {
        setActionSuccess('Task status updated to IN PROGRESS.');
        loadChallenge();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to start work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCameraCapture = (record: EvidenceRecord) => {
    setCapturedEvidence(record);
    setCameraModalOpen(false);
  };

  const handleRetakeEvidence = () => {
    setCapturedEvidence(null);
    setCameraModalOpen(true);
  };

  const handleSubmitResolution = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!capturedEvidence) {
      alert('Please capture live photo or video evidence before submitting resolution.');
      return;
    }
    setActionLoading(true);
    try {
      const isVideo = capturedEvidence.type === 'live_video';
      const payload = {
        description: resolutionRemarks.trim() || `Field remediation completed on-site with live ${isVideo ? 'video' : 'photo'} proof.`,
        photos: !isVideo ? [capturedEvidence.previewUrl] : [],
        videos: isVideo ? [capturedEvidence.previewUrl] : [],
        evidenceType: isVideo ? 'LIVE_VIDEO' : 'LIVE_PHOTO',
        latitude: capturedEvidence.latitude,
        longitude: capturedEvidence.longitude,
        accuracy: capturedEvidence.accuracy,
        address: capturedEvidence.address || challenge.location?.address,
        ward: challenge.ward,
        completionNotes: resolutionRemarks.trim(),
        category: resolutionCategory,
      };

      const res = await apiClient.post(`/field-worker/challenges/${id}/resolution`, payload);
      if (res.data.success) {
        setActionSuccess('Live geotagged resolution evidence submitted for Municipal Review.');
        setCapturedEvidence(null);
        setResolutionRemarks('');
        loadChallenge();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to submit resolution');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading challenge verification profile...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle size={36} className="mx-auto text-amber-500" />
        <h2 className="text-base font-bold text-slate-900">Challenge Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested challenge ID is outside your authorized municipal jurisdiction or does not exist.
        </p>
        <Link
          to="/field-worker/challenges"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Return to Assignments</span>
        </Link>
      </div>
    );
  }

  const lat = challenge.location?.latitude || 22.5601;
  const lng = challenge.location?.longitude || 72.9285;
  const statusStr = (challenge.status || '').toLowerCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/field-worker/challenges')}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Back to Assigned Challenges"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                {challenge.complaintNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  challenge.priority === 'CRITICAL'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : challenge.priority === 'HIGH'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {challenge.priority} PRIORITY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 uppercase">
                {challenge.status?.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 mt-1">
              {challenge.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(statusStr === 'assigned' || statusStr === 'pending_verification') && (
            <button
              onClick={handleStartWork}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Start Work</span>
            </button>
          )}

          {statusStr === 'in_progress' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCameraMode('photo');
                  setCameraModalOpen(true);
                }}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Camera size={13} className="text-amber-400" />
                <span>📷 Live Photo</span>
              </button>
              <button
                onClick={() => {
                  setCameraMode('video');
                  setCameraModalOpen(true);
                }}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Video size={13} className="text-white" />
                <span>🎥 Live Video</span>
              </button>
            </div>
          )}

          {statusStr === 'resolution_submitted' && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
              Resolution Submitted (Pending Municipal Review)
            </span>
          )}

          <Link
            to={`/field-worker/verification?challengeId=${challenge.id}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-sm transition-colors shrink-0"
          >
            <Camera size={14} className="text-amber-400" />
            <span>Camera Capture</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg">
          {actionSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Challenge Information & Citizen Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* ASSIGNMENT INFORMATION CARD */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
            <h2 className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-900" />
              <span>ASSIGNMENT DETAILS</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Worker</span>
                <span className="font-bold text-slate-900">{challenge.assignedOfficer?.name || 'Assigned Officer'}</span>
                <span className="text-[10px] text-slate-500 block font-mono">{challenge.assignedOfficer?.badgeNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Department</span>
                <span className="font-bold text-slate-800">{challenge.department || 'Public Works'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned By</span>
                <span className="font-semibold text-slate-800">Municipal Admin</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Date</span>
                <span className="font-mono text-slate-700">{challenge.assignedDate || 'Today'}</span>
              </div>
            </div>
          </div>

          {/* Challenge Description Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Challenge Information
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Description</span>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{challenge.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Civic Domain</span>
                  <span className="font-semibold text-slate-900">{challenge.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Reported Date</span>
                  <span className="font-mono text-slate-900">{challenge.reportedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Due Date SLA</span>
                  <span className="font-mono font-bold text-red-700">{challenge.dueDate}</span>
                </div>
              </div>

              {/* Citizen Reporting Info (Privacy Model Protected) */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <User size={15} />
                </div>
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Reported By</span>
                  <span className="font-semibold text-slate-800">{challenge.reportedBy || 'Citizen / Community User'}</span>
                  <p className="text-[10px] text-slate-500">Citizen contact protected under CivicConnect Privacy Protocol.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CITIZEN-SUBMITTED EVIDENCE CARD */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-900" />
                  <span>CITIZEN-SUBMITTED EVIDENCE</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Original media submitted by citizen during grievance filing. Immutable audit trail.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Read-Only
              </span>
            </div>

            {/* Photo Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {challenge.citizenEvidence?.map((ev: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group cursor-pointer"
                  onClick={() => setSelectedPhoto(ev.url)}
                >
                  <div className="h-44 w-full overflow-hidden bg-slate-200 relative">
                    <img
                      src={ev.url}
                      alt={ev.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[9px]">
                      {ev.timestamp}
                    </span>
                  </div>
                  <div className="p-2.5 text-xs text-slate-700">
                    <p className="font-medium text-[11px]">{ev.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RESOLUTION EVIDENCE / BEFORE-AFTER SECTION */}
          {(() => {
            const hasSubmittedEvidence = Boolean(
              challenge.resolutionEvidence &&
              ((challenge.resolutionEvidence.photos && challenge.resolutionEvidence.photos.length > 0) ||
               (challenge.resolutionEvidence.videos && challenge.resolutionEvidence.videos.length > 0)) &&
              ['resolution_submitted', 'verification_pending', 'resolved', 'closed'].includes(statusStr)
            );

            return (
              <div id="resolution-evidence-section" className="p-5 rounded-xl bg-white border-2 border-blue-900/30 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-900 text-amber-400 font-mono">
                        OFFICIAL VERIFICATION
                      </span>
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        FIELD WORKER RESOLUTION EVIDENCE
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Live Geotagged Resolution Proof • Real-time device camera capture at complaint coordinates.
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {hasSubmittedEvidence ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock size={12} />
                        <span>Resolution Submitted for Review</span>
                      </span>
                    ) : capturedEvidence ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Check size={12} />
                        <span>Resolution Evidence Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        <span>Awaiting Field Worker Resolution Evidence</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* BEFORE / AFTER Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* BEFORE: Citizen Reported Evidence */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
                    <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wide">
                        BEFORE
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        Citizen Reported Evidence
                      </span>
                    </div>
                    <div className="h-56 w-full bg-slate-200 relative overflow-hidden flex items-center justify-center">
                      {challenge.citizenEvidence?.[0]?.url ? (
                        <img
                          src={challenge.citizenEvidence[0].url}
                          alt="Citizen Before Evidence"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs italic">
                          No initial photo reported
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono">
                        Reported: {challenge.reportedDate}
                      </div>
                    </div>
                    <div className="p-3 text-xs bg-white grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Grievance Description</span>
                        <p className="text-[11px] text-slate-700 line-clamp-3 mt-0.5">{challenge.description}</p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100 text-[10.5px] text-slate-500 font-mono flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        <span className="truncate">{challenge.location?.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* AFTER: Field Worker Live Geotagged Resolution Evidence */}
                  <div className="rounded-xl border-2 border-blue-900/40 overflow-hidden bg-slate-50 flex flex-col">
                    <div className="p-2.5 bg-blue-900 text-white flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-amber-400" />
                        <span>AFTER</span>
                      </span>
                      <span className="text-[10px] font-mono bg-white/15 px-1.5 py-0.5 rounded text-blue-100">
                        Live Field Evidence
                      </span>
                    </div>

                    {hasSubmittedEvidence ? (
                      /* 1. Already Submitted Resolution View */
                      <div className="flex flex-col grow">
                        <div className="h-56 w-full bg-black relative overflow-hidden flex items-center justify-center">
                          {challenge.resolutionEvidence?.videos?.[0] || challenge.resolutionEvidence?.evidenceType === 'LIVE_VIDEO' ? (
                            <video
                              src={challenge.resolutionEvidence.videos?.[0] || challenge.resolutionEvidence.photos?.[0]}
                              controls
                              playsInline
                              className="w-full h-full object-contain bg-black"
                            />
                          ) : (
                            <img
                              src={challenge.resolutionEvidence?.photos?.[0]}
                              alt="Submitted Resolution Proof"
                              className="w-full h-full object-contain bg-black"
                            />
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9.5px] font-bold flex items-center gap-1 shadow-xs">
                            <Check size={10} />
                            <span>GPS VERIFIED</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white space-y-2 grow text-xs border-t border-slate-200">
                          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] space-y-1">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>Field Worker: {challenge.resolutionEvidence?.resolvedBy?.name || user?.name}</span>
                              <span className="font-mono text-[10px] text-blue-900">
                                {challenge.resolutionEvidence?.capturedLocation
                                  ? `${Number(challenge.resolutionEvidence.capturedLocation.latitude).toFixed(4)}° N, ${Number(challenge.resolutionEvidence.capturedLocation.longitude).toFixed(4)}° E`
                                  : 'On-site Geotagged'}
                              </span>
                            </div>
                            {challenge.resolutionEvidence?.resolvedAt && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Completion: {new Date(challenge.resolutionEvidence.resolvedAt).toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                          {challenge.resolutionEvidence?.description && (
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">Completion Remarks</span>
                              <p className="text-[11px] text-slate-800 italic mt-0.5">
                                "{challenge.resolutionEvidence.description}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : capturedEvidence ? (
                      /* 2. Ready to submit captured live evidence */
                      <div className="flex flex-col grow">
                        <div className="h-56 w-full bg-black relative overflow-hidden flex items-center justify-center">
                          {capturedEvidence.type === 'live_video' ? (
                            <video
                              src={capturedEvidence.previewUrl}
                              controls
                              playsInline
                              className="w-full h-full object-contain bg-black"
                            />
                          ) : (
                            <img
                              src={capturedEvidence.previewUrl}
                              alt="Captured Geotagged Evidence"
                              className="w-full h-full object-contain bg-black"
                            />
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9.5px] font-bold flex items-center gap-1 shadow-xs">
                            <Check size={10} />
                            <span>GPS VERIFIED</span>
                          </div>
                          {capturedEvidence.duration && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[9.5px] font-bold font-mono">
                              {capturedEvidence.duration}s
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-white space-y-2.5 grow text-xs border-t border-slate-200">
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-emerald-950">
                              <span className="truncate">📍 {capturedEvidence.locationName || 'Current Location'}</span>
                              <span className="font-mono text-[10px] shrink-0">±{Math.round(capturedEvidence.accuracy || 10)}m</span>
                            </div>
                            <div className="text-[10px] text-emerald-800 font-mono">
                              Lat {capturedEvidence.latitude.toFixed(6)}° • Long {capturedEvidence.longitude.toFixed(6)}°
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Captured: {capturedEvidence.capturedAt || capturedEvidence.recordedAt}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                              Inspection Tag / Category:
                            </label>
                            <select
                              value={resolutionCategory}
                              onChange={(e) => setResolutionCategory(e.target.value)}
                              className="w-full p-1.5 rounded-md border border-slate-300 text-xs font-semibold bg-white"
                            >
                              <option value="Completed Work">Completed Work</option>
                              <option value="Work In Progress">Work In Progress</option>
                              <option value="Problem Area">Problem Area</option>
                              <option value="Safety Condition">Safety Condition</option>
                              <option value="Road Condition">Road Condition</option>
                              <option value="Drainage">Drainage</option>
                              <option value="Garbage">Garbage</option>
                              <option value="Streetlight">Streetlight</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                              Ground Note / Completion Description: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              value={resolutionRemarks}
                              onChange={(e) => setResolutionRemarks(e.target.value)}
                              placeholder="Detail the repair work executed on site with verified proof..."
                              className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={handleRetakeEvidence}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Retake</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSubmitResolution()}
                              disabled={actionLoading}
                              className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>{actionLoading ? 'Submitting...' : 'Submit Resolution Proof'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 3. Awaiting Live Evidence Capture - STRICTLY NO FILE UPLOADS */
                      <div className="p-6 bg-white flex flex-col items-center justify-center text-center space-y-4 grow">
                        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center">
                          <Camera size={22} className="text-blue-900" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-tight">
                            Awaiting Field Worker Resolution Evidence
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Resolution proof requires live device camera capture on-site with verifiable GPS and GOI watermark. File and gallery uploads are prohibited.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraMode('photo');
                              setCameraModalOpen(true);
                            }}
                            className="p-3.5 rounded-xl border-2 border-blue-900 bg-blue-50/70 hover:bg-blue-100 text-blue-950 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                              <Camera size={18} />
                            </div>
                            <div className="text-center">
                              <span className="font-extrabold text-xs block">📷 LIVE PHOTO</span>
                              <span className="text-[10px] text-slate-600">Capture live photo</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCameraMode('video');
                              setCameraModalOpen(true);
                            }}
                            className="p-3.5 rounded-xl border-2 border-amber-600 bg-amber-50/70 hover:bg-amber-100 text-amber-950 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                          >
                            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                              <Video size={18} />
                            </div>
                            <div className="text-center">
                              <span className="font-extrabold text-xs block">🎥 LIVE VIDEO</span>
                              <span className="text-[10px] text-slate-600">Record live video (Max 60s)</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Submitted Verification Reports History if any */}
          {verifications.length > 0 && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Submitted Field Verification Logs ({verifications.length})
              </h2>
              <div className="space-y-2">
                {verifications.map((v: any) => (
                  <div key={v.id} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-900">{v.id} • {v.verificationResult}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{v.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{v.remarks}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Expected Location & Mini Map */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Location Verification Details
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Ward</span>
                <span className="font-bold text-slate-900">{challenge.ward}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Expected Address</span>
                <span className="text-slate-700 leading-snug">{challenge.location?.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">Latitude</span>
                  <span className="text-slate-900">{lat}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">Longitude</span>
                  <span className="text-slate-900">{lng}</span>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Mini Map */}
            <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-300 relative z-0">
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customPinIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong className="text-blue-900">{challenge.complaintNumber}</strong>
                      <p className="mt-1">{challenge.title}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <Compass size={14} className="text-blue-900" />
              <span>Open in External GPS Navigation</span>
            </a>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2">
            <img src={selectedPhoto} alt="Evidence Full" className="max-w-full max-h-[80vh] object-contain rounded" />
            <div className="p-2 text-center text-xs text-slate-600 font-bold">
              Citizen-Submitted Grievance Media (Read-Only)
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal (STRICTLY DEVICE CAMERA ONLY) */}
      {cameraModalOpen && (
        <CameraCaptureModal
          isOpen={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={handleCameraCapture}
          initialMode={cameraMode}
          complaintNumber={challenge.complaintNumber}
          workerName={user?.name}
          workerBadge={user?.badgeNumber || 'FW-01'}
          departmentName={challenge.department}
          ward={challenge.ward}
          category={resolutionCategory}
        />
      )}
    </div>
  );
}
