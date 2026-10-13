import mongoose, { Schema, Document } from 'mongoose';

export interface IDuplicateGroup extends Document {
  _id: mongoose.Types.ObjectId;
  masterComplaintId: mongoose.Types.ObjectId;
  complaintIds: mongoose.Types.ObjectId[];
  category: string;
  reportCount: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  radiusMeters: number;
  createdAt: Date;
  updatedAt: Date;
}

const duplicateGroupSchema = new Schema<IDuplicateGroup>(
  {
    masterComplaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    complaintIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
    category: {
      type: String,
      required: true,
      index: true,
    },
    reportCount: {
      type: Number,
      default: 1,
    },
    location: {
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
    radiusMeters: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

duplicateGroupSchema.index({ location: '2dsphere' });

export const DuplicateGroup = mongoose.model<IDuplicateGroup>(
  'DuplicateGroup',
  duplicateGroupSchema
);
