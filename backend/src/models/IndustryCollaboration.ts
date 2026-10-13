import mongoose, { Schema, Document } from 'mongoose';

export interface IIndustryMentor {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  expertise: string[];
  technicalSkills: string[];
  experienceYears: number;
  availableFor: string[];
  assignedProjects: string[];
  availability: 'Available' | 'Assigned' | 'Busy';
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface ICollaborationRequest {
  id: string;
  challengeId: string;
  projectTitle: string;
  universityName: string;
  facultyMentor: string;
  domain: string;
  requiredSupport: string;
  technicalExpertise: string[];
  expectedDuration: string;
  fundingRequirement: string;
  equipmentRequirement: string;
  testingRequirement: string;
  fieldDeployment: string;
  additionalNotes?: string;
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Declined';
  requestDate: string;
}

export interface IUniversityProposal {
  id: string;
  university: string;
  projectTitle: string;
  challengeId: string;
  facultyMentor: string;
  requiredSupport: string;
  estimatedBudget: string;
  timeline: string;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Revision Requested' | 'Rejected';
  submissionDate: string;
  technicalScope: string;
}

export interface IFundingCommitment {
  id: string;
  projectId: string;
  projectTitle: string;
  university: string;
  committedAmount: number;
  disbursedAmount: number;
  remainingAmount: number;
  commitmentDate: string;
  expectedDisbursementDate: string;
  fundingPurpose: string;
  status: 'Proposed' | 'Committed' | 'Partially Disbursed' | 'Disbursed' | 'Completed' | 'Cancelled';
  documents: { title: string; filename: string; date: string }[];
}

export interface IIndustryCollaborationDoc extends Document {
  organizationName: string;
  registrationId: string;
  industryDomain: string;
  location: string;
  officialEmail: string;
  website: string;
  csrFocusAreas: string[];
  technicalExpertise: string[];
  testingFacilities: string[];
  equipmentSupport: string[];
  fieldDeploymentCapability: string;
  fundingCapacity: string;
  partnershipsCount: number;
  completedCollaborationsCount: number;
  teamMembers: IIndustryMentor[];
  collaborationRequests: ICollaborationRequest[];
  proposals: IUniversityProposal[];
  fundingCommitments: IFundingCommitment[];
  updatedAt: Date;
  createdAt: Date;
}

const industryMentorSchema = new Schema<IIndustryMentor>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  expertise: [{ type: String }],
  technicalSkills: [{ type: String }],
  experienceYears: { type: Number, default: 5 },
  availableFor: [{ type: String }],
  assignedProjects: [{ type: String }],
  availability: { type: String, enum: ['Available', 'Assigned', 'Busy'], default: 'Available' },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
});

const collaborationRequestSchema = new Schema<ICollaborationRequest>({
  id: { type: String, required: true },
  challengeId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  universityName: { type: String, required: true },
  facultyMentor: { type: String, required: true },
  domain: { type: String, required: true },
  requiredSupport: { type: String, required: true },
  technicalExpertise: [{ type: String }],
  expectedDuration: { type: String, required: true },
  fundingRequirement: { type: String, required: true },
  equipmentRequirement: { type: String, default: 'None' },
  testingRequirement: { type: String, default: 'Standard' },
  fieldDeployment: { type: String, default: 'Local Municipal Ward' },
  additionalNotes: { type: String },
  status: { type: String, enum: ['Pending', 'Under Review', 'Accepted', 'Declined'], default: 'Pending' },
  requestDate: { type: String, required: true },
});

const universityProposalSchema = new Schema<IUniversityProposal>({
  id: { type: String, required: true },
  university: { type: String, required: true },
  projectTitle: { type: String, required: true },
  challengeId: { type: String, required: true },
  facultyMentor: { type: String, required: true },
  requiredSupport: { type: String, required: true },
  estimatedBudget: { type: String, required: true },
  timeline: { type: String, required: true },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Accepted', 'Revision Requested', 'Rejected'],
    default: 'Submitted',
  },
  submissionDate: { type: String, required: true },
  technicalScope: { type: String, required: true },
});

const fundingCommitmentSchema = new Schema<IFundingCommitment>({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  university: { type: String, required: true },
  committedAmount: { type: Number, required: true },
  disbursedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  commitmentDate: { type: String, required: true },
  expectedDisbursementDate: { type: String, required: true },
  fundingPurpose: { type: String, required: true },
  status: {
    type: String,
    enum: ['Proposed', 'Committed', 'Partially Disbursed', 'Disbursed', 'Completed', 'Cancelled'],
    default: 'Committed',
  },
  documents: [
    {
      title: { type: String },
      filename: { type: String },
      date: { type: String },
    },
  ],
});

const industryCollaborationSchema = new Schema<IIndustryCollaborationDoc>(
  {
    organizationName: { type: String, required: true, default: 'Tata Steel Utilities & Infrastructure' },
    registrationId: { type: String, required: true, default: 'CIN: U45200JH1993PLC005396' },
    industryDomain: { type: String, required: true, default: 'Urban Infrastructure & Smart Utility Management' },
    location: { type: String, required: true, default: 'Jamshedpur, Jharkhand' },
    officialEmail: { type: String, required: true, default: 'industry.admin@tatasteel.com' },
    website: { type: String, default: 'https://www.tatasteeluisil.com' },
    csrFocusAreas: [{ type: String }],
    technicalExpertise: [{ type: String }],
    testingFacilities: [{ type: String }],
    equipmentSupport: [{ type: String }],
    fieldDeploymentCapability: { type: String, default: 'Active Jamshedpur Municipal Corporation Pilot Access' },
    fundingCapacity: { type: String, default: '₹ 50,00,000 Annual CSR Innovation Ceiling' },
    partnershipsCount: { type: Number, default: 6 },
    completedCollaborationsCount: { type: Number, default: 9 },
    teamMembers: [industryMentorSchema],
    collaborationRequests: [collaborationRequestSchema],
    proposals: [universityProposalSchema],
    fundingCommitments: [fundingCommitmentSchema],
  },
  { timestamps: true }
);

export const IndustryCollaboration = mongoose.model<IIndustryCollaborationDoc>(
  'IndustryCollaboration',
  industryCollaborationSchema
);
