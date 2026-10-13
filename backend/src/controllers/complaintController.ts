import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Complaint, IComplaint } from '../models/Complaint';
import { Department, DepartmentCode } from '../models/Department';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory';
import { ComplaintAssignment } from '../models/ComplaintAssignment';
import { ComplaintComment } from '../models/ComplaintComment';
import { CitizenVerification } from '../models/CitizenVerification';
import { AIAnalysis } from '../models/AIAnalysis';
import { User } from '../models/User';
import { generateComplaintId, generateTitle } from '../utils/complaintIdGenerator';
import { calculateComplaintSLA } from '../utils/sla';
import { routeComplaint, sendTargetedDepartmentNotifications } from '../services/routingService';
import { checkForDuplicates, upvoteExistingComplaint } from '../services/duplicateService';
import { calculatePriority } from '../services/priorityEngine';
import { aiService } from '../ai/aiService';
import { imageVerificationService } from '../services/imageVerificationService';
import { storageService } from '../services/storage/storageService';
import { createNotification, emitToRole, emitToUser, emitToDepartment } from '../services/notificationService';
import { logAuditAction } from '../middleware/audit';
import { ComplaintCategory, ComplaintStatus, PhotoAsset } from '../types';
import { mapComplaintCategory } from './fieldWorkerController';
import {
  MAX_EVIDENCE_FILES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_AUDIO_MIMES,
  parseVideoDurationFromBuffer,
} from '../utils/mediaValidator';

export async function createComplaint(req: Request, res: Response) {
  try {
    const {
      description,
      category,
      subcategory,
      latitude,
      longitude,
      address,
      voiceTranscript,
      idempotencyKey,
      wardId: explicitWardId,
      aiAssessmentToken,
      evidenceMetadata,
      problemImpact,
      problemSince,
    } = req.body;

    // AI Assessment Security Gate Verification
    if (!aiAssessmentToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AI_ASSESSMENT_REQUIRED',
          message: 'AI quality and safety assessment must be completed before final report submission.',
        },
      });
    }

    try {
      const decoded: any = jwt.verify(aiAssessmentToken, env.JWT_SECRET);
      if (decoded.evidenceValid === false) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EVIDENCE_VALIDATION_FAILED',
            message: 'Evidence validation failed. Please upload valid photographic evidence showing the civic issue.',
          },
        });
      }
    } catch (tokenErr) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AI_ASSESSMENT',
          message: 'AI assessment token is invalid or expired. Please re-run the assessment.',
        },
      });
    }

    if (!description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Description, latitude, and longitude are required.' },
      });
    }

    let lat = parseFloat(latitude);
    let lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COORDINATES', message: 'Valid latitude and longitude coordinates are required.' },
      });
    }

    // Authoritative Evidence GPS validation (Prevent location tampering)
    if (evidenceMetadata) {
      try {
        const parsedMeta = typeof evidenceMetadata === 'string' ? JSON.parse(evidenceMetadata) : evidenceMetadata;
        if (Array.isArray(parsedMeta) && parsedMeta.length > 0) {
          const primaryEvidence = parsedMeta[0];
          if (primaryEvidence.latitude !== undefined && primaryEvidence.longitude !== undefined) {
            const evLat = parseFloat(primaryEvidence.latitude);
            const evLng = parseFloat(primaryEvidence.longitude);
            if (!isNaN(evLat) && !isNaN(evLng)) {
              if (Math.abs(lat - evLat) > 0.001 || Math.abs(lng - evLng) > 0.001) {
                return res.status(400).json({
                  success: false,
                  error: {
                    code: 'LOCATION_EVIDENCE_MISMATCH',
                    message: 'Submitted location does not match verified live evidence GPS.',
                  },
                });
              }
              lat = evLat;
              lng = evLng;
            }
          }
        }
      } catch (err) {
        // Continue with validated lat/lng
      }
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Complaint.findOne({
        idempotencyKey,
        reportedBy: req.user!._id,
      })
        .populate('departmentId', 'name slug icon')
        .populate('wardId', 'wardNumber name');

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Complaint retrieved via idempotency token',
          data: { complaint: existing, isDuplicate: false },
        });
      }
    }

    // File Uploads
    const photos: string[] = [];
    const videos: string[] = [];
    const photoAssets: PhotoAsset[] = [];
    const mediaAssets: PhotoAsset[] = [];
    const photoBuffersForAI: Array<{ buffer: Buffer; mimeType: string }> = [];
    let voiceAudioUrl: string | undefined = req.body.voiceAudioUrl;

    if (req.files && Array.isArray(req.files)) {
      // 1. Enforce maximum 5 evidence files limit
      if (req.files.length > MAX_EVIDENCE_FILES) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MAX_FILES_EXCEEDED',
            message: `Maximum ${MAX_EVIDENCE_FILES} evidence files allowed.`,
          },
        });
      }

      // 2. Pre-validate all files before attempting storage upload
      for (const file of req.files) {
        if (!file.buffer || file.buffer.length === 0) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_FILE', message: 'Unable to process this file.' },
          });
        }

        const mime = file.mimetype.toLowerCase();
        const isImage = ALLOWED_IMAGE_MIMES.includes(mime);
        const isVideo = ALLOWED_VIDEO_MIMES.includes(mime);
        const isAudio = ALLOWED_AUDIO_MIMES.includes(mime) || file.fieldname === 'voice' || file.fieldname === 'audio';

        if (!isImage && !isVideo && !isAudio) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'UNSUPPORTED_FORMAT',
              message: `Unsupported file format: "${file.originalname}".`,
            },
          });
        }

        // Enforce 10MB image limit
        if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `Photo "${file.originalname}" exceeds the 10MB limit.`,
            },
          });
        }

        // Enforce 50MB video limit
        if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VIDEO_TOO_LARGE',
              message: 'Video is too large. Maximum allowed size is 50 MB.',
            },
          });
        }

        // Enforce 60-second video duration limit
        if (isVideo) {
          const duration = parseVideoDurationFromBuffer(file.buffer);
          if (duration !== null && duration > MAX_VIDEO_DURATION_SECONDS) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'VIDEO_TOO_LONG',
                message: 'Video must be 1 minute or less.',
              },
            });
          }
        }
      }

      for (const file of req.files) {
        try {
          const uploadResult = await storageService.uploadFile({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          });

          if (file.mimetype.startsWith('audio/') || file.fieldname === 'voice' || file.fieldname === 'audio') {
            voiceAudioUrl = uploadResult.url;
            mediaAssets.push({
              url: uploadResult.url,
              provider: uploadResult.provider,
              publicId: uploadResult.publicId,
              mimeType: uploadResult.mimeType,
              sizeBytes: uploadResult.sizeBytes,
              mediaType: 'audio',
              originalName: file.originalname,
            });
          } else if (file.mimetype.startsWith('video/')) {
            videos.push(uploadResult.url);
            const asset: PhotoAsset = {
              url: uploadResult.url,
              provider: uploadResult.provider,
              publicId: uploadResult.publicId,
              mimeType: uploadResult.mimeType,
              sizeBytes: uploadResult.sizeBytes,
              mediaType: 'video',
              originalName: file.originalname,
            };
            mediaAssets.push(asset);
            photoAssets.push(asset);
          } else {
            // Standard Image
            photos.push(uploadResult.url);
            const asset: PhotoAsset = {
              url: uploadResult.url,
              provider: uploadResult.provider,
              publicId: uploadResult.publicId,
              mimeType: uploadResult.mimeType,
              sizeBytes: uploadResult.sizeBytes,
              mediaType: 'image',
              originalName: file.originalname,
            };
            photoAssets.push(asset);
            mediaAssets.push(asset);
            if (file.buffer) {
              photoBuffersForAI.push({
                buffer: file.buffer,
                mimeType: file.mimetype,
              });
            }
          }
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
        }
      }
    }

    const complaintCoordinates: [number, number] = [lng, lat];
    const initialCategory: ComplaintCategory = category || 'other';

    // 1. Proximity Duplicate Check (within 150m for same category/subcategory)
    const duplicateCheck = await checkForDuplicates(
      complaintCoordinates,
      initialCategory,
      req.user!._id,
      150,
      req.body.subcategory
    );

    // BLOCK DUPLICATE SUBMISSION: If similar complaint already submitted in this area, do not allow duplicate
    if (duplicateCheck.isDuplicate && duplicateCheck.masterComplaintNumber) {
      if (duplicateCheck.masterComplaintId) {
        await upvoteExistingComplaint(duplicateCheck.masterComplaintId.toString(), req.user!._id);
      }
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_REPORT_BLOCKED',
          message: `A grievance for this category has already been reported in this immediate area (${duplicateCheck.masterComplaintNumber}). Duplicate submissions are blocked to prevent municipal overload. Your support has been linked to the existing active report.`,
          existingComplaintNumber: duplicateCheck.masterComplaintNumber,
          existingComplaintId: duplicateCheck.masterComplaintId,
          existingComplaintTitle: duplicateCheck.masterComplaintTitle,
          existingComplaintStatus: duplicateCheck.masterComplaintStatus,
        },
      });
    }

    let parsedProblemImpact: string[] = [];
    if (Array.isArray(problemImpact)) {
      parsedProblemImpact = problemImpact;
    } else if (typeof problemImpact === 'string') {
      try {
        const p = JSON.parse(problemImpact);
        if (Array.isArray(p)) parsedProblemImpact = p;
      } catch {
        if (problemImpact.trim()) parsedProblemImpact = problemImpact.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // 2. AI / Rule Advisory Analysis (Images + Audio Transcript)
    const aiResult = await aiService.analyzeIssue({
      description,
      category: initialCategory,
      subcategory: req.body.subcategory,
      voiceTranscript,
      problemImpact: parsedProblemImpact,
      problemSince: typeof problemSince === 'string' ? problemSince : undefined,
      photos: photoBuffersForAI,
    });

    // 3. Intelligent Auto-Routing (Ward GIS + Controlled Department + Officer)
    const routing = await routeComplaint(
      initialCategory,
      complaintCoordinates,
      explicitWardId,
      aiResult.confidence,
      aiResult.departmentSlug,
      aiResult.reasoning,
      description
    );

    // 4. Explainable Priority Calculation
    const priorityResult = calculatePriority({
      severity: aiResult.severity,
      category: aiResult.category,
      reportCount: duplicateCheck.isDuplicate ? duplicateCheck.nearbyCount + 1 : 1,
      hasPhotoEvidence: photos.length > 0 || videos.length > 0,
    });

    // 5. Dynamic SLA Deadline
    const sla = await calculateComplaintSLA(aiResult.category, priorityResult.priority);

    // 6. Generate Complaint ID
    const complaintNumber = await generateComplaintId();
    const title = generateTitle(aiResult.category, description);

    // 7. Create Master Complaint Record
    const complaint = await Complaint.create({
      complaintNumber,
      title,
      description,
      category: category === 'other' ? 'other' : (aiResult.category || category || 'other'),
      subcategory: req.body.subcategory || aiResult.subcategory,
      problemImpact: parsedProblemImpact,
      problemSince: typeof problemSince === 'string' ? problemSince : '',
      department: undefined,
      departmentId: undefined,
      classificationStatus: routing.classificationStatus,
      status: 'submitted',
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityExplanation: priorityResult.explanation,
      location: {
        type: 'Point',
        coordinates: complaintCoordinates,
        address: address || (routing.wardName ? `Ward ${routing.wardNumber}, ${routing.wardName}` : ''),
      },
      wardId: routing.wardId,
      assignedOfficerId: undefined,
      reportedBy: req.user!._id,
      photos,
      videos,
      photoAssets,
      mediaAssets,
      voiceAudioUrl,
      voiceTranscript,
      reportCount: 1,
      duplicateGroupId: duplicateCheck.duplicateGroup?._id,
      slaDeadline: sla.slaDeadline,
      responseTimeDeadline: sla.responseTimeDeadline,
      slaState: 'within_sla',
      aiAssessment: {
        category: aiResult.category,
        subCategory: aiResult.subcategory,
        department: routing.departmentCode,
        confidence: aiResult.confidence,
        urgency: priorityResult.priority,
        reasoning: aiResult.reasoning,
      },
      idempotencyKey,
    });

    // 8. Record AI Analysis Record
    const aiRecord = await AIAnalysis.create({
      complaintId: complaint._id,
      provider: aiResult.analysisMethod.includes('Gemini') ? 'gemini' : 'fallback',
      category: aiResult.category,
      subcategory: aiResult.subcategory,
      severity: aiResult.severity,
      priority: aiResult.priority,
      confidence: aiResult.confidence,
      departmentSlug: aiResult.departmentSlug,
      summary: aiResult.summary,
      hazards: aiResult.hazards,
      reasoning: aiResult.reasoning,
      detectedObjects: aiResult.detectedObjects,
      analysisMethod: aiResult.analysisMethod,
    });

    complaint.aiAnalysisId = aiRecord._id;

    // 9. Multi-Signal Evidence Verification Record
    if (photoBuffersForAI.length > 0) {
      try {
        const evRecord = await imageVerificationService.analyzeEvidence({
          buffer: photoBuffersForAI[0].buffer,
          mimeType: photoBuffersForAI[0].mimeType,
          category: initialCategory,
          description,
          reportedLocation: { latitude: lat, longitude: lng },
          complaintId: complaint._id.toString(),
          sizeBytes: photoBuffersForAI[0].buffer.length,
        });

        complaint.evidenceVerificationId = evRecord._id;
        complaint.evidenceVerificationStatus = evRecord.verificationStatus;
        complaint.evidenceRiskScore = evRecord.overallRiskScore;
      } catch (evErr) {
        console.warn('Evidence verification link warning:', evErr);
      }
    }

    await complaint.save();

    // 10. Initial Status History & Audit Log
    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: null,
      toStatus: 'submitted',
      changedBy: req.user!._id,
      note: 'Grievance submitted by citizen. Awaiting municipal review and department dispatch.',
    });

    // 11. Send Targeted Department Notifications
    await sendTargetedDepartmentNotifications(complaint, routing);

    // 12. Notify Reporting Citizen
    await createNotification({
      userId: req.user!._id,
      type: 'complaint_submitted',
      title: 'Grievance Filed Successfully',
      message: `Your complaint ${complaintNumber} has been logged. Awaiting municipal review and field allocation.`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    // 13. Real-time Broadcasting to Municipal Admin Overview
    const wardNameFormatted = routing.wardName
      ? `Ward ${routing.wardNumber} (${routing.wardName})`
      : `Ward ${routing.wardNumber || 12}`;
    const addressFormatted =
      complaint.location?.address ||
      (routing.wardName ? `Ward ${routing.wardNumber}, ${routing.wardName}` : 'Anand Municipality');

    const newComplaintPayload = {
      _id: complaint._id,
      id: complaint._id.toString(),
      complaintNumber: complaint.complaintNumber,
      challengeId: complaint.complaintNumber,
      title: complaint.title,
      problem: complaint.title,
      description: complaint.description,
      category: mapComplaintCategory(complaint.category),
      rawCategory: complaint.category,
      department: 'Not Assigned',
      priority: (complaint.priority || 'medium').toUpperCase(),
      status: 'submitted',
      validationStatus: 'New',
      projectStatus: 'Unassigned',
      ward: wardNameFormatted,
      wardNumber: routing.wardNumber || 12,
      location: addressFormatted,
      coordinates: complaint.location?.coordinates || [72.9289, 22.5645],
      reportedBy: {
        _id: req.user!._id,
        name: req.user!.name || 'Citizen',
        email: req.user!.email || '',
        phone: (req.user as any).phone || '',
      },
      citizen: {
        name: req.user!.name || 'Citizen',
        email: req.user!.email || '',
        phone: (req.user as any).phone || '',
      },
      citizenName: req.user!.name || 'Citizen',
      reportedByCitizen: req.user!.name || 'Citizen',
      createdAt: complaint.createdAt ? new Date(complaint.createdAt).toISOString() : new Date().toISOString(),
      submittedDate: complaint.createdAt ? new Date(complaint.createdAt).toISOString() : new Date().toISOString(),
      slaDeadline: complaint.slaDeadline,
      assignedOfficer: null,
      isInsideJurisdiction: true,
    };

    emitToRole('municipal_admin', 'complaint:new', newComplaintPayload);
    emitToRole('municipal_admin', 'complaint:created', newComplaintPayload);

    // 13. Audit Log
    await logAuditAction({
      req,
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: complaint._id.toString(),
      details: {
        complaintNumber,
        category: complaint.category,
        department: routing.departmentCode,
        priority: complaint.priority,
        status: complaint.status,
      },
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('departmentId', 'name slug icon code')
      .populate('wardId', 'wardNumber name zone')
      .populate('assignedOfficerId', 'name email phone badgeNumber')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: {
        complaint: populatedComplaint,
        routing,
        duplicateWarning: duplicateCheck.isDuplicate
          ? {
              nearbyCount: duplicateCheck.nearbyCount,
              masterComplaintNumber: duplicateCheck.masterComplaintNumber,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SUBMISSION_FAILED', message: error.message },
    });
  }
}

export async function getComplaints(req: Request, res: Response) {
  try {
    const {
      status,
      category,
      wardId,
      departmentId,
      priority,
      slaState,
      search,
      my,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = {};
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    // Role-based visibility
    if (req.user?.role === 'citizen' || my === 'true') {
      query.reportedBy = req.user!._id;
    } else if (req.user?.role === 'field_officer' || req.user?.role === 'field_worker') {
      query.assignedOfficerId = req.user._id;
    } else if (req.user?.role === 'department_officer' && req.user.departmentId) {
      query.departmentId = req.user.departmentId;
    }

    if (status) {
      if (Array.isArray(status)) query.status = { $in: status };
      else query.status = status;
    }

    if (category) query.category = category;
    if (wardId) query.wardId = wardId;
    if (departmentId) query.departmentId = departmentId;
    if (priority) query.priority = priority;
    if (slaState) query.slaState = slaState;

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { complaintNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.find(query)
        .populate('departmentId', 'name slug icon')
        .populate('wardId', 'wardNumber name zone')
        .populate('assignedOfficerId', 'name email phone badgeNumber')
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_COMPLAINTS_FAILED', message: error.message },
    });
  }
}

export async function getComplaintById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    let complaint: any;

    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findById(id);
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: id.toUpperCase() });
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMPLAINT_NOT_FOUND', message: 'Grievance record not found.' },
      });
    }

    // Access control: citizens only view their own private details unless viewing public fields
    if (req.user?.role === 'citizen' && !complaint.reportedBy.equals(req.user._id)) {
      // Return public sanitized summary for transparency
      return res.json({
        success: true,
        data: {
          complaintNumber: complaint.complaintNumber,
          category: complaint.category,
          status: complaint.status,
          priority: complaint.priority,
          location: { coordinates: complaint.location.coordinates },
          createdAt: complaint.createdAt,
          slaState: complaint.slaState,
          isPublicView: true,
        },
      });
    }

    // Department Access Control: Department staff may ONLY access complaints within their department
    if (req.user?.role === 'department_officer' && req.user.departmentId) {
      if (
        complaint.departmentId &&
        !complaint.departmentId.equals(req.user.departmentId)
      ) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_DEPARTMENT_ACCESS',
            message: 'You are not authorized to view complaints outside your department.',
          },
        });
      }
    }

    // Strict Field Worker Data Isolation: Field workers can ONLY view complaints assigned to them
    if (req.user?.role === 'field_officer' || req.user?.role === 'field_worker') {
      const isAssigned = complaint.assignedOfficerId && complaint.assignedOfficerId.equals(req.user._id);
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_TASK_ACCESS',
            message: 'Access denied: You are not assigned to this complaint.',
          },
        });
      }
    }

    await complaint.populate([
      { path: 'departmentId', select: 'name slug icon description contactEmail contactPhone code' },
      { path: 'wardId', select: 'wardNumber name zone contactPhone' },
      { path: 'assignedOfficerId', select: 'name email phone badgeNumber designation' },
      { path: 'reportedBy', select: 'name email phone' },
      { path: 'aiAnalysisId' },
      { path: 'evidenceVerificationId' },
    ]);

    // Fetch timeline history & comments & assignment history
    const statusHistory = await ComplaintStatusHistory.find({ complaintId: complaint._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    const assignmentHistory = await ComplaintAssignment.find({ complaintId: complaint._id })
      .populate('officerId', 'name email phone badgeNumber designation')
      .populate('departmentId', 'name code slug')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const comments = await ComplaintComment.find({
      complaintId: complaint._id,
      ...(req.user?.role === 'citizen' ? { isInternal: false } : {}),
    })
      .populate('authorId', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...complaint.toObject(),
        statusHistory,
        assignmentHistory,
        comments,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_DETAIL_FAILED', message: error.message },
    });
  }
}

export async function updateComplaintStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, note, evidencePhoto } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    const oldStatus = complaint.status;
    const newStatus = status as ComplaintStatus;

    complaint.status = newStatus;
    if (newStatus === 'resolved') {
      complaint.resolvedAt = new Date();
    } else if (newStatus === 'closed') {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: req.user!._id,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      evidencePhoto,
    });

    // Notify Citizen
    await createNotification({
      userId: complaint.reportedBy,
      type: `complaint_${newStatus}`,
      title: `Status Update: ${complaint.complaintNumber}`,
      message: `Your complaint is now '${newStatus.replace('_', ' ').toUpperCase()}'. ${note ? `Note: ${note}` : ''}`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    // Real-time events
    emitToUser(complaint.reportedBy, 'complaint:status_changed', {
      complaintId: complaint._id,
      status: newStatus,
      note,
    });

    emitToRole('municipal_admin', 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: newStatus,
    });

    await logAuditAction({
      req,
      action: 'STATUS_UPDATED',
      entityType: 'Complaint',
      entityId: complaint._id.toString(),
      details: { oldStatus, newStatus, note },
    });

    res.json({
      success: true,
      message: `Status successfully updated to ${newStatus}`,
      data: { complaint },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_STATUS_FAILED', message: error.message },
    });
  }
}

export async function assignOfficer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { officerId, notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    const officer = await User.findById(officerId);
    if (!officer) {
      return res.status(404).json({
        success: false,
        error: { code: 'OFFICER_NOT_FOUND', message: 'Field officer not found.' },
      });
    }

    const oldStatus = complaint.status;
    complaint.assignedOfficerId = officer._id;
    if (complaint.status === 'submitted' || complaint.status === 'acknowledged' || complaint.status === 'routed') {
      complaint.status = 'assigned';
    }
    await complaint.save();

    await ComplaintAssignment.updateMany(
      { complaintId: complaint._id, isCurrent: true },
      { $set: { isCurrent: false } }
    );

    await ComplaintAssignment.create({
      complaintId: complaint._id,
      departmentId: complaint.departmentId || officer.departmentId!,
      officerId: officer._id,
      assignedBy: req.user!._id,
      assignmentReason: notes || 'Administrative dispatch',
      isCurrent: true,
    });

    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: oldStatus,
      toStatus: 'assigned',
      changedBy: req.user!._id,
      note: `Assigned to Field Officer ${officer.name} (${officer.badgeNumber || 'Badge N/A'}). ${notes || ''}`,
    });

    await createNotification({
      userId: officer._id,
      type: 'complaint_assigned',
      title: `Task Assigned: ${complaint.complaintNumber}`,
      message: `${complaint.title} has been assigned to you for inspection & resolution.`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    emitToUser(officer._id, 'notification:new', {
      type: 'complaint_assigned',
      title: `Task Assigned: ${complaint.complaintNumber}`,
      message: `${complaint.title} has been assigned to you.`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    emitToUser(officer._id, 'complaint:assigned', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
    });

    emitToUser(complaint.reportedBy, 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'assigned',
      officer: officer.name,
    });

    emitToRole('municipal_admin', 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'assigned',
      officer: officer.name,
    });

    res.json({
      success: true,
      message: `Complaint assigned to ${officer.name}`,
      data: { complaint },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ASSIGNMENT_FAILED', message: error.message },
    });
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { message, isInternal } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_MESSAGE', message: 'Comment message is required.' },
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    const isStaff = req.user!.role !== 'citizen';
    const internalFlag = isStaff && Boolean(isInternal);

    const comment = await ComplaintComment.create({
      complaintId: complaint._id,
      authorId: req.user!._id,
      authorRole: req.user!.role,
      authorName: req.user!.name,
      message: message.trim(),
      isInternal: internalFlag,
    });

    // Notify opposite party
    if (!internalFlag) {
      if (req.user!.role === 'citizen' && complaint.assignedOfficerId) {
        await createNotification({
          userId: complaint.assignedOfficerId,
          type: 'comment_added',
          title: `Citizen Message on ${complaint.complaintNumber}`,
          message: `${req.user!.name}: "${message.substring(0, 80)}"`,
          complaintId: complaint._id,
        });
      } else if (req.user!.role !== 'citizen') {
        await createNotification({
          userId: complaint.reportedBy,
          type: 'comment_added',
          title: `Official Update on ${complaint.complaintNumber}`,
          message: `${req.user!.name} (Municipal Staff): "${message.substring(0, 80)}"`,
          complaintId: complaint._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: { comment },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'COMMENT_FAILED', message: error.message },
    });
  }
}

export async function verifyResolution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { isVerified, feedback, rating } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    if (!complaint.reportedBy.equals(req.user!._id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the citizen who reported this grievance can verify resolution.' },
      });
    }

    if (isVerified) {
      complaint.status = 'resolved';
      complaint.closedAt = new Date();
      if (rating) {
        complaint.satisfactionRating = rating;
        complaint.resolutionFeedback = {
          rating,
          comment: feedback,
          submittedAt: new Date(),
          submittedBy: req.user!._id,
        };
      }
      await complaint.save();

      await ComplaintStatusHistory.create({
        complaintId: complaint._id,
        fromStatus: 'verification_pending',
        toStatus: 'resolved',
        changedBy: req.user!._id,
        note: `Citizen confirmed satisfactory resolution.${feedback ? ` Feedback: "${feedback}"` : ''}`,
      });

      await CitizenVerification.create({
        complaintId: complaint._id,
        citizenId: req.user!._id,
        isVerified: true,
        rating,
        feedback,
      });

      emitToRole('municipal_admin', 'complaint:resolved', {
        complaintNumber: complaint.complaintNumber,
        rating,
      });
    } else {
      // Reopen complaint
      complaint.status = 'reopened';
      complaint.priorityScore = Math.min(100, (complaint.priorityScore || 50) + 20);
      complaint.priority = 'critical';
      await complaint.save();

      await ComplaintStatusHistory.create({
        complaintId: complaint._id,
        fromStatus: 'verification_pending',
        toStatus: 'reopened',
        changedBy: req.user!._id,
        note: `Citizen rejected resolution: ${feedback || 'Work incomplete or unsatisfactory'}`,
      });

      await CitizenVerification.create({
        complaintId: complaint._id,
        citizenId: req.user!._id,
        isVerified: false,
        feedback,
      });

      if (complaint.assignedOfficerId) {
        await createNotification({
          userId: complaint.assignedOfficerId,
          type: 'complaint_reopened',
          title: `⚠️ Complaint Reopened: ${complaint.complaintNumber}`,
          message: `Citizen reported the issue is not resolved: "${feedback || 'Needs rework'}"`,
          complaintId: complaint._id,
        });
      }

      emitToRole('municipal_admin', 'complaint:reopened', {
        complaintNumber: complaint.complaintNumber,
        reason: feedback,
      });
    }

    res.json({
      success: true,
      message: isVerified ? 'Resolution verified and closed' : 'Complaint reopened for rework',
      data: { complaint, isVerified },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'VERIFICATION_FAILED', message: error.message },
    });
  }
}

export async function upvoteComplaint(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const updated = await upvoteExistingComplaint(id, req.user!._id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    res.json({
      success: true,
      message: 'Support added to complaint',
      data: { reportCount: updated.reportCount, priorityScore: updated.priorityScore },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPVOTE_FAILED', message: error.message },
    });
  }
}

/**
 * Admin Manual Issue Classification:
 * Used by Municipal Admin / Super Admin when AI confidence is low or when reclassifying.
 */
export async function manualClassifyComplaint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { department: deptCode, category: newCategory, notes, assignedOfficerId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    const targetCode = (deptCode as DepartmentCode) || 'PUBLIC_WORKS';
    const deptDoc = await Department.findOne({
      $or: [{ code: targetCode }, { slug: targetCode.toLowerCase() }],
      isActive: true,
    });

    if (!deptDoc) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DEPARTMENT', message: `Department '${deptCode}' not found.` },
      });
    }

    const oldDept = complaint.department || 'OTHER';
    const oldStatus = complaint.status;

    complaint.department = deptDoc.code;
    complaint.departmentId = deptDoc._id;
    if (newCategory) complaint.category = newCategory;
    complaint.classificationStatus = 'MANUALLY_CLASSIFIED';
    complaint.status = assignedOfficerId ? 'assigned' : 'routed';
    if (assignedOfficerId && mongoose.Types.ObjectId.isValid(assignedOfficerId)) {
      complaint.assignedOfficerId = new mongoose.Types.ObjectId(assignedOfficerId);
    }

    await complaint.save();

    // Timeline event
    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: oldStatus,
      toStatus: complaint.status,
      changedBy: req.user!._id,
      note: notes || `Manually classified to ${deptDoc.name} (${deptDoc.code}) by Municipal Admin`,
    });

    // Targeted notification to the newly assigned department
    await sendTargetedDepartmentNotifications(complaint, {
      departmentCode: deptDoc.code,
      departmentId: deptDoc._id,
      departmentName: deptDoc.name,
      departmentSlug: deptDoc.slug,
      classificationStatus: 'MANUALLY_CLASSIFIED',
      status: complaint.status,
      recommendedOfficerId: complaint.assignedOfficerId,
      routingReason: notes || `Manually classified by Municipal Admin`,
      confidence: 1.0,
    });

    await logAuditAction({
      req,
      action: 'COMPLAINT_CLASSIFIED',
      entityType: 'Complaint',
      entityId: complaint._id.toString(),
      details: { oldDept, newDept: deptDoc.code, notes },
    });

    res.json({
      success: true,
      message: `Complaint successfully classified to ${deptDoc.name}.`,
      data: { complaint },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CLASSIFICATION_FAILED', message: error.message },
    });
  }
}

/**
 * Manual Route Complaint:
 * Re-routes a complaint to a different department or officer.
 */
export async function manualRouteComplaint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { departmentId, departmentCode, officerId, routingReason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
    }

    let deptDoc: any;
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      deptDoc = await Department.findById(departmentId);
    } else if (departmentCode) {
      deptDoc = await Department.findOne({ code: departmentCode });
    }

    if (deptDoc) {
      complaint.department = deptDoc.code;
      complaint.departmentId = deptDoc._id;
    }

    if (officerId && mongoose.Types.ObjectId.isValid(officerId)) {
      complaint.assignedOfficerId = new mongoose.Types.ObjectId(officerId);
      complaint.status = 'assigned';
    } else {
      complaint.status = 'routed';
    }

    complaint.classificationStatus = 'MANUALLY_CLASSIFIED';
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: complaint.status,
      toStatus: complaint.status,
      changedBy: req.user!._id,
      note: routingReason || `Re-routed to ${deptDoc?.name || 'new department'}`,
    });

    if (deptDoc) {
      await sendTargetedDepartmentNotifications(complaint, {
        departmentCode: deptDoc.code,
        departmentId: deptDoc._id,
        departmentName: deptDoc.name,
        departmentSlug: deptDoc.slug,
        classificationStatus: 'MANUALLY_CLASSIFIED',
        status: complaint.status,
        recommendedOfficerId: complaint.assignedOfficerId,
        routingReason: routingReason || 'Re-routed by Administrator',
        confidence: 1.0,
      });
    }

    res.json({
      success: true,
      message: 'Complaint successfully re-routed.',
      data: { complaint },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ROUTING_FAILED', message: error.message },
    });
  }
}

/**
 * Department Complaints & Dashboard Statistics:
 * Aggregates live queue for a specific department.
 */
export async function getDepartmentComplaints(req: Request, res: Response) {
  try {
    const deptParam = req.params.department as string;

    // Find Department by Code, Slug, or ObjectId
    const deptDoc = await Department.findOne({
      $or: [
        { code: deptParam.toUpperCase() },
        { slug: deptParam.toLowerCase() },
        ...(mongoose.Types.ObjectId.isValid(deptParam) ? [{ _id: new mongoose.Types.ObjectId(deptParam) }] : []),
      ],
    });

    if (!deptDoc) {
      return res.status(404).json({
        success: false,
        error: { code: 'DEPARTMENT_NOT_FOUND', message: `Department '${deptParam}' not found.` },
      });
    }

    // Access control: if user is department officer, must match their department
    if (req.user?.role === 'department_officer' && req.user.departmentId) {
      if (!deptDoc._id.equals(req.user.departmentId)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN_DEPARTMENT_ACCESS', message: 'You cannot access other department queues.' },
        });
      }
    }

    const query: any = {
      $or: [{ departmentId: deptDoc._id }, { department: deptDoc.code }],
    };

    const [
      complaints,
      totalCount,
      newCount,
      assignedCount,
      inProgressCount,
      highPriorityCount,
      resolvedCount,
      overdueCount,
    ] = await Promise.all([
      Complaint.find(query)
        .populate('assignedOfficerId', 'name email phone badgeNumber')
        .populate('wardId', 'wardNumber name zone')
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Complaint.countDocuments(query),
      Complaint.countDocuments({ ...query, status: { $in: ['submitted', 'routed'] } }),
      Complaint.countDocuments({ ...query, status: 'assigned' }),
      Complaint.countDocuments({ ...query, status: { $in: ['in_progress', 'resolution_submitted'] } }),
      Complaint.countDocuments({ ...query, priority: { $in: ['high', 'critical'] }, status: { $nin: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ ...query, status: { $in: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ ...query, slaState: { $in: ['breached', 'escalated'] }, status: { $nin: ['resolved', 'closed'] } }),
    ]);

    res.json({
      success: true,
      data: {
        department: {
          _id: deptDoc._id,
          name: deptDoc.name,
          code: deptDoc.code,
          slug: deptDoc.slug,
          description: deptDoc.description,
        },
        statistics: {
          total: totalCount,
          new: newCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          highPriority: highPriorityCount,
          resolved: resolvedCount,
          overdue: overdueCount,
        },
        complaints,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_DEPT_COMPLAINTS_FAILED', message: error.message },
    });
  }
}
