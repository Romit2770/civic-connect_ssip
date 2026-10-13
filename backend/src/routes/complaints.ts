import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignOfficer,
  addComment,
  verifyResolution,
  upvoteComplaint,
  manualClassifyComplaint,
  manualRouteComplaint,
  getDepartmentComplaints,
} from '../controllers/complaintController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireStaff, requireAdmin } from '../middleware/roles';
import { upload } from '../middleware/upload';

const router = Router();

// Create complaint (Authenticated citizens)
router.post('/', authenticate, upload.any(), createComplaint);

// List complaints (Filtered, paginated)
router.get('/', optionalAuthenticate, getComplaints);

// Department-specific queue & dashboard stats
router.get('/department/:department', authenticate, getDepartmentComplaints);

// Detail view
router.get('/:id', optionalAuthenticate, getComplaintById);

// Update status (Staff & Admins)
router.post('/:id/status', authenticate, requireStaff, updateComplaintStatus);
router.put('/:id/status', authenticate, requireStaff, updateComplaintStatus);

// Manual Issue Classification (Admin manual classification for low-confidence or re-routed issues)
router.post('/:id/classify', authenticate, requireAdmin, manualClassifyComplaint);

// Re-route complaint (Admins & Staff)
router.post('/:id/route', authenticate, requireStaff, manualRouteComplaint);

// Assign officer (Admins / Department heads)
router.post('/:id/assign', authenticate, requireStaff, assignOfficer);

// Comments
router.post('/:id/comments', authenticate, addComment);

// Citizen verification & satisfaction feedback
router.post('/:id/verify', authenticate, verifyResolution);

// Upvote / Support existing complaint
router.post('/:id/upvote', authenticate, upvoteComplaint);

export default router;
