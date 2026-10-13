import { Router } from 'express';
import {
  verifyEvidence,
  getEvidenceVerification,
  recordHumanReview,
} from '../controllers/evidenceController';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// 1. Evidence Verification (Citizen or Officer during reporting)
router.post('/verify', upload.single('photo'), optionalAuthenticate, verifyEvidence);

// 2. Get Evidence Verification Details
router.get('/:id/verification', optionalAuthenticate, getEvidenceVerification);

// 3. Human-In-The-Loop Officer Review & Override (Staff Only)
router.post(
  '/:id/human-review',
  authenticate,
  authorize('field_officer', 'department_officer', 'municipal_admin', 'super_admin'),
  recordHumanReview
);

export default router;
