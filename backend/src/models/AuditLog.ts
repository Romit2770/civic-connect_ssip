import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  actorRole?: string;
  actorName?: string;
  action: string;
  entityType: 'Complaint' | 'Department' | 'Ward' | 'User' | 'SLA' | 'System';
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String, index: true },
    actorName: String,
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['Complaint', 'Department', 'Ward', 'User', 'SLA', 'System'],
      required: true,
      index: true,
    },
    entityId: { type: String, index: true },
    details: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
