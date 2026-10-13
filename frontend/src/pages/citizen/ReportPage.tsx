import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FilePlus2,
  Camera,
  MapPin,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Send,
  Sparkles,
  Building2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Hammer,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Car,
  Trees,
  Truck,
  ShieldAlert,
  Clock,
  AlertCircle,
  GraduationCap,
  HeartPulse,
  Sprout,
  Briefcase,
  Accessibility,
  Landmark,
  HandHelping,
  Download,
  XCircle,
  RefreshCw,
  CopyCheck,
  Film,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import LocationPicker from '../../components/common/LocationPicker';
import EvidenceUploader from '../../components/common/EvidenceUploader';
import VoiceRecorder from '../../components/common/VoiceRecorder';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import {
  EvidenceRecord,
  stampGeotagWatermarkOnFile,
  formatLocationCardTimestamp,
} from '../../utils/evidenceValidator';
import { generateGrievancePdf } from '../../utils/reportPdfGenerator';

interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  subcategories: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    subcategories: [
      'School Infrastructure',
      'Higher Education',
      'Digital Education',
      'Teacher Availability',
      'Student Attendance',
      'Learning Resources',
      'Skill Development',
      'Other',
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: HeartPulse,
    subcategories: [
      'Primary Healthcare',
      'Hospital Infrastructure',
      'Medical Equipment',
      'Medicine Availability',
      'Emergency Services',
      'Maternal & Child Health',
      'Public Health',
      'Other',
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Sprout,
    subcategories: [
      'Crop Health',
      'Irrigation',
      'Soil Quality',
      'Agricultural Technology',
      'Crop Storage',
      'Supply Chain',
      'Market Access',
      'Other',
    ],
  },
  {
    id: 'water_management',
    name: 'Water Management',
    icon: Droplets,
    subcategories: [
      'Drinking Water',
      'Water Pollution',
      'Pipeline Leakage',
      'Flooding',
      'Irrigation',
      'Water Conservation',
      'Groundwater',
      'Other',
    ],
  },
  {
    id: 'sanitation_waste',
    name: 'Sanitation & Waste Management',
    icon: Trash2,
    subcategories: [
      'Garbage Collection',
      'Waste Disposal',
      'Sewage',
      'Drainage',
      'Public Toilets',
      'Plastic Waste',
      'Biomedical Waste',
      'Other',
    ],
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: Trees,
    subcategories: [
      'Air Pollution',
      'Water Pollution',
      'Noise Pollution',
      'Deforestation',
      'Biodiversity',
      'Climate Impact',
      'Green Spaces',
      'Other',
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: Lightbulb,
    subcategories: [
      'Electricity Supply',
      'Street Lighting',
      'Renewable Energy',
      'Solar Energy',
      'Power Infrastructure',
      'Energy Efficiency',
      'Other',
    ],
  },
  {
    id: 'rural_livelihoods',
    name: 'Rural Livelihoods',
    icon: Briefcase,
    subcategories: [
      'Employment',
      'Rural Entrepreneurship',
      'Self Employment',
      'Skill Development',
      'Rural Infrastructure',
      'Market Access',
      'Financial Inclusion',
      'Other',
    ],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: Accessibility,
    subcategories: [
      'Accessible Roads',
      'Public Transport',
      'Accessible Buildings',
      'Disability Services',
      'Assistive Technology',
      'Digital Accessibility',
      'Other',
    ],
  },
  {
    id: 'urban_infrastructure',
    name: 'Urban Infrastructure',
    icon: Building2,
    subcategories: [
      'Roads',
      'Footpaths',
      'Traffic Management',
      'Street Lighting',
      'Public Infrastructure',
      'Drainage',
      'Public Transport',
      'Other',
    ],
  },
  {
    id: 'public_administration',
    name: 'Public Administration',
    icon: Landmark,
    subcategories: [
      'Government Services',
      'Service Delays',
      'Public Information',
      'Grievance Resolution',
      'Administrative Processes',
      'Transparency',
      'Other',
    ],
  },
  {
    id: 'public_service_delivery',
    name: 'Public Service Delivery',
    icon: HandHelping,
    subcategories: [
      'Water Services',
      'Electricity Services',
      'Sanitation Services',
      'Healthcare Services',
      'Education Services',
      'Transport Services',
      'Digital Government Services',
      'Other',
    ],
  },
  {
    id: 'other',
    name: 'Other',
    icon: FileText,
    subcategories: [],
  },
];

const CATEGORY_ID_TO_BACKEND_MAP: Record<string, ComplaintCategory> = {
  education: 'other',
  healthcare: 'other',
  agriculture: 'other',
  water_management: 'water',
  sanitation_waste: 'garbage',
  environment: 'other',
  energy: 'streetlight',
  rural_livelihoods: 'other',
  accessibility: 'other',
  urban_infrastructure: 'road_damage',
  public_administration: 'other',
  public_service_delivery: 'other',
  other: 'other',
};

const PROBLEM_IMPACT_OPTIONS = [
  'Residents',
  'Students',
  'Farmers',
  'Healthcare',
  'Environment',
  'Public Safety',
  'Livelihood',
  'Accessibility',
  'Public Services',
] as const;

const PROBLEM_SINCE_OPTIONS = [
  'Today',
  'Within 1 week',
  'Within 1 month',
  '1–6 months',
  'More than 6 months',
  "Don't know",
] as const;

export default function ReportPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isOnline, saveDraft } = useOffline();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step: 1 (Category), 2 (Photos), 3 (Location), 4 (Description), 5 (Review)
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [mainCategory, setMainCategory] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [otherCategoryText, setOtherCategoryText] = useState<string>('');
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [problemImpact, setProblemImpact] = useState<string[]>([]);
  const [problemSince, setProblemSince] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  const toggleProblemImpact = (impact: string) => {
    setProblemImpact((prev) =>
      prev.includes(impact) ? prev.filter((item) => item !== impact) : [...prev, impact]
    );
    setValidationError(null);
    invalidateAiAssessment();
  };

  const handleProblemSinceChange = (val: string) => {
    setProblemSince(val);
    invalidateAiAssessment();
  };

  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Validation State & Types
  interface AIValidationResult {
    overallStatus: 'PASS' | 'NEEDS_CORRECTION' | 'REJECTED';
    descriptionValidation: {
      valid: boolean;
      reason: string;
      suggestion?: string;
    };
    categoryValidation: {
      matches: boolean;
      confidence: number;
      reason: string;
    };
    evidenceValidation: {
      relevant: boolean;
      quality: 'GOOD' | 'ACCEPTABLE' | 'POOR';
      confidence: number;
      reason: string;
      allowSubmission?: boolean;
      overallStatus?: string;
    };
    locationValidation: {
      gpsVerified: boolean;
      accuracy: number;
      reason?: string;
    };
    impactValidation: {
      consistent: boolean;
      reason?: string;
    };
    problemSinceValidation: {
      valid: boolean;
    };
    identifiedProblem: string;
    suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    severityScore: number;
    targetDepartment: string;
    recommendedAction: string;
    corrections: Array<{
      step: number;
      field: string;
      issue: string;
      action: string;
    }>;
    duplicateInfo?: {
      isDuplicate: boolean;
      masterComplaintNumber?: string;
      masterComplaintTitle?: string;
      masterComplaintStatus?: string;
      masterComplaintDate?: string;
      nearbyCount?: number;
    };
  }

  const [aiValidationResult, setAiValidationResult] = useState<AIValidationResult | null>(null);
  const [duplicateBlockedInfo, setDuplicateBlockedInfo] = useState<{
    existingComplaintNumber: string;
    existingComplaintTitle?: string;
    existingComplaintStatus?: string;
    message?: string;
  } | null>(null);
  const [aiAdvisory, setAiAdvisory] = useState<{
    category?: string;
    priority?: ComplaintPriority;
    departmentSlug?: string;
    summary?: string;
    hazards?: string[];
    severity?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // AI Assessment Gate States: 'idle' | 'analyzing' | 'ready' | 'failed'
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'ready' | 'failed'>('idle');
  const [aiAssessmentToken, setAiAssessmentToken] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [evidenceValidation, setEvidenceValidation] = useState<{
    overallStatus: 'valid' | 'needs_attention' | 'rejected';
    isRelevant: boolean;
    isAcceptableQuality: boolean;
    syntheticRisk: 'low' | 'medium' | 'high';
    reasoning: string;
    userMessage: string;
    allowSubmission: boolean;
  } | null>(null);

  const selectedCategoryConfig = CATEGORIES.find((c) => c.id === selectedCategoryId);

  const handleMainCategorySelect = (catId: string, catName: string) => {
    if (selectedCategoryId !== catId) {
      setSelectedCategoryId(catId);
      setMainCategory(catName);
      setCategory(CATEGORY_ID_TO_BACKEND_MAP[catId] || 'other');
      setSubcategory('');
      setOtherCategoryText('');
      setValidationError(null);
      invalidateAiAssessment();
    }
  };

  const handleSubcategorySelect = (sub: string) => {
    if (subcategory !== sub) {
      setSubcategory(sub);
      if (sub !== 'Other') {
        setOtherCategoryText('');
      }
      setValidationError(null);
      invalidateAiAssessment();
    }
  };

  // Trigger AI assessment when entering review step or when explicitly requested
  const runAiAssessment = async () => {
    setAiStatus('analyzing');
    setAiError(null);
    setAiAssessmentToken(null);
    setEvidenceValidation(null);
    setAiValidationResult(null);

    const effectiveSubcategory =
      mainCategory === 'Other' || selectedCategoryId === 'other'
        ? otherCategoryText.trim()
        : subcategory === 'Other'
        ? otherCategoryText.trim()
        : subcategory;

    const primaryEvidence = evidenceRecords[0];

    try {
      const res = await apiClient.post('/ai/classify-complaint', {
        description: description.trim(),
        category: category || 'other',
        subcategory: effectiveSubcategory,
        otherCategoryText: otherCategoryText.trim(),
        voiceTranscript: voiceTranscript.trim(),
        problemImpact,
        problemSince,
        latitude: latitude ?? primaryEvidence?.latitude,
        longitude: longitude ?? primaryEvidence?.longitude,
        accuracy: primaryEvidence?.accuracy || 15,
        address: address || primaryEvidence?.address || primaryEvidence?.locationName || '',
        evidenceMetadata: evidenceRecords.length > 0 ? evidenceRecords : undefined,
        photoBase64: previews[0] || undefined,
      });

      if (res.data.success && res.data.data) {
        const valData = res.data.data;
        setAiValidationResult(valData);
        setAiAdvisory(valData.analysis || null);
        setEvidenceValidation(valData.evidenceValidation || valData.analysis?.evidenceValidation || null);
        setAiAssessmentToken(valData.assessmentToken || null);
        setAiStatus('ready');
      } else {
        setAiStatus('failed');
        setAiError('AI assessment could not be completed. Please retry.');
      }
    } catch (err: any) {
      setAiStatus('failed');
      setAiError('AI assessment could not be completed. Please retry.');
    }
  };

  useEffect(() => {
    if (step === 5) {
      if (aiStatus === 'idle' || aiStatus === 'failed') {
        runAiAssessment();
      }
    }
  }, [step]);

  // If user modifies key report contents, invalidate old AI assessment
  const invalidateAiAssessment = () => {
    if (aiStatus !== 'idle') {
      setAiStatus('idle');
      setAiAssessmentToken(null);
      setAiAdvisory(null);
      setEvidenceValidation(null);
      setAiValidationResult(null);
      setDuplicateBlockedInfo(null);
    }
  };

  const handleLocationChange = (lat: number, lng: number, addr?: string, accuracy?: number) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addr !== undefined) setAddress(addr);
    setValidationError(null);
    setEvidenceRecords((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((rec, idx) => {
        if (idx === 0) {
          return {
            ...rec,
            latitude: lat,
            longitude: lng,
            accuracy: accuracy !== undefined ? accuracy : rec.accuracy,
            address: addr || rec.address,
            locationName: addr || rec.locationName,
            location: {
              ...(rec.location || { source: 'DEVICE_GPS' }),
              latitude: lat,
              longitude: lng,
              address: addr || rec.address,
            },
          };
        }
        return rec;
      });
    });
    invalidateAiAssessment();
  };

  // Automatically watermark any un-stamped uploaded photos with authoritative GPS coordinates
  useEffect(() => {
    let isCancelled = false;
    const processUnstamped = async () => {
      let changed = false;
      const updatedFiles = [...files];
      const updatedPreviews = [...previews];
      const updatedRecords = [...evidenceRecords];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const rec = evidenceRecords[i];
        if (!file || !rec) continue;
        const isVideo = file.type?.toLowerCase()?.startsWith('video/') || false;
        if (isVideo) continue;

        // If file has not been watermarked yet
        if (!file.name.includes('_geotagged') && rec.type !== 'live_photo') {
          try {
            const photoLat = rec.latitude ?? latitude ?? 23.0225;
            const photoLng = rec.longitude ?? longitude ?? 72.5714;
            const photoLoc = rec.locationName || rec.address || address || 'Current Location';
            const stamped = await stampGeotagWatermarkOnFile(file, {
              locationName: photoLoc,
              address: rec.address || address || photoLoc,
              latitude: photoLat,
              longitude: photoLng,
              accuracy: rec.accuracy || 10,
              timestamp: rec.capturedAt || formatLocationCardTimestamp(new Date()),
              category: mainCategory,
              subcategory,
            });

            if (isCancelled) return;

            updatedFiles[i] = stamped.file;
            updatedPreviews[i] = stamped.previewUrl;
            updatedRecords[i] = {
              ...rec,
              file: stamped.file,
              previewUrl: stamped.previewUrl,
              latitude: photoLat,
              longitude: photoLng,
              locationName: photoLoc,
              address: rec.address || address || photoLoc,
            };
            changed = true;
          } catch {
            // Keep existing
          }
        }
      }

      if (changed && !isCancelled) {
        setFiles(updatedFiles);
        setPreviews(updatedPreviews);
        setEvidenceRecords(updatedRecords);
      }
    };

    if (files.length > 0 && (latitude || longitude || evidenceRecords.length > 0)) {
      processUnstamped();
    }

    return () => {
      isCancelled = true;
    };
  }, [files.length, latitude, longitude, address, mainCategory, subcategory]);

  // STEP VALIDATION HELPERS
  const isStep1Valid = (() => {
    if (!mainCategory) return false;
    if (mainCategory === 'Other' || selectedCategoryId === 'other') {
      return otherCategoryText.trim().length > 0;
    }
    if (!subcategory) return false;
    if (subcategory === 'Other') {
      return otherCategoryText.trim().length > 0;
    }
    return true;
  })();

  const isStep2Valid = (() => {
    if (files.length === 0 || evidenceRecords.length === 0) return false;
    // At least one valid Live Photo OR Live Video has been successfully captured AND valid GPS coordinates are attached
    for (const r of evidenceRecords) {
      if (r.validationStatus !== 'VALID' || r.isConfirmed === false) return false;
      if (r.latitude === undefined || r.longitude === undefined || isNaN(r.latitude) || isNaN(r.longitude)) {
        return false;
      }
      if (r.type === 'live_video') {
        if (r.fileSize > 50 * 1024 * 1024) return false;
        if (r.duration !== undefined && r.duration > 60) return false;
      }
    }
    return true;
  })();

  const isStep3Valid = (() => {
    if (latitude === null || longitude === null) return false;
    if (evidenceRecords.length === 0) return false;
    const primary = evidenceRecords[0];
    if (!primary || primary.latitude === undefined || primary.longitude === undefined) return false;
    // Coordinates must match verified evidence coordinates (prevent tampering)
    if (Math.abs(latitude - primary.latitude) > 0.0001 || Math.abs(longitude - primary.longitude) > 0.0001) {
      return false;
    }
    return true;
  })();
  const isStep4Valid =
    ((description.trim().length >= 5) || (voiceTranscript.trim().length >= 5)) &&
    problemImpact.length > 0;

  const canProceedToNext = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    if (step === 4) return isStep4Valid;
    return true;
  };

  const handleNextStep = () => {
    setValidationError(null);

    if (step === 1) {
      if (!mainCategory) {
        setValidationError('Please select a main category to continue.');
        return;
      }
      if (mainCategory === 'Other' || selectedCategoryId === 'other') {
        if (!otherCategoryText.trim()) {
          setValidationError('Please describe the type of societal problem before continuing.');
          return;
        }
      } else {
        if (!subcategory) {
          setValidationError('Please select a subcategory to continue.');
          return;
        }
        if (subcategory === 'Other' && !otherCategoryText.trim()) {
          setValidationError('Please specify the problem type before continuing.');
          return;
        }
      }
    }

    if (step === 2 && !isStep2Valid) {
      setValidationError('Please capture at least 1 live photo or live video with valid GPS coordinates.');
      return;
    }

    // When advancing from Step 2 to Step 3, strictly lock authoritative evidence GPS
    if (step === 2 && isStep2Valid) {
      const primary = evidenceRecords[0];
      if (primary?.latitude !== undefined && primary?.longitude !== undefined) {
        setLatitude(primary.latitude);
        setLongitude(primary.longitude);
        if (primary.address) {
          setAddress(primary.address);
        } else if (primary.locationName) {
          setAddress(primary.locationName);
        }
      }
    }

    if (step === 3 && !isStep3Valid) {
      setValidationError('Verified GPS location from live evidence is required to continue.');
      return;
    }

    if (step === 4) {
      if (!((description.trim().length >= 5) || (voiceTranscript.trim().length >= 5))) {
        setValidationError('Please provide a brief description or record a voice note (min. 5 characters).');
        return;
      }
      if (problemImpact.length === 0) {
        setValidationError('Please select at least one problem impact.');
        return;
      }
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleStepClick = (targetStep: number) => {
    setValidationError(null);
    // Allow clicking backward anytime
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    // If clicking forward, enforce that prerequisite steps are completed
    if (targetStep >= 2 && !isStep1Valid) {
      setValidationError('Please select a category and subcategory first.');
      return;
    }
    if (targetStep >= 3 && !isStep2Valid) {
      setValidationError('Please upload photo evidence before proceeding to location.');
      return;
    }
    if (targetStep >= 4 && !isStep3Valid) {
      setValidationError('Please specify the location on the map before proceeding.');
      return;
    }
    if (targetStep >= 5 && !isStep4Valid) {
      setValidationError('Please enter a description and select problem impact before reviewing.');
      return;
    }

    setStep(targetStep);
  };

  const handleSubmit = async () => {
    setServerError(null);
    setValidationError(null);

    if (!isStep4Valid) {
      setValidationError('Please provide a description and select problem impact before submitting.');
      setStep(4);
      return;
    }

    if (!isStep3Valid) {
      setValidationError('Please verify the grievance location on the map.');
      setStep(3);
      return;
    }

    if (!isStep2Valid) {
      setValidationError('Please upload photographic evidence.');
      setStep(2);
      return;
    }

    const effectiveSubcategory =
      mainCategory === 'Other' || selectedCategoryId === 'other'
        ? otherCategoryText.trim()
        : subcategory === 'Other'
        ? otherCategoryText.trim()
        : subcategory;

    // Offline Draft Handling
    if (!isOnline) {
      try {
        await saveDraft({
          category: category || 'other',
          subcategory: effectiveSubcategory ? `${mainCategory !== 'Other' ? mainCategory + ' — ' : ''}${effectiveSubcategory}` : '',
          description: description || voiceTranscript,
          latitude: latitude!,
          longitude: longitude!,
          address,
          voiceTranscript,
          photoDataUrl: previews[0],
          problemImpact,
          problemSince,
        });
        alert('You are currently offline. Your report has been saved safely as a local draft!');
        navigate('/my-reports');
        return;
      } catch (e) {
        setServerError('Failed to save offline draft.');
        return;
      }
    }

    if (!isAuthenticated) {
      sessionStorage.setItem(
        'pending_report',
        JSON.stringify({
          mainCategory,
          selectedCategoryId,
          subcategory,
          otherCategoryText,
          category,
          description,
          latitude,
          longitude,
          address,
          voiceTranscript,
          problemImpact,
          problemSince,
        })
      );
      navigate('/login?redirect=/report');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', category || 'other');
      if (effectiveSubcategory) {
        formData.append('subcategory', `${mainCategory !== 'Other' ? mainCategory + ' — ' : ''}${effectiveSubcategory}`);
      }
      formData.append('description', description || voiceTranscript);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('address', address);
      if (problemImpact.length > 0) formData.append('problemImpact', JSON.stringify(problemImpact));
      if (problemSince) formData.append('problemSince', problemSince);
      if (voiceTranscript) formData.append('voiceTranscript', voiceTranscript);
      if (aiAssessmentToken) formData.append('aiAssessmentToken', aiAssessmentToken);

      if (evidenceRecords.length > 0) {
        const evidenceMeta = evidenceRecords.map((r) => ({
          id: r.id,
          type: r.type,
          latitude: r.latitude,
          longitude: r.longitude,
          accuracy: r.accuracy,
          capturedAt: r.capturedAt || r.recordedAt,
          locationName: r.locationName,
          address: r.address,
        }));
        formData.append('evidenceMetadata', JSON.stringify(evidenceMeta));
      }

      files.forEach((file) => {
        formData.append('photos', file);
      });

      if (voiceBlob) {
        formData.append('photos', voiceBlob, 'voice_note.webm');
      }

      const res = await apiClient.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSubmittedComplaint(res.data.data.complaint);
        setDuplicateWarning(res.data.data.duplicateWarning);
      }
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.error?.code === 'DUPLICATE_REPORT_BLOCKED') {
        const errData = err.response.data.error;
        setDuplicateBlockedInfo({
          existingComplaintNumber: errData.existingComplaintNumber,
          existingComplaintTitle: errData.existingComplaintTitle,
          existingComplaintStatus: errData.existingComplaintStatus,
          message: errData.message,
        });
        setServerError(errData.message);
      } else {
        setServerError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedComplaint) {
    return (
      <div className="gov-container max-w-2xl py-12">
        <div className="gov-card p-8 bg-white border border-emerald-200 shadow-lg rounded-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {t('report.successTitle')}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {t('report.successSubtitle')}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('report.trackingIdLabel')}
            </span>
            <p className="font-mono text-2xl font-extrabold text-blue-900 tracking-wider">
              {submittedComplaint.complaintNumber}
            </p>
            <div className="text-xs text-slate-600 pt-1 flex justify-center gap-4">
              <span>Department: <strong>{submittedComplaint.departmentId?.name || 'Public Works'}</strong></span>
              <span>Ward: <strong>{submittedComplaint.wardId?.name || 'Assigned'}</strong></span>
            </div>
          </div>

          {duplicateWarning && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-xs text-left">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle size={14} /> Duplicate Alert
              </p>
              <p className="mt-0.5">
                {duplicateWarning.nearbyCount} similar complaints were reported nearby ({duplicateWarning.masterComplaintNumber}). Your grievance has been linked to prioritize collective municipal remediation.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                const primaryEvidence = evidenceRecords[0];
                generateGrievancePdf({
                  grievanceId: submittedComplaint.complaintNumber || 'CC-2026-000123',
                  submissionDate: new Date().toLocaleString(),
                  status: 'Validated / Submitted',
                  category: mainCategory || (category ? t(`categories.${category}`) : 'Other'),
                  subcategory: subcategory || 'General',
                  problemTitle: submittedComplaint.title || `${mainCategory || 'Civic'} Grievance`,
                  description: description || voiceTranscript,
                  problemImpact,
                  problemSince,
                  address: address || primaryEvidence?.address || primaryEvidence?.locationName || 'Captured Location',
                  latitude: latitude || primaryEvidence?.latitude || 0,
                  longitude: longitude || primaryEvidence?.longitude || 0,
                  accuracy: primaryEvidence?.accuracy || 15,
                  evidenceType: files[0]?.type?.toLowerCase()?.startsWith('video/') ? 'Live Video' : 'Live Photo',
                  evidenceCaptureTime: primaryEvidence?.capturedAt || primaryEvidence?.recordedAt || new Date().toLocaleString(),
                  evidenceStatus: '✓ Verified Live',
                  evidencePhotoDataUrl: previews[0],
                  videoDuration: primaryEvidence?.duration,
                  descriptionValid: aiValidationResult?.descriptionValidation.valid ?? true,
                  categoryMatch: aiValidationResult?.categoryValidation.matches ?? true,
                  evidenceRelevant: aiValidationResult?.evidenceValidation.relevant ?? true,
                  evidenceQuality: aiValidationResult?.evidenceValidation.quality || 'Acceptable',
                  gpsVerified: aiValidationResult?.locationValidation.gpsVerified ?? true,
                  identifiedProblem: aiValidationResult?.identifiedProblem || subcategory || 'Civic Defect',
                  suggestedPriority: aiValidationResult?.suggestedPriority || 'MEDIUM',
                  severityScore: aiValidationResult?.severityScore || 6,
                  targetDepartment: submittedComplaint.departmentId?.name || aiValidationResult?.targetDepartment || 'Public Works',
                  recommendedAction: aiValidationResult?.recommendedAction || 'Forward to municipal engineering cell for field remediation.',
                  verificationToken: aiAssessmentToken || undefined,
                });
              }}
              className="gov-button-primary text-xs py-2.5 px-6 shadow-sm flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 cursor-pointer"
            >
              <Download size={14} />
              <span>Download Official Report (PDF)</span>
            </button>

            <Link
              to={`/issues/${submittedComplaint.complaintNumber}`}
              className="gov-button-secondary text-xs py-2.5 px-6 shadow-xs flex items-center gap-1.5"
            >
              <span>{t('report.trackNow')}</span>
              <ExternalLink size={14} />
            </Link>

            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setStep(1);
                setMainCategory('');
                setSelectedCategoryId('');
                setSubcategory('');
                setOtherCategoryText('');
                setCategory('');
                setDescription('');
                setFiles([]);
                setPreviews([]);
                setEvidenceRecords([]);
                setVoiceTranscript('');
                setLatitude(null);
                setLongitude(null);
                setAddress('');
                setValidationError(null);
              }}
              className="gov-button-secondary text-xs py-2.5 px-6 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{t('report.reportAnother')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gov-container max-w-3xl py-8 space-y-6">
      {/* Wizard Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('report.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('report.subtitle')}
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="gov-card p-3 bg-white border border-slate-200 overflow-x-auto rounded-xl">
        <div className="flex items-center justify-between min-w-[500px] text-xs font-semibold">
          {[
            { num: 1, label: t('report.stepCategory'), valid: isStep1Valid },
            { num: 2, label: t('report.stepEvidence'), valid: isStep2Valid },
            { num: 3, label: t('report.stepLocation'), valid: isStep3Valid },
            { num: 4, label: t('report.stepDescription'), valid: isStep4Valid },
            { num: 5, label: t('report.stepReview'), valid: true },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => handleStepClick(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                step === s.num
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : s.valid
                  ? 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s.valid && s.num < step ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : null}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2 animate-shake">
          <ShieldAlert size={16} className="text-amber-700 shrink-0" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {t('report.selectCategory')} <span className="text-red-500">*</span>
            </h2>
            <span className="text-xs text-slate-500">Step 1 of 5</span>
          </div>

          {/* Main Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleMainCategorySelect(c.id, c.name)}
                  className={`p-4 rounded-lg border text-left flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/80 text-blue-950 ring-2 ring-blue-700/20 shadow-xs font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-xs">{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Subcategories Section (for all categories except 'other') */}
          {selectedCategoryConfig && selectedCategoryConfig.id !== 'other' && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Select Subcategory <span className="text-red-500">*</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {selectedCategoryConfig.subcategories.map((sub) => {
                  const isSubSelected = subcategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcategorySelect(sub)}
                      className={`p-3 rounded-lg border text-center flex items-center justify-center min-h-[46px] transition-all cursor-pointer ${
                        isSubSelected
                          ? 'border-blue-700 bg-blue-50/80 text-blue-950 ring-2 ring-blue-700/20 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs leading-tight">{sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory = 'Other' input */}
              {subcategory === 'Other' && (
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg space-y-2">
                  <label htmlFor="sub-other-problem-type" className="block text-xs font-bold text-amber-950">
                    Please specify the problem type <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sub-other-problem-type"
                    type="text"
                    value={otherCategoryText}
                    onChange={(e) => {
                      setOtherCategoryText(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="e.g. Dam water storage issue"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>
              )}
            </div>
          )}

          {/* Main Category = 'Other' input */}
          {selectedCategoryId === 'other' && (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg space-y-2 pt-4 border-t border-slate-200">
              <label htmlFor="main-other-problem-type" className="block text-xs font-bold text-amber-950">
                Describe the type of societal problem <span className="text-red-500">*</span>
              </label>
              <input
                id="main-other-problem-type"
                type="text"
                value={otherCategoryText}
                onChange={(e) => {
                  setOtherCategoryText(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Community internet connectivity problem"
                className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: EVIDENCE UPLOAD (Live Camera or Device Files) */}
      {step === 2 && (
        <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload or Capture Photo Evidence <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload photo from your device gallery or capture live photo/video.
              </p>
            </div>
            <span className="text-xs text-slate-500">Step 2 of 5</span>
          </div>

          <EvidenceUploader
            files={files}
            previews={previews}
            evidenceRecords={evidenceRecords}
            onChange={(newFiles, newPreviews, newRecords) => {
              setFiles(newFiles);
              setPreviews(newPreviews);
              if (newRecords) {
                setEvidenceRecords(newRecords);
              }
              setValidationError(null);
            }}
            category={mainCategory}
            subcategory={subcategory}
            description={description}
            defaultLatitude={latitude}
            defaultLongitude={longitude}
            defaultAddress={address}
          />
        </div>
      )}

      {/* STEP 3: LOCATION DETECTION (GPS-LOCKED FROM LIVE EVIDENCE) */}
      {step === 3 && (
        <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Select Location <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify the precise geographic location from your live evidence capture.
              </p>
            </div>
            <span className="text-xs text-slate-500">Step 3 of 5</span>
          </div>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            evidenceRecords={evidenceRecords}
            onChange={handleLocationChange}
            onBackToEvidence={() => setStep(2)}
          />
        </div>
      )}

      {/* STEP 4: DESCRIPTION & AUDIO NOTE */}
      {step === 4 && (
        <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t('report.detailsPrompt')} <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide clear defect details or record an audio voice note.
              </p>
            </div>
            <span className="text-xs text-slate-500">Step 4 of 5</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              {t('report.descriptionLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setValidationError(null);
              }}
              placeholder={t('report.descPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 leading-relaxed"
            />
          </div>

          {/* SIDE-BY-SIDE: Problem Impact * & Problem Since */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* Left Column: Problem Impact * */}
            <div className="md:col-span-7 space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <span>Problem Impact</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-normal">
                  Select one or more
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {PROBLEM_IMPACT_OPTIONS.map((impact) => {
                  const isSelected = problemImpact.includes(impact);
                  return (
                    <button
                      key={impact}
                      type="button"
                      onClick={() => toggleProblemImpact(impact)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/80 text-blue-950 ring-2 ring-blue-700/20 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {impact}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Problem Since (Enhanced Dropdown Section) */}
            <div className="md:col-span-5 space-y-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="problem-since-select" className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Clock size={13} className="text-blue-700" />
                    <span>Problem Since</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    (Optional)
                  </span>
                </div>

                <div className="relative">
                  <select
                    id="problem-since-select"
                    value={problemSince}
                    onChange={(e) => handleProblemSinceChange(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 rounded-lg text-xs sm:text-sm font-medium text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">Select when problem started</option>
                    {PROBLEM_SINCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <ChevronDown size={15} />
                  </div>
                </div>
              </div>

              {/* Dynamic Status / Helper Note */}
              <div className="pt-0.5">
                {problemSince ? (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50/90 border border-blue-200 rounded-md text-[11px] text-blue-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="truncate">Duration: <strong>{problemSince}</strong></span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Helps authorities assess issue chronicity and priority.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Voice Recording Widget */}
          <div className="pt-2 border-t border-slate-100">
            <VoiceRecorder
              transcript={voiceTranscript}
              onTranscriptChange={(text) => {
                setVoiceTranscript(text);
                if (!description && text) {
                  setDescription(text);
                }
                setValidationError(null);
              }}
              onAudioBlobReady={(blob) => setVoiceBlob(blob)}
            />
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & FINAL SUBMISSION */}
      {step === 5 && (
        <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t('report.reviewTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('report.reviewSubtitle')}
              </p>
            </div>
            <span className="text-xs text-slate-500">Step 5 of 5</span>
          </div>

          {/* AI QUALITY & RISK GATE VALIDATION BOX */}
          <div className="space-y-3">
            {aiStatus === 'analyzing' && (
              <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-col items-center justify-center text-center space-y-2.5">
                <RefreshCw size={26} className="text-blue-700 animate-spin" />
                <div>
                  <h4 className="font-bold text-sm text-blue-950">Analyzing submission...</h4>
                  <p className="text-xs text-blue-700 max-w-md mt-0.5">
                    CivicConnect AI Quality & Risk Gate is cross-verifying description quality, category consistency, live photographic evidence relevance, and GPS sensor lock.
                  </p>
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between">
                <span>{aiError}</span>
                <button
                  type="button"
                  onClick={runAiAssessment}
                  className="px-3 py-1 bg-red-700 text-white rounded font-bold hover:bg-red-800 cursor-pointer shadow-xs"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {/* DUPLICATE GRIEVANCE ALERT CARD — GOVERNMENT PORTAL STYLE */}
            {((aiValidationResult?.duplicateInfo?.isDuplicate) || duplicateBlockedInfo) && (
              <div className="bg-white border border-slate-300 border-l-4 border-l-amber-600 rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
                      <CopyCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Official Notice: Similar Grievance Already Registered in this Area
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        An active grievance has already been filed and verified for this issue in this immediate vicinity. Duplicate reports for the same incident are blocked to prevent municipal backlog.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold tracking-wide uppercase shrink-0">
                    Active Ticket Exists
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Existing Tracking ID</span>
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-1">
                      {aiValidationResult?.duplicateInfo?.masterComplaintNumber || duplicateBlockedInfo?.existingComplaintNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Current Status</span>
                    <span className="font-bold text-xs uppercase text-emerald-800 block mt-1">
                      {aiValidationResult?.duplicateInfo?.masterComplaintStatus || duplicateBlockedInfo?.existingComplaintStatus || 'In Progress'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Reported Defect</span>
                    <span className="font-medium text-xs text-slate-800 block truncate mt-1" title={aiValidationResult?.duplicateInfo?.masterComplaintTitle || duplicateBlockedInfo?.existingComplaintTitle}>
                      {aiValidationResult?.duplicateInfo?.masterComplaintTitle || duplicateBlockedInfo?.existingComplaintTitle || mainCategory}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const id = aiValidationResult?.duplicateInfo?.masterComplaintNumber || duplicateBlockedInfo?.existingComplaintNumber;
                      if (id) navigate(`/issues/${id}`);
                    }}
                    className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Track Existing Grievance #{aiValidationResult?.duplicateInfo?.masterComplaintNumber || duplicateBlockedInfo?.existingComplaintNumber}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition-colors"
                  >
                    Change Evidence / Location
                  </button>
                </div>
              </div>
            )}

            {/* STATE 1 — PASSED — GOVERNMENT PORTAL STYLE */}
            {aiStatus === 'ready' && aiValidationResult?.overallStatus === 'PASS' && !aiValidationResult?.duplicateInfo?.isDuplicate && !duplicateBlockedInfo && (
              <div className="bg-white border border-slate-300 border-l-4 border-l-emerald-600 rounded-lg p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        Submission Integrity Verification — PASSED
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        All 5 compliance and sensor verification gates have been satisfied. Authenticated for municipal filing.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-semibold tracking-wide uppercase shrink-0">
                    VALIDATED
                  </span>
                </div>

                {/* 5 Mandatory Checks Verified Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">Description Valid</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">{aiValidationResult.descriptionValidation.reason}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">Category Match</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">{aiValidationResult.categoryValidation.reason}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">Evidence Relevance</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">
                        {aiValidationResult.evidenceValidation.reason} ({Math.round((aiValidationResult.evidenceValidation.confidence || 0.89) * 100)}% match)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">Evidence Quality</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">
                        Quality: {aiValidationResult.evidenceValidation.quality || 'Acceptable'} • Subject visible
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">GPS Verified</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">
                        Accuracy: ±{Math.round(aiValidationResult.locationValidation.accuracy || 15)}m • Authenticated lock
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block text-xs">Public Risk Assessed</span>
                      <span className="text-[10.5px] text-slate-600 block leading-tight">
                        Severity: {aiValidationResult.severityScore}/10 • Priority: {aiValidationResult.suggestedPriority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data-Driven Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10.5px] font-semibold uppercase tracking-wider">Identified Defect</span>
                    <strong className="text-slate-900 font-bold block truncate text-xs mt-0.5" title={aiValidationResult.identifiedProblem}>
                      {aiValidationResult.identifiedProblem}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10.5px] font-semibold uppercase tracking-wider">Suggested Priority</span>
                    <strong
                      className={`font-bold text-xs uppercase block mt-0.5 ${
                        aiValidationResult.suggestedPriority === 'CRITICAL'
                          ? 'text-red-700'
                          : aiValidationResult.suggestedPriority === 'HIGH'
                          ? 'text-amber-800'
                          : 'text-slate-800'
                      }`}
                    >
                      {aiValidationResult.suggestedPriority}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10.5px] font-semibold uppercase tracking-wider">Severity Score</span>
                    <strong className="text-slate-900 font-bold text-xs block mt-0.5">{aiValidationResult.severityScore} / 10</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10.5px] font-semibold uppercase tracking-wider">Target Department</span>
                    <strong className="text-slate-900 font-bold block truncate text-xs uppercase mt-0.5">
                      {aiValidationResult.targetDepartment}
                    </strong>
                  </div>
                </div>

                {/* Recommended Action */}
                {aiValidationResult.recommendedAction && (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-800 flex items-start gap-2">
                    <div className="p-1 rounded bg-blue-100 text-blue-900 shrink-0 mt-0.5">
                      <Sparkles size={13} />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold">Recommended Municipal Action: </strong>
                      <span className="text-slate-700">{aiValidationResult.recommendedAction}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATE 2 — NEEDS CORRECTION — GOVERNMENT PORTAL STYLE */}
            {aiStatus === 'ready' && aiValidationResult?.overallStatus === 'NEEDS_CORRECTION' && (
              <div className="bg-white border border-slate-300 border-l-4 border-l-amber-600 rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        Administrative Compliance Review — Action Required
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Please resolve the following required verification items before final submission can be accepted:
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold tracking-wide uppercase shrink-0">
                    Action Required
                  </span>
                </div>

                {/* Specific Correction Cards */}
                <div className="space-y-2 pt-1">
                  {!aiValidationResult.descriptionValidation.valid && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 border-l-2 border-l-red-600 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Description Insufficient</span>
                        </div>
                        <p className="text-xs text-slate-700">{aiValidationResult.descriptionValidation.reason}</p>
                        {aiValidationResult.descriptionValidation.suggestion && (
                          <p className="text-[11px] text-slate-500 italic">
                            Action: {aiValidationResult.descriptionValidation.suggestion}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Fix Description
                      </button>
                    </div>
                  )}

                  {!aiValidationResult.categoryValidation.matches && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 border-l-2 border-l-red-600 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Category Mismatch</span>
                        </div>
                        <p className="text-xs text-slate-700">{aiValidationResult.categoryValidation.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Go Back & Edit
                      </button>
                    </div>
                  )}

                  {(!aiValidationResult.evidenceValidation.relevant || aiValidationResult.evidenceValidation.quality === 'POOR') && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 border-l-2 border-l-red-600 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Evidence Does Not Support Complaint</span>
                        </div>
                        <p className="text-xs text-slate-700">{aiValidationResult.evidenceValidation.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Retake Evidence
                      </button>
                    </div>
                  )}

                  {!aiValidationResult.locationValidation.gpsVerified && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 border-l-2 border-l-red-600 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>GPS Verification Failed</span>
                        </div>
                        <p className="text-xs text-slate-700">
                          {aiValidationResult.locationValidation.reason || 'Location could not be verified. Please capture the evidence again with GPS enabled.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Retake with GPS
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Note: Final submission is disabled until all required items pass validation.</span>
                  <span className="font-mono text-slate-400">STATUS: REVISION_REQUIRED</span>
                </div>
              </div>
            )}

            {/* STATE 3 — REJECTED — GOVERNMENT PORTAL STYLE */}
            {aiStatus === 'ready' && aiValidationResult?.overallStatus === 'REJECTED' && (
              <div className="bg-white border border-slate-300 border-l-4 border-l-red-600 rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-red-100 text-red-800 border border-red-200 shrink-0 mt-0.5">
                      <XCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Filing Inadmissible — Evidence Inconsistency Detected
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your evidence does not appear to represent the selected civic issue.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-[11px] font-semibold tracking-wide uppercase shrink-0">
                    Rejected
                  </span>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3.5 py-1.5 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Go Back & Correct
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COMPLETE REVIEW DATA SECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Selected Category:</span>
              <strong className="text-slate-900 text-right">
                {mainCategory || (category ? t(`categories.${category}`) : 'Not specified')}
                {subcategory && subcategory !== 'Other' ? ` — ${subcategory}` : ''}
                {(mainCategory === 'Other' || selectedCategoryId === 'other') && otherCategoryText ? ` (${otherCategoryText})` : ''}
                {subcategory === 'Other' && otherCategoryText ? ` — Other (${otherCategoryText})` : ''}
              </strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Location:</span>
              <div className="text-right">
                <span className="font-semibold text-slate-800 block truncate max-w-sm">
                  {address || 'Captured Location'}
                </span>
                {latitude && longitude && (
                  <span className="font-mono text-[10.5px] text-slate-500 block">
                    Lat {latitude.toFixed(6)}°, Long {longitude.toFixed(6)}°
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium block">Detailed Description:</span>
              <p className="text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                {description || voiceTranscript || 'No description provided'}
              </p>
            </div>

            {problemImpact.length > 0 && (
              <div className="border-b border-slate-200 pb-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Problem Impact:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                    {problemImpact.map((imp) => (
                      <span
                        key={imp}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-900"
                      >
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>
                {problemSince && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Problem Since:</span>
                    <strong className="text-slate-900">{problemSince}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Preview: Shows actual geotagged photo uncropped with watermark and pin map */}
            {previews.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium block">
                    Verified Live Evidence ({previews.length}):
                  </span>
                  <span className="text-emerald-700 font-bold text-[10.5px] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    GPS Geotag Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  {previews.map((p, i) => {
                    const file = files[i];
                    const rec = evidenceRecords[i];
                    const isVideo = file?.type?.toLowerCase()?.startsWith('video/') || false;
                    const photoLat = rec?.latitude ?? latitude;
                    const photoLng = rec?.longitude ?? longitude;
                    const photoAcc = rec?.accuracy ?? 10;
                    const photoLocation = rec?.locationName || rec?.address || address || 'Municipal Area';
                    const photoAddress = rec?.address && rec?.address !== photoLocation ? rec.address : '';
                    const photoTime = rec?.capturedAt || rec?.recordedAt || 'Authenticated Capture';

                    return isVideo ? (
                      <div key={i} className="w-full sm:w-[48%] min-w-[280px] bg-slate-950 rounded-xl border border-slate-300 overflow-hidden shadow-sm flex flex-col">
                        <div className="relative bg-black flex items-center justify-center">
                          <video src={p} controls playsInline className="w-full h-48 object-contain bg-black" />
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[10px] shadow-sm">
                            <Film size={11} /> LIVE VIDEO
                          </div>
                          <div className="absolute top-2 right-2 z-10 bg-slate-950/85 backdrop-blur-xs text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                            ±{Math.round(photoAcc)}m
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 text-white space-y-2 border-t border-slate-800">
                          <div className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-slate-100 block leading-snug break-words">
                                {photoLocation}
                              </span>
                              {photoAddress && (
                                <span className="text-[10px] text-slate-400 block leading-snug break-words mt-0.5">
                                  {photoAddress}
                                </span>
                              )}
                            </div>
                          </div>
                          {photoLat !== null && photoLng !== null && (
                            <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
                              <span>
                                Lat: <strong className="text-white">{photoLat.toFixed(6)}°</strong> &nbsp;
                                Long: <strong className="text-white">{photoLng.toFixed(6)}°</strong>
                              </span>
                              <span className="text-emerald-400 text-[10px] font-sans font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                GPS LOCKED
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock size={10} className="text-amber-400" />
                              <span>{photoTime}</span>
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              {rec?.duration ? `${Math.round(rec.duration)}s` : '<60s'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="w-full sm:w-[48%] min-w-[280px] bg-slate-950 rounded-xl border border-slate-300 overflow-hidden shadow-sm flex flex-col">
                        <div className="relative bg-black flex items-center justify-center">
                          <img
                            src={p}
                            alt="Verified Live Geotagged Evidence"
                            className="w-full max-h-[300px] object-contain block bg-black"
                          />
                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-slate-950/85 backdrop-blur-xs text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/30">
                            <MapPin size={11} className="text-cyan-400" />
                            <span>GEOTAGGED PHOTO</span>
                          </div>
                          <div className="absolute top-2 right-2 z-10 bg-slate-950/85 backdrop-blur-xs text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span>±{Math.round(photoAcc)}m</span>
                          </div>
                        </div>

                        {/* Full Geotag Location Info Footer */}
                        <div className="p-3 bg-slate-950 text-white space-y-2 border-t border-slate-800">
                          {/* Location Address */}
                          <div className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-slate-100 block leading-snug break-words">
                                {photoLocation}
                              </span>
                              {photoAddress && (
                                <span className="text-[10px] text-slate-400 block leading-snug break-words mt-0.5">
                                  {photoAddress}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Coordinates & Accuracy */}
                          {photoLat !== null && photoLng !== null && (
                            <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
                              <span>
                                Lat: <strong className="text-white">{photoLat.toFixed(6)}°</strong> &nbsp;
                                Long: <strong className="text-white">{photoLng.toFixed(6)}°</strong>
                              </span>
                              <span className="text-emerald-400 text-[10px] font-sans font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                GPS LOCKED
                              </span>
                            </div>
                          )}

                          {/* Timestamp & Verification */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock size={10} className="text-amber-400" />
                              <span>{photoTime}</span>
                            </span>
                            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              AUTHENTICATED
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stepper Footer Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              setStep(step - 1);
            }}
            className="gov-button-secondary text-xs py-2.5 px-4 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>{t('common.back')}</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={!canProceedToNext()}
            className={`gov-button-primary text-xs py-2.5 px-6 shadow-sm font-bold flex items-center gap-1.5 transition-all ${
              canProceedToNext()
                ? 'cursor-pointer hover:bg-blue-800'
                : 'opacity-50 cursor-not-allowed bg-slate-400'
            }`}
          >
            <span>{t('common.next')}</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          /* STEP 5 SUBMIT BUTTON: Strictly gated by AI Assessment & all 5 checks passing */
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              aiStatus !== 'ready' ||
              !aiAssessmentToken ||
              aiValidationResult?.overallStatus !== 'PASS' ||
              Boolean(aiValidationResult?.duplicateInfo?.isDuplicate) ||
              Boolean(duplicateBlockedInfo)
            }
            className={`gov-button-primary text-xs py-2.5 px-8 shadow-md font-bold transition-all flex items-center gap-2 ${
              aiStatus === 'ready' &&
              aiAssessmentToken &&
              aiValidationResult?.overallStatus === 'PASS' &&
              !aiValidationResult?.duplicateInfo?.isDuplicate &&
              !duplicateBlockedInfo &&
              !isSubmitting
                ? 'bg-emerald-700 hover:bg-emerald-600 cursor-pointer text-white'
                : 'bg-slate-400 cursor-not-allowed opacity-60 text-slate-200'
            }`}
          >
            {isSubmitting ? (
              <span>{t('report.submitting')}</span>
            ) : (aiValidationResult?.duplicateInfo?.isDuplicate || duplicateBlockedInfo) ? (
              <>
                <CopyCheck size={15} />
                <span>Duplicate Report — Submission Blocked</span>
              </>
            ) : aiValidationResult?.overallStatus === 'NEEDS_CORRECTION' ? (
              <>
                <AlertTriangle size={15} />
                <span>Resolve Issues to Submit</span>
              </>
            ) : aiValidationResult?.overallStatus === 'REJECTED' ? (
              <>
                <ShieldAlert size={15} />
                <span>Cannot Be Submitted</span>
              </>
            ) : aiStatus === 'ready' && aiValidationResult?.overallStatus === 'PASS' ? (
              <>
                <Send size={15} />
                <span>Submit Civic Grievance</span>
              </>
            ) : (
              <>
                <Clock size={15} className={aiStatus === 'analyzing' ? 'animate-spin' : ''} />
                <span>Analyzing Submission...</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
