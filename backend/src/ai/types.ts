import { z } from 'zod';
import { ComplaintCategory, ComplaintPriority } from '../types';

export const CorrectionItemSchema = z.object({
  step: z.number().int().min(1).max(4),
  field: z.string(),
  issue: z.string(),
  action: z.string(),
});

export type CorrectionItem = z.infer<typeof CorrectionItemSchema>;

export const DescriptionValidationSchema = z.object({
  valid: z.boolean(),
  reason: z.string(),
  suggestion: z.string().optional(),
});

export type DescriptionValidation = z.infer<typeof DescriptionValidationSchema>;

export const CategoryValidationSchema = z.object({
  matches: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type CategoryValidation = z.infer<typeof CategoryValidationSchema>;

export const EvidenceValidationSchema = z.object({
  relevant: z.boolean().default(true),
  quality: z.enum(['GOOD', 'ACCEPTABLE', 'POOR']).default('GOOD'),
  confidence: z.number().min(0).max(1).default(0.85),
  reason: z.string().default('Photographic evidence is relevant and authentic.'),
  // Compatibility fields
  overallStatus: z.enum(['valid', 'needs_attention', 'rejected']).default('valid'),
  isRelevant: z.boolean().default(true),
  isAcceptableQuality: z.boolean().default(true),
  syntheticRisk: z.enum(['low', 'medium', 'high']).default('low'),
  reasoning: z.string().default('Evidence verified as relevant photographic documentation.'),
  userMessage: z.string().default('Evidence verified successfully.'),
  allowSubmission: z.boolean().default(true),
});

export type EvidenceValidationParsed = z.infer<typeof EvidenceValidationSchema>;

export const LocationValidationSchema = z.object({
  gpsVerified: z.boolean().default(true),
  accuracy: z.number().default(10),
  reason: z.string().optional(),
});

export type LocationValidation = z.infer<typeof LocationValidationSchema>;

export const ImpactValidationSchema = z.object({
  consistent: z.boolean().default(true),
  reason: z.string().optional(),
});

export type ImpactValidation = z.infer<typeof ImpactValidationSchema>;

export const ProblemSinceValidationSchema = z.object({
  valid: z.boolean().default(true),
});

export type ProblemSinceValidation = z.infer<typeof ProblemSinceValidationSchema>;

export const AIAnalysisSchema = z.object({
  overallStatus: z.enum(['PASS', 'NEEDS_CORRECTION', 'REJECTED']).default('PASS'),
  descriptionValidation: DescriptionValidationSchema,
  categoryValidation: CategoryValidationSchema,
  evidenceValidation: EvidenceValidationSchema,
  locationValidation: LocationValidationSchema,
  impactValidation: ImpactValidationSchema,
  problemSinceValidation: ProblemSinceValidationSchema,
  identifiedProblem: z.string(),
  suggestedPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  severityScore: z.number().int().min(1).max(10),
  targetDepartment: z.string().default('public_works'),
  recommendedAction: z.string(),
  corrections: z.array(CorrectionItemSchema).default([]),

  // Backwards compatibility properties for database models and existing consumers
  category: z.enum([
    'pothole',
    'garbage',
    'streetlight',
    'water',
    'drainage',
    'road_damage',
    'public_property',
    'fallen_tree',
    'illegal_dumping',
    'traffic',
    'other',
  ]).default('other'),
  subcategory: z.string().default('General civic issue'),
  severity: z.number().int().min(1).max(10).default(5),
  priorityRecommendation: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  departmentSlug: z.string().default('public_works'),
  summary: z.string().default('Civic grievance analysis completed.'),
  hazards: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.85),
  reasoning: z.string().default('AI verification completed.'),
  detectedObjects: z.array(z.string()).default([]),
});

export type AIAnalysisParsed = z.infer<typeof AIAnalysisSchema>;

export interface AIAnalysisInput {
  description: string;
  category?: string;
  subcategory?: string;
  otherCategoryText?: string;
  voiceTranscript?: string;
  problemImpact?: string[];
  problemSince?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  evidenceMetadata?: any;
  photos?: Array<{
    url?: string;
    buffer?: Buffer;
    mimeType?: string;
  }>;
}

export interface AIAnalysisResult {
  overallStatus: 'PASS' | 'NEEDS_CORRECTION' | 'REJECTED';
  descriptionValidation: {
    valid: boolean;
    reason: string;
    suggestion?: string;
  };
  categoryValidation: {
    matches: boolean;
    confidence: number;
    reason: string;
  };
  evidenceValidation: {
    relevant: boolean;
    quality: 'GOOD' | 'ACCEPTABLE' | 'POOR';
    confidence: number;
    reason: string;
    overallStatus?: 'valid' | 'needs_attention' | 'rejected';
    isRelevant?: boolean;
    isAcceptableQuality?: boolean;
    syntheticRisk?: 'low' | 'medium' | 'high';
    reasoning?: string;
    userMessage?: string;
    allowSubmission?: boolean;
  };
  locationValidation: {
    gpsVerified: boolean;
    accuracy: number;
    reason?: string;
  };
  impactValidation: {
    consistent: boolean;
    reason?: string;
  };
  problemSinceValidation: {
    valid: boolean;
  };
  identifiedProblem: string;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  targetDepartment: string;
  recommendedAction: string;
  corrections: CorrectionItem[];
  duplicateInfo?: {
    isDuplicate: boolean;
    masterComplaintId?: any;
    masterComplaintNumber?: string;
    masterComplaintTitle?: string;
    masterComplaintStatus?: string;
    masterComplaintDate?: Date;
    nearbyCount?: number;
  };

  // Legacy mappings
  category: ComplaintCategory;
  subcategory: string;
  severity: number;
  priority: ComplaintPriority;
  departmentSlug: string;
  summary: string;
  hazards: string[];
  confidence: number;
  reasoning: string;
  analysisMethod: string;
  detectedObjects: string[];
}

export interface ResolutionVerificationInput {
  initialPhotoUrl?: string;
  initialPhotoBuffer?: Buffer;
  resolutionPhotoUrl?: string;
  resolutionPhotoBuffer?: Buffer;
  category: string;
  description: string;
  officerRemarks?: string;
}

export interface ResolutionVerificationResult {
  status: 'likely_resolved' | 'likely_not_resolved' | 'uncertain';
  confidence: number;
  reasoning: string;
  detectedChanges: string[];
  recommendation: 'citizen_verification' | 'admin_inspection' | 'rework_required';
}
