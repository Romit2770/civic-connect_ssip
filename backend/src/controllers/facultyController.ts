import { Request, Response } from 'express';
import { academicDataService } from '../services/academicDataService';
import { generateFacultyReportPdf } from '../services/facultyReportPdfService';

// Helper to retrieve authenticated faculty mentor name
const getMentorName = (req: Request): string => {
  return (req as any).user?.name || 'Prof. Ananya Sen';
};

// 1. Faculty Dashboard API
export const getFacultyDashboard = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);

    const myChallenges = academicDataService.getChallenges({ facultyMentor: mentorName });
    const myTeams = academicDataService.getTeams(mentorName);
    const myProjects = academicDataService.getProjects(mentorName);
    const myMilestones = academicDataService.getMilestones(mentorName);
    const myRequests = academicDataService.getCollaborationRequests(mentorName);

    // Pending reviews calculation
    let pendingReviews: any[] = [];
    myMilestones.forEach((m) => {
      if (m.submissions) {
        m.submissions.forEach((s) => {
          if (s.status === 'Pending Review') {
            pendingReviews.push({
              submissionId: s.id,
              milestoneId: m.id,
              milestoneName: m.name,
              projectTitle: m.projectTitle,
              studentTeam: s.studentTeam,
              submittedDate: s.submittedDate,
              description: s.description,
              filesCount: s.submittedFiles.length,
            });
          }
        });
      }
    });

    const activePartnersCount = myRequests.filter((r) => r.status === 'Accepted').length || 4;
    const upcomingMilestones = myMilestones
      .filter((m) => m.status === 'Upcoming' || m.status === 'In Progress')
      .slice(0, 6);

    res.json({
      success: true,
      data: {
        mentorName,
        stats: {
          myProjects: myProjects.length,
          activeTeams: myTeams.length,
          pendingReviews: pendingReviews.length,
          milestonesDue: myMilestones.filter((m) => m.status !== 'Completed').length,
          industryPartners: activePartnersCount,
        },
        activeProjects: myProjects.slice(0, 5),
        upcomingMilestones,
        pendingReviews,
        industryCollaborations: myRequests.slice(0, 4),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Challenges Scoped to Mentor
export const getFacultyChallenges = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const { status, search } = req.query;

    const challenges = academicDataService.getChallenges({
      facultyMentor: mentorName,
      status: status as string,
      search: search as string,
    });

    res.json({ success: true, data: challenges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacultyChallengeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = academicDataService.getChallengeById(id as string);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, data: challenge });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptMentorship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentorName = getMentorName(req);

    const updated = academicDataService.acceptChallengeMentorship(id as string, mentorName);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({
      success: true,
      message: `Mentorship accepted for challenge ${id}`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Teams Scoped to Mentor
export const getFacultyTeams = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const teams = academicDataService.getTeams(mentorName);

    res.json({ success: true, data: teams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeamTask = async (req: Request, res: Response) => {
  try {
    const { teamId, studentId } = req.params;
    const { task, taskStatus } = req.body;

    const updated = academicDataService.updateTeamMemberTask(
      teamId as string,
      studentId as string,
      task,
      taskStatus
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Team or student member not found' });
    }

    res.json({
      success: true,
      message: 'Student task updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Projects Scoped to Mentor
export const getFacultyProjects = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const projects = academicDataService.getProjects(mentorName);

    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Solution Proposals
export const getFacultyProposals = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const proposals = academicDataService.getProposals(mentorName);

    res.json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveFacultyProposal = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const proposalData = req.body;

    const saved = academicDataService.saveProposal({
      ...proposalData,
      facultyMentor: mentorName,
    });

    res.json({
      success: true,
      message: `Proposal ${saved.id} ${saved.status === 'Submitted' ? 'submitted' : 'saved'} successfully`,
      data: saved,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Milestones & Submissions Review
export const getFacultyMilestones = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const milestones = academicDataService.getMilestones(mentorName);

    res.json({ success: true, data: milestones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFacultyMilestone = async (req: Request, res: Response) => {
  try {
    const milestoneData = req.body;
    const created = academicDataService.createMilestone(milestoneData);

    res.status(201).json({
      success: true,
      message: 'Project milestone created successfully',
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { action, comment } = req.body;
    const mentorName = getMentorName(req);

    if (!['APPROVE', 'REQUEST REVISION', 'REJECT', 'ADD COMMENT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid review action' });
    }

    if (action === 'REQUEST REVISION' && (!comment || comment.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'A mentor comment explaining what needs to be changed is required when requesting revision.',
      });
    }

    const result = academicDataService.reviewSubmission(
      submissionId as string,
      action as any,
      comment,
      mentorName
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({
      success: true,
      message: `Submission ${action === 'APPROVE' ? 'approved' : action === 'REQUEST REVISION' ? 'marked for revision' : 'updated'} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Industry Collaboration
export const getFacultyIndustry = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const recommendedPartners = academicDataService.getIndustryPartners();
    const collaborationRequests = academicDataService.getCollaborationRequests(mentorName);

    res.json({
      success: true,
      data: {
        recommendedPartners,
        collaborationRequests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendIndustryCollaborationRequest = async (req: Request, res: Response) => {
  try {
    const reqData = req.body;
    const created = academicDataService.createCollaborationRequest(reqData);

    res.status(201).json({
      success: true,
      message: 'Industry collaboration request dispatched successfully',
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Reports
export const getFacultyReports = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const reports = academicDataService.getReports(mentorName);

    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFacultyReport = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const reportData = req.body;

    const created = academicDataService.createReport(reportData, mentorName);

    res.status(201).json({
      success: true,
      message: 'Project report submitted successfully',
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacultyReportBundle = async (req: Request, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const mentorName = getMentorName(req);

    const bundle = academicDataService.getReportBundle(reportId, mentorName);
    if (!bundle) {
      return res.status(404).json({ success: false, message: `Report ${reportId} not found` });
    }

    res.json({ success: true, data: bundle });
  } catch (error: any) {
    const status = error.message?.includes('Access denied') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const downloadFacultyReportPdf = async (req: Request, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const mentorName = getMentorName(req);

    const bundle = academicDataService.getReportBundle(reportId, mentorName);
    if (!bundle) {
      return res.status(404).json({ success: false, message: `Report ${reportId} not found` });
    }

    const pdfBuffer = generateFacultyReportPdf(bundle);

    const sanitizedType = (bundle.report.reportType || 'Report')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `CivicConnect_${bundle.report.id}_${sanitizedType}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Server PDF Generation Error:', error);
    const status = error.message?.includes('Access denied') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message?.includes('Access denied')
        ? error.message
        : 'Unable to generate the PDF. Please try again.',
    });
  }
};

// 9. Profile
export const getFacultyProfile = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const profile = academicDataService.getFacultyProfile(mentorName);

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFacultyProfile = async (req: Request, res: Response) => {
  try {
    const mentorName = getMentorName(req);
    const updates = req.body;

    const updated = academicDataService.updateFacultyProfile(mentorName, updates);

    res.json({
      success: true,
      message: 'Faculty profile updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
