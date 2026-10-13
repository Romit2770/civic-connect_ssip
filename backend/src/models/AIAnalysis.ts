import mongoose, { Schema, Document } from 'mongoose';
import { ComplaintCategory, ComplaintPriority } from '../types';

export interface IAIAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: mongoose.Types.ObjectId;
  provider: 'gemini' | 'fallback';
  category: ComplaintCategory;
  subcategory?: string;
  severity: number; // 1-10
  priority: ComplaintPriority;
  confidence: number; // 0.0 - 1.0
  departmentSlug: string;
  summary: string;
  hazards: string[];
  reasoning: string;
  detectedObjects: string[];
  analysisMethod: string;
  isManualOverride: boolean;
  overrideBy?: mongoose.Types.ObjectId;
  overrideReason?: string;
  createdAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gemini', 'fallback'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: String,
    severity: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    departmentSlug: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    hazards: {
      type: [String],
      default: [],
    },
    reasoning: {
      type: String,
      required: true,
    },
    detectedObjects: {
      type: [String],
      default: [],
    },
    analysisMethod: {
      type: String,
      required: true,
    },
    isManualOverride: {
      type: Boolean,
      default: false,
    },
    overrideBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    overrideReason: String,
  },
  {
    timestamps: true,
  }
);

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
