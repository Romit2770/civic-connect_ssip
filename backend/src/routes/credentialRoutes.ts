import { Router } from 'express';
import {
  getCredentialSummary,
  getCredentials,
  createAdminCredential,
  updateAdminCredential,
  toggleAdminStatus,
  resetAdminCredentials,
  getCredentialAuditLogs,
} from '../controllers/credentialController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All credential endpoints are restricted to Government Super Admin / Municipal Admin
router.get('/summary', authenticate, requireAdmin, getCredentialSummary);
router.get('/', authenticate, requireAdmin, getCredentials);
router.post('/', authenticate, requireAdmin, createAdminCredential);
router.put('/:id', authenticate, requireAdmin, updateAdminCredential);
router.patch('/:id/status', authenticate, requireAdmin, toggleAdminStatus);
router.post('/:id/reset', authenticate, requireAdmin, resetAdminCredentials);
router.get('/audit-logs', authenticate, requireAdmin, getCredentialAuditLogs);

export default router;
