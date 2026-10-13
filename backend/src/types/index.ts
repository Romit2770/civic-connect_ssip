export type UserRole =
  | 'citizen'
  | 'field_officer'
  | 'field_worker'
  | 'department_officer'
  | 'municipal_admin'
  | 'super_admin'
  | 'university_admin'
  | 'faculty_mentor'
  | 'student_lead'
  | 'industry_admin'
  | 'csr_lead'
  | 'corporate_partner';

export type ComplaintStatus =
  | 'submitted'
  | 'acknowledged'
  | 'validated'
  | 'routed'
  | 'assigned'
  | 'in_progress'
  | 'resolution_submitted'
  | 'verification_pending'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type SLAState = 'within_sla' | 'due_soon' | 'breached' | 'escalated';

export type ComplaintCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water'
  | 'drainage'
  | 'road_damage'
  | 'public_property'
  | 'fallen_tree'
  | 'illegal_dumping'
  | 'traffic'
  | 'other';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

export interface MediaAsset {
  url: string;
  provider: 'local' | 'cloudinary' | 's3';
  publicId?: string;
  mimeType: string;
  sizeBytes: number;
  mediaType: 'image' | 'video' | 'audio';
  originalName?: string;
}

export type PhotoAsset = MediaAsset;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
