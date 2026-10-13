import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/civicconnect',
  JWT_SECRET: process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'civicconnect-super-secret-refresh-key-2026',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1h',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // Advisory Multimodal AI
  AI_PROVIDER: (process.env.AI_PROVIDER || 'fallback') as 'gemini' | 'fallback',
  AI_MODEL: process.env.AI_MODEL || 'gemini-3.6-flash',
  AI_TIMEOUT_MS: parseInt(process.env.AI_TIMEOUT_MS || '10000', 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Storage
  STORAGE_PROVIDER: (process.env.STORAGE_PROVIDER || 'local') as 'cloudinary' | 'local',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // SLA & Automation
  SLA_MONITOR_ENABLED: process.env.SLA_MONITOR_ENABLED !== 'false',
  SLA_MONITOR_INTERVAL_MINUTES: parseInt(process.env.SLA_MONITOR_INTERVAL_MINUTES || '60', 10),
  SLA_DUE_SOON_HOURS: parseInt(process.env.SLA_DUE_SOON_HOURS || '6', 10),

  // Web & Security
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10', 10),
  MAX_AUDIO_SIZE_MB: parseInt(process.env.MAX_AUDIO_SIZE_MB || '25', 10),
  MAX_VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '50', 10),

  // Brevo Transactional Email Service
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'noreply@civicconnect.gov.in',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'CivicConnect Citizen Services',
};
