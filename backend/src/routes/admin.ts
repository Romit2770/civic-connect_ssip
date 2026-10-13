import { Router } from 'express';
import {
  getOverview,
  getCategoryAnalytics,
  getDepartmentAnalytics,
  getWardAnalytics,
  getTrendsAnalytics,
  getAuditLogs,
  getSLAConfigurations,
  updateSLAConfiguration,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireStaff, requireAdmin } from '../middleware/roles';

const router = Router();

// Staff and Admin Overview
router.get('/overview', authenticate, requireStaff, getOverview);

// Analytics
router.get('/analytics/categories', authenticate, requireStaff, getCategoryAnalytics);
router.get('/analytics/departments', authenticate, requireStaff, getDepartmentAnalytics);
router.get('/analytics/wards', authenticate, requireStaff, getWardAnalytics);
router.get('/analytics/trends', authenticate, requireStaff, getTrendsAnalytics);

// Audit Trail & SLA Configuration (Admins only)
router.get('/audit-logs', authenticate, requireAdmin, getAuditLogs);
router.get('/sla-config', authenticate, requireAdmin, getSLAConfigurations);
router.put('/sla-config/:id', authenticate, requireAdmin, updateSLAConfiguration);

export default router;
