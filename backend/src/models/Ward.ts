import mongoose, { Schema, Document } from 'mongoose';

export interface IWard extends Document {
  _id: mongoose.Types.ObjectId;
  wardNumber: number;
  name: string;
  zone: string;
  boundary: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  centerPoint: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  population?: number;
  nodalOfficerId?: mongoose.Types.ObjectId;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wardSchema = new Schema<IWard>(
  {
    wardNumber: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    zone: { type: String, required: true, trim: true, index: true },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        required: true,
      },
      coordinates: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
    centerPoint: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    population: Number,
    nodalOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    contactPhone: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

wardSchema.index({ boundary: '2dsphere' });
wardSchema.index({ centerPoint: '2dsphere' });

export const Ward = mongoose.model<IWard>('Ward', wardSchema);
