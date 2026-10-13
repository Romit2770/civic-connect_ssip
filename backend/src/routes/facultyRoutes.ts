import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getFacultyDashboard,
  getFacultyChallenges,
  getFacultyChallengeById,
  acceptMentorship,
  getFacultyTeams,
  updateTeamTask,
  getFacultyProjects,
  getFacultyProposals,
  saveFacultyProposal,
  getFacultyMilestones,
  createFacultyMilestone,
  reviewSubmission,
  getFacultyIndustry,
  sendIndustryCollaborationRequest,
  getFacultyReports,
  createFacultyReport,
  getFacultyReportBundle,
  downloadFacultyReportPdf,
  getFacultyProfile,
  updateFacultyProfile,
} from '../controllers/facultyController';

const router = Router();

// Protect all routes: Accessible ONLY by authenticated faculty mentors or super admins
router.use(authenticate);
router.use(authorize('faculty_mentor', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getFacultyDashboard);

// 2. Challenges
router.get('/challenges', getFacultyChallenges);
router.get('/challenges/:id', getFacultyChallengeById);
router.patch('/challenges/:id/accept', acceptMentorship);

// 3. Teams
router.get('/teams', getFacultyTeams);
router.patch('/teams/:teamId/members/:studentId/task', updateTeamTask);

// 4. Projects
router.get('/projects', getFacultyProjects);

// 5. Solution Proposals
router.get('/proposals', getFacultyProposals);
router.post('/proposals', saveFacultyProposal);

// 6. Milestones & Submissions
router.get('/milestones', getFacultyMilestones);
router.post('/milestones', createFacultyMilestone);
router.post('/submissions/:submissionId/review', reviewSubmission);

// 7. Industry Collaboration
router.get('/industry', getFacultyIndustry);
router.post('/industry/requests', sendIndustryCollaborationRequest);

// 8. Reports
router.get('/reports', getFacultyReports);
router.post('/reports', createFacultyReport);
router.get('/reports/:reportId/bundle', getFacultyReportBundle);
router.get('/reports/:reportId/pdf', downloadFacultyReportPdf);

// 9. Profile
router.get('/profile', getFacultyProfile);
router.patch('/profile', updateFacultyProfile);

export default router;
