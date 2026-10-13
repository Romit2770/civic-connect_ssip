import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getIndustryDashboard,
  getIndustryChallenges,
  createCollaborationRequest,
  getUniversityCollaborations,
  updateProposalStatus,
  getIndustryTeam,
  addIndustryMentor,
  getIndustryProjects,
  reviewProjectDeliverable,
  getFundingCommitments,
  createFundingCommitment,
  getIndustryAnalytics,
  getOrganizationProfile,
  updateOrganizationProfile,
} from '../controllers/industryAdminController';

const router = Router();

// Protect all routes: Accessible ONLY by authenticated industry administrators, CSR leads, or super admins
router.use(authenticate);
router.use(authorize('industry_admin', 'csr_lead', 'corporate_partner', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getIndustryDashboard);

// 2. Challenge Discovery
router.get('/challenges', getIndustryChallenges);
router.post('/challenges/requests', createCollaborationRequest);
router.post('/collaborations/request', createCollaborationRequest);

// 3. University Collaboration & Proposals
router.get('/collaborations', getUniversityCollaborations);
router.patch('/proposals/:proposalId/status', updateProposalStatus);
router.put('/proposals/:proposalId/status', updateProposalStatus);

// 4. Industry Team & Mentors
router.get('/team', getIndustryTeam);
router.post('/team/mentors', addIndustryMentor);

// 5. Supported Projects & Deliverables
router.get('/projects', getIndustryProjects);
router.post('/projects/deliverables/:deliverableId/review', reviewProjectDeliverable);

// 6. Funding & CSR Commitments
router.get('/funding', getFundingCommitments);
router.post('/funding', createFundingCommitment);

// 7. Organization Impact Analytics
router.get('/analytics', getIndustryAnalytics);

// 8. Organization Profile
router.get('/organization', getOrganizationProfile);
router.patch('/organization', updateOrganizationProfile);
router.put('/organization', updateOrganizationProfile);

export default router;
