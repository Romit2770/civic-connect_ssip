import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  institutionId: string; // AISHE or Institution Registration Code
  state?: string;
  district?: string;
  website?: string;
  mainAdminId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const universitySchema = new Schema<IUniversity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    institutionId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: 'Jharkhand',
    },
    district: {
      type: String,
      trim: true,
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

export const University = mongoose.model<IUniversity>('University', universitySchema);
