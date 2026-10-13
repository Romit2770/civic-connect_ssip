import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  wardId?: mongoose.Types.ObjectId;
  badgeNumber?: string;
  institutionName?: string;
  organizationName?: string;
  adminId?: string;
  username?: string;
  designation?: string;
  registrationId?: string;
  industryType?: string;
  universityId?: mongoose.Types.ObjectId;
  industryId?: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  avatar?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  isEmailVerified?: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        'citizen',
        'field_officer',
        'field_worker',
        'department_officer',
        'municipal_admin',
        'super_admin',
        'university_admin',
        'faculty_mentor',
        'student_lead',
        'industry_admin',
        'csr_lead',
        'corporate_partner',
      ],
      default: 'citizen',
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      index: true,
    },
    badgeNumber: {
      type: String,
      trim: true,
    },
    institutionName: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    adminId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    registrationId: {
      type: String,
      trim: true,
    },
    industryType: {
      type: String,
      trim: true,
    },
    universityId: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      index: true,
    },
    industryId: {
      type: Schema.Types.ObjectId,
      ref: 'Industry',
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    avatar: String,
    location: {
      type: pointSchema,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
