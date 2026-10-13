import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  recipientUserId?: mongoose.Types.ObjectId;
  recipientDepartment?: string;
  departmentId?: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  complaintId?: mongoose.Types.ObjectId;
  complaintNumber?: string;
  isRead: boolean;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    recipientDepartment: {
      type: String,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'NEW_COMPLAINT',
        'DEPARTMENT_ASSIGNED',
        'NEEDS_MANUAL_CLASSIFICATION',
        'complaint_submitted',
        'complaint_acknowledged',
        'complaint_routed',
        'complaint_assigned',
        'complaint_in_progress',
        'resolution_submitted',
        'verification_requested',
        'complaint_verified',
        'complaint_resolved',
        'complaint_status_changed',
        'complaint_reopened',
        'sla_due_soon',
        'sla_breached',
        'sla_escalated',
        'comment_added',
        'feedback_received',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    complaintNumber: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre('save', function (next) {
  if (this.userId && !this.recipientUserId) this.recipientUserId = this.userId;
  if (this.recipientUserId && !this.userId) this.userId = this.recipientUserId;
  if (this.isRead !== undefined) this.read = this.isRead;
  if (this.read !== undefined) this.isRead = this.read;
  next();
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientDepartment: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
