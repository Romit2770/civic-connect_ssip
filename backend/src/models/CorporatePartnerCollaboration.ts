import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorshipSession {
  id: string;
  projectId: string;
  projectTitle: string;
  studentTeam: string;
  university: string;
  date: string;
  time: string;
  topic: string;
  meetingType: 'Online' | 'Offline' | 'Hybrid';
  meetingLink?: string;
  agenda?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: {
    technicalFeedback: string;
    studentProgress: string;
    strengths: string;
    issues: string;
    recommendedImprovements: string;
    nextSteps: string;
    submittedAt: string;
  };
}

export interface ITechnicalSupportItem {
  id: string;
  projectId: string;
  projectTitle: string;
  university: string;
  supportType: 'API' | 'Infrastructure' | 'Hardware' | 'Software' | 'Testing' | 'Technical Expertise' | 'Documentation' | 'Other';
  category: 'APIs' | 'Infrastructure' | 'Hardware' | 'Software' | 'Testing' | 'Expertise';
  description: string;
  requestedBy: string;
  date: string;
  expectedDelivery?: string;
  resourceDetails?: string;
  notes?: string;
  status: 'Requested' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined';
}

export interface IProjectDeliverable {
  id: string;
  projectId: string;
  projectTitle: string;
  deliverableName: string;
  submittedBy: string;
  submissionDate: string;
  version: string;
  partnerReviewStatus: 'Pending Review' | 'Reviewed & Approved' | 'Revision Requested';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Verified';
  feedback?: string;
  reviewedDate?: string;
}

export interface ITestingRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  testType: 'Functional' | 'Performance' | 'Security' | 'Hardware' | 'API' | 'Field' | 'Integration';
  environment: string;
  submittedDate: string;
  result: 'Passed' | 'Failed' | 'Conditional Pass' | 'Under Evaluation';
  partnerReviewStatus: 'Pending Review' | 'Verified' | 'Issues Flagged';
  feedback?: string;
  issuesFound?: string;
  recommendations?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface IAssignedProject {
  projectId: string;
  challengeId: string;
  projectTitle: string;
  university: string;
  facultyMentor: string;
  studentLead: string;
  studentTeam: string;
  domain: string;
  location: string;
  partnerRole: string;
  progress: number;
  currentMilestone: string;
  nextMilestone: string;
  status: 'Active' | 'Under Review' | 'Completed' | 'At Risk';
  currentStage: 'Proposal' | 'Approval' | 'Prototype' | 'Testing' | 'Field Pilot' | 'Deployment' | 'Completion';
  problemStatement: string;
  proposedSolution: string;
  technology: string;
  expectedOutcome: string;
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    progress: number;
    status: 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
    feedback?: string;
  }>;
}

export interface ICollaborationRecord {
  id: string;
  challengeId: string;
  projectId?: string;
  projectTitle: string;
  university: string;
  department: string;
  facultyMentor: string;
  studentLead: string;
  partnerRole: string;
  startDate: string;
  expectedDuration: string;
  supportType: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Declined';
  partnerResponsibilities: string[];
  universityResponsibilities: string[];
  expectedContribution: string;
  technicalResources: string;
  additionalMessage?: string;
}

export interface IProjectMessage {
  id: string;
  projectId: string;
  projectTitle: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  recipientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{ name: string; size: string }>;
}

export interface ICorporatePartnerCollaboration extends Document {
  partnerEmail: string;
  partnerName: string;
  designation: string;
  organizationName: string;
  department: string;
  officialEmail: string;
  officialContact: string;
  industryDomain: string;
  technicalExpertise: string[];
  professionalSkills: string[];
  yearsOfExperience: number;
  areasOfInterest: string[];
  mentorshipAreas: string[];
  assignedProjects: IAssignedProject[];
  collaborations: ICollaborationRecord[];
  mentorshipSessions: IMentorshipSession[];
  technicalSupportItems: ITechnicalSupportItem[];
  deliverables: IProjectDeliverable[];
  testingRecords: ITestingRecord[];
  messages: IProjectMessage[];
}

const CorporatePartnerCollaborationSchema = new Schema(
  {
    partnerEmail: { type: String, required: true, unique: true, index: true },
    partnerName: { type: String, required: true },
    designation: { type: String, default: 'Senior Technical Consultant' },
    organizationName: { type: String, default: 'Jindal Steel & Power Ltd.' },
    department: { type: String, default: 'Corporate Technology & Innovation Group' },
    officialEmail: { type: String, required: true },
    officialContact: { type: String, default: '+91 9835102906' },
    industryDomain: { type: String, default: 'Smart Infrastructure & Industrial IoT' },
    technicalExpertise: { type: [String], default: [] },
    professionalSkills: { type: [String], default: [] },
    yearsOfExperience: { type: Number, default: 14 },
    areasOfInterest: { type: [String], default: [] },
    mentorshipAreas: { type: [String], default: [] },
    assignedProjects: { type: Array, default: [] },
    collaborations: { type: Array, default: [] },
    mentorshipSessions: { type: Array, default: [] },
    technicalSupportItems: { type: Array, default: [] },
    deliverables: { type: Array, default: [] },
    testingRecords: { type: Array, default: [] },
    messages: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const CorporatePartnerCollaboration = mongoose.model<ICorporatePartnerCollaboration>(
  'CorporatePartnerCollaboration',
  CorporatePartnerCollaborationSchema
);
