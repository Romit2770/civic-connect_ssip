import mongoose from 'mongoose';
import { Department, DepartmentCode } from '../models/Department';
import { User } from '../models/User';
import { Complaint, IComplaint } from '../models/Complaint';
import { Notification } from '../models/Notification';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory';
import { findWardForCoordinates } from './wardService';
import { emitToDepartment, emitToRole, emitToUser } from '../config/socket';
import { env } from '../config/env';
import { ComplaintCategory } from '../types';

export const AI_CONFIDENCE_THRESHOLD = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.70');

export interface DepartmentClassificationResult {
  departmentCode: DepartmentCode;
  departmentSlug: string;
  departmentName: string;
  departmentId?: mongoose.Types.ObjectId;
  confidence: number;
  classificationStatus: 'AI_CLASSIFIED' | 'NEEDS_MANUAL_CLASSIFICATION' | 'MANUALLY_CLASSIFIED' | 'AI_FAILED';
  reasoning: string;
}

export interface RoutingDecision {
  departmentCode: DepartmentCode;
  departmentId?: mongoose.Types.ObjectId;
  departmentName: string;
  departmentSlug: string;
  classificationStatus: 'AI_CLASSIFIED' | 'NEEDS_MANUAL_CLASSIFICATION' | 'MANUALLY_CLASSIFIED' | 'AI_FAILED';
  status: 'submitted' | 'routed' | 'assigned' | 'needs_manual_classification';
  wardId?: mongoose.Types.ObjectId;
  wardNumber?: number;
  wardName?: string;
  recommendedOfficerId?: mongoose.Types.ObjectId;
  recommendedOfficerName?: string;
  routingReason: string;
  confidence: number;
}

// Category to Controlled Department Code & Slug Mapping
export const CATEGORY_TO_DEPARTMENT_MAP: Record<ComplaintCategory, { code: DepartmentCode; slug: string }> = {
  pothole: { code: 'PUBLIC_WORKS', slug: 'public_works' },
  road_damage: { code: 'PUBLIC_WORKS', slug: 'public_works' },
  public_property: { code: 'PUBLIC_WORKS', slug: 'public_works' },
  garbage: { code: 'SANITATION', slug: 'sanitation' },
  illegal_dumping: { code: 'SANITATION', slug: 'sanitation' },
  streetlight: { code: 'STREET_LIGHTING', slug: 'electrical' },
  water: { code: 'WATER_SUPPLY', slug: 'water_supply' },
  drainage: { code: 'SEWERAGE', slug: 'drainage' },
  fallen_tree: { code: 'PARKS_AND_GARDENS', slug: 'parks_gardens' },
  traffic: { code: 'TRAFFIC_AND_ROADS', slug: 'public_works' },
  other: { code: 'OTHER', slug: 'other' },
};

/**
 * Controlled Department Classifier: Evaluates AI output and category mapping with confidence validation.
 */
export async function classifyDepartment(input: {
  category: ComplaintCategory;
  description?: string;
  aiConfidence?: number;
  aiDepartmentSlug?: string;
  aiReasoning?: string;
}): Promise<DepartmentClassificationResult> {
  const confidence = input.aiConfidence !== undefined ? input.aiConfidence : 0.85;
  const mapping = CATEGORY_TO_DEPARTMENT_MAP[input.category] || { code: 'OTHER', slug: 'other' };

  // Rule 5: If AI confidence is below configured threshold (< 0.70), route to OTHER / manual classification
  if (confidence < AI_CONFIDENCE_THRESHOLD || input.category === 'other') {
    let otherDept = await Department.findOne({ code: 'OTHER' });
    if (!otherDept) {
      otherDept = await Department.findOne({ slug: 'public_works' });
    }

    return {
      departmentCode: 'OTHER',
      departmentSlug: otherDept?.slug || 'other',
      departmentName: otherDept?.name || 'Nodal / Unclassified Grievance Pool',
      departmentId: otherDept?._id,
      confidence,
      classificationStatus: 'NEEDS_MANUAL_CLASSIFICATION',
      reasoning: `Confidence score (${(confidence * 100).toFixed(0)}%) is below required threshold (${(AI_CONFIDENCE_THRESHOLD * 100).toFixed(0)}%). Flagged for Municipal Admin manual classification.`,
    };
  }

  // Find Department in DB by Code or Slug
  let department = await Department.findOne({
    $or: [{ code: mapping.code }, { slug: mapping.slug }],
    isActive: true,
  });

  if (!department) {
    department = await Department.findOne({ isActive: true });
  }

  return {
    departmentCode: mapping.code,
    departmentSlug: department?.slug || mapping.slug,
    departmentName: department?.name || 'Municipal Operations',
    departmentId: department?._id,
    confidence,
    classificationStatus: 'AI_CLASSIFIED',
    reasoning: input.aiReasoning || `Classified under ${department?.name || mapping.code} via controlled category engine.`,
  };
}

/**
 * Controlled Routing Engine: Determines responsible Department, Spatial Ward, and Field Officer
 */
export async function routeComplaint(
  category: ComplaintCategory,
  coordinates?: [number, number],
  explicitWardId?: string,
  aiConfidence?: number,
  aiDepartmentSlug?: string,
  aiReasoning?: string,
  description?: string
): Promise<RoutingDecision> {
  // 1. Department Classification
  const classification = await classifyDepartment({
    category,
    description,
    aiConfidence,
    aiDepartmentSlug,
    aiReasoning,
  });

  // If low confidence, hold for manual classification
  if (classification.classificationStatus === 'NEEDS_MANUAL_CLASSIFICATION') {
    return {
      departmentCode: 'OTHER',
      departmentId: classification.departmentId,
      departmentName: classification.departmentName,
      departmentSlug: classification.departmentSlug,
      classificationStatus: 'NEEDS_MANUAL_CLASSIFICATION',
      status: 'needs_manual_classification',
      routingReason: classification.reasoning,
      confidence: classification.confidence,
    };
  }

  // 2. Detect Ward from coordinates
  let wardId: mongoose.Types.ObjectId | undefined;
  let wardNumber: number | undefined;
  let wardName: string | undefined;

  if (explicitWardId && mongoose.Types.ObjectId.isValid(explicitWardId)) {
    wardId = new mongoose.Types.ObjectId(explicitWardId);
  } else if (coordinates && coordinates.length === 2) {
    const detectedWard = await findWardForCoordinates(coordinates[0], coordinates[1]);
    if (detectedWard) {
      wardId = detectedWard._id;
      wardNumber = detectedWard.wardNumber;
      wardName = detectedWard.name;
    }
  }

  // 3. Find optimal Field Officer (matching department, ward preference, lowest active workload)
  let recommendedOfficerId: mongoose.Types.ObjectId | undefined;
  let recommendedOfficerName: string | undefined;

  if (classification.departmentId) {
    const candidateOfficers = await User.find({
      role: 'field_officer',
      departmentId: classification.departmentId,
      isActive: true,
    }).lean();

    if (candidateOfficers.length > 0) {
      const officerIds = candidateOfficers.map((o) => o._id);
      const activeCounts = await Complaint.aggregate([
        {
          $match: {
            assignedOfficerId: { $in: officerIds },
            status: { $in: ['assigned', 'in_progress', 'resolution_submitted'] },
          },
        },
        {
          $group: {
            _id: '$assignedOfficerId',
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map<string, number>();
      activeCounts.forEach((ac) => countMap.set(ac._id.toString(), ac.count));

      candidateOfficers.sort((a, b) => {
        const aWardMatch = wardId && a.wardId && a.wardId.toString() === wardId.toString() ? 1 : 0;
        const bWardMatch = wardId && b.wardId && b.wardId.toString() === wardId.toString() ? 1 : 0;

        if (aWardMatch !== bWardMatch) {
          return bWardMatch - aWardMatch;
        }

        const countA = countMap.get(a._id.toString()) || 0;
        const countB = countMap.get(b._id.toString()) || 0;
        return countA - countB;
      });

      const selected = candidateOfficers[0];
      recommendedOfficerId = selected._id;
      recommendedOfficerName = selected.name;
    }
  }

  const wardText = wardNumber ? `Ward ${wardNumber} (${wardName})` : 'Central Municipal Zone';
  const officerText = recommendedOfficerName ? ` and assigned to Field Officer ${recommendedOfficerName}` : '';
  const routingReason = `Auto-routed to ${classification.departmentName} based on '${category}' issue classification in ${wardText}${officerText}.`;

  return {
    departmentCode: classification.departmentCode,
    departmentId: classification.departmentId,
    departmentName: classification.departmentName,
    departmentSlug: classification.departmentSlug,
    classificationStatus: 'AI_CLASSIFIED',
    status: recommendedOfficerId ? 'assigned' : 'routed',
    wardId,
    wardNumber,
    wardName,
    recommendedOfficerId,
    recommendedOfficerName,
    routingReason,
    confidence: classification.confidence,
  };
}

/**
 * Targeted Department Notification Service:
 * Notifies ONLY the authorized users of the responsible department.
 * Does NOT broadcast operational new complaints to unrelated departments.
 */
export async function sendTargetedDepartmentNotifications(
  complaint: IComplaint,
  routing: RoutingDecision
): Promise<void> {
  // Case A: Low Confidence / Needs Manual Classification -> Notify Municipal Admins ONLY
  if (routing.classificationStatus === 'NEEDS_MANUAL_CLASSIFICATION') {
    const admins = await User.find({
      role: { $in: ['municipal_admin', 'super_admin'] },
      isActive: true,
    });

    const notifPromises = admins.map((admin) =>
      Notification.create({
        userId: admin._id,
        recipientUserId: admin._id,
        recipientDepartment: 'OTHER',
        type: 'NEEDS_MANUAL_CLASSIFICATION',
        title: 'Action Required: Unclassified Complaint',
        message: `Complaint ${complaint.complaintNumber} (${complaint.title}) has low AI confidence and requires manual department classification.`,
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        actionUrl: `/admin/complaints/${complaint._id}`,
      })
    );

    await Promise.all(notifPromises);

    // Emit real-time Socket.IO to admin roles
    emitToRole('municipal_admin', 'complaint:needs_classification', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
    });
    emitToRole('super_admin', 'complaint:needs_classification', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
    });
    return;
  }

  // Case B: Confirmed Department Classification -> Notify ONLY Responsible Department Staff & Assigned Officer
  if (routing.departmentId) {
    const deptUsers = await User.find({
      departmentId: routing.departmentId,
      isActive: true,
      role: { $in: ['department_officer', 'field_officer'] },
    });

    const notifPromises = deptUsers.map((user) => {
      const isAssignedOfficer = routing.recommendedOfficerId && user._id.equals(routing.recommendedOfficerId);
      return Notification.create({
        userId: user._id,
        recipientUserId: user._id,
        recipientDepartment: routing.departmentCode,
        departmentId: routing.departmentId,
        type: isAssignedOfficer ? 'complaint_assigned' : 'NEW_COMPLAINT',
        title: isAssignedOfficer
          ? `Task Assigned: ${complaint.complaintNumber}`
          : `New ${routing.departmentName} Complaint`,
        message: isAssignedOfficer
          ? `You have been assigned civic issue ${complaint.complaintNumber}: "${complaint.title}".`
          : `A new ${complaint.priority} priority complaint (${complaint.complaintNumber}) has been routed to ${routing.departmentName}.`,
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        actionUrl: isAssignedOfficer
          ? `/officer/tasks/${complaint._id}`
          : `/admin/complaints/${complaint._id}`,
      });
    });

    await Promise.all(notifPromises);

    // Emit real-time Socket.IO ONLY to that department room
    emitToDepartment(routing.departmentId.toString(), 'department:new_complaint', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
      departmentCode: routing.departmentCode,
      priority: complaint.priority,
    });

    if (routing.recommendedOfficerId) {
      emitToUser(routing.recommendedOfficerId.toString(), 'task:assigned', {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
      });
    }
  }
}
