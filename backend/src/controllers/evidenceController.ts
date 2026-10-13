import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { imageVerificationService } from '../services/imageVerificationService';
import { EvidenceVerification, HumanReviewDecision } from '../models/EvidenceVerification';
import { Complaint } from '../models/Complaint';
import { logAuditAction } from '../middleware/audit';

export async function verifyEvidence(req: Request, res: Response) {
  try {
    let buffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    let originalName = 'evidence.jpg';
    let sizeBytes = 0;

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype || 'image/jpeg';
      originalName = req.file.originalname || 'evidence.jpg';
      sizeBytes = req.file.size;
    } else if (req.body.imageBase64) {
      buffer = Buffer.from(req.body.imageBase64, 'base64');
      mimeType = req.body.mimeType || 'image/jpeg';
      sizeBytes = buffer.length;
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_IMAGE', message: 'No photo evidence file or data provided.' },
      });
    }

    if (sizeBytes > env.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: `Photo exceeds the ${env.MAX_IMAGE_SIZE_MB}MB limit.` },
      });
    }

    const { category, description, latitude, longitude, complaintId } = req.body;

    let reportedLocation: { latitude: number; longitude: number } | undefined;
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        reportedLocation = { latitude: lat, longitude: lng };
      }
    }

    const verificationRecord = await imageVerificationService.analyzeEvidence({
      buffer,
      mimeType,
      originalName,
      sizeBytes,
      category,
      description,
      reportedLocation,
      complaintId,
    });

    // Generate signed assessment gate token
    const assessmentToken = jwt.sign(
      {
        verificationId: verificationRecord._id.toString(),
        verificationStatus: verificationRecord.verificationStatus,
        overallRiskScore: verificationRecord.overallRiskScore,
        perceptualHash: verificationRecord.perceptualHash,
        recommendedAction: verificationRecord.recommendedAction,
        allowSubmission: verificationRecord.verificationStatus !== 'HIGH_RISK' || req.body.allowOverride === 'true',
        userId: req.user?._id?.toString(),
        timestamp: Date.now(),
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        verificationId: verificationRecord._id,
        verificationStatus: verificationRecord.verificationStatus,
        overallRiskScore: verificationRecord.overallRiskScore,
        confidence: verificationRecord.confidence,
        recommendedAction: verificationRecord.recommendedAction,
        citizenMessage: verificationRecord.citizenMessage,
        aiVisual: {
          authenticityStatus: verificationRecord.aiVisual.authenticityStatus,
          syntheticProbability: verificationRecord.aiVisual.syntheticProbability,
          manipulationProbability: verificationRecord.aiVisual.manipulationProbability,
          reasoningSummary: verificationRecord.aiVisual.reasoningSummary,
        },
        civicRelevance: {
          isCivicIssueVisible: verificationRecord.civicRelevance.isCivicIssueVisible,
          detectedIssueType: verificationRecord.civicRelevance.detectedIssueType,
          categoryMatch: verificationRecord.civicRelevance.categoryMatch,
        },
        metadata: {
          available: verificationRecord.metadata.available,
          hasEditingSoftware: verificationRecord.metadata.hasEditingSoftware,
          findings: verificationRecord.metadata.findings,
        },
        duplicateCheck: {
          isDuplicate: verificationRecord.duplicateCheck.isDuplicate,
          similarityScore: verificationRecord.duplicateCheck.similarityScore,
        },
        assessmentToken,
        disclaimer: 'AI-assisted evidence assessment. Subject to authorized municipal human verification.',
      },
    });
  } catch (error: any) {
    console.error('Evidence verification failed:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EVIDENCE_VERIFICATION_FAILED', message: error.message },
    });
  }
}

export async function getEvidenceVerification(req: Request, res: Response) {
  try {
    const { id } = req.params;

    let verification = await EvidenceVerification.findById(id).populate('complaintId', 'complaintNumber title status');

    if (!verification) {
      // Try searching by complaintId
      verification = await EvidenceVerification.findOne({ complaintId: id }).populate('complaintId', 'complaintNumber title status');
    }

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: { code: 'VERIFICATION_NOT_FOUND', message: 'Evidence verification record not found.' },
      });
    }

    res.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_VERIFICATION_FAILED', message: error.message },
    });
  }
}

export async function recordHumanReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    if (!decision || !['ACCEPTED', 'MARKED_FOR_REVIEW', 'REJECTED', 'REQUESTED_NEW_EVIDENCE', 'OVERRIDDEN'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DECISION', message: 'Valid human review decision is required.' },
      });
    }

    const verification = await EvidenceVerification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        error: { code: 'VERIFICATION_NOT_FOUND', message: 'Evidence verification record not found.' },
      });
    }

    const previousStatus = verification.verificationStatus;
    const reviewer = req.user!;

    // Map decision to verification status
    if (decision === 'ACCEPTED' || decision === 'OVERRIDDEN') {
      verification.verificationStatus = 'PASS';
    } else if (decision === 'MARKED_FOR_REVIEW' || decision === 'REQUESTED_NEW_EVIDENCE') {
      verification.verificationStatus = 'REVIEW';
    } else if (decision === 'REJECTED') {
      verification.verificationStatus = 'HIGH_RISK';
    }

    verification.humanReview = {
      reviewedBy: reviewer._id,
      reviewerName: reviewer.name,
      reviewerRole: reviewer.role,
      decision: decision as HumanReviewDecision,
      notes,
      previousStatus,
      reviewedAt: new Date(),
    };

    await verification.save();

    // Update parent complaint if linked
    if (verification.complaintId) {
      await Complaint.findByIdAndUpdate(verification.complaintId, {
        evidenceVerificationStatus: verification.verificationStatus,
      });
    }

    await logAuditAction({
      req,
      actorId: reviewer._id,
      actorRole: reviewer.role,
      actorName: reviewer.name,
      action: 'EVIDENCE_HUMAN_REVIEW',
      entityType: 'Complaint',
      entityId: verification.complaintId?.toString() || verification._id.toString(),
      details: {
        decision,
        notes,
        previousStatus,
        newStatus: verification.verificationStatus,
      },
    });

    res.json({
      success: true,
      message: 'Human review decision recorded successfully.',
      data: verification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'HUMAN_REVIEW_FAILED', message: error.message },
    });
  }
}
