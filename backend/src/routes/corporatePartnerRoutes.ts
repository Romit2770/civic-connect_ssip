import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getPartnerDashboard,
  getRecommendedOpportunities,
  createCollaborationRequest,
  getPartnerCollaborations,
  respondToCollaboration,
  getPartnerMentorship,
  scheduleMentorshipSession,
  submitMentorshipFeedback,
  getTechnicalSupport,
  createTechnicalSupport,
  getPartnerProjects,
  submitDeliverableReview,
  submitTestingFeedback,
  getPartnerCommunication,
  sendPartnerMessage,
  getPartnerProfile,
  updatePartnerProfile,
} from '../controllers/corporatePartnerController';

const router = Router();

// Protect all Corporate Partner routes
router.use(authenticate);
router.use(authorize('corporate_partner', 'industry_admin', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getPartnerDashboard);

// 2. Recommended Opportunities
router.get('/opportunities', getRecommendedOpportunities);

// 3. Collaborations
router.get('/collaborations', getPartnerCollaborations);
router.post('/collaborations/request', createCollaborationRequest);
router.post('/collaborations/:id/respond', respondToCollaboration);

// 4. Mentorship
router.get('/mentorship', getPartnerMentorship);
router.post('/mentorship/schedule', scheduleMentorshipSession);
router.post('/mentorship/:sessionId/feedback', submitMentorshipFeedback);

// 5. Technical Support
router.get('/technical-support', getTechnicalSupport);
router.post('/technical-support', createTechnicalSupport);

// 6. Project Progress, Milestones & Testing
router.get('/projects', getPartnerProjects);
router.post('/deliverables/:deliverableId/review', submitDeliverableReview);
router.post('/testing/:testId/feedback', submitTestingFeedback);

// 7. Project Communication
router.get('/communication', getPartnerCommunication);
router.post('/communication/send', sendPartnerMessage);

// 8. Profile
router.get('/profile', getPartnerProfile);
router.patch('/profile', updatePartnerProfile);
router.put('/profile', updatePartnerProfile);

export default router;
