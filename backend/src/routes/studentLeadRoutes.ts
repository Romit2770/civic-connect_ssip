import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getStudentDashboard,
  getStudentProject,
  updateStudentProject,
  getStudentTeam,
  getStudentTasks,
  createStudentTask,
  updateStudentTask,
  getStudentMilestones,
  updateMilestoneProgress,
  submitMilestoneDeliverable,
  getStudentDocuments,
  documentUploadMiddleware,
  uploadStudentDocument,
  downloadStudentDocument,
  getStudentMessages,
  sendStudentMessage,
  getStudentNotifications,
} from '../controllers/studentLeadController';

const router = Router();

// Protect all routes: Accessible ONLY by authenticated student leads or super admins
router.use(authenticate);
router.use(authorize('student_lead', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getStudentDashboard);

// 2. Project
router.get('/project', getStudentProject);
router.patch('/project', updateStudentProject);

// 3. Team
router.get('/team', getStudentTeam);

// 4. Tasks
router.get('/tasks', getStudentTasks);
router.post('/tasks', createStudentTask);
router.patch('/tasks/:taskId', updateStudentTask);

// 5. Milestones
router.get('/milestones', getStudentMilestones);
router.patch('/milestones/:milestoneId/progress', updateMilestoneProgress);
router.post('/milestones/:milestoneId/submit', submitMilestoneDeliverable);

// 6. Documents
router.get('/documents', getStudentDocuments);
router.post('/documents/upload', documentUploadMiddleware, uploadStudentDocument);
router.get('/documents/download/:filename', downloadStudentDocument);

// 7. Communication
router.get('/communication', getStudentMessages);
router.post('/communication', sendStudentMessage);

// 8. Notifications
router.get('/notifications', getStudentNotifications);

export default router;
