import { Router } from 'express';
import {
  getOfficers,
  getMyAssignedTasks,
  startWorkOnTask,
  submitTaskResolution,
} from '../controllers/officerController';
import { authenticate } from '../middleware/auth';
import { requireStaff } from '../middleware/roles';
import { upload } from '../middleware/upload';

const router = Router();

// List officers (Admins and staff)
router.get('/', authenticate, requireStaff, getOfficers);

// Field Officer specific task operations
router.get('/tasks', authenticate, getMyAssignedTasks);
router.post('/tasks/:id/start', authenticate, startWorkOnTask);
router.post('/tasks/:id/resolve', authenticate, upload.array('photos', 5), submitTaskResolution);

export default router;
