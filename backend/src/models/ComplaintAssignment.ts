import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintAssignment extends Document {
  complaintId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  officerId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignmentReason?: string;
  isCurrent: boolean;
  createdAt: Date;
}

const complaintAssignmentSchema = new Schema<IComplaintAssignment>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    officerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignmentReason: String,
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

complaintAssignmentSchema.index({ complaintId: 1, createdAt: -1 });

export const ComplaintAssignment = mongoose.model<IComplaintAssignment>(
  'ComplaintAssignment',
  complaintAssignmentSchema
);
