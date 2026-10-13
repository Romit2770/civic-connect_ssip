import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintComment extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: string;
  authorName: string;
  message: string;
  isInternal: boolean; // Internal officer/admin notes hidden from citizens
  attachments?: string[];
  createdAt: Date;
}

const complaintCommentSchema = new Schema<IComplaintComment>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorRole: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

complaintCommentSchema.index({ complaintId: 1, createdAt: 1 });

export const ComplaintComment = mongoose.model<IComplaintComment>(
  'ComplaintComment',
  complaintCommentSchema
);
