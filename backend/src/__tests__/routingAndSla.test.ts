import mongoose from 'mongoose';
import { env } from '../config/env';
import { findWardForCoordinates } from '../services/wardService';
import { routeComplaint } from '../services/routingService';
import { calculatePriority } from '../services/priorityEngine';
import { calculateComplaintSLA, evaluateSLAState } from '../utils/sla';
import { fallbackClassify } from '../ai/fallbackClassifier';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GIS, SLA, Routing & Priority Engine Unit Tests', () => {
  it('should detect appropriate Ward for coordinates via Point-in-Polygon', async () => {
    const ward = await findWardForCoordinates(72.5714, 23.0225);
    expect(ward).toBeDefined();
    expect(ward?.wardNumber).toBeDefined();
  });

  it('should automatically route pothole complaint to Public Works Department', async () => {
    const decision = await routeComplaint('pothole', [72.5714, 23.0225]);
    expect(decision.departmentCode).toBe('PUBLIC_WORKS');
    expect(decision.departmentSlug).toBe('public_works');
    expect(decision.routingReason).toContain('Public Works');
  });

  it('should automatically route garbage complaint to Sanitation Department', async () => {
    const decision = await routeComplaint('garbage', [72.5714, 23.0225]);
    expect(decision.departmentCode).toBe('SANITATION');
    expect(decision.departmentSlug).toBe('sanitation');
    expect(decision.routingReason).toContain('Sanitation');
  });

  it('should automatically route streetlight complaint to Street Lighting Department', async () => {
    const decision = await routeComplaint('streetlight', [72.5714, 23.0225]);
    expect(decision.departmentCode).toBe('STREET_LIGHTING');
  });

  it('should automatically route water complaint to Water Supply Department', async () => {
    const decision = await routeComplaint('water', [72.5714, 23.0225]);
    expect(decision.departmentCode).toBe('WATER_SUPPLY');
  });

  it('should route low-confidence complaints (< 0.70) to OTHER with NEEDS_MANUAL_CLASSIFICATION status', async () => {
    const decision = await routeComplaint('other', [72.5714, 23.0225], undefined, 0.45);
    expect(decision.departmentCode).toBe('OTHER');
    expect(decision.classificationStatus).toBe('NEEDS_MANUAL_CLASSIFICATION');
    expect(decision.status).toBe('needs_manual_classification');
  });

  it('should compute high priority for high-severity issues with multiple citizen reports', () => {
    const result = calculatePriority({
      severity: 9,
      category: 'pothole',
      reportCount: 6,
    });
    expect(result.priority).toBe('critical');
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('should calculate dynamic SLA deadline based on category and priority', async () => {
    const sla = await calculateComplaintSLA('water', 'critical');
    expect(sla.resolutionHours).toBeLessThanOrEqual(12);
    expect(sla.slaDeadline.getTime()).toBeGreaterThan(Date.now());
  });

  it('should evaluate SLA state as breached when deadline is in the past', () => {
    const pastDeadline = new Date(Date.now() - 3600 * 1000);
    const state = evaluateSLAState(pastDeadline);
    expect(state).toBe('breached');
  });

  it('should classify text description via fallback rule-based classifier', () => {
    const res = fallbackClassify('The streetlight on our lane is broken and pitch dark at night');
    expect(res.category).toBe('streetlight');
    expect(res.departmentSlug).toBe('electrical');
    expect(res.confidence).toBeGreaterThan(0.7);
  });
});
