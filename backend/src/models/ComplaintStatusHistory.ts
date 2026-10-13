import mongoose, { Schema, Document } from 'mongoose';
import { ComplaintStatus } from '../types';

export interface IComplaintStatusHistory extends Document {
  complaintId: mongoose.Types.ObjectId;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  changedBy: mongoose.Types.ObjectId;
  note?: string;
  evidencePhoto?: string;
  createdAt: Date;
}

const complaintStatusHistorySchema = new Schema<IComplaintStatusHistory>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      default: null,
    },
    toStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: String,
    evidencePhoto: String,
  },
  {
    timestamps: true,
  }
);

complaintStatusHistorySchema.index({ complaintId: 1, createdAt: 1 });

export const ComplaintStatusHistory = mongoose.model<IComplaintStatusHistory>(
  'ComplaintStatusHistory',
  complaintStatusHistorySchema
);
