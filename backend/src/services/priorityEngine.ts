import { ComplaintCategory, ComplaintPriority } from '../types';

export interface PriorityEvaluationInput {
  severity: number;           // 1 to 10
  reportCount?: number;       // duplicate count
  category: ComplaintCategory;
  daysUnresolved?: number;
  hasPhotoEvidence?: boolean;
  isHighTransitArea?: boolean;
}

export interface PriorityScoreResult {
  score: number;              // 0 to 100
  priority: ComplaintPriority;
  explanation: string[];
}

export function calculatePriority(
  input: PriorityEvaluationInput
): PriorityScoreResult {
  const explanation: string[] = [];
  let score = 0;

  // 1. Severity Factor (Weight: 40%)
  const severityValue = Math.min(10, Math.max(1, input.severity));
  const severityPoints = severityValue * 10 * 0.40;
  score += severityPoints;
  if (severityValue >= 8) {
    explanation.push(`High physical defect severity (${severityValue}/10)`);
  } else if (severityValue >= 5) {
    explanation.push(`Moderate physical severity (${severityValue}/10)`);
  }

  // 2. Community Report Volume (Weight: 25%)
  const count = input.reportCount || 1;
  const volumePoints = Math.min(100, count * 20) * 0.25;
  score += volumePoints;
  if (count > 5) {
    explanation.push(`Reported by ${count} citizens (High civic density)`);
  } else if (count > 1) {
    explanation.push(`Multi-citizen verification (${count} reports)`);
  }

  // 3. Time Pending / Aging Factor (Weight: 15%)
  const days = input.daysUnresolved || 0;
  const timePoints = Math.min(100, days * 15) * 0.15;
  score += timePoints;
  if (days >= 3) {
    explanation.push(`Pending resolution for ${days} days`);
  }

  // 4. Public Safety Category Impact (Weight: 10%)
  const safetyCategoryRisk: Record<ComplaintCategory, number> = {
    pothole: 85,
    water: 75,
    fallen_tree: 90,
    drainage: 80,
    road_damage: 75,
    streetlight: 60,
    traffic: 85,
    garbage: 50,
    public_property: 40,
    illegal_dumping: 55,
    other: 40,
  };
  const categoryRisk = safetyCategoryRisk[input.category] || 40;
  score += categoryRisk * 0.10;
  if (categoryRisk >= 75) {
    explanation.push('Elevated public safety hazard');
  }

  // 5. Location & Transit Multiplier (Weight: 10%)
  let locationPoints = 50;
  if (input.isHighTransitArea) {
    locationPoints = 100;
    explanation.push('Located on primary arterial transit corridor');
  }
  score += locationPoints * 0.10;

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let priority: ComplaintPriority = 'medium';
  if (finalScore >= 75 || severityValue >= 9) priority = 'critical';
  else if (finalScore >= 55) priority = 'high';
  else if (finalScore >= 35) priority = 'medium';
  else priority = 'low';

  return {
    score: finalScore,
    priority,
    explanation: explanation.length > 0 ? explanation : ['Standard baseline priority calculated'],
  };
}
