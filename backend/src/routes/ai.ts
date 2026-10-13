import { Router } from 'express';
import {
  classifyComplaint,
  analyzeResolution,
  transcribeVoiceAudio,
  translateComplaintText,
} from '../controllers/aiController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/classify-complaint', optionalAuthenticate, upload.array('photos', 5), classifyComplaint);
router.post('/analyze-resolution', authenticate, analyzeResolution);
router.post('/transcribe-audio', upload.single('audio'), transcribeVoiceAudio);
router.post('/translate-text', translateComplaintText);

export default router;
