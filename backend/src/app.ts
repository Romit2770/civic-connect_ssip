import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route Imports
import authRoutes from './routes/auth';
import complaintsRoutes from './routes/complaints';
import issuesRoutes from './routes/issues';
import adminRoutes from './routes/admin';
import mapRoutes from './routes/map';
import departmentRoutes from './routes/departments';
import officerRoutes from './routes/officers';
import aiRoutes from './routes/ai';
import evidenceRoutes from './routes/evidence';
import notificationRoutes from './routes/notifications';
import credentialRoutes from './routes/credentialRoutes';
import universityRoutes from './routes/universityRoutes';
import facultyRoutes from './routes/facultyRoutes';
import studentLeadRoutes from './routes/studentLeadRoutes';
import industryAdminRoutes from './routes/industryAdminRoutes';
import csrRoutes from './routes/csrRoutes';
import corporatePartnerRoutes from './routes/corporatePartnerRoutes';
import municipalityRoutes from './routes/municipalityRoutes';
import fieldWorkerRoutes from './routes/fieldWorkerRoutes';
import { authenticate } from './middleware/auth';
import { downloadFacultyReportPdf } from './controllers/facultyController';
import { requestTelemetryMiddleware, metricsRegistry } from './middleware/observability';
import { pingDatabase } from './config/database';

const app = express();

// Request Telemetry & Latency Tracking Middleware (First in chain)
app.use(requestTelemetryMiddleware);

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedStatic = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      if (
        env.NODE_ENV === 'development' ||
        allowedStatic.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('.onrender.com') ||
        origin.includes('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(mongoSanitize());

// Rate Limiting (Protects public portal)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' },
  },
  skip: (req) => env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static File Serving for Evidence & Resolution Media
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/credentials', credentialRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student-lead', studentLeadRoutes);
app.use('/api/industry-admin', industryAdminRoutes);
app.use('/api/csr', csrRoutes);
app.use('/api/corporate-partner', corporatePartnerRoutes);
app.use('/api/municipality', municipalityRoutes);
app.use('/api/field-worker', fieldWorkerRoutes);
app.get('/api/reports/:reportId/pdf', authenticate, downloadFacultyReportPdf);

// Root Service Status
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'CivicConnect Backend',
    status: 'healthy',
    system: 'CivicConnect Grievance & Municipal Resolution Engine',
    version: '1.0.0',
    endpoints: {
      liveness: '/health',
      readiness: '/ready',
      metrics: '/api/metrics',
      auth: '/api/auth',
      complaints: '/api/complaints',
    },
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 1. Liveness Probe (Does NOT touch database; responds in < 3ms)
const livenessHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'UP',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'CivicConnect Backend',
  });
};
app.get('/health', livenessHandler);
app.get('/api/health', livenessHandler);

// 2. Readiness Probe (Checks MongoDB connection readiness without overwhelming pool)
const readinessHandler = async (_req: express.Request, res: express.Response) => {
  const dbPing = await pingDatabase();
  const isReady = dbPing.ok;

  const payload = {
    status: isReady ? 'READY' : 'NOT_READY',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: isReady,
      latencyMs: dbPing.latencyMs,
    },
  };

  if (isReady) {
    res.status(200).json(payload);
  } else {
    res.status(503).json(payload);
  }
};
app.get('/ready', readinessHandler);
app.get('/api/ready', readinessHandler);

// 3. Operational Telemetry & Metrics (Sanitized, no sensitive secrets or PII)
app.get('/api/metrics', (_req, res) => {
  res.json({
    success: true,
    metrics: metricsRegistry.getSnapshot(),
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
