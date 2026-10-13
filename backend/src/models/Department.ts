import mongoose, { Schema, Document } from 'mongoose';

export type DepartmentCode =
  | 'SANITATION'
  | 'PUBLIC_WORKS'
  | 'STREET_LIGHTING'
  | 'WATER_SUPPLY'
  | 'SEWERAGE'
  | 'PARKS_AND_GARDENS'
  | 'TRAFFIC_AND_ROADS'
  | 'OTHER';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: DepartmentCode;
  slug: string;
  description: string;
  categories: string[];
  contactEmail?: string;
  contactPhone?: string;
  icon: string;
  active: boolean;
  isActive: boolean;
  notificationSettings?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    inAppAlerts?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    categories: [{ type: String }],
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    icon: { type: String, default: 'building-2' },
    active: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: true },
      inAppAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

departmentSchema.pre('save', function (next) {
  if (this.active !== undefined) this.isActive = this.active;
  if (this.isActive !== undefined) this.active = this.isActive;
  next();
});

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
