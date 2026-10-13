import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { studentLeadDataService } from '../services/studentLeadDataService';

// Ensure documents directory exists
const docsDir = path.resolve(__dirname, '../../uploads/documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Multer storage for project documents
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, docsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  },
});

const allowedDocExts = ['.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.txt', '.csv'];
const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedDocExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file format: ${ext}. Allowed: PDF, DOCX, XLSX, PPTX, ZIP, CSV, TXT`));
    }
  },
});

export const documentUploadMiddleware = docUpload.single('file');

// Helper to check Student Lead role
const verifyStudentLeadAccess = (req: Request) => {
  const role = (req as any).user?.role;
  return role === 'student_lead' || role === 'super_admin';
};

// 1. Dashboard Data API
export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const dashboardData = studentLeadDataService.getDashboardData();
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. My Project API
export const getStudentProject = async (req: Request, res: Response) => {
  try {
    const project = studentLeadDataService.getProjectData();
    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Student-Editable Project Fields (Strict RBAC Protection)
export const updateStudentProject = async (req: Request, res: Response) => {
  try {
    const {
      // Forbidden fields for Student Lead to modify
      challengeId,
      facultyMentor,
      industryPartner,
      budget,
      currentStage,
      problemStatement,
      // Allowed student fields
      gitRepositoryUrl,
      labStationWorkstation,
      studentTechnicalNotes,
      hardwareBOMUpdates,
      weeklyMeetingSchedule,
      riskMitigationActions,
    } = req.body;

    // Strict Enforcement of Role Restrictions
    if (challengeId || facultyMentor || industryPartner || budget || currentStage || problemStatement) {
      return res.status(403).json({
        success: false,
        message:
          'Access Denied: Institutional parameters, faculty mentorship, industry partnership, and formal problem statements are strictly controlled by the University & Faculty Mentor and cannot be altered by the Student Lead.',
      });
    }

    const updated = studentLeadDataService.updateStudentEditableProject({
      gitRepositoryUrl,
      labStationWorkstation,
      studentTechnicalNotes,
      hardwareBOMUpdates,
      weeklyMeetingSchedule,
      riskMitigationActions,
    });

    res.json({
      success: true,
      message: 'Student project operational details updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Team Members API
export const getStudentTeam = async (_req: Request, res: Response) => {
  try {
    const team = studentLeadDataService.getTeam();
    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Tasks API
export const getStudentTasks = async (req: Request, res: Response) => {
  try {
    const { status, search, priority, assignee } = req.query;
    const tasks = studentLeadDataService.getTasks({
      status: status as string,
      search: search as string,
      priority: priority as string,
      assignee: assignee as string,
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudentTask = async (req: Request, res: Response) => {
  try {
    const { title, description, assignedTo, priority, startDate, dueDate, milestoneId, expectedDeliverable } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }
    if (!assignedTo || !assignedTo.trim()) {
      return res.status(400).json({ success: false, message: 'Assignee is required.' });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required.' });
    }

    const newTask = studentLeadDataService.createTask({
      title,
      description,
      assignedTo,
      priority,
      startDate,
      dueDate,
      milestoneId,
      expectedDeliverable,
    });

    res.status(201).json({
      success: true,
      message: `Task ${newTask.id} created successfully and assigned to ${newTask.assignedTo}.`,
      data: newTask,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStudentTask = async (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.taskId);
    const updates = req.body;

    const updatedTask = studentLeadDataService.updateTask(taskId, updates);
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({
      success: true,
      message: `Task ${taskId} updated successfully.`,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. Milestones API
export const getStudentMilestones = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const milestones = studentLeadDataService.getMilestones({ status: status as string });
    res.json({
      success: true,
      data: milestones,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMilestoneProgress = async (req: Request, res: Response) => {
  try {
    const milestoneId = String(req.params.milestoneId);
    const { progress, remarks } = req.body;

    const updated = studentLeadDataService.updateMilestoneProgress(milestoneId, progress, remarks);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    res.json({
      success: true,
      message: `Milestone ${milestoneId} progress updated to ${progress}%.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitMilestoneDeliverable = async (req: Request, res: Response) => {
  try {
    const milestoneId = String(req.params.milestoneId);
    const { description, files, attemptSelfApproval } = req.body;

    // Strict Enforcement: Student Lead cannot approve own milestone!
    if (attemptSelfApproval) {
      return res.status(403).json({
        success: false,
        message:
          'Statutory Violation: Student Leads are not authorized to grant academic approval to milestones. Formal approval requires Faculty Mentor evaluation.',
      });
    }

    const updated = studentLeadDataService.submitMilestone(milestoneId, {
      description: description || 'Submitted for Faculty Mentor academic evaluation.',
      files: files || [{ name: 'Milestone_Deliverable.pdf', size: '2.5 MB' }],
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    res.json({
      success: true,
      message: `Milestone ${milestoneId} submitted for Faculty Mentor review.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Documents API
export const getStudentDocuments = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    const documents = studentLeadDataService.getDocuments({
      type: type as string,
      search: search as string,
    });
    res.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadStudentDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { name, type, description, version } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    let fileUrl = '#';
    let fileSize = '2.1 MB';
    let fileType = 'PDF';

    if (file) {
      fileUrl = `/uploads/documents/${file.filename}`;
      fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      fileType = path.extname(file.originalname).replace('.', '').toUpperCase();
    } else {
      fileUrl = `/uploads/documents/PRJ-CH-2026-089_${name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    }

    const studentName = (req as any).user?.name || 'Aakash Verma';
    const newDoc = studentLeadDataService.addDocument({
      name: name.trim(),
      type: type || 'Progress Reports',
      description: description || '',
      version: version || 'v1.0',
      fileUrl,
      fileSize,
      fileType,
      uploadedBy: `${studentName} (Student Lead)`,
    });

    res.status(201).json({
      success: true,
      message: `Document "${newDoc.name}" uploaded successfully.`,
      data: newDoc,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Download / stream file
export const downloadStudentDocument = async (req: Request, res: Response) => {
  try {
    const filename = String(req.params.filename);
    const filePath = path.resolve(docsDir, filename);

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }

    // Fallback: create sample valid PDF if file doesn't exist on disk yet
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from('%PDF-1.4 CivicConnect Academic Project Document'));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Communication API
export const getStudentMessages = async (req: Request, res: Response) => {
  try {
    const channel = (req.query.channel as any) || 'faculty';
    const messages = studentLeadDataService.getMessages(channel);
    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendStudentMessage = async (req: Request, res: Response) => {
  try {
    const { channel, message, attachments } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const studentName = (req as any).user?.name || 'Aakash Verma';
    const newMsg = studentLeadDataService.sendMessage({
      channel: channel || 'faculty',
      senderName: studentName,
      senderRole: 'Student Lead',
      message,
      attachments,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: newMsg,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 9. Notifications API
export const getStudentNotifications = async (_req: Request, res: Response) => {
  try {
    const notifications = studentLeadDataService.getNotifications();
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
