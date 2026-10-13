import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getFieldWorkerDashboard,
  getFieldWorkerChallenges,
  getFieldWorkerChallengeById,
  startWorkOnFieldChallenge,
  submitFieldChallengeResolution,
  submitFieldVerification,
  getBeforeAfterRecords,
  addAfterPhoto,
  getMonitoredProjects,
  getMonitoredProjectById,
  submitProjectSiteVisit,
  getFieldWorkerMapData,
  getFieldWorkerReports,
  getFieldWorkerReportById,
  getFieldWorkerActivity,
  getFieldWorkerProfile,
  updateFieldWorkerProfile,
} from '../controllers/fieldWorkerController';

const router = Router();

// Protect all routes: strictly accessible by field_worker, field_officer, and super_admin
router.use(authenticate);
router.use(authorize('field_worker', 'field_officer', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getFieldWorkerDashboard);

// 2. Assigned Challenges
router.get('/challenges', getFieldWorkerChallenges);
router.get('/challenges/:id', getFieldWorkerChallengeById);
router.post('/challenges/:id/start-work', startWorkOnFieldChallenge);
router.post('/challenges/:id/resolution', upload.any(), submitFieldChallengeResolution);

// 3. Field Verification
router.post('/verification', submitFieldVerification);

// 4. Before / After Records
router.get('/before-after', getBeforeAfterRecords);
router.post('/before-after/:id/after-photo', addAfterPhoto);

// 5. Monitored Projects
router.get('/projects', getMonitoredProjects);
router.get('/projects/:id', getMonitoredProjectById);
router.post('/projects/:id/visit', submitProjectSiteVisit);

// 6. GIS / Field Map
router.get('/map', getFieldWorkerMapData);

// 7. Field Reports
router.get('/reports', getFieldWorkerReports);
router.get('/reports/:id', getFieldWorkerReportById);

// 8. Activity History
router.get('/activity', getFieldWorkerActivity);

// 9. Profile
router.get('/profile', getFieldWorkerProfile);
router.put('/profile', updateFieldWorkerProfile);

export default router;
