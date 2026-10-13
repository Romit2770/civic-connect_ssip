import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';

// Store in memory for direct stream / validation / hash / disk writing
const storage = multer.memoryStorage();

const allowedMimes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
  'video/3gpp',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
];

import { metricsRegistry } from './observability';

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    metricsRegistry.recordUpload(false);
    cb(new Error(`Unsupported file format: ${file.mimetype}. Allowed: Images (JPG, PNG, WEBP), Videos (MP4, WEBM, MOV, OGG), and Audio.`));
  }
}

// Bounded memory limits to protect 512MB RAM cloud tiers from OOM crashes
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    // 10MB per file max in memory
    fileSize: Math.min(10, env.MAX_IMAGE_SIZE_MB || 10) * 1024 * 1024,
    files: 4,
  },
});
