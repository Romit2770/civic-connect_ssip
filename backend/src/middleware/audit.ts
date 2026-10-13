import { Request } from 'express';
import { AuditLog } from '../models/AuditLog';

export interface AuditParams {
  req?: Request;
  actorId?: any;
  actorRole?: string;
  actorName?: string;
  action: string;
  entityType: 'Complaint' | 'Department' | 'Ward' | 'User' | 'SLA' | 'System';
  entityId?: string;
  details?: Record<string, any>;
}

export async function logAuditAction(params: AuditParams): Promise<void> {
  try {
    const actorId = params.actorId || params.req?.user?._id;
    const actorRole = params.actorRole || params.req?.user?.role || 'system';
    const actorName = params.actorName || params.req?.user?.name || 'System';
    const ipAddress = params.req?.ip || params.req?.socket?.remoteAddress;
    const userAgent = params.req?.headers['user-agent'];

    await AuditLog.create({
      actorId,
      actorRole,
      actorName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
