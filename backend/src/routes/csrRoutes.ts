import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getCSRDashboard,
  getCSROpportunities,
  getCSROpportunityDetails,
  getCSRProjectSelection,
  reviewCSRProposal,
  getCSRProjects,
  getCSRProjectDetails,
  getCSRFunding,
  createCSRFundingRelease,
  getCSRImpact,
  getCSRReports,
  createCSRReport,
  getCSRProfile,
  updateCSRProfile,
} from '../controllers/csrController';

const router = Router();

// Protect all CSR routes: accessible strictly by authenticated CSR leads and super admins
router.use(authenticate);
router.use(authorize('csr_lead', 'super_admin'));

// 1. Dashboard
router.get('/dashboard', getCSRDashboard);

// 2. CSR Opportunities
router.get('/opportunities', getCSROpportunities);
router.get('/opportunities/:id', getCSROpportunityDetails);

// 3. Project Selection & Proposals
router.get('/project-selection', getCSRProjectSelection);
router.post('/proposals/:id/review', reviewCSRProposal);

// 4. Active CSR Projects & Monitoring
router.get('/projects', getCSRProjects);
router.get('/projects/:id', getCSRProjectDetails);

// 5. Funding Management & Releases
router.get('/funding', getCSRFunding);
router.post('/funding/release', createCSRFundingRelease);

// 6. Impact & Outcomes
router.get('/impact', getCSRImpact);

// 7. Reports
router.get('/reports', getCSRReports);
router.post('/reports', createCSRReport);

// 8. Profile
router.get('/profile', getCSRProfile);
router.patch('/profile', updateCSRProfile);
router.put('/profile', updateCSRProfile);

export default router;
