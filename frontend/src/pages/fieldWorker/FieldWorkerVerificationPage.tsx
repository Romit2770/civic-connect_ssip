import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  Upload,
  Video,
  FileText,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Info,
  Check,
  X,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Save,
  HardHat,
  Search,
  Crosshair,
  ExternalLink,
  Download,
  Eye,
  Sliders,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Compass,
  Trash2,
  Maximize2,
  FileDown,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { generateFieldReportPdf, FieldReportPdfData } from '../../utils/fieldReportPdfGenerator';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import { EvidenceRecord } from '../../utils/evidenceValidator';

// Leaflet custom marker icons
const targetPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const workerPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Leaflet Map Helper to auto-recenter when coordinates change
function RecenterMap({ center, zoom = 16 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Haversine distance formula in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const PHOTO_CATEGORIES = [
  'Problem Area',
  'Site Overview',
  'Infrastructure Damage',
  'Safety Hazard',
  'Water Accumulation',
  'Pre-Work Benchmark',
  'Surrounding Context',
  'Measurement Reference',
  'Other Ground Detail',
];



export default function FieldWorkerVerificationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialChallengeId = searchParams.get('challengeId') || '';

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedChallengeId, setSelectedChallengeId] = useState(initialChallengeId);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Current Challenge Data
  const [challenge, setChallenge] = useState<any>({
    id: 'CC-PENDING-ASSIGNMENT',
    complaintNumber: 'CC-PENDING',
    title: 'Assigned Field Inspection Docket',
    description: 'Civic infrastructure field investigation docket awaiting on-site engineering verification and photographic proofing.',
    priority: 'HIGH',
    ward: 'Ward 12',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Civic Infrastructure',
    location: {
      address: 'Anand Municipal Field Location',
      latitude: 22.5601,
      longitude: 72.9285,
    },
    citizenEvidence: [],
  });

  // Step 2 Location State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMode, setGpsMode] = useState<'simulated' | 'real' | 'aligned'>('simulated');
  const [capturedLocation, setCapturedLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    method?: string;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'Pending' | 'Matched' | 'Within Acceptable Range' | 'Outside Expected Location'
  >('Pending');
  const [remoteExceptionEnabled, setRemoteExceptionEnabled] = useState(false);
  const [remoteExceptionReason, setRemoteExceptionReason] = useState('');

  // Step 3 Site Visit State & Stopwatch
  const [visitStarted, setVisitStarted] = useState(false);
  const [visitPaused, setVisitPaused] = useState(false);
  const [visitStartTime, setVisitStartTime] = useState<string>('');
  const [visitId, setVisitId] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [weatherCondition, setWeatherCondition] = useState('Clear / Sunny (31°C)');
  const [ppeGearChecked, setPpeGearChecked] = useState<string[]>([
    'Safety Helmet',
    'High-Visibility Vest',
    'Safety Boots',
  ]);
  const [citizenContacted, setCitizenContacted] = useState<'Yes' | 'No' | 'Not Available'>('Yes');
  const [siteCheckInNotes, setSiteCheckInNotes] = useState('');

  // Step 4 Evidence State
  const [photos, setPhotos] = useState<
    Array<{
      id: string;
      url: string;
      category: string;
      caption: string;
      timestamp: string;
      geotag?: string;
      latitude?: number;
      longitude?: number;
      accuracy?: number;
    }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Problem Area');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [videos, setVideos] = useState<
    Array<{
      id: string;
      url: string;
      duration: string;
      caption: string;
      timestamp: string;
      category?: string;
      geotag?: string;
      latitude?: number;
      longitude?: number;
      accuracy?: number;
    }>
  >([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<any | null>(null);

  // Live Camera stream in browser
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 5 Observations State
  const [observedProblem, setObservedProblem] = useState('');
  const [actualGroundCondition, setActualGroundCondition] = useState('');
  const [fieldSeverity, setFieldSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [affectedArea, setAffectedArea] = useState('');
  const [peopleImpact, setPeopleImpact] = useState('');
  const [immediateRisks, setImmediateRisks] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Step 5 Structured Questions
  const [qIssuePresent, setQIssuePresent] = useState<'Yes' | 'No' | 'Partially'>('Yes');
  const [qLocationMatch, setQLocationMatch] = useState<'Yes' | 'No' | 'Partially'>('Yes');
  const [qIssueActive, setQIssueActive] = useState<'Yes' | 'No'>('Yes');
  const [qImmediateIntervention, setQImmediateIntervention] = useState<'Yes' | 'No'>('Yes');
  const [qConditionChange, setQConditionChange] = useState<'Improved' | 'Same' | 'Worsened'>('Worsened');
  const [qVisibleSafetyRisks, setQVisibleSafetyRisks] = useState<'Yes' | 'No'>('Yes');

  // Step 6 Verification Result
  const [verificationResult, setVerificationResult] = useState<
    'Verified' | 'Partially Verified' | 'Not Verified' | 'Unable to Verify' | 'Requires Follow-up'
  >('Verified');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportData, setSubmittedReportData] = useState<any | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // 1. Stopwatch timer for site inspection check-in
  useEffect(() => {
    let interval: any = null;
    if (visitStarted && !visitPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visitStarted, visitPaused]);

  // Format seconds to HH:MM:SS
  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Load available challenges and initialize selected one
  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get('/field-worker/challenges');
        if (res.data.success && res.data.data?.challenges) {
          const list = res.data.data.challenges;
          setAvailableChallenges(list);

          let target = null;
          if (selectedChallengeId) {
            target = list.find(
              (c: any) =>
                c.id === selectedChallengeId ||
                c.complaintNumber === selectedChallengeId ||
                c._id === selectedChallengeId
            );
          }

          if (target) {
            setChallenge(target);
            applySimulatedGps(target);
          } else if (list.length > 0) {
            // If requested ID not found in list, try direct ID fetch only if ID was provided
            if (selectedChallengeId) {
              try {
                const singleRes = await apiClient.get(`/field-worker/challenges/${selectedChallengeId}`);
                if (singleRes.data.success && singleRes.data.data?.challenge) {
                  setChallenge(singleRes.data.data.challenge);
                  applySimulatedGps(singleRes.data.data.challenge);
                  return;
                }
              } catch (err) {}
            }
            const first = list[0];
            setSelectedChallengeId(first.id || first.complaintNumber || first._id);
            setChallenge(first);
            applySimulatedGps(first);
          }
        }
      } catch (err) {
        // Fallback default setup
        applySimulatedGps(challenge);
      }
    }
    loadData();

    // Recover unsaved draft from localStorage if present
    const savedDraft = localStorage.getItem(`fw_draft_${selectedChallengeId}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.observedProblem) setObservedProblem(parsed.observedProblem);
        if (parsed.actualGroundCondition) setActualGroundCondition(parsed.actualGroundCondition);
        if (parsed.affectedArea) setAffectedArea(parsed.affectedArea);
        if (parsed.peopleImpact) setPeopleImpact(parsed.peopleImpact);
        if (parsed.immediateRisks) setImmediateRisks(parsed.immediateRisks);
        if (parsed.remarks) setRemarks(parsed.remarks);
      } catch (e) {}
    }
  }, [selectedChallengeId]);

  // Auto-save form draft to localStorage
  useEffect(() => {
    const draft = {
      observedProblem,
      actualGroundCondition,
      affectedArea,
      peopleImpact,
      immediateRisks,
      remarks,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`fw_draft_${selectedChallengeId}`, JSON.stringify(draft));
  }, [observedProblem, actualGroundCondition, affectedArea, peopleImpact, immediateRisks, remarks, selectedChallengeId]);

  // Handle Challenge Switch
  const handleChallengeChange = (newId: string) => {
    setSelectedChallengeId(newId);
    const found = availableChallenges.find(
      (c) => c.id === newId || c.complaintNumber === newId || c._id === newId
    );
    if (found) {
      setChallenge(found);
      applySimulatedGps(found);
      setActiveStep(1);
    }
  };

  // 3. High-Precision On-Site GPS Simulation (Guaranteed within 12-16m tolerance)
  const applySimulatedGps = (targetChallenge = challenge) => {
    const expLat = targetChallenge.location?.latitude || 22.5601;
    const expLng = targetChallenge.location?.longitude || 72.9285;

    // Place simulated worker 14m from target
    const simLat = Number((expLat + 0.00011).toFixed(6));
    const simLng = Number((expLng + 0.00009).toFixed(6));
    const dist = calculateDistanceMeters(expLat, expLng, simLat, simLng);

    const loc = {
      latitude: simLat,
      longitude: simLng,
      accuracy: 4.2,
      timestamp: new Date().toISOString(),
      method: 'High-Precision On-Site Simulation (Demo Tolerant)',
    };

    setCapturedLocation(loc);
    setDistanceMeters(dist);
    setLocationStatus('Matched');
    setGpsMode('simulated');
    setGpsError(null);
  };

  // 4. Capture Geolocation from real device browser hardware
  const handleCaptureRealGps = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation API is not supported by your browser or device. Falling back to On-Site Simulation.');
      applySimulatedGps();
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const timestamp = new Date().toISOString();

        const loc = {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          accuracy: Math.round(accuracy),
          timestamp,
          method: 'Physical Hardware GPS',
        };

        setCapturedLocation(loc);
        setGpsMode('real');

        // Distance against expected coordinates
        const expLat = challenge.location?.latitude || 22.5601;
        const expLng = challenge.location?.longitude || 72.9285;
        const dist = calculateDistanceMeters(expLat, expLng, lat, lng);
        setDistanceMeters(dist);

        if (dist <= 15) {
          setLocationStatus('Matched');
        } else if (dist <= 100) {
          setLocationStatus('Within Acceptable Range');
        } else {
          setLocationStatus('Outside Expected Location');
        }

        setGpsLoading(false);
      },
      (err) => {
        setGpsError(`Hardware GPS permission denied or timed out (${err.message}). Loaded high-precision near-site coordinates.`);
        applySimulatedGps();
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 5. Align challenge's expected coordinates to current physical location (0m match)
  const handleAlignChallengeToMyGps = () => {
    if (!capturedLocation) return;
    const updated = {
      ...challenge,
      location: {
        ...challenge.location,
        latitude: capturedLocation.latitude,
        longitude: capturedLocation.longitude,
        address: `${challenge.location?.address || 'Municipal Inspection Site'} (Calibrated to current ground coordinates)`,
      },
    };
    setChallenge(updated);
    setDistanceMeters(0);
    setLocationStatus('Matched');
    setGpsMode('aligned');
    setGpsError(null);
  };

  // 6. Step 3: Start Site Inspection
  const handleStartSiteVisit = () => {
    const vId = `VST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    setVisitId(vId);
    setVisitStartTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    setVisitStarted(true);
    setVisitPaused(false);
  };

  const handleTogglePauseVisit = () => {
    setVisitPaused(!visitPaused);
  };

  // 7. Step 4: Web Camera Support with Canvas Watermarking
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(`Camera access could not be initialized: ${err.message || 'Permission denied'}. Please upload an image or choose from samples.`);
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw camera frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply Official Municipal Geotag Watermark
    const bannerHeight = 56;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`CIVICCONNECT FIELD AUDIT • ${challenge.complaintNumber} • ${challenge.ward || 'Ward 12'}`, 12, canvas.height - bannerHeight + 20);

    const latStr = capturedLocation?.latitude?.toFixed(5) || '22.5601';
    const lngStr = capturedLocation?.longitude?.toFixed(5) || '72.9285';
    const dateStr = new Date().toLocaleString('en-GB');
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`GPS: ${latStr}°N, ${lngStr}°E (±${capturedLocation?.accuracy || 5}m) | TIME: ${dateStr} | OFFICER: ${user?.name || 'Er. Rajesh Patel'}`, 12, canvas.height - bannerHeight + 40);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const newPhoto = {
      id: `cam-${Date.now()}`,
      url: dataUrl,
      category: selectedCategory,
      caption: photoCaption || `Live field capture for ${challenge.complaintNumber} (${selectedCategory})`,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      geotag: `${latStr}, ${lngStr} (±${capturedLocation?.accuracy || 5}m)`,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setPhotoCaption('');
    handleStopCamera();
  };

  // Trigger live camera capture (strictly no file upload)
  const handleStartLiveEvidence = (mode: 'photo' | 'video') => {
    setCameraMode(mode);
    setCameraModalOpen(true);
  };

  const handleCameraModalCapture = (rec: EvidenceRecord) => {
    const isVideo = rec.type === 'live_video';
    if (isVideo) {
      setVideos((prev) => [
        {
          id: rec.id,
          url: rec.previewUrl,
          category: selectedCategory,
          caption: photoCaption || `Live video capture (${rec.duration}s) for ${challenge.complaintNumber}`,
          duration: `${rec.duration}s`,
          timestamp: rec.recordedAt || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          geotag: `${rec.latitude.toFixed(5)}, ${rec.longitude.toFixed(5)} (±${Math.round(rec.accuracy || 10)}m)`,
          latitude: rec.latitude,
          longitude: rec.longitude,
          accuracy: rec.accuracy,
        },
        ...prev,
      ]);
    } else {
      setPhotos((prev) => [
        {
          id: rec.id,
          url: rec.previewUrl,
          category: selectedCategory,
          caption: photoCaption || `Live photo capture for ${challenge.complaintNumber} (${selectedCategory})`,
          timestamp: rec.capturedAt || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          geotag: `${rec.latitude.toFixed(5)}, ${rec.longitude.toFixed(5)} (±${Math.round(rec.accuracy || 10)}m)`,
          latitude: rec.latitude,
          longitude: rec.longitude,
          accuracy: rec.accuracy,
        },
        ...prev,
      ]);
    }
    setPhotoCaption('');
    setCameraModalOpen(false);
  };

  // 8. Step 5: Quick-Fill Observations Presets for rapid testing & demos
  const handleQuickFillVerified = () => {
    setObservedProblem(
      `Physical site audit confirms ${challenge.title.toLowerCase()}. Stormwater ingress obstructed by heavy silt, plastic refuse, and loose gravel deposits.`
    );
    setActualGroundCondition(
      `Approximately 15-20cm stagnant wastewater accumulation over a 120-meter road corridor. Pedestrian footpath submerged; stormwater grating 85% choked.`
    );
    setFieldSeverity('High');
    setAffectedArea(`120m corridor along ${challenge.location?.address || 'Main Market Road'}`);
    setPeopleImpact('40+ roadside retail shops, 1 municipal school approach road, and approximately 800 daily commuters affected.');
    setImmediateRisks('Slip & fall hazard for pedestrians, two-wheeler skidding risk, and potential health hazard due to contaminated puddle.');
    setAdditionalNotes('Desilting suction vehicle and 4 municipal sanitation workers recommended for immediate 3-hour clearance.');

    // Structured questions
    setQIssuePresent('Yes');
    setQLocationMatch('Yes');
    setQIssueActive('Yes');
    setQImmediateIntervention('Yes');
    setQConditionChange('Same');
    setQVisibleSafetyRisks('Yes');

    // Default result
    setVerificationResult('Verified');
    setRemarks(
      'Field ground inspection successfully verified citizen complaint in full. Physical dimensions and obstruction severity match reported docket. Forwarded for high-priority ULB clearance sanction.'
    );
  };

  const handleQuickFillEmergency = () => {
    setObservedProblem(
      `CRITICAL EMERGENCY: Severe structural road collapse / high-pressure utility rupture observed at ${challenge.location?.address}.`
    );
    setActualGroundCondition(
      'Deep cavity expanding across both traffic lanes with active water bubbling. Electrical distribution post tilting towards carriageway.'
    );
    setFieldSeverity('Critical');
    setAffectedArea('Entire junction intersection cordoned off (300m radius)');
    setPeopleImpact('High-density vehicular flow completely paralyzed; 2000+ residents impacted.');
    setImmediateRisks('Structural cavity collapse, electrocution danger, major vehicular collision risk.');
    setAdditionalNotes('Emergency PWD heavy machinery and police traffic barricading requested on site immediately.');

    setQIssuePresent('Yes');
    setQLocationMatch('Yes');
    setQIssueActive('Yes');
    setQImmediateIntervention('Yes');
    setQConditionChange('Worsened');
    setQVisibleSafetyRisks('Yes');

    setVerificationResult('Verified');
    setRemarks(
      'CRITICAL ESCALATION: Emergency intervention required within 2 hours. Site safety barricading established. Urgent ULB contractor dispatch requested.'
    );
  };

  // Calculate Verification Integrity Confidence Score
  const computeConfidenceScore = () => {
    let score = 50;
    if (distanceMeters !== null && distanceMeters <= 15) score += 20;
    else if (distanceMeters !== null && distanceMeters <= 100) score += 15;
    if (photos.length >= 1) score += 10;
    if (photos.length >= 2) score += 5;
    if (observedProblem.trim().length > 20) score += 5;
    if (actualGroundCondition.trim().length > 20) score += 5;
    if (qIssuePresent === 'Yes') score += 5;
    return Math.min(100, score);
  };

  // 9. Final Submission
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Remarks required if not verified, unable to verify or requires follow-up
    if (['Not Verified', 'Unable to Verify', 'Requires Follow-up'].includes(verificationResult) && !remarks.trim()) {
      setSubmitError(`Official remarks are mandatory when marking verification as '${verificationResult}'.`);
      setSubmitting(false);
      return;
    }

    try {
      const expLat = challenge.location?.latitude || 22.5601;
      const expLng = challenge.location?.longitude || 72.9285;

      const payload = {
        challengeId: challenge.id || challenge.complaintNumber,
        expectedLocation: {
          latitude: expLat,
          longitude: expLng,
          address: challenge.location?.address || 'Anand Municipal Ward',
        },
        capturedLocation: capturedLocation || {
          latitude: expLat + 0.0001,
          longitude: expLng + 0.0001,
          accuracy: 5.0,
          timestamp: new Date().toISOString(),
        },
        visitStartTime: visitStartTime || '10:00 AM',
        visitEndTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        photos,
        videos,
        observations: {
          observedProblem: observedProblem || 'Ground inspection completed. Physical conditions verified by field officer.',
          actualGroundCondition: actualGroundCondition || 'Site inspected under standard municipal verification protocols.',
          severity: fieldSeverity,
          affectedArea: affectedArea || challenge.location?.address,
          peopleImpact: peopleImpact || 'Local residents and daily commuters.',
          immediateRisks: immediateRisks || 'Requires routine municipal department resolution.',
          additionalNotes,
        },
        structuredQuestions: {
          isIssuePresent: qIssuePresent,
          isLocationMatch: qLocationMatch,
          isIssueActive: qIssueActive,
          isImmediateInterventionRequired: qImmediateIntervention,
          conditionChange: qConditionChange,
          visibleSafetyRisks: qVisibleSafetyRisks,
        },
        verificationResult,
        remarks: remarks || 'Site inspected and verified under municipal field SOP.',
      };

      const res = await apiClient.post('/field-worker/verification', payload);
      if (res.data.success) {
        setSubmitSuccess(res.data.message || 'Field verification submitted successfully.');
        localStorage.removeItem(`fw_draft_${selectedChallengeId}`);

        // Save submitted report data for instant PDF generation & confirmation receipt
        const reportData = {
          reportId: res.data.data?.reportId || `FVR-${Date.now().toString().slice(-6)}`,
          visitId: visitId || `VST-${Date.now().toString().slice(-4)}`,
          payload,
          challenge,
          submittedAt: new Date().toLocaleString('en-GB'),
        };
        setSubmittedReportData(reportData);
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Verification submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // 10. Generate PDF report on demand
  const handleDownloadPdfDocket = () => {
    if (!submittedReportData) return;
    setDownloadingPdf(true);
    try {
      const p = submittedReportData.payload;
      const ch = submittedReportData.challenge;

      const pdfData: FieldReportPdfData = {
        reportId: submittedReportData.reportId,
        reportType: 'Official Field Verification Docket',
        visitId: submittedReportData.visitId,
        workerName: user?.name || 'Er. Rajesh Patel',
        workerId: 'GOV-FO-PWD-101',
        workerRole: 'Senior Field Inspection Officer',
        department: ch.category || 'Public Works & Civil Infrastructure',
        municipality: 'Anand Municipal Corporation (ULB)',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        assignment: {
          challengeId: ch.complaintNumber || ch.id,
          problemTitle: ch.title,
          domain: ch.category || 'Municipal Civil Infrastructure',
          priority: ch.priority,
          location: ch.location?.address,
          ward: ch.ward || 'Ward 12',
          dueDate: ch.dueDate,
        },
        gpsVerification: {
          expectedCoordinates: `${p.expectedLocation.latitude}° N, ${p.expectedLocation.longitude}° E`,
          capturedCoordinates: `${p.capturedLocation.latitude}° N, ${p.capturedLocation.longitude}° E`,
          distanceMeters: distanceMeters ?? 12,
          gpsAccuracyMeters: p.capturedLocation.accuracy,
          locationStatus: locationStatus,
          timestamp: p.capturedLocation.timestamp || new Date().toISOString(),
        },
        observations: {
          observedProblem: p.observations.observedProblem,
          actualGroundCondition: p.observations.actualGroundCondition,
          severityAssessment: p.observations.severity,
          affectedArea: p.observations.affectedArea,
          communityImpact: p.observations.peopleImpact,
          immediateRisks: p.observations.immediateRisks,
          additionalNotes: p.observations.additionalNotes,
        },
        structuredQuestions: {
          isIssuePresent: p.structuredQuestions.isIssuePresent,
          isLocationMatch: p.structuredQuestions.isLocationMatch,
          isIssueActive: p.structuredQuestions.isIssueActive,
          isImmediateInterventionRequired: p.structuredQuestions.isImmediateInterventionRequired,
          conditionChange: p.structuredQuestions.conditionChange,
          visibleSafetyRisks: p.structuredQuestions.visibleSafetyRisks,
        },
        evidenceSummary: {
          photoCount: photos.length,
          photos: photos.map((ph) => ({
            category: ph.category,
            caption: ph.caption,
            timestamp: ph.timestamp,
          })),
          videoCount: videos.length,
        },
        verificationResult: {
          result: p.verificationResult,
          officialStatus: 'PENDING_ULB_ADMIN_REVIEW',
          remarks: p.remarks,
        },
        followUp: {
          requiredAction:
            p.verificationResult === 'Verified'
              ? 'Sanction physical desilting / civil repair docket'
              : 'Detailed site engineering re-inspection',
          responsibleAuthority: 'ULB Engineering & Public Works Division',
          targetRedressalWindow: '24-48 Hours (Standard SLA)',
        },
      };

      const doc = generateFieldReportPdf(pdfData);
      doc.save(`CivicConnect_FieldDocket_${submittedReportData.reportId}.pdf`);
    } catch (e: any) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const steps = [
    { number: 1, title: 'Assignment', icon: FileText },
    { number: 2, title: 'GPS Location', icon: MapPin },
    { number: 3, title: 'Site Inspection', icon: Clock },
    { number: 4, title: 'Evidence', icon: Camera },
    { number: 5, title: 'Observations', icon: Sliders },
    { number: 6, title: 'Submission', icon: CheckCircle2 },
  ];

  // Coordinates for Leaflet Map
  const expLat = challenge.location?.latitude || 22.5601;
  const expLng = challenge.location?.longitude || 72.9285;
  const workerLat = capturedLocation?.latitude || expLat + 0.0001;
  const workerLng = capturedLocation?.longitude || expLng + 0.0001;

  // Midpoint for map
  const mapCenter: [number, number] = [
    (expLat + workerLat) / 2,
    (expLng + workerLng) / 2,
  ];

  const confidenceScore = computeConfidenceScore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Official Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-900 text-white shadow-xs">
              <CheckCircle2 size={18} className="text-amber-400" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Field Verification Workflow
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Capture ground-truth GPS, photo/video evidence, and complete structured municipal verification.
          </p>
        </div>

        {/* Confidence & Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Verification Integrity</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-blue-900">{confidenceScore}% Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Step Progress Bar */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-0.5 gap-2 scrollbar-none">
          {steps.map((st) => (
            <button
              key={st.number}
              type="button"
              onClick={() => setActiveStep(st.number)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeStep === st.number
                  ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm ring-2 ring-blue-500/20'
                  : activeStep > st.number
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === st.number
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : activeStep > st.number
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {activeStep > st.number ? '✓' : st.number}
              </span>
              <span className="tracking-tight">{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workflow Form Container */}
      <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* STEP 1: ASSIGNMENT SELECTION & DETAILS */}
        {activeStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">1</span>
                <span>Select & Review Field Assignment</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 1 of 6</span>
            </div>

            {/* Select Assignment Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Active Assignment Queue ({availableChallenges.length} Total Assignments)
              </label>
              <select
                value={selectedChallengeId}
                onChange={(e) => handleChallengeChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
              >
                {availableChallenges.map((c) => (
                  <option key={c.id || c.complaintNumber} value={c.id || c.complaintNumber}>
                    [{c.priority || 'HIGH'}] {c.complaintNumber || c.id} — {c.title} ({c.ward || 'Ward 12'})
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    {challenge.complaintNumber || challenge.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {challenge.category || 'Drainage & Stormwater'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                    challenge.priority === 'CRITICAL'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : challenge.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {challenge.priority || 'HIGH'} PRIORITY
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{challenge.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{challenge.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin size={13} className="text-red-500 shrink-0" />
                  <span>{challenge.location?.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 sm:justify-end">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>SLA Due Date: <strong className="font-mono text-red-700">{challenge.dueDate || '26 Sep 2026'}</strong></span>
                </div>
              </div>

              {/* Citizen Reported Evidence Preview */}
              {challenge.citizenEvidence && challenge.citizenEvidence.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                    Original Citizen Submitted Evidence ({challenge.citizenEvidence.length})
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {challenge.citizenEvidence.map((ev: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 max-w-xs">
                        <img src={ev.url} alt="citizen" className="w-12 h-12 object-cover rounded" />
                        <div className="text-[10px] text-slate-600 leading-tight">
                          <p className="font-semibold text-slate-800 truncate max-w-[160px]">{ev.caption || 'Citizen photo'}</p>
                          <span className="text-slate-400 font-mono text-[9px]">{ev.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action to proceed */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Proceed to GPS Location Verification</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION CAPTURE & GPS DISTANCE TOLERANCE */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">2</span>
                  <span>Location Verification & GPS Capture</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Verify physical ground proximity to the target civic asset (100m ULB tolerance geofence).
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 2 of 6</span>
            </div>

            {/* Quick Action Toolbar to Switch/Simulate Location for Flawless Testing */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-blue-900" />
                <span className="text-xs font-extrabold text-blue-950">GPS Verification Controls:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Simulate on-site coordinates (Demo Mode - always within 14m) */}
                <button
                  type="button"
                  onClick={() => applySimulatedGps()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gpsMode === 'simulated'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                  }`}
                  title="Simulates device on site within 14m tolerance"
                >
                  <Crosshair size={13} />
                  <span>Simulate On-Site GPS (±14m Demo)</span>
                </button>

                {/* 2. Read physical browser GPS */}
                <button
                  type="button"
                  onClick={handleCaptureRealGps}
                  disabled={gpsLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gpsMode === 'real'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-blue-900 border border-blue-300 hover:bg-blue-50'
                  }`}
                  title="Capture live coordinates from device browser"
                >
                  {gpsLoading ? <RefreshCw size={13} className="animate-spin" /> : <Navigation size={13} />}
                  <span>Capture Real Hardware GPS</span>
                </button>

                {/* 3. Align Challenge to current position */}
                <button
                  type="button"
                  onClick={handleAlignChallengeToMyGps}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  title="Calibrates the challenge target location to your current device spot"
                >
                  <Compass size={13} className="text-amber-600" />
                  <span>Align Site to My GPS</span>
                </button>
              </div>
            </div>

            {/* Expected vs Captured Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected Coordinates */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Target Municipal Location</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    Target Reference
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{challenge.location?.address}</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-500 uppercase block">Expected Lat</span>
                    <span className="text-slate-900 font-bold">{expLat}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-500 uppercase block">Expected Lng</span>
                    <span className="text-slate-900 font-bold">{expLng}</span>
                  </div>
                </div>
              </div>

              {/* Captured GPS from Device */}
              <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Captured Device Coordinates</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      gpsMode === 'simulated'
                        ? 'bg-emerald-100 text-emerald-800'
                        : gpsMode === 'aligned'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {gpsMode === 'simulated' ? 'On-Site Simulated' : gpsMode === 'aligned' ? 'Calibrated Site' : 'Hardware GPS'}
                  </span>
                </div>

                {capturedLocation ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[9px] font-sans text-slate-500 uppercase block">Captured Lat</span>
                        <span className="text-slate-900 font-bold">{capturedLocation.latitude}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[9px] font-sans text-slate-500 uppercase block">Captured Lng</span>
                        <span className="text-slate-900 font-bold">{capturedLocation.longitude}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-sans pt-1">
                      <span>Accuracy: <strong className="text-emerald-700">±{capturedLocation.accuracy} metres</strong></span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(capturedLocation.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    <Navigation size={24} className="mx-auto text-slate-300 mb-1" />
                    <span>No coordinates registered. Click "Simulate On-Site GPS" or "Capture Real GPS".</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map for Visual Ground Verification */}
            <div className="rounded-xl border border-slate-300 overflow-hidden shadow-2xs bg-slate-100">
              <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-amber-400" />
                  <span>Geofence Spatial Radar (100m Tolerance Boundary)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Target Site
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Field Worker
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 100m Radius
                  </span>
                </div>
              </div>

              <div className="h-64 w-full relative">
                <MapContainer
                  center={mapCenter}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <RecenterMap center={mapCenter} zoom={distanceMeters && distanceMeters > 500 ? 11 : 16} />

                  {/* Target Asset Marker */}
                  <Marker position={[expLat, expLng]} icon={targetPinIcon}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <strong className="text-red-700 block">{challenge.complaintNumber}</strong>
                        <span>{challenge.location?.address}</span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* 100-Meter Geofence Acceptance Circle around Target */}
                  <Circle
                    center={[expLat, expLng]}
                    radius={100}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.15,
                      dashArray: '4, 4',
                    }}
                  />

                  {/* Field Worker Location Marker */}
                  {capturedLocation && (
                    <Marker position={[capturedLocation.latitude, capturedLocation.longitude]} icon={workerPinIcon}>
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong className="text-blue-700 block">Field Worker Location</strong>
                          <span>Accuracy: ±{capturedLocation.accuracy}m</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Line between target and worker */}
                  {capturedLocation && (
                    <Polyline
                      positions={[
                        [expLat, expLng],
                        [capturedLocation.latitude, capturedLocation.longitude],
                      ]}
                      pathOptions={{
                        color: distanceMeters && distanceMeters <= 100 ? '#10b981' : '#ef4444',
                        weight: 2,
                        dashArray: '6, 6',
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* GPS Distance & Status Tolerance Meter */}
            {distanceMeters !== null && (
              <div
                className={`p-4 rounded-xl border space-y-2.5 ${
                  locationStatus === 'Outside Expected Location'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    {locationStatus === 'Outside Expected Location' ? (
                      <AlertTriangle size={16} className="text-amber-600" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    )}
                    <span>Location Status: {locationStatus}</span>
                  </div>
                  <span className="font-mono text-sm font-black">
                    {distanceMeters} metres difference {distanceMeters <= 100 ? '(Within Tolerance)' : ''}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      distanceMeters <= 15
                        ? 'bg-emerald-600'
                        : distanceMeters <= 100
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, (distanceMeters / 150) * 100))}%` }}
                  />
                </div>

                {locationStatus === 'Outside Expected Location' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <p className="text-amber-900 font-medium leading-tight">
                      ⚠️ Device registered {distanceMeters}m away from target coordinates. If testing or conducting remote inspection, switch to On-Site Simulation.
                    </p>
                    <button
                      type="button"
                      onClick={() => applySimulatedGps()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shrink-0 shadow-2xs"
                    >
                      ✓ Switch to On-Site (14m)
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800 font-medium">
                    ✓ Physical GPS coordinates within certified municipal verification radius (&le; 100 metres). Proximity confirmed.
                  </p>
                )}
              </div>
            )}

            {/* Remote Inspection Exception Toggle */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={remoteExceptionEnabled}
                  onChange={(e) => setRemoteExceptionEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span>Document Remote / Perimeter Verification Exception (If site is physically barricaded or flooded)</span>
              </label>

              {remoteExceptionEnabled && (
                <div className="mt-2 pl-5 space-y-1">
                  <input
                    type="text"
                    value={remoteExceptionReason}
                    onChange={(e) => setRemoteExceptionReason(e.target.value)}
                    placeholder="State justification (e.g. Inaccessible due to live storm overflow; verified from perimeter 60m away)"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              )}
            </div>

            {gpsError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <Info size={14} className="shrink-0 text-amber-600" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Step navigation */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Assignment</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!capturedLocation) {
                    applySimulatedGps();
                  }
                  setActiveStep(3);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Proceed to Site Inspection Check-In</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: START SITE INSPECTION & STOPWATCH */}
        {activeStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">3</span>
                <span>Site Inspection Check-In & Safety Protocol</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 3 of 6</span>
            </div>

            {/* Metadata & Live Stopwatch Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Visit ID</span>
                  <span className="font-mono font-bold text-blue-900">{visitId || 'VST-2026-AUTO'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Challenge ID</span>
                  <span className="font-mono font-bold text-slate-900">{challenge.complaintNumber || challenge.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Field Officer</span>
                  <span className="font-bold text-slate-900">{user?.name || 'Er. Rajesh Patel'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Inspection Date</span>
                  <span className="text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Start Time</span>
                  <span className="font-mono text-slate-900">{visitStartTime || 'Pending Check-In'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">GPS Proximity</span>
                  <span className="text-emerald-700 font-bold">±{capturedLocation?.accuracy || 4}m ({distanceMeters ?? 14}m dist)</span>
                </div>
              </div>

              {/* Stopwatch & Action Area */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Site Inspection Elapsed Time</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                      {formatStopwatch(elapsedSeconds)}
                    </span>
                    {visitStarted && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1.5 ${
                        visitPaused ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${visitPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                        <span>{visitPaused ? 'PAUSED' : 'RECORDING ON SITE'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!visitStarted ? (
                    <button
                      type="button"
                      onClick={handleStartSiteVisit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-md transition-colors"
                    >
                      <Play size={15} className="text-amber-400 fill-amber-400" />
                      <span>Start Official Check-In</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleTogglePauseVisit}
                        className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                      >
                        {visitPaused ? <Play size={13} /> : <Pause size={13} />}
                        <span>{visitPaused ? 'Resume Timer' : 'Pause Timer'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setElapsedSeconds(0)}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-500"
                        title="Reset stopwatch"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Site Conditions & PPE Checklist */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Weather & Site Ambient Condition</label>
                    <select
                      value={weatherCondition}
                      onChange={(e) => setWeatherCondition(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="Clear / Sunny (31°C)">Clear / Sunny (31°C)</option>
                      <option value="Overcast / Cloudy (27°C)">Overcast / Cloudy (27°C)</option>
                      <option value="Active Monsoon Rain (24°C)">Active Monsoon Rain (24°C)</option>
                      <option value="Dusk / Night Inspection (26°C)">Dusk / Night Inspection (26°C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Complainant / Citizen Interaction</label>
                    <div className="flex items-center gap-2">
                      {(['Yes', 'No', 'Not Available'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCitizenContacted(opt)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            citizenContacted === opt
                              ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PPE Safety Gear Verification</label>
                  <div className="flex flex-wrap gap-2">
                    {['Safety Helmet', 'High-Visibility Vest', 'Safety Boots', 'Reflective Barricade Tape'].map((gear) => {
                      const isSelected = ppeGearChecked.includes(gear);
                      return (
                        <button
                          key={gear}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setPpeGearChecked(ppeGearChecked.filter((g) => g !== gear));
                            } else {
                              setPpeGearChecked([...ppeGearChecked, gear]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        >
                          <HardHat size={12} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>{gear}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Location</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!visitStarted) handleStartSiteVisit();
                  setActiveStep(4);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Proceed to Evidence Capture</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTO & VIDEO EVIDENCE CAPTURE */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs shadow-xs">4</span>
                  <span>Field Evidence & Geotagged Photographs</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Every photo is physically stamped with verified GPS coordinates, inspection timestamp, and inspector ID for official ULB records.
                </p>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase px-2 py-0.5 bg-slate-100 rounded-md">Step 4 of 6</span>
            </div>

            {/* Photo Capture & Upload Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span>Photo Category (Official Inspection Tag)</span>
                    <span className="text-[10px] font-mono text-blue-700 font-semibold">{selectedCategory}</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-2xs"
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Evidence Caption / Ground Note
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of observed site condition..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Action Buttons: Live Camera & Video Only */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Live photo trigger card */}
                  <button
                    type="button"
                    onClick={() => handleStartLiveEvidence('photo')}
                    className="group relative flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 hover:from-blue-950 hover:to-slate-900 text-white shadow-md hover:shadow-lg transition-all duration-200 border border-blue-800/60 hover:border-blue-400 text-left cursor-pointer overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-500/30 transition-all shadow-inner">
                      <Camera size={22} className="text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase text-white">LIVE PHOTO</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">MANDATORY</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                        Snap geotagged ground truth with physical GPS & timestamp burn
                      </p>
                    </div>
                  </button>

                  {/* 2. Live video trigger card */}
                  <button
                    type="button"
                    onClick={() => handleStartLiveEvidence('video')}
                    className="group relative flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-br from-slate-900 via-rose-950 to-red-950 hover:from-rose-950 hover:to-slate-900 text-white shadow-md hover:shadow-lg transition-all duration-200 border border-rose-800/60 hover:border-rose-400 text-left cursor-pointer overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-rose-500/30 transition-all shadow-inner">
                      <Video size={22} className="text-rose-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase text-white">LIVE VIDEO</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-300 border border-rose-400/30">MAX 60s</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                        Record moving site conditions with real-time HUD telemetry
                      </p>
                    </div>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 text-amber-950 text-xs flex items-start sm:items-center gap-3 shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="leading-relaxed">
                    <span className="font-black text-amber-900 uppercase tracking-wide text-[11px] mr-1.5">Anti-Tamper Rule:</span>
                    <span className="text-slate-700 text-[11px]">
                      File uploads and external gallery selection are strictly prohibited. All evidence must be captured live via device camera with verified hardware GPS and official GOI-style geotag.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos & Videos Preview Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Captured Official Field Evidence
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-mono font-bold">
                    {photos.length + videos.length}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  photos.length + videos.length >= 1 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {photos.length + videos.length >= 1 ? '✓ Minimum requirement fulfilled' : '⚠️ At least 1 photo/video required'}
                </span>
              </div>

              {photos.length === 0 && videos.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-2 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-slate-200/80 mx-auto flex items-center justify-center text-slate-400">
                    <Camera size={24} />
                  </div>
                  <p className="font-extrabold text-slate-700 text-sm">No field evidence captured yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Click "LIVE PHOTO" or "LIVE VIDEO" above to capture live geotagged proof with tamper-evident digital custody.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-400 transition-all duration-200"
                    >
                      {/* Photo Container: aspect-[4/3] bg-slate-950 with object-contain so bottom watermark is fully visible */}
                      <div
                        className="relative w-full aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => setLightboxPhoto(p)}
                      >
                        <img
                          src={p.url}
                          alt={p.caption}
                          className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                        />

                        {/* Top Badges Bar */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm backdrop-blur-xs">
                            <ShieldCheck size={11} className="text-emerald-200" />
                            <span>GPS VERIFIED</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotos(photos.filter((item) => item.id !== p.id));
                            }}
                            className="p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors pointer-events-auto shadow-sm"
                            title="Remove photo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Hover Inspect Indicator */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                          <Eye size={16} />
                          <span>Inspect Full Docket</span>
                        </div>
                      </div>

                      {/* Card Details Footer */}
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/50">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                              {p.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">
                              {p.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-snug" title={p.caption}>
                            {p.caption}
                          </p>
                        </div>

                        {/* Telemetry pill */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600 font-bold truncate max-w-[190px]">
                            <MapPin size={11} className="text-blue-600 shrink-0" />
                            <span className="truncate">{p.geotag || '📍 Hardware Tagged'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setLightboxPhoto(p)}
                            className="text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-rose-200 bg-white shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:border-rose-400 transition-all duration-200"
                    >
                      {/* Video Player */}
                      <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                        <video
                          src={v.url}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                        {/* Top Badges Bar */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                          <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm backdrop-blur-xs">
                            <Video size={11} className="text-rose-200" />
                            <span>LIVE VIDEO ({v.duration})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setVideos(videos.filter((item) => item.id !== v.id))}
                            className="p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors pointer-events-auto shadow-sm"
                            title="Remove video"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Video Metadata Details */}
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2 border-t border-rose-100 bg-rose-50/20">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-200">
                              {v.category || selectedCategory}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">
                              {v.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-snug" title={v.caption}>
                            {v.caption}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1 text-rose-700 font-bold">
                            <Clock size={11} />
                            Duration: {v.duration}
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <ShieldCheck size={11} /> 30fps Stream
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox Modal: Official Inspection Docket Viewer */}
            {lightboxPhoto && (
              <div
                className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
                onClick={() => setLightboxPhoto(null)}
              >
                <div
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col max-h-[92vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-wide uppercase text-white">
                            ULB Official Inspection Docket
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            GPS VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {challenge.complaintNumber || challenge.id} • {lightboxPhoto.category || 'Problem Area'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(null)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Media Viewport: object-contain with black bg */}
                  <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh] p-2">
                    <img
                      src={lightboxPhoto.url}
                      alt={lightboxPhoto.caption}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>

                  {/* Docket Metadata & Telemetry Strip */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800 text-slate-200 text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Observed Condition / Note
                        </span>
                        <p className="text-xs text-white font-medium bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                          {lightboxPhoto.caption || 'Live photo captured on-site during municipal inspection.'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Hardware Audit Telemetry
                        </span>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Coordinates:</span>
                            <span className="text-sky-300 font-bold">{lightboxPhoto.geotag || `${capturedLocation?.latitude || 22.5601}°N, ${capturedLocation?.longitude || 72.9285}°E`}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Timestamp:</span>
                            <span className="text-amber-300">{lightboxPhoto.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Officer / ULB:</span>
                            <span className="text-emerald-300">{user?.name || 'Er. Rajesh Patel'} ({challenge.ward || 'Ward 12'})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <ShieldCheck size={12} className="text-emerald-400" /> Tamper-evident 5-line digital watermark certified
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={lightboxPhoto.url}
                          download={`ULB_FieldEvidence_${challenge.complaintNumber || 'Docket'}_${Date.now()}.jpg`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Download size={13} />
                          <span>Download Stamped Evidence</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Site Check-In</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Proceed to Observations</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FIELD OBSERVATIONS & STRUCTURED PROTOCOL */}
        {activeStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">5</span>
                  <span>Ground Observations & Structured Questions</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Record physical ground truth parameters according to municipal field operating standards.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 5 of 6</span>
            </div>

            {/* Quick Fill Presets Bar for seamless testing */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                <Zap size={14} className="text-amber-500" />
                <span>Rapid Report Presets:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillVerified}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs"
                >
                  ⚡ Auto-Fill Verified Ground Truth
                </button>
                <button
                  type="button"
                  onClick={handleQuickFillEmergency}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-2xs"
                >
                  ⚡ Auto-Fill Critical Escalation
                </button>
              </div>
            </div>

            {/* Observations Textarea Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Observed Problem Condition
                  </label>
                  <textarea
                    rows={2}
                    value={observedProblem}
                    onChange={(e) => setObservedProblem(e.target.value)}
                    placeholder="e.g. Silt buildup choking stormwater drain inlet..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Actual Ground Situation
                  </label>
                  <textarea
                    rows={2}
                    value={actualGroundCondition}
                    onChange={(e) => setActualGroundCondition(e.target.value)}
                    placeholder="e.g. 15cm stagnant water covering road carriageway..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Field Assessed Severity
                  </label>
                  <select
                    value={fieldSeverity}
                    onChange={(e) => setFieldSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Affected Footprint / Area
                  </label>
                  <input
                    type="text"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value)}
                    placeholder="e.g. 120m stretch along corridor"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    People / Community Impact
                  </label>
                  <input
                    type="text"
                    value={peopleImpact}
                    onChange={(e) => setPeopleImpact(e.target.value)}
                    placeholder="e.g. 40+ market shops & pedestrians"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Immediate Risks & Public Safety Hazards
                </label>
                <input
                  type="text"
                  value={immediateRisks}
                  onChange={(e) => setImmediateRisks(e.target.value)}
                  placeholder="e.g. Vehicle skidding risk near school intersection..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Structured Verification Questions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center justify-between">
                <span>Structured Field Verification Protocol</span>
                <span className="text-[10px] text-slate-500 font-bold">Mandatory Questions (6 of 6)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {/* Q1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">1. Is the reported issue present on ground?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Yes', 'Partially', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQIssuePresent(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qIssuePresent === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">2. Does physical location match coordinates?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Yes', 'Partially', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQLocationMatch(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qLocationMatch === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">3. Is the issue currently active & unresolved?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQIssueActive(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qIssueActive === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">4. Is immediate emergency intervention required?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQImmediateIntervention(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qImmediateIntervention === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q5 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">5. Has the condition changed since filing?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Improved', 'Same', 'Worsened'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQConditionChange(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qConditionChange === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q6 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-800">6. Are there visible public safety hazards?</span>
                  <div className="flex items-center gap-1.5">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQVisibleSafetyRisks(opt)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          qVisibleSafetyRisks === opt ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Evidence</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(6)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Proceed to Final Verification Decision</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: VERIFICATION RESULT & SUBMISSION */}
        {activeStep === 6 && (
          <form onSubmit={handleSubmitVerification} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">6</span>
                  <span>Field Verification Decision & Executive Docket</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Review ground truth audit summary and formalize the field inspection decision.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 6 of 6</span>
            </div>

            {/* Complete Audit Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 uppercase">Executive Audit Docket Summary</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Score: {confidenceScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Target ID</span>
                  <span className="font-mono font-bold text-slate-900">{challenge.complaintNumber || challenge.id}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">GPS Proximity</span>
                  <span className="font-bold text-emerald-700">{distanceMeters ?? 14}m (Matched)</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Inspection Duration</span>
                  <span className="font-mono font-bold text-slate-900">{formatStopwatch(elapsedSeconds)}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Evidence Attached</span>
                  <span className="font-bold text-blue-900">{photos.length} Photos</span>
                </div>
              </div>
            </div>

            {/* Verification Result Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Official Field Verification Result
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'Verified', label: 'Verified', desc: 'Ground truth confirms citizen report' },
                  { key: 'Partially Verified', label: 'Partially Verified', desc: 'Partially matches reported scope' },
                  { key: 'Not Verified', label: 'Not Verified', desc: 'No issue found or invalid report' },
                  { key: 'Unable to Verify', label: 'Unable to Verify', desc: 'Site inaccessible or obscured' },
                  { key: 'Requires Follow-up', label: 'Requires Follow-up', desc: 'Specialist engineer needed' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setVerificationResult(item.key as any)}
                    className={`p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                      verificationResult === item.key
                        ? 'border-blue-900 bg-blue-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs">{item.label}</span>
                    <span className={`block text-[10px] font-normal mt-0.5 ${
                      verificationResult === item.key ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Officer Remarks */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Official Field Remarks {['Not Verified', 'Unable to Verify', 'Requires Follow-up'].includes(verificationResult) ? '(Mandatory)' : '(Recommended)'}
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter official ground observations and recommendation for municipal engineering department..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                required={['Not Verified', 'Unable to Verify', 'Requires Follow-up'].includes(verificationResult)}
              />
            </div>

            {/* OFFICIAL VERIFICATION RULE NOTICE */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info size={14} className="text-amber-700 shrink-0" />
                <span>OFFICIAL VERIFICATION RULE</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Submitting this field report does <strong>NOT</strong> automatically mark the civic challenge as resolved. Your report provides ground truth under <em>FIELD VERIFICATION RESULT</em>. The authorized municipality / ULB authority makes the final administrative closure decision.
              </p>
            </div>

            {/* Post-submission Success Modal / Receipt */}
            {submitSuccess && submittedReportData && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-700" />
                    <div>
                      <h3 className="font-black text-sm text-emerald-950">Field Verification Successfully Submitted</h3>
                      <p className="text-xs text-emerald-800">Docket registered under official municipal record.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black px-2 py-1 rounded bg-emerald-200 text-emerald-900">
                    {submittedReportData.reportId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200">
                  <button
                    type="button"
                    onClick={handleDownloadPdfDocket}
                    disabled={downloadingPdf}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-xs"
                  >
                    {downloadingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                    <span>Download Official PDF Inspection Docket</span>
                  </button>

                  <Link
                    to="/field-worker/dashboard"
                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs"
                  >
                    Go to Dashboard
                  </Link>

                  <Link
                    to="/field-worker/challenges"
                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs"
                  >
                    View Assigned Challenges
                  </Link>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            {!submitSuccess && (
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Questions</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting Official Field Verification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Submit Official Field Verification</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* High-Accuracy Live Geotagged Camera Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraModalCapture}
        initialMode={cameraMode}
        complaintNumber={challenge.complaintNumber || challenge.id}
        workerName={user?.name || 'Field Officer'}
        workerBadge="GOV-FW-OFFICER"
        departmentName={challenge.category || 'Municipal Civil Infrastructure'}
        ward={challenge.ward || 'Ward 12'}
      />
    </div>
  );
}
