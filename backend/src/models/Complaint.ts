import mongoose, { Schema, Document } from 'mongoose';
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  PhotoAsset,
  SLAState,
} from '../types';

export interface IResolutionEvidence {
  photos: string[];
  videos?: string[];
  evidenceType?: 'LIVE_PHOTO' | 'LIVE_VIDEO';
  description: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  aiVerificationScore?: number;
  aiVerificationStatus?: 'likely_resolved' | 'likely_not_resolved' | 'uncertain';
  aiVerificationReason?: string;
  capturedLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    ward?: string;
  };
}

export interface IResolutionFeedback {
  rating: number; // 1 to 5
  comment?: string;
  submittedAt: Date;
  submittedBy: mongoose.Types.ObjectId;
}

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  complaintNumber: string; // CC-YYYY-XXXXXX
  title: string;
  description: string;
  category: ComplaintCategory;
  subcategory?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  priorityScore: number; // 0-100
  priorityExplanation?: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  wardId?: mongoose.Types.ObjectId;
  department?: string;
  departmentId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  photos: string[];
  videos?: string[];
  photoAssets?: PhotoAsset[];
  mediaAssets?: PhotoAsset[];
  voiceAudioUrl?: string;
  voiceTranscript?: string;
  problemImpact?: string[];
  problemSince?: string;
  reportCount: number;
  duplicateGroupId?: mongoose.Types.ObjectId;
  aiAnalysisId?: mongoose.Types.ObjectId;
  evidenceVerificationId?: mongoose.Types.ObjectId;
  evidenceVerificationStatus?: 'PASS' | 'REVIEW' | 'HIGH_RISK' | 'UNAVAILABLE';
  evidenceRiskScore?: number;
  classificationStatus?: 'AI_CLASSIFIED' | 'NEEDS_MANUAL_CLASSIFICATION' | 'MANUALLY_CLASSIFIED' | 'AI_FAILED';
  aiAssessment?: {
    category?: string;
    subCategory?: string;
    department?: string;
    confidence?: number;
    urgency?: string;
    reasoning?: string;
  };
  
  // SLA Fields
  slaDeadline?: Date;
  responseTimeDeadline?: Date;
  slaState: SLAState;
  slaNotifiedDueSoon?: boolean;
  slaNotifiedBreached?: boolean;
  slaNotifiedEscalated?: boolean;
  breachedAt?: Date;
  lastEscalatedAt?: Date;

  // Resolution & Verification
  resolutionEvidence?: IResolutionEvidence;
  satisfactionRating?: number;
  resolutionFeedback?: IResolutionFeedback;
  resolvedAt?: Date;
  closedAt?: Date;

  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'pothole', 'garbage', 'streetlight', 'water', 'drainage',
        'road_damage', 'public_property', 'fallen_tree', 'illegal_dumping',
        'traffic', 'other',
      ],
      required: true,
      index: true,
    },
    subcategory: String,
    department: {
      type: String,
      enum: [
        'SANITATION',
        'PUBLIC_WORKS',
        'STREET_LIGHTING',
        'WATER_SUPPLY',
        'SEWERAGE',
        'PARKS_AND_GARDENS',
        'TRAFFIC_AND_ROADS',
        'OTHER',
      ],
      index: true,
    },
    classificationStatus: {
      type: String,
      enum: ['AI_CLASSIFIED', 'NEEDS_MANUAL_CLASSIFICATION', 'MANUALLY_CLASSIFIED', 'AI_FAILED'],
      default: 'AI_CLASSIFIED',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'submitted', 'acknowledged', 'validated', 'routed', 'assigned', 'in_progress',
        'resolution_submitted', 'verification_pending', 'resolved',
        'reopened', 'closed', 'rejected', 'needs_manual_classification',
      ],
      default: 'submitted',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    priorityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    priorityExplanation: [String],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    aiAssessment: {
      category: String,
      subCategory: String,
      department: String,
      confidence: Number,
      urgency: String,
      reasoning: String,
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photos: [String],
    videos: [String],
    photoAssets: [
      {
        url: String,
        provider: String,
        publicId: String,
        mimeType: String,
        sizeBytes: Number,
        mediaType: {
          type: String,
          enum: ['image', 'video', 'audio'],
          default: 'image',
        },
        originalName: String,
      },
    ],
    mediaAssets: [
      {
        url: String,
        provider: String,
        publicId: String,
        mimeType: String,
        sizeBytes: Number,
        mediaType: {
          type: String,
          enum: ['image', 'video', 'audio'],
          default: 'image',
        },
        originalName: String,
      },
    ],
    voiceAudioUrl: String,
    voiceTranscript: String,
    problemImpact: {
      type: [String],
      default: [],
    },
    problemSince: {
      type: String,
      default: '',
    },
    reportCount: {
      type: Number,
      default: 1,
    },
    duplicateGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'DuplicateGroup',
    },
    aiAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'AIAnalysis',
    },
    evidenceVerificationId: {
      type: Schema.Types.ObjectId,
      ref: 'EvidenceVerification',
    },
    evidenceVerificationStatus: {
      type: String,
      enum: ['PASS', 'REVIEW', 'HIGH_RISK', 'UNAVAILABLE'],
      default: 'PASS',
      index: true,
    },
    evidenceRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 15,
    },
    slaDeadline: Date,
    responseTimeDeadline: Date,
    slaState: {
      type: String,
      enum: ['within_sla', 'due_soon', 'breached', 'escalated'],
      default: 'within_sla',
      index: true,
    },
    slaNotifiedDueSoon: {
      type: Boolean,
      default: false,
    },
    slaNotifiedBreached: {
      type: Boolean,
      default: false,
    },
    slaNotifiedEscalated: {
      type: Boolean,
      default: false,
    },
    breachedAt: Date,
    lastEscalatedAt: Date,
    resolutionEvidence: {
      photos: [String],
      videos: [String],
      evidenceType: {
        type: String,
        enum: ['LIVE_PHOTO', 'LIVE_VIDEO'],
        default: 'LIVE_PHOTO',
      },
      description: String,
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
      aiVerificationScore: Number,
      aiVerificationStatus: {
        type: String,
        enum: ['likely_resolved', 'likely_not_resolved', 'uncertain'],
      },
      aiVerificationReason: String,
      capturedLocation: {
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        address: String,
        ward: String,
      },
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    resolutionFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
      submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    resolvedAt: Date,
    closedAt: Date,
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial & Compound Indexes for high-performance municipal queries
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ department: 1, status: 1, priority: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: 1, createdAt: -1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ classificationStatus: 1, status: 1 });
complaintSchema.index({ wardId: 1, status: 1 });
complaintSchema.index({ assignedOfficerId: 1, status: 1 });
complaintSchema.index({ reportedBy: 1, createdAt: -1 });
complaintSchema.index({ slaDeadline: 1, slaState: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
// Export alias Issue for compatibility
export const Issue = Complaint;
export type IIssue = IComplaint;
export type IssueStatus = ComplaintStatus;
export type IssuePriority = ComplaintPriority;
export type IssueCategory = ComplaintCategory;
