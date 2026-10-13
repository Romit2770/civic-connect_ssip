import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getMunicipalityDashboard,
  getMunicipalityChallenges,
  getMunicipalityChallengeById,
  validateMunicipalityChallenge,
  forwardOutsideJurisdictionChallenge,
  allocateChallengeToFieldWorker,
  getMunicipalityFieldWorkers,
  getMunicipalityMapData,
  getMunicipalityUniversities,
  reviewUniversityProposal,
  getMunicipalityIndustry,
  getMunicipalityProjects,
  addMunicipalMilestoneFeedback,
  getMunicipalityAnalytics,
  getMunicipalityReports,
  getMunicipalityProfile,
  updateMunicipalityProfile,
  getMunicipalityNotifications,
} from '../controllers/municipalityController';

const router = Router();

// Protect all routes: strictly accessible by municipal_admin and super_admin
router.use(authenticate);
router.use(authorize('municipal_admin', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getMunicipalityDashboard);

// 2. Challenge Management
router.get('/challenges', getMunicipalityChallenges);
router.get('/field-workers', getMunicipalityFieldWorkers);
router.get('/challenges/:id', getMunicipalityChallengeById);
router.post('/challenges/:id/validate', validateMunicipalityChallenge);
router.post('/challenges/:id/forward', forwardOutsideJurisdictionChallenge);
router.post('/challenges/:id/allocate', allocateChallengeToFieldWorker);

// 3. Geographical View / GIS
router.get('/map', getMunicipalityMapData);

// 4. University Collaboration & Proposals
router.get('/universities', getMunicipalityUniversities);
router.post('/proposals/:id/review', reviewUniversityProposal);

// 5. Industry Collaboration & CSR
router.get('/industry', getMunicipalityIndustry);

// 6. Project Monitoring & Delays
router.get('/projects', getMunicipalityProjects);
router.post('/projects/:id/milestone-feedback', addMunicipalMilestoneFeedback);

// 7. Impact Analytics
router.get('/analytics', getMunicipalityAnalytics);

// 8. Reports
router.get('/reports', getMunicipalityReports);

// 9. Municipality Profile
router.get('/profile', getMunicipalityProfile);
router.put('/profile', updateMunicipalityProfile);

// 10. Operational Notifications
router.get('/notifications', getMunicipalityNotifications);

export default router;
