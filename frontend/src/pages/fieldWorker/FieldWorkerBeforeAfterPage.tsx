import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  MapPin,
  Calendar,
  Camera,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Video,
  X,
  RotateCcw,
  Info,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import { EvidenceRecord } from '../../utils/evidenceValidator';

export default function FieldWorkerBeforeAfterPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Add After Photo Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [capturedEvidence, setCapturedEvidence] = useState<EvidenceRecord | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [afterCaption, setAfterCaption] = useState('');
  const [observedImprovement, setObservedImprovement] = useState('');
  const [remainingIssues, setRemainingIssues] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await apiClient.get('/field-worker/before-after');
      if (res.data.success && res.data.data?.records) {
        setRecords(res.data.data.records);
        setSelectedRecord(res.data.data.records[0] || null);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = (record: any) => {
    setSelectedRecord(record);
    setAfterPhotoUrl('');
    setCapturedEvidence(null);
    setCaptureError(null);
    setAfterCaption('');
    setObservedImprovement(record.impact?.observedImprovement || '');
    setRemainingIssues(record.impact?.remainingIssues || '');
    setModalOpen(true);
  };

  const handleStartCapture = (mode: 'photo' | 'video') => {
    setCameraMode(mode);
    setCameraModalOpen(true);
  };

  const handleCameraCapture = (record: EvidenceRecord) => {
    setCapturedEvidence(record);
    setAfterPhotoUrl(record.previewUrl);
    setCaptureError(null);
    if (!afterCaption) {
      setAfterCaption(
        record.type === 'live_video'
          ? `Live field video evidence (${record.duration}s) verifying resolution of ${selectedRecord?.challengeId || 'complaint'}`
          : `Live geotagged resolution photo verifying completion of ${selectedRecord?.challengeId || 'complaint'}`
      );
    }
    setCameraModalOpen(false);
  };

  const handleSubmitAfterPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!afterPhotoUrl || !capturedEvidence) {
      setCaptureError('Live geotagged camera evidence is mandatory. Please capture live photo or video.');
      return;
    }
    setSubmitting(true);
    setCaptureError(null);

    try {
      const isVideo = capturedEvidence.type === 'live_video';
      const payload = {
        photoUrl: !isVideo ? afterPhotoUrl : undefined,
        videoUrl: isVideo ? afterPhotoUrl : undefined,
        evidenceType: isVideo ? 'LIVE_VIDEO' : 'LIVE_PHOTO',
        caption: afterCaption || 'Official field worker live resolution evidence',
        observedImprovement,
        remainingIssues,
        latitude: capturedEvidence.latitude,
        longitude: capturedEvidence.longitude,
        accuracy: capturedEvidence.accuracy,
        address: capturedEvidence.address || selectedRecord.location,
        timestamp: capturedEvidence.capturedAt || capturedEvidence.recordedAt || new Date().toISOString(),
      };

      const res = await apiClient.post(`/field-worker/before-after/${selectedRecord.id}/after-photo`, payload);
      if (res.data.success) {
        setModalOpen(false);
        fetchRecords();
      }
    } catch (err: any) {
      // Complete locally if offline
      if (selectedRecord && capturedEvidence) {
        selectedRecord.afterPhotos.push({
          url: afterPhotoUrl,
          caption: afterCaption || 'Official field worker live resolution evidence',
          timestamp: new Date().toLocaleTimeString(),
          uploadedBy: `${user?.name || 'Field Officer'} (Official)`,
          type: 'After',
          geotag: `${capturedEvidence.latitude.toFixed(5)}, ${capturedEvidence.longitude.toFixed(5)}`,
          evidenceType: capturedEvidence.type === 'live_video' ? 'LIVE_VIDEO' : 'LIVE_PHOTO',
        });
        if (observedImprovement) selectedRecord.impact.observedImprovement = observedImprovement;
        if (remainingIssues) selectedRecord.impact.remainingIssues = remainingIssues;
        setModalOpen(false);
      } else {
        setCaptureError(err.response?.data?.message || 'Failed to submit evidence.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-900 text-white">
            <Layers size={18} className="text-amber-400" />
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Before / After Verification
          </h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Visual comparison of pre-intervention citizen evidence against verified field remediation evidence.
        </p>
      </div>

      {/* 2. Before / After Comparison Records */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-blue-900" />
          <span>Loading before/after records...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
          <Layers size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">No before/after records found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {records.map((rec) => (
            <div key={rec.id} className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              {/* Record Title Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      {rec.challengeId}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {rec.category} • {rec.ward}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{rec.problem}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span>{rec.address}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddModal(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
                >
                  <Plus size={14} className="text-amber-400" />
                  <span>Add After Photo</span>
                </button>
              </div>

              {/* Side-by-Side Visual Comparison */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: BEFORE CONDITION (Citizen Evidence - Read Only) */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-700" />
                      <span>BEFORE CONDITION (Citizen Evidence)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-800">
                      {rec.beforeDate}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {rec.beforePhotos?.map((p: any, idx: number) => (
                      <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                        <div className="h-52 w-full overflow-hidden bg-slate-100">
                          <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 text-xs space-y-1">
                          <p className="font-semibold text-slate-900 text-xs">{p.caption}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Uploaded By: <strong>{p.uploadedBy}</strong></span>
                            <span className="font-mono">{p.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900">
                    <strong className="block font-bold mb-0.5">Citizen Initial Report:</strong>
                    <span>Original ground issue before municipal action. Protected from alteration.</span>
                  </div>
                </div>

                {/* RIGHT: AFTER CONDITION (Field Evidence) */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      <span>AFTER CONDITION (Field Verified)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800">
                      {rec.afterDate}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {rec.afterPhotos?.map((p: any, idx: number) => (
                      <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                        <div className="h-52 w-full overflow-hidden bg-slate-100">
                          <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 text-xs space-y-1">
                          <p className="font-semibold text-slate-900 text-xs">{p.caption}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Uploaded By: <strong>{p.uploadedBy}</strong></span>
                            <span className="font-mono">{p.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded bg-emerald-100/60 border border-emerald-200 text-[11px] text-emerald-900">
                    <strong className="block font-bold mb-0.5">Field Remediation Audit:</strong>
                    <span>{rec.fieldAuditNotes}</span>
                  </div>
                </div>
              </div>

              {/* FIELD IMPACT OBSERVATION SECTION (Prompt Section 23) */}
              <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-900" />
                  <span>FIELD IMPACT OBSERVATION</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Observed Improvement</span>
                    <p className="text-slate-800 font-semibold mt-1">{rec.impact?.observedImprovement}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Affected Area Footprint</span>
                    <p className="text-slate-800 font-semibold mt-1">{rec.impact?.affectedArea}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">People / Community Impact</span>
                    <p className="text-slate-800 font-semibold mt-1">{rec.impact?.communityImpact || 'Not yet measured'}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Service Delivery Improvement</span>
                    <p className="text-slate-800 font-semibold mt-1">{rec.impact?.serviceImprovement}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Remaining Issues</span>
                    <p className="text-amber-800 font-semibold mt-1">{rec.impact?.remainingIssues || 'None'}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Additional Observations</span>
                    <p className="text-slate-700 mt-1">{rec.impact?.additionalObservation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add After Photo Modal */}
      {modalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Add After Photo & Field Impact</h3>
                <p className="text-[11px] text-blue-200">{selectedRecord.challengeId} • {selectedRecord.problem}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAfterPhoto} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Field Resolution Proof (Camera Only)
                </label>

                {!capturedEvidence ? (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-3">
                    <div className="text-xs text-slate-600 font-medium">
                      Capture live geotagged proof at the ground location. Gallery or file uploads are strictly prohibited.
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartCapture('photo')}
                        className="py-2.5 px-3 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Camera size={14} className="text-amber-400" />
                        <span>📷 LIVE PHOTO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartCapture('video')}
                        className="py-2.5 px-3 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Video size={14} className="text-rose-400" />
                        <span>🎥 LIVE VIDEO (Max 60s)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-black relative max-h-52 flex items-center justify-center">
                      {capturedEvidence.type === 'live_video' ? (
                        <video src={afterPhotoUrl} controls className="max-h-52 w-full object-contain" />
                      ) : (
                        <img src={afterPhotoUrl} alt="Captured resolution proof" className="max-h-52 w-full object-contain" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 size={11} /> GPS Verified
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span>Lat: {capturedEvidence.latitude.toFixed(5)}° Long: {capturedEvidence.longitude.toFixed(5)}°</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedEvidence(null);
                          setAfterPhotoUrl('');
                        }}
                        className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 font-sans"
                      >
                        <RotateCcw size={12} /> Retake
                      </button>
                    </div>
                  </div>
                )}

                {captureError && (
                  <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{captureError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Photo Caption / Ground Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Drainage cover replaced and water drained..."
                  value={afterCaption}
                  onChange={(e) => setAfterCaption(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Observed Ground Improvement
                </label>
                <textarea
                  rows={2}
                  value={observedImprovement}
                  onChange={(e) => setObservedImprovement(e.target.value)}
                  placeholder="e.g. Water accumulation reduced after culvert repair..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Remaining Issues (if any)
                </label>
                <input
                  type="text"
                  value={remainingIssues}
                  onChange={(e) => setRemainingIssues(e.target.value)}
                  placeholder="e.g. Drain cover requires final asphalt sealing..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !capturedEvidence}
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save After Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Geotagged Camera Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        initialMode={cameraMode}
        complaintNumber={selectedRecord?.challengeId || 'COMPLAINT'}
        workerName={user?.name || 'Field Officer'}
        workerBadge="GOV-FW-OFFICER"
        departmentName={selectedRecord?.category || 'Municipal Civil Infrastructure'}
        ward={selectedRecord?.ward || 'Ward 12'}
      />
    </div>
  );
}
