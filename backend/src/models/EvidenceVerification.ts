import mongoose, { Schema, Document } from 'mongoose';

export type VerificationStatus = 'PASS' | 'REVIEW' | 'HIGH_RISK' | 'UNAVAILABLE';
export type AuthenticityStatus = 'LIKELY_REAL' | 'NEEDS_REVIEW' | 'LIKELY_SYNTHETIC';
export type HumanReviewDecision = 'ACCEPTED' | 'MARKED_FOR_REVIEW' | 'REJECTED' | 'REQUESTED_NEW_EVIDENCE' | 'OVERRIDDEN';

export interface IEvidenceVerification extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  photoUrl?: string;
  perceptualHash: string;
  
  // Composite Risk Assessment
  verificationStatus: VerificationStatus; // PASS (0-30), REVIEW (31-60), HIGH_RISK (61-100)
  overallRiskScore: number; // 0 - 100
  confidence: number; // 0.0 - 1.0
  recommendedAction: 'ACCEPT' | 'REVIEW' | 'FLAG';

  // AI Visual & Forensic Signals (Gemini)
  aiVisual: {
    authenticityStatus: AuthenticityStatus;
    syntheticProbability: number; // 0.0 - 1.0
    manipulationProbability: number; // 0.0 - 1.0
    visualArtifacts: string[];
    syntheticIndicators: string[];
    visualRealismScore: number; // 0 - 100
    reasoningSummary: string;
    model: string;
    analyzedAt: Date;
  };

  // Civic Relevance Signal
  civicRelevance: {
    isCivicIssueVisible: boolean;
    detectedIssueType: string;
    relevanceConfidence: number;
    categoryMatch: boolean;
    reasoning: string;
  };

  // EXIF & File Metadata Signal
  metadata: {
    available: boolean;
    cameraMake?: string;
    cameraModel?: string;
    software?: string;
    hasEditingSoftware: boolean;
    captureTimestamp?: Date;
    gpsCoordinates?: [number, number]; // [lng, lat]
    dimensions?: { width: number; height: number };
    fileSizeBytes: number;
    mimeType: string;
    findings: string[];
  };

  // Consistency Checks
  consistency: {
    locationConsistency: 'VERIFIED' | 'UNVERIFIED' | 'MISMATCH' | 'NOT_AVAILABLE';
    timestampConsistency: 'CONSISTENT' | 'SUSPICIOUS' | 'NOT_AVAILABLE';
    locationDistanceMeters?: number;
    timestampDiscrepancyHours?: number;
  };

  // Duplicate / Reuse Check
  duplicateCheck: {
    isDuplicate: boolean;
    similarityScore: number; // 0.0 - 1.0 (1.0 = identical perceptual hash)
    matchedComplaintId?: mongoose.Types.ObjectId;
    matchedComplaintNumber?: string;
    findings: string;
  };

  // Citizen & Officer Explanations
  citizenMessage: string;
  officerNotes: string;

  // Human-In-The-Loop Audit
  humanReview?: {
    reviewedBy: mongoose.Types.ObjectId;
    reviewerName: string;
    reviewerRole: string;
    decision: HumanReviewDecision;
    notes?: string;
    previousStatus: VerificationStatus;
    reviewedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const evidenceVerificationSchema = new Schema<IEvidenceVerification>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      index: true,
    },
    photoUrl: String,
    perceptualHash: {
      type: String,
      required: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PASS', 'REVIEW', 'HIGH_RISK', 'UNAVAILABLE'],
      default: 'PASS',
      index: true,
    },
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 15,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85,
    },
    recommendedAction: {
      type: String,
      enum: ['ACCEPT', 'REVIEW', 'FLAG'],
      default: 'ACCEPT',
    },
    aiVisual: {
      authenticityStatus: {
        type: String,
        enum: ['LIKELY_REAL', 'NEEDS_REVIEW', 'LIKELY_SYNTHETIC'],
        default: 'LIKELY_REAL',
      },
      syntheticProbability: { type: Number, default: 0.05 },
      manipulationProbability: { type: Number, default: 0.05 },
      visualArtifacts: { type: [String], default: [] },
      syntheticIndicators: { type: [String], default: [] },
      visualRealismScore: { type: Number, default: 90 },
      reasoningSummary: { type: String, default: 'Photographic evidence appears natural and consistent.' },
      model: { type: String, default: 'gemini-3.6-flash' },
      analyzedAt: { type: Date, default: Date.now },
    },
    civicRelevance: {
      isCivicIssueVisible: { type: Boolean, default: true },
      detectedIssueType: { type: String, default: 'civic_infrastructure' },
      relevanceConfidence: { type: Number, default: 0.9 },
      categoryMatch: { type: Boolean, default: true },
      reasoning: { type: String, default: 'Civic defect is clearly visible in the foreground.' },
    },
    metadata: {
      available: { type: Boolean, default: false },
      cameraMake: String,
      cameraModel: String,
      software: String,
      hasEditingSoftware: { type: Boolean, default: false },
      captureTimestamp: Date,
      gpsCoordinates: [Number],
      dimensions: {
        width: Number,
        height: Number,
      },
      fileSizeBytes: Number,
      mimeType: String,
      findings: { type: [String], default: [] },
    },
    consistency: {
      locationConsistency: {
        type: String,
        enum: ['VERIFIED', 'UNVERIFIED', 'MISMATCH', 'NOT_AVAILABLE'],
        default: 'NOT_AVAILABLE',
      },
      timestampConsistency: {
        type: String,
        enum: ['CONSISTENT', 'SUSPICIOUS', 'NOT_AVAILABLE'],
        default: 'NOT_AVAILABLE',
      },
      locationDistanceMeters: Number,
      timestampDiscrepancyHours: Number,
    },
    duplicateCheck: {
      isDuplicate: { type: Boolean, default: false },
      similarityScore: { type: Number, default: 0 },
      matchedComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
      matchedComplaintNumber: String,
      findings: { type: String, default: 'No duplicate perceptual image match detected.' },
    },
    citizenMessage: {
      type: String,
      default: 'Photo received. Your evidence appears suitable for this report.',
    },
    officerNotes: {
      type: String,
      default: 'AI-assisted assessment. Final decision requires authorized human review.',
    },
    humanReview: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewerName: String,
      reviewerRole: String,
      decision: {
        type: String,
        enum: ['ACCEPTED', 'MARKED_FOR_REVIEW', 'REJECTED', 'REQUESTED_NEW_EVIDENCE', 'OVERRIDDEN'],
      },
      notes: String,
      previousStatus: String,
      reviewedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

evidenceVerificationSchema.index({ overallRiskScore: -1, createdAt: -1 });
evidenceVerificationSchema.index({ 'humanReview.decision': 1 });

export const EvidenceVerification = mongoose.model<IEvidenceVerification>(
  'EvidenceVerification',
  evidenceVerificationSchema
);
