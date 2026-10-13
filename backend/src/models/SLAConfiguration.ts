import mongoose, { Schema, Document } from 'mongoose';
import { ComplaintCategory, ComplaintPriority } from '../types';

export interface ISLAConfiguration extends Document {
  _id: mongoose.Types.ObjectId;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  responseTimeHours: number;    // Acknowledgment & Routing SLA
  resolutionTimeHours: number;  // Full remediation SLA
  escalationLevel: number;      // 1: Dept Head, 2: City Commissioner
  warningThresholdPercent: number; // e.g. 75% -> triggers "due_soon" warning
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const slaConfigurationSchema = new Schema<ISLAConfiguration>(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'pothole', 'garbage', 'streetlight', 'water', 'drainage',
        'road_damage', 'public_property', 'fallen_tree', 'illegal_dumping',
        'traffic', 'other',
      ],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true,
    },
    responseTimeHours: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },
    resolutionTimeHours: {
      type: Number,
      required: true,
      min: 1,
      default: 48,
    },
    escalationLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    warningThresholdPercent: {
      type: Number,
      default: 75, // 75% of SLA elapsed
      min: 50,
      max: 95,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

slaConfigurationSchema.index({ category: 1, priority: 1 }, { unique: true });

export const SLAConfiguration = mongoose.model<ISLAConfiguration>(
  'SLAConfiguration',
  slaConfigurationSchema
);
