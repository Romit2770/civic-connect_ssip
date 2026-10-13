import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { aiService } from '../ai/aiService';
import { env } from '../config/env';
import { checkForDuplicates } from '../services/duplicateService';
import { ComplaintCategory } from '../types';

export async function classifyComplaint(req: Request, res: Response) {
  try {
    const {
      description,
      category,
      subcategory,
      otherCategoryText,
      voiceTranscript,
      problemImpact,
      problemSince,
      latitude,
      longitude,
      accuracy,
      address,
      evidenceMetadata,
      photoBase64,
      photos: bodyPhotos,
    } = req.body;

    const effectiveText = (description || voiceTranscript || '').trim();

    let parsedImpact: string[] = [];
    if (Array.isArray(problemImpact)) {
      parsedImpact = problemImpact;
    } else if (typeof problemImpact === 'string') {
      try {
        const p = JSON.parse(problemImpact);
        if (Array.isArray(p)) parsedImpact = p;
      } catch {
        if (problemImpact.trim()) parsedImpact = problemImpact.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    let parsedEvidenceMeta: any = evidenceMetadata;
    if (typeof evidenceMetadata === 'string') {
      try {
        parsedEvidenceMeta = JSON.parse(evidenceMetadata);
      } catch {
        parsedEvidenceMeta = null;
      }
    }

    // Extract photos from files or base64
    const photoBuffers: Array<{ buffer?: Buffer; mimeType?: string; url?: string }> = [];

    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        photoBuffers.push({ buffer: f.buffer, mimeType: f.mimetype });
      }
    } else if (photoBase64 && typeof photoBase64 === 'string') {
      const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        photoBuffers.push({
          buffer: Buffer.from(match[2], 'base64'),
          mimeType: match[1],
        });
      } else {
        photoBuffers.push({
          buffer: Buffer.from(photoBase64, 'base64'),
          mimeType: 'image/jpeg',
        });
      }
    } else if (Array.isArray(bodyPhotos)) {
      for (const p of bodyPhotos) {
        if (typeof p === 'string' && p.startsWith('data:')) {
          const match = p.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            photoBuffers.push({ buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] });
          }
        }
      }
    }

    const latNum = latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(String(latitude)) : undefined;
    const lngNum = longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(String(longitude)) : undefined;
    const accNum = accuracy !== undefined && accuracy !== null && accuracy !== '' ? parseFloat(String(accuracy)) : undefined;

    const result = await aiService.analyzeIssue({
      description: effectiveText,
      category,
      subcategory,
      otherCategoryText,
      voiceTranscript,
      problemImpact: parsedImpact,
      problemSince: typeof problemSince === 'string' ? problemSince : undefined,
      latitude: !isNaN(latNum!) ? latNum : undefined,
      longitude: !isNaN(lngNum!) ? lngNum : undefined,
      accuracy: !isNaN(accNum!) ? accNum : undefined,
      address,
      evidenceMetadata: parsedEvidenceMeta,
      photos: photoBuffers.length > 0 ? photoBuffers : undefined,
    });

    // Proximity duplicate check if lat/lng coordinates are available
    let duplicateInfo: any = undefined;
    if (latNum !== undefined && lngNum !== undefined && !isNaN(latNum) && !isNaN(lngNum)) {
      const dupCheck = await checkForDuplicates(
        [lngNum, latNum],
        (category as ComplaintCategory) || 'other',
        req.user?._id,
        150,
        subcategory
      );
      if (dupCheck.isDuplicate && dupCheck.masterComplaintNumber) {
        duplicateInfo = {
          isDuplicate: true,
          masterComplaintId: dupCheck.masterComplaintId,
          masterComplaintNumber: dupCheck.masterComplaintNumber,
          masterComplaintTitle: dupCheck.masterComplaintTitle,
          masterComplaintStatus: dupCheck.masterComplaintStatus,
          masterComplaintDate: dupCheck.masterComplaintDate,
          nearbyCount: dupCheck.nearbyCount,
        };
        result.overallStatus = 'NEEDS_CORRECTION';
        result.corrections.unshift({
          step: 3,
          field: 'duplicate',
          issue: `Duplicate Grievance Detected (${dupCheck.masterComplaintNumber})`,
          action: `An active grievance has already been reported for this location (#${dupCheck.masterComplaintNumber}). Duplicate submissions are blocked.`,
        });
      }
    }

    const isAllowed = result.overallStatus === 'PASS' && !duplicateInfo?.isDuplicate;

    // Generate cryptographically signed AI assessment gate token
    const assessmentToken = jwt.sign(
      {
        overallStatus: result.overallStatus,
        category: result.category,
        severity: result.severityScore,
        confidence: result.confidence,
        departmentSlug: result.targetDepartment,
        evidenceValid: isAllowed,
        evidenceStatus: isAllowed ? 'valid' : 'rejected',
        isDuplicate: Boolean(duplicateInfo?.isDuplicate),
        userId: req.user?._id?.toString(),
        timestamp: Date.now(),
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        ...result,
        duplicateInfo,
        analysis: result,
        assessmentToken,
        disclaimer: 'CivicConnect AI Quality & Risk Gate — Real Evidence Verification.',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AI_CLASSIFICATION_FAILED', message: error.message },
    });
  }
}

export async function analyzeResolution(req: Request, res: Response) {
  try {
    const { initialPhotoUrl, category, description, officerRemarks } = req.body;

    const result = await aiService.verifyResolution({
      initialPhotoUrl,
      category: category || 'pothole',
      description: description || '',
      officerRemarks,
    });

    res.json({
      success: true,
      data: {
        verification: result,
        disclaimer: 'AI Advisory Verification — Subject to final citizen confirmation.',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AI_VERIFICATION_FAILED', message: error.message },
    });
  }
}

export async function transcribeVoiceAudio(req: Request, res: Response) {
  try {
    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/webm';

    if (req.file) {
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'audio/webm';
    } else if (req.body.audioBase64) {
      audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      mimeType = req.body.mimeType || 'audio/webm';
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_AUDIO', message: 'No audio stream or file provided.' },
      });
    }

    const targetLanguage = req.body.targetLanguage || req.body.language || 'en';

    const result = await aiService.transcribeAudio(
      audioBuffer,
      mimeType,
      targetLanguage
    );

    res.json({
      success: true,
      data: {
        transcript: result.transcript,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        provider: 'Google Gemini 3.6 Flash Multimodal',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'TRANSCRIPTION_FAILED', message: error.message },
    });
  }
}

export async function translateComplaintText(req: Request, res: Response) {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TEXT', message: 'Text to translate is required.' },
      });
    }

    const translated = await aiService.translateText(
      text,
      targetLanguage || 'en'
    );

    res.json({
      success: true,
      data: {
        translatedText: translated,
        targetLanguage,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'TRANSLATION_FAILED', message: error.message },
    });
  }
}
