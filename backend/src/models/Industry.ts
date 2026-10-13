import mongoose, { Schema, Document } from 'mongoose';

export interface IIndustry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  registrationId: string; // CIN / GSTIN / Corporate Registration ID
  industryType: string;
  state?: string;
  website?: string;
  mainAdminId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const industrySchema = new Schema<IIndustry>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    registrationId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    industryType: {
      type: String,
      required: true,
      trim: true,
      default: 'Infrastructure & Manufacturing',
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: 'Jharkhand',
    },
    website: {
      type: String,
      trim: true,
    },
    mainAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Industry = mongoose.model<IIndustry>('Industry', industrySchema);
