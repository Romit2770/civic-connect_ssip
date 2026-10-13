import { SLAConfiguration } from '../models/SLAConfiguration';
import { ComplaintCategory, ComplaintPriority, SLAState } from '../types';

export interface SLADeadlineInfo {
  responseTimeDeadline: Date;
  slaDeadline: Date;
  resolutionHours: number;
}

// Default standard SLA hours if DB configuration is not yet seeded
const DEFAULT_SLA_HOURS: Record<ComplaintCategory, Record<ComplaintPriority, number>> = {
  pothole: { critical: 12, high: 24, medium: 48, low: 72 },
  garbage: { critical: 6, high: 12, medium: 24, low: 48 },
  streetlight: { critical: 12, high: 24, medium: 48, low: 72 },
  water: { critical: 4, high: 12, medium: 24, low: 48 },
  drainage: { critical: 6, high: 12, medium: 24, low: 48 },
  road_damage: { critical: 12, high: 24, medium: 48, low: 96 },
  public_property: { critical: 24, high: 48, medium: 72, low: 120 },
  fallen_tree: { critical: 4, high: 12, medium: 24, low: 48 },
  illegal_dumping: { critical: 12, high: 24, medium: 48, low: 72 },
  traffic: { critical: 4, high: 12, medium: 24, low: 48 },
  other: { critical: 24, high: 48, medium: 72, low: 96 },
};

export async function calculateComplaintSLA(
  category: ComplaintCategory,
  priority: ComplaintPriority,
  startDate: Date = new Date()
): Promise<SLADeadlineInfo> {
  let responseHours = 4;
  let resolutionHours = 48;

  try {
    const config = await SLAConfiguration.findOne({
      category,
      priority,
      isActive: true,
    }).lean();

    if (config) {
      responseHours = config.responseTimeHours;
      resolutionHours = config.resolutionTimeHours;
    } else if (DEFAULT_SLA_HOURS[category]?.[priority]) {
      resolutionHours = DEFAULT_SLA_HOURS[category][priority];
      responseHours = Math.max(2, Math.round(resolutionHours * 0.15));
    }
  } catch (e) {
    if (DEFAULT_SLA_HOURS[category]?.[priority]) {
      resolutionHours = DEFAULT_SLA_HOURS[category][priority];
      responseHours = Math.max(2, Math.round(resolutionHours * 0.15));
    }
  }

  const responseTimeDeadline = new Date(startDate.getTime() + responseHours * 60 * 60 * 1000);
  const slaDeadline = new Date(startDate.getTime() + resolutionHours * 60 * 60 * 1000);

  return {
    responseTimeDeadline,
    slaDeadline,
    resolutionHours,
  };
}

export function evaluateSLAState(
  slaDeadline?: Date,
  warningThresholdHours: number = 6
): SLAState {
  if (!slaDeadline) return 'within_sla';

  const now = Date.now();
  const deadlineMs = new Date(slaDeadline).getTime();
  const diffMs = deadlineMs - now;

  if (diffMs <= 0) {
    return 'breached';
  }

  if (diffMs <= warningThresholdHours * 60 * 60 * 1000) {
    return 'due_soon';
  }

  return 'within_sla';
}
