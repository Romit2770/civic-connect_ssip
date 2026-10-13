import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailOtpVerification extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  attempts: number;
  verified: boolean;
  verifiedAt?: Date;
  expiresAt: Date;
  lastSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailOtpVerificationSchema = new Schema<IEmailOtpVerification>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic MongoDB TTL cleanup
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailOtpVerification = mongoose.model<IEmailOtpVerification>(
  'EmailOtpVerification',
  emailOtpVerificationSchema
);
