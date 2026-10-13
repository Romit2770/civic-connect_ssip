import mongoose, { Schema, Document } from 'mongoose';

export interface ICSRMilestone {
  id: string;
  title: string;
  dueDate: string;
  progress: number;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface ICSRDeliverable {
  id: string;
  title: string;
  submittedBy: string;
  submissionDate: string;
  reviewStatus: 'Pending Review' | 'Verified' | 'Changes Requested';
  documentUrl?: string;
}

export interface ICSRRisk {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedDate: string;
  responsiblePerson: string;
  resolution: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface ICSRProject {
  projectId: string;
  challengeId: string;
  projectTitle: string;
  university: string;
  studentTeam: string;
  facultyMentor: string;
  industryMentor: string;
  csrProjectLead: string;
  domain: string;
  location: string;
  stage: 'Proposal' | 'Approved' | 'Funding Released' | 'Prototype' | 'Testing' | 'Field Deployment' | 'Impact Assessment' | 'Completed';
  progress: number;
  approvedBudget: number; // in Rupees
  releasedFunding: number; // in Rupees
  utilizedFunding: number; // in Rupees
  remainingFunding: number; // approvedBudget - releasedFunding
  status: 'Active' | 'At Risk' | 'Delayed' | 'Completed';
  nextMilestone: string;
  photoUrl?: string;
  milestones: ICSRMilestone[];
  deliverables: ICSRDeliverable[];
  risks: ICSRRisk[];
  impact: {
    targetCommunity: string;
    peopleBenefited: number;
    villagesCovered: number;
    measuredOutcome: string;
    infrastructureCreated: string;
    serviceImprovement: string;
    costReduction: string;
    environmentalImpact: string;
    verificationStatus: 'Pending Audit' | 'Third-Party Audited' | 'MoE Validated';
  };
}

export interface ICSRFundingRelease {
  id: string;
  projectId: string;
  projectTitle: string;
  university: string;
  releaseAmount: number;
  releaseDate: string;
  fundingPhase: string;
  referenceNumber: string;
  notes: string;
  recordedBy: string;
}

export interface ICSRProposal {
  id: string;
  challengeId: string;
  title: string;
  university: string;
  facultyMentor: string;
  studentTeam: string;
  domain: string;
  location: string;
  budget: number;
  expectedImpact: string;
  submissionDate: string;
  status: 'Pending Review' | 'Shortlisted' | 'Approved' | 'Changes Requested' | 'Rejected';
  problemStatement: string;
  proposedSolution: string;
  technology: string;
  expectedOutcomes: string;
  timeline: string;
  csrDomain: string;
  csrImpact: string;
  targetCommunity: string;
  geographicalCoverage: string;
  sustainabilityPotential: string;
  estimatedCsrRequirement: number;
  universityContribution: string;
  industryContribution: string;
  reviewDecision?: {
    decision: 'Approved' | 'Changes Requested' | 'Rejected' | 'Shortlisted';
    reviewer: string;
    reviewDate: string;
    comments: string;
  };
}

export interface ICSRReport {
  id: string;
  projectId: string;
  projectTitle: string;
  reportType: 'CSR Project Report' | 'Financial Report' | 'Impact Report' | 'Project Progress Report' | 'Final CSR Report';
  period: string;
  title: string;
  summary: string;
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved';
  submittedDate: string;
  reviewedBy: string;
  executiveSummary?: string;
  problemStatement?: string;
  solution?: string;
  progressPercent?: number;
  fundingSummary?: {
    approvedAmount: number;
    releasedAmount: number;
    utilizedAmount: number;
    remainingAmount: number;
  };
  socialImpactSummary?: {
    peopleBenefited: number;
    areasCovered: string;
    measuredOutcomes: string;
  };
  nextSteps?: string;
}

export interface ICSRInitiativeDoc extends Document {
  organizationName: string;
  department: string;
  contactPerson: string;
  officialEmail: string;
  contactNumber: string;
  cinNumber: string;
  csrRegistrationNumber: string;
  annualBudgetPool: number;
  allocatedBudget: number;
  releasedBudget: number;
  utilizedBudget: number;
  remainingBudget: number;
  communitiesReached: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalInitiativesCount: number;
  csrDomains: string[];
  areasOfExpertise: string[];
  industryPartnerships: string[];
  projects: ICSRProject[];
  fundingReleases: ICSRFundingRelease[];
  proposals: ICSRProposal[];
  reports: ICSRReport[];
  createdAt: Date;
  updatedAt: Date;
}

const csrMilestoneSchema = new Schema<ICSRMilestone>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  dueDate: { type: String, required: true },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['Upcoming', 'In Progress', 'Completed', 'Delayed'], default: 'Upcoming' },
});

const csrDeliverableSchema = new Schema<ICSRDeliverable>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  submittedBy: { type: String, required: true },
  submissionDate: { type: String, required: true },
  reviewStatus: { type: String, enum: ['Pending Review', 'Verified', 'Changes Requested'], default: 'Pending Review' },
  documentUrl: { type: String },
});

const csrRiskSchema = new Schema<ICSRRisk>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  reportedDate: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  resolution: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'Mitigated', 'Closed'], default: 'Open' },
});

const csrProjectSchema = new Schema<ICSRProject>({
  projectId: { type: String, required: true, index: true },
  challengeId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  university: { type: String, required: true },
  studentTeam: { type: String, required: true },
  facultyMentor: { type: String, required: true },
  industryMentor: { type: String, required: true },
  csrProjectLead: { type: String, required: true },
  domain: { type: String, required: true },
  location: { type: String, required: true },
  stage: {
    type: String,
    enum: ['Proposal', 'Approved', 'Funding Released', 'Prototype', 'Testing', 'Field Deployment', 'Impact Assessment', 'Completed'],
    default: 'Approved',
  },
  progress: { type: Number, default: 0 },
  approvedBudget: { type: Number, required: true },
  releasedFunding: { type: Number, default: 0 },
  utilizedFunding: { type: Number, default: 0 },
  remainingFunding: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'At Risk', 'Delayed', 'Completed'], default: 'Active' },
  nextMilestone: { type: String, default: '' },
  photoUrl: { type: String },
  milestones: [csrMilestoneSchema],
  deliverables: [csrDeliverableSchema],
  risks: [csrRiskSchema],
  impact: {
    targetCommunity: { type: String, default: '' },
    peopleBenefited: { type: Number, default: 0 },
    villagesCovered: { type: Number, default: 0 },
    measuredOutcome: { type: String, default: '' },
    infrastructureCreated: { type: String, default: '' },
    serviceImprovement: { type: String, default: '' },
    costReduction: { type: String, default: '' },
    environmentalImpact: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['Pending Audit', 'Third-Party Audited', 'MoE Validated'],
      default: 'Third-Party Audited',
    },
  },
});

const csrFundingReleaseSchema = new Schema<ICSRFundingRelease>({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  university: { type: String, required: true },
  releaseAmount: { type: Number, required: true },
  releaseDate: { type: String, required: true },
  fundingPhase: { type: String, required: true },
  referenceNumber: { type: String, required: true },
  notes: { type: String, default: '' },
  recordedBy: { type: String, required: true },
});

const csrProposalSchema = new Schema<ICSRProposal>({
  id: { type: String, required: true, index: true },
  challengeId: { type: String, required: true },
  title: { type: String, required: true },
  university: { type: String, required: true },
  facultyMentor: { type: String, required: true },
  studentTeam: { type: String, required: true },
  domain: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  expectedImpact: { type: String, required: true },
  submissionDate: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending Review', 'Shortlisted', 'Approved', 'Changes Requested', 'Rejected'],
    default: 'Pending Review',
  },
  problemStatement: { type: String, required: true },
  proposedSolution: { type: String, required: true },
  technology: { type: String, required: true },
  expectedOutcomes: { type: String, required: true },
  timeline: { type: String, required: true },
  csrDomain: { type: String, required: true },
  csrImpact: { type: String, required: true },
  targetCommunity: { type: String, required: true },
  geographicalCoverage: { type: String, required: true },
  sustainabilityPotential: { type: String, required: true },
  estimatedCsrRequirement: { type: Number, required: true },
  universityContribution: { type: String, required: true },
  industryContribution: { type: String, required: true },
  reviewDecision: {
    decision: { type: String, enum: ['Approved', 'Changes Requested', 'Rejected', 'Shortlisted'] },
    reviewer: { type: String },
    reviewDate: { type: String },
    comments: { type: String },
  },
});

const csrReportSchema = new Schema<ICSRReport>({
  id: { type: String, required: true, index: true },
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  reportType: {
    type: String,
    enum: ['CSR Project Report', 'Financial Report', 'Impact Report', 'Project Progress Report', 'Final CSR Report'],
    required: true,
  },
  period: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Submitted', 'Reviewed', 'Approved'], default: 'Approved' },
  submittedDate: { type: String, required: true },
  reviewedBy: { type: String, required: true },
  executiveSummary: { type: String },
  problemStatement: { type: String },
  solution: { type: String },
  progressPercent: { type: Number },
  fundingSummary: {
    approvedAmount: { type: Number },
    releasedAmount: { type: Number },
    utilizedAmount: { type: Number },
    remainingAmount: { type: Number },
  },
  socialImpactSummary: {
    peopleBenefited: { type: Number },
    areasCovered: { type: String },
    measuredOutcomes: { type: String },
  },
  nextSteps: { type: String },
});

const csrInitiativeSchema = new Schema<ICSRInitiativeDoc>(
  {
    organizationName: { type: String, default: 'Tata Steel Utilities & Infrastructure' },
    department: { type: String, default: 'CSR & Innovation Division' },
    contactPerson: { type: String, default: 'Meera Chawla' },
    officialEmail: { type: String, default: 'csr.lead@tata.com' },
    contactNumber: { type: String, default: '+91 9835102905' },
    cinNumber: { type: String, default: 'CIN: U45200JH1993PLC005396' },
    csrRegistrationNumber: { type: String, default: 'CSR00018492' },
    annualBudgetPool: { type: Number, default: 25000000 }, // ₹2.50 Cr
    allocatedBudget: { type: Number, default: 18500000 }, // ₹1.85 Cr
    releasedBudget: { type: Number, default: 11200000 }, // ₹1.12 Cr
    utilizedBudget: { type: Number, default: 9640000 }, // ₹96.40 L
    remainingBudget: { type: Number, default: 7360000 }, // ₹73.60 L
    communitiesReached: { type: Number, default: 24850 },
    activeProjectsCount: { type: Number, default: 7 },
    completedProjectsCount: { type: Number, default: 5 },
    totalInitiativesCount: { type: Number, default: 12 },
    csrDomains: [{ type: String }],
    areasOfExpertise: [{ type: String }],
    industryPartnerships: [{ type: String }],
    projects: [csrProjectSchema],
    fundingReleases: [csrFundingReleaseSchema],
    proposals: [csrProposalSchema],
    reports: [csrReportSchema],
  },
  { timestamps: true }
);

export const CSRInitiative = mongoose.model<ICSRInitiativeDoc>('CSRInitiative', csrInitiativeSchema);
