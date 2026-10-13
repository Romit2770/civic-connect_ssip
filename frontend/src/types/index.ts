export type UserRole =
  | 'citizen'
  | 'field_officer'
  | 'field_worker'
  | 'department_officer'
  | 'municipal_admin'
  | 'super_admin'
  | 'university_admin'
  | 'faculty_mentor'
  | 'student_lead'
  | 'industry_admin'
  | 'csr_lead'
  | 'corporate_partner';

export type ComplaintStatus =
  | 'submitted'
  | 'acknowledged'
  | 'routed'
  | 'assigned'
  | 'in_progress'
  | 'resolution_submitted'
  | 'verification_pending'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type Priority = ComplaintPriority;

export type SLAState = 'within_sla' | 'due_soon' | 'breached' | 'escalated';

export type ComplaintCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water'
  | 'drainage'
  | 'road_damage'
  | 'public_property'
  | 'fallen_tree'
  | 'illegal_dumping'
  | 'traffic'
  | 'other';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  institutionName?: string;
  organizationName?: string;
  adminId?: string;
  username?: string;
  designation?: string;
  lastLoginAt?: string;
  department?: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  ward?: {
    _id: string;
    wardNumber: number;
    name: string;
    zone: string;
  };
  badgeNumber?: string;
  avatar?: string;
  registrationId?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  address?: string;
  city?: string;
  pincode?: string;
  preferredLanguage?: string;
}

export interface AdminCredentialRecord {
  id: string;
  name: string;
  adminId: string;
  workerId?: string;
  username: string;
  email: string;
  phone?: string;
  role: 'field_worker' | 'field_officer' | 'municipal_admin' | 'department_officer' | 'super_admin' | 'university_admin' | 'industry_admin' | string;
  roleLabel: string;
  organizationName: string;
  departmentName?: string;
  wardName?: string;
  badgeNumber?: string;
  registrationId?: string;
  designation?: string;
  industryType?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLoginAt?: string;
  createdByName?: string;
}

export interface CredentialSummary {
  totalFieldWorkers?: number;
  activeFieldWorkers?: number;
  totalMunicipalities?: number;
  activeMunicipalAdmins?: number;
  totalUniversities?: number;
  activeUniversityAdmins?: number;
  totalIndustries?: number;
  activeIndustryAdmins?: number;
}

export interface Department {
  _id: string;
  name: string;
  code?: string;
  slug: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  icon: string;
  categories?: string[];
  active?: boolean;
  isActive: boolean;
  workerCount?: number;
  activeComplaintsCount?: number;
  resolvedComplaintsCount?: number;
}

export interface DepartmentWorker {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  badgeNumber?: string;
  wardId?: {
    _id: string;
    wardNumber: number;
    name: string;
    zone: string;
  };
  avatar?: string;
  createdAt?: string;
  activeTasksCount: number;
  resolvedTasksCount: number;
  recentTasks?: Array<{
    _id: string;
    complaintNumber: string;
    title: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    createdAt: string;
  }>;
}

export interface Ward {
  _id: string;
  wardNumber: number;
  name: string;
  zone: string;
  population?: number;
  contactPhone?: string;
  centerPoint?: {
    coordinates: [number, number];
  };
  boundary?: any;
}

export interface ResolutionEvidence {
  photos: string[];
  description: string;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  resolvedAt?: string;
  aiVerificationScore?: number;
  aiVerificationStatus?: 'likely_resolved' | 'likely_not_resolved' | 'uncertain';
  aiVerificationReason?: string;
  capturedLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
  };
}

export interface ResolutionFeedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface MediaAsset {
  url: string;
  provider: 'local' | 'cloudinary' | 's3';
  publicId?: string;
  mimeType: string;
  sizeBytes: number;
  mediaType: 'image' | 'video' | 'audio';
  originalName?: string;
}

export type PhotoAsset = MediaAsset;

export interface Complaint {
  _id: string;
  complaintNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  subcategory?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  priorityScore: number;
  priorityExplanation?: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  wardId?: Ward;
  departmentId?: Department;
  assignedOfficerId?: User;
  reportedBy: User;
  photos: string[];
  videos?: string[];
  photoAssets?: PhotoAsset[];
  mediaAssets?: MediaAsset[];
  voiceAudioUrl?: string;
  voiceTranscript?: string;
  problemImpact?: string[];
  problemSince?: string;
  reportCount: number;
  slaDeadline?: string;
  responseTimeDeadline?: string;
  slaState: SLAState;
  resolutionEvidence?: ResolutionEvidence;
  satisfactionRating?: number;
  resolutionFeedback?: ResolutionFeedback;
  resolvedAt?: string;
  closedAt?: string;
  statusHistory?: Array<{
    _id: string;
    fromStatus: ComplaintStatus | null;
    toStatus: ComplaintStatus;
    changedBy: {
      _id: string;
      name: string;
      role: string;
    };
    note?: string;
    evidencePhoto?: string;
    createdAt: string;
  }>;
  comments?: Array<{
    _id: string;
    authorId: {
      _id: string;
      name: string;
      role: string;
    };
    authorRole: string;
    authorName: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  aiAnalysisId?: {
    category: string;
    severity: number;
    priority: string;
    confidence: number;
    summary: string;
    hazards: string[];
    reasoning: string;
    analysisMethod: string;
  };
  evidenceVerificationId?: EvidenceVerification;
  evidenceVerificationStatus?: 'PASS' | 'REVIEW' | 'HIGH_RISK' | 'UNAVAILABLE';
  evidenceRiskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type VerificationStatus = 'PASS' | 'REVIEW' | 'HIGH_RISK' | 'UNAVAILABLE';
export type AuthenticityStatus = 'LIKELY_REAL' | 'NEEDS_REVIEW' | 'LIKELY_SYNTHETIC';
export type HumanReviewDecision = 'ACCEPTED' | 'MARKED_FOR_REVIEW' | 'REJECTED' | 'REQUESTED_NEW_EVIDENCE' | 'OVERRIDDEN';

export interface EvidenceVerification {
  _id: string;
  complaintId?: string;
  photoUrl?: string;
  perceptualHash: string;
  verificationStatus: VerificationStatus;
  overallRiskScore: number;
  confidence: number;
  recommendedAction: 'ACCEPT' | 'REVIEW' | 'FLAG';
  aiVisual: {
    authenticityStatus: AuthenticityStatus;
    syntheticProbability: number;
    manipulationProbability: number;
    visualArtifacts: string[];
    syntheticIndicators: string[];
    visualRealismScore: number;
    reasoningSummary: string;
    model: string;
    analyzedAt: string;
  };
  civicRelevance: {
    isCivicIssueVisible: boolean;
    detectedIssueType: string;
    relevanceConfidence: number;
    categoryMatch: boolean;
    reasoning: string;
  };
  metadata: {
    available: boolean;
    cameraMake?: string;
    cameraModel?: string;
    software?: string;
    hasEditingSoftware: boolean;
    captureTimestamp?: string;
    gpsCoordinates?: [number, number];
    fileSizeBytes: number;
    mimeType: string;
    findings: string[];
  };
  consistency: {
    locationConsistency: 'VERIFIED' | 'UNVERIFIED' | 'MISMATCH' | 'NOT_AVAILABLE';
    timestampConsistency: 'CONSISTENT' | 'SUSPICIOUS' | 'NOT_AVAILABLE';
    locationDistanceMeters?: number;
    timestampDiscrepancyHours?: number;
  };
  duplicateCheck: {
    isDuplicate: boolean;
    similarityScore: number;
    matchedComplaintNumber?: string;
    findings: string;
  };
  citizenMessage: string;
  officerNotes: string;
  humanReview?: {
    reviewedBy: string;
    reviewerName: string;
    reviewerRole: string;
    decision: HumanReviewDecision;
    notes?: string;
    previousStatus: VerificationStatus;
    reviewedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  complaintId?: string;
  complaintNumber?: string;
  isRead: boolean;
  createdAt: string;
}
