import mongoose, { Schema, Document } from 'mongoose';

export interface ICitizenVerification extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: mongoose.Types.ObjectId;
  citizenId: mongoose.Types.ObjectId;
  isVerified: boolean;
  rating?: number; // 1 to 5
  feedback?: string;
  photo?: string;
  createdAt: Date;
}

const citizenVerificationSchema = new Schema<ICitizenVerification>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    citizenId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    photo: String,
  },
  {
    timestamps: true,
  }
);

citizenVerificationSchema.index({ complaintId: 1, citizenId: 1 }, { unique: true });

export const CitizenVerification = mongoose.model<ICitizenVerification>(
  'CitizenVerification',
  citizenVerificationSchema
);
