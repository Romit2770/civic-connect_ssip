import { Complaint } from '../models/Complaint';
import { User } from '../models/User';
import { createNotification, emitToRole } from './notificationService';
import { logAuditAction } from '../middleware/audit';
import { metricsRegistry } from '../middleware/observability';

// Concurrency lock to prevent overlapping runs under scale / multi-instance
let isSLACheckRunning = false;

export async function runSLAMonitorCheck(): Promise<{
  checked: number;
  dueSoon: number;
  breached: number;
  escalated: number;
}> {
  if (isSLACheckRunning) {
    console.warn('⚠️ SLA check skipped: Previous check is still actively executing.');
    return { checked: 0, dueSoon: 0, breached: 0, escalated: 0 };
  }

  isSLACheckRunning = true;
  const startTime = Date.now();

  try {
    const now = new Date();
    const warningWindow = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours ahead

    let dueSoonCount = 0;
    let breachedCount = 0;
    let escalatedCount = 0;

    // Bounded search for active unresolved complaints
    const activeComplaints = await Complaint.find({
      status: { $in: ['submitted', 'acknowledged', 'routed', 'assigned', 'in_progress'] },
      slaDeadline: { $exists: true },
    })
      .limit(300)
      .populate('assignedOfficerId', 'name email');

  for (const complaint of activeComplaints) {
    if (!complaint.slaDeadline) continue;

    const deadline = new Date(complaint.slaDeadline);

    // 1. Check for Breach
    if (deadline <= now) {
      if (complaint.slaState !== 'breached' && complaint.slaState !== 'escalated') {
        complaint.slaState = 'breached';
        complaint.breachedAt = now;
        breachedCount++;

        // Notify assigned officer
        if (complaint.assignedOfficerId) {
          await createNotification({
            userId: (complaint.assignedOfficerId as any)._id,
            type: 'sla_breached',
            title: `🚨 SLA Breached: ${complaint.complaintNumber}`,
            message: `The resolution SLA deadline for complaint ${complaint.complaintNumber} has expired. Urgent action required.`,
            complaintId: complaint._id,
            complaintNumber: complaint.complaintNumber,
          });
        }

        // Notify Municipal Admin
        emitToRole('municipal_admin', 'sla:breached', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          category: complaint.category,
        });

        await logAuditAction({
          action: 'SLA_BREACH_DETECTED',
          entityType: 'Complaint',
          entityId: complaint._id.toString(),
          details: {
            complaintNumber: complaint.complaintNumber,
            slaDeadline: complaint.slaDeadline,
          },
        });
      }

      // Check for Escalation (overdue > 24 hours)
      const hoursOverdue = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60);
      if (hoursOverdue >= 24 && complaint.slaState !== 'escalated' && !complaint.slaNotifiedEscalated) {
        complaint.slaState = 'escalated';
        complaint.lastEscalatedAt = now;
        complaint.slaNotifiedEscalated = true;
        complaint.priority = 'critical';
        complaint.priorityScore = 100;
        escalatedCount++;

        emitToRole('municipal_admin', 'sla:escalated', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          hoursOverdue: Math.round(hoursOverdue),
        });

        await logAuditAction({
          action: 'SLA_ESCALATION_LEVEL_2',
          entityType: 'Complaint',
          entityId: complaint._id.toString(),
          details: {
            complaintNumber: complaint.complaintNumber,
            hoursOverdue: Math.round(hoursOverdue),
          },
        });
      }
    }
    // 2. Check for Due Soon
    else if (deadline <= warningWindow) {
      if (complaint.slaState === 'within_sla' && !complaint.slaNotifiedDueSoon) {
        complaint.slaState = 'due_soon';
        complaint.slaNotifiedDueSoon = true;
        dueSoonCount++;

        if (complaint.assignedOfficerId) {
          await createNotification({
            userId: (complaint.assignedOfficerId as any)._id,
            type: 'sla_due_soon',
            title: `⏳ SLA Warning: ${complaint.complaintNumber}`,
            message: `Resolution deadline is in less than 6 hours for ${complaint.complaintNumber}.`,
            complaintId: complaint._id,
            complaintNumber: complaint.complaintNumber,
          });
        }
      }
    }

    // Only persist if document fields were actually modified
    if (complaint.isModified()) {
      await complaint.save();
    }
  }

  const durationMs = Date.now() - startTime;
  metricsRegistry.recordSlaJob(durationMs, true);

  return {
    checked: activeComplaints.length,
    dueSoon: dueSoonCount,
    breached: breachedCount,
    escalated: escalatedCount,
  };
} catch (error) {
  const durationMs = Date.now() - startTime;
  metricsRegistry.recordSlaJob(durationMs, false);
  throw error;
} finally {
  isSLACheckRunning = false;
}
}
