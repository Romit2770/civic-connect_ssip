import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  getDepartmentWorkers,
  createDepartment,
  updateDepartment,
  addDepartmentWorker,
} from '../controllers/departmentController';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireStaff } from '../middleware/roles';

const router = Router();

// Public / Authenticated Department Read Endpoints
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/workers', authenticate, requireStaff, getDepartmentWorkers);

// Admin Management Endpoints
router.post('/', authenticate, requireAdmin, createDepartment);
router.put('/:id', authenticate, requireAdmin, updateDepartment);
router.post('/:id/workers', authenticate, requireAdmin, addDepartmentWorker);

export default router;
