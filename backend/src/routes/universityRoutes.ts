import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardSummary,
  getChallenges,
  updateChallengeStatus,
  getTeams,
  createTeam,
  getProjects,
  getProposals,
  createProposal,
  getIndustryMatching,
  sendIndustryRequest,
  getTestingLogs,
  getUniversityCredentials,
  createUniversityCredential,
  toggleUniversityCredentialStatus,
  getUniversityProfile,
} from '../controllers/universityController';

const router = Router();

// Protect all routes: Accessible by university admin, faculty, student lead, or super admin
router.use(authenticate);
router.use(authorize('university_admin', 'faculty_mentor', 'student_lead', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getDashboardSummary);

// 2. Challenges
router.get('/challenges', getChallenges);
router.patch('/challenges/:id/status', updateChallengeStatus);

// 3. Teams
router.get('/teams', getTeams);
router.post('/teams', createTeam);

// 4. Projects & Milestones
router.get('/projects', getProjects);

// 5. Solution Proposals
router.get('/proposals', getProposals);
router.post('/proposals', createProposal);

// 6. Industry Collaboration & AI Matching
router.get('/industry-matching', getIndustryMatching);
router.post('/industry-requests', sendIndustryRequest);

// 7. Testing & Validation
router.get('/testing-logs', getTestingLogs);

// 8. Credentials (University Internal Scope - strictly University Admin & Super Admin)
router.get('/credentials', authorize('university_admin', 'super_admin'), getUniversityCredentials);
router.post('/credentials', authorize('university_admin', 'super_admin'), createUniversityCredential);
router.patch('/credentials/:id/status', authorize('university_admin', 'super_admin'), toggleUniversityCredentialStatus);

// 9. University Profile
router.get('/profile', getUniversityProfile);

export default router;
