import mongoose from 'mongoose';
import { Complaint, IComplaint } from '../models/Complaint';
import { DuplicateGroup } from '../models/DuplicateGroup';
import { ComplaintCategory } from '../types';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  masterComplaintId?: mongoose.Types.ObjectId;
  masterComplaintNumber?: string;
  masterComplaintTitle?: string;
  masterComplaintStatus?: string;
  masterComplaintDate?: Date;
  nearbyCount: number;
  duplicateGroup?: any;
}

export async function checkForDuplicates(
  coordinates: [number, number],
  category: ComplaintCategory,
  citizenId?: mongoose.Types.ObjectId,
  radiusMeters: number = 150,
  subcategory?: string
): Promise<DuplicateCheckResult> {
  try {
    const cleanSub = subcategory && subcategory.trim().length > 2
      ? subcategory.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : undefined;

    let categoryFilter: any;
    if (category === 'other' && cleanSub) {
      categoryFilter = {
        $or: [
          { subcategory: new RegExp(cleanSub, 'i') },
          { category: 'other', subcategory: new RegExp(cleanSub, 'i') },
        ],
      };
    } else if (cleanSub) {
      categoryFilter = {
        $or: [
          { category },
          { subcategory: new RegExp(cleanSub, 'i') },
        ],
      };
    } else {
      categoryFilter = { category };
    }

    // Search within radius for same category/subcategory in active states
    const nearbyComplaints = await Complaint.find({
      ...categoryFilter,
      status: {
        $in: [
          'submitted',
          'acknowledged',
          'routed',
          'assigned',
          'in_progress',
          'resolution_submitted',
          'verification_pending',
          'reopened',
        ],
      },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: radiusMeters,
        },
      },
    })
      .sort({ createdAt: 1 })
      .limit(5);

    if (nearbyComplaints.length === 0) {
      return {
        isDuplicate: false,
        nearbyCount: 0,
      };
    }

    const masterComplaint = nearbyComplaints[0];

    // Find or create DuplicateGroup
    let duplicateGroup = await DuplicateGroup.findOne({
      masterComplaintId: masterComplaint._id,
    });

    if (!duplicateGroup) {
      duplicateGroup = await DuplicateGroup.create({
        masterComplaintId: masterComplaint._id,
        complaintIds: [masterComplaint._id],
        category,
        reportCount: 1,
        location: masterComplaint.location,
        radiusMeters,
      });

      masterComplaint.duplicateGroupId = duplicateGroup._id;
      await masterComplaint.save();
    }

    return {
      isDuplicate: true,
      masterComplaintId: masterComplaint._id,
      masterComplaintNumber: masterComplaint.complaintNumber,
      masterComplaintTitle: masterComplaint.title,
      masterComplaintStatus: masterComplaint.status,
      masterComplaintDate: (masterComplaint as any).createdAt,
      nearbyCount: nearbyComplaints.length,
      duplicateGroup,
    };
  } catch (error) {
    console.warn('Duplicate check error:', error);
    return {
      isDuplicate: false,
      nearbyCount: 0,
    };
  }
}

export async function upvoteExistingComplaint(
  complaintId: string,
  citizenId: mongoose.Types.ObjectId
): Promise<IComplaint | null> {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return null;

  complaint.reportCount = (complaint.reportCount || 1) + 1;
  complaint.priorityScore = Math.min(100, (complaint.priorityScore || 50) + 10);
  if (complaint.priorityScore >= 80) complaint.priority = 'critical';
  else if (complaint.priorityScore >= 60) complaint.priority = 'high';

  await complaint.save();

  if (complaint.duplicateGroupId) {
    await DuplicateGroup.findByIdAndUpdate(complaint.duplicateGroupId, {
      $inc: { reportCount: 1 },
      $addToSet: { complaintIds: complaint._id },
    });
  }

  return complaint;
}
