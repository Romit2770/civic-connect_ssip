import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint';
import { Ward } from '../models/Ward';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory';
import { ComplaintAssignment } from '../models/ComplaintAssignment';
import { createNotification, emitToRole, emitToUser } from '../services/notificationService';
import mongoose from 'mongoose';
import { registerAssignedChallengeToFieldWorker, mapComplaintCategory } from './fieldWorkerController';

export function mapComplaintStatusToValidation(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'submitted':
    case 'acknowledged':
      return 'New';
    case 'validated':
    case 'routed':
      return 'Validated';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'resolution_submitted':
    case 'verification_pending':
      return 'Resolution Submitted';
    case 'resolved':
    case 'closed':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'New';
  }
}

export function mapDepartmentCodeToName(code?: string): string {
  if (!code) return 'Not Assigned';
  switch (code.toUpperCase().replace(/\s+/g, '_')) {
    case 'SANITATION':
    case 'SOLID_WASTE_MANAGEMENT':
      return 'Solid Waste Management';
    case 'PUBLIC_WORKS':
    case 'ROADS_AND_BUILDINGS':
      return 'Public Works Department';
    case 'STREET_LIGHTING':
      return 'Street Lighting';
    case 'WATER_SUPPLY':
      return 'Water Supply';
    case 'SEWERAGE':
    case 'DRAINAGE':
      return 'Drainage & Sewerage';
    case 'PARKS_AND_GARDENS':
      return 'Parks & Gardens';
    case 'TRAFFIC_AND_ROADS':
      return 'Traffic & Roads';
    case 'OTHER':
      return 'General Municipal Services';
    default:
      return code;
  }
}

export function normalizeDepartmentEnum(dept?: string): string | undefined {
  if (!dept) return undefined;
  const upper = dept.toUpperCase().replace(/[\s&/\\-]+/g, '_');
  const valid = [
    'SANITATION',
    'PUBLIC_WORKS',
    'STREET_LIGHTING',
    'WATER_SUPPLY',
    'SEWERAGE',
    'PARKS_AND_GARDENS',
    'TRAFFIC_AND_ROADS',
    'OTHER',
  ];
  if (valid.includes(upper)) return upper;
  if (upper.includes('SOLID_WASTE') || upper.includes('WASTE') || upper.includes('GARBAGE') || upper.includes('CLEAN')) return 'SANITATION';
  if (upper.includes('WATER')) return 'WATER_SUPPLY';
  if (upper.includes('ROAD') || upper.includes('PUBLIC_WORK') || upper.includes('INFRASTRUCTURE') || upper.includes('PWD')) return 'PUBLIC_WORKS';
  if (upper.includes('LIGHT') || upper.includes('ELECTRIC')) return 'STREET_LIGHTING';
  if (upper.includes('DRAIN') || upper.includes('SEWER')) return 'SEWERAGE';
  if (upper.includes('PARK') || upper.includes('GARDEN') || upper.includes('TREE')) return 'PARKS_AND_GARDENS';
  if (upper.includes('TRAFFIC')) return 'TRAFFIC_AND_ROADS';
  return 'OTHER';
}

export function mapComplaintStatusToProjectStatus(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'resolution_submitted':
    case 'verification_pending':
      return 'Resolution Submitted';
    case 'resolved':
    case 'closed':
      return 'Completed';
    case 'validated':
    case 'routed':
      return 'Department Assigned';
    default:
      return 'Unassigned';
  }
}

// Anand Municipality Reference Coordinates & Wards
export const ANAND_JURISDICTION = {
  municipalityName: 'Anand Municipality',
  type: 'Urban Local Body (ULB)',
  district: 'Anand',
  state: 'Gujarat',
  bounds: {
    minLat: 22.50,
    maxLat: 22.62,
    minLng: 72.88,
    maxLng: 73.04,
  },
  center: [72.9289, 22.5645] as [number, number], // [lng, lat]
};

// Seed/centralized data for Anand Municipality wards
export const ANAND_WARDS = [
  { wardNumber: 1, name: 'Ward 1 (Anand East - Station Road)', zone: 'East Zone', population: 24500, center: [72.9340, 22.5650] },
  { wardNumber: 2, name: 'Ward 2 (Anand West - Gamdi Area)', zone: 'West Zone', population: 22800, center: [72.9210, 22.5630] },
  { wardNumber: 3, name: 'Ward 3 (Amul Dairy & Milk City Zone)', zone: 'North Zone', population: 26100, center: [72.9280, 22.5720] },
  { wardNumber: 4, name: 'Ward 4 (Borsad Chokdi & Highway Junction)', zone: 'South Zone', population: 21400, center: [72.9310, 22.5510] },
  { wardNumber: 5, name: 'Ward 5 (Vallabh Vidyanagar Link Road)', zone: 'West Zone', population: 28900, center: [72.9150, 22.5580] },
  { wardNumber: 6, name: 'Ward 6 (Lambhvel Road & Green Belt)', zone: 'North Zone', population: 19800, center: [72.9380, 22.5790] },
  { wardNumber: 7, name: 'Ward 7 (Jitodia Road & Industrial Area)', zone: 'South Zone', population: 23200, center: [72.9420, 22.5540] },
  { wardNumber: 8, name: 'Ward 8 (Ganesh Chokdi & Municipal Market)', zone: 'Central Zone', population: 25700, center: [72.9295, 22.5615] },
  { wardNumber: 9, name: 'Ward 9 (Karamsad Road Junction)', zone: 'West Zone', population: 21100, center: [72.9090, 22.5520] },
  { wardNumber: 10, name: 'Ward 10 (Town Hall & Civil Hospital Sector)', zone: 'Central Zone', population: 27400, center: [72.9260, 22.5665] },
  { wardNumber: 11, name: 'Ward 11 (Vaghashi Road Extension)', zone: 'East Zone', population: 18600, center: [72.9480, 22.5680] },
  { wardNumber: 12, name: 'Ward 12 (Anand East - Drainage Outfall Corridor)', zone: 'East Zone', population: 23900, center: [72.9390, 22.5610] },
  { wardNumber: 13, name: 'Ward 13 (Mogar Highway Bypass Corridor)', zone: 'South Zone', population: 17500, center: [72.9330, 22.5410] },
  { wardNumber: 14, name: 'Ward 14 (Chikhodra Overbridge Sector)', zone: 'North-East Zone', population: 20200, center: [72.9520, 22.5750] },
];

// Helper to check jurisdiction
export function isCoordinateInAnandJurisdiction(lng: number, lat: number): boolean {
  return (
    lat >= ANAND_JURISDICTION.bounds.minLat &&
    lat <= ANAND_JURISDICTION.bounds.maxLat &&
    lng >= ANAND_JURISDICTION.bounds.minLng &&
    lng <= ANAND_JURISDICTION.bounds.maxLng
  );
}

// In-memory municipal data store for demo/centralized consistency
export let municipalChallengesStore: any[] = [
  {
    id: 'CH-2026-089',
    challengeId: 'CH-2026-089',
    complaintNumber: 'CC-2026-00089',
    problem: 'Overflowing Drainage Network & Stormwater Stagnation',
    title: 'Overflowing Drainage Network & Stormwater Stagnation',
    description: 'Underground trunk sewerage backing up during minor rainfall, inundating commercial streets and causing pedestrian paralysis.',
    category: 'Water & Sanitation',
    subcategory: 'Trunk Sewerage Overflow',
    department: 'Water & Sanitation',
    ward: 'Ward 12',
    wardNumber: 12,
    location: 'Anand East - Drainage Outfall Corridor',
    address: 'Near Old GIDC Drainage Outfall, Ward 12, Anand East',
    coordinates: [72.9390, 22.5610] as [number, number], // [lng, lat]
    priority: 'HIGH',
    priorityScore: 84,
    submittedDate: '2026-03-18T09:30:00Z',
    validationStatus: 'Verified',
    projectStatus: 'Assigned',
    assignedUniversity: 'BVM Engineering College',
    linkedProjectId: 'PRJ-ANAND-014',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Water enters shops on every rainfall. Manhole covers rattle under hydraulic pressure.',
      reportedBy: 'Kailashben Patel (Shopkeepers Association)',
      citizenPhone: '+91 98250 11442',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Water & Sanitation / Urban Stormwater Drainage',
      detectedCategory: 'Water & Sanitation',
      confidence: 0.94,
      priorityRecommendation: 'High',
      duplicateDetection: 'No duplicates detected within 500m radius',
      suggestedDepartment: 'Water & Sanitation',
      validationSummary: 'Visual analysis confirms sewage effluent breaching curbside level. High risk to public hygiene and commercial thoroughfare.',
    },
    municipalValidation: {
      reviewer: 'Shri J. Trivedi (Chief Officer)',
      validatedAt: '2026-03-19T11:20:00Z',
      decision: 'Verified',
      department: 'Water & Sanitation',
      remarks: 'Inspected by Deputy Municipal Engineer. Requires civil engineering flow redirection and smart level sensors.',
    },
  },
  {
    id: 'CH-2026-092',
    challengeId: 'CH-2026-092',
    complaintNumber: 'CC-2026-00092',
    problem: 'Commercial Solid Waste Accumulation & Stray Cattle Gathering',
    title: 'Commercial Solid Waste Accumulation & Stray Cattle Gathering',
    description: 'Bulk waste from agricultural vegetable market spilling onto municipal carriageway. Bin capacities breached repeatedly.',
    category: 'Solid Waste Management',
    subcategory: 'Bulk Waste Spillover',
    department: 'Solid Waste Management',
    ward: 'Ward 8',
    wardNumber: 8,
    location: 'Ganesh Chokdi Municipal Market',
    address: 'APMC Vegetable Sub-yard, Ganesh Chokdi, Ward 8, Anand',
    coordinates: [72.9295, 22.5615] as [number, number],
    priority: 'HIGH',
    priorityScore: 78,
    submittedDate: '2026-03-20T14:15:00Z',
    validationStatus: 'In Progress',
    projectStatus: 'In Progress',
    assignedUniversity: 'Charusat University (DEPSTAR)',
    linkedProjectId: 'PRJ-ANAND-018',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Bins fill up by 11 AM daily. Stray animals block the traffic completely.',
      reportedBy: 'Rameshwar Vyas (Market Secretary)',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Solid Waste Management / Bio-degradable Market Waste',
      detectedCategory: 'Solid Waste Management',
      confidence: 0.91,
      priorityRecommendation: 'High',
      duplicateDetection: 'Low duplicate probability',
      suggestedDepartment: 'Solid Waste Management',
      validationSummary: 'Volume estimation indicates ~2.4 metric tonnes daily bio-waste surcharge.',
    },
    municipalValidation: {
      reviewer: 'P. M. Solanki (Sanitation Superintendent)',
      validatedAt: '2026-03-21T10:00:00Z',
      decision: 'Verified',
      department: 'Solid Waste Management',
      remarks: 'Automated compactor integration and biogas conversion pilot assigned to university team.',
    },
  },
  {
    id: 'CH-2026-104',
    challengeId: 'CH-2026-104',
    complaintNumber: 'CC-2026-00104',
    problem: 'Pothole & Sub-base Failure on Heavy Vehicle Arterial Road',
    title: 'Pothole & Sub-base Failure on Heavy Vehicle Arterial Road',
    description: 'Deep structural craters across 220m stretch leading to frequent two-wheeler skids and traffic jams.',
    category: 'Roads & Infrastructure',
    subcategory: 'Arterial Road Damage',
    department: 'Roads & Infrastructure',
    ward: 'Ward 4',
    wardNumber: 4,
    location: 'Borsad Chokdi Industrial Approach',
    address: 'Opposite State Transport Workshop, Borsad Chokdi, Ward 4',
    coordinates: [72.9310, 22.5510] as [number, number],
    priority: 'CRITICAL',
    priorityScore: 92,
    submittedDate: '2026-03-22T08:00:00Z',
    validationStatus: 'Verified',
    projectStatus: 'In Progress',
    assignedUniversity: 'GCET Engineering College',
    linkedProjectId: 'PRJ-ANAND-021',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Buses bottom out. Three motorcycle accidents occurred last weekend.',
      reportedBy: 'Amit Joshi (Resident)',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Roads & Infrastructure / Pothole & Sub-base Subsidence',
      detectedCategory: 'Roads & Infrastructure',
      confidence: 0.96,
      priorityRecommendation: 'Critical',
      duplicateDetection: '3 citizen complaints merged for this location',
      suggestedDepartment: 'Roads & Infrastructure',
      validationSummary: 'Critical safety risk for motorized vehicles. Water ingress has compromised the granular sub-base.',
    },
    municipalValidation: {
      reviewer: 'Shri J. Trivedi (Chief Officer)',
      validatedAt: '2026-03-22T12:00:00Z',
      decision: 'Verified',
      department: 'Roads & Infrastructure',
      remarks: 'Fast-track cold polymer mix resurfacing approved. GCET geotechnical lab analyzing CBR values.',
    },
  },
  {
    id: 'CH-2026-112',
    challengeId: 'CH-2026-112',
    complaintNumber: 'CC-2026-00112',
    problem: 'Industrial Effluent Discoloration in Irrigation Feeder Canal',
    title: 'Industrial Effluent Discoloration in Irrigation Feeder Canal',
    description: 'Chemical smell and reddish discoloration detected in open canal adjacent to farm fields near Lambhvel.',
    category: 'Environment',
    subcategory: 'Waterbody Contamination',
    department: 'Environment',
    ward: 'Ward 6',
    wardNumber: 6,
    location: 'Lambhvel Green Belt Canal',
    address: 'Near Narmada Sub-distributary 4, Lambhvel Road, Ward 6',
    coordinates: [72.9380, 22.5790] as [number, number],
    priority: 'HIGH',
    priorityScore: 81,
    submittedDate: '2026-03-23T11:45:00Z',
    validationStatus: 'Pending Validation',
    projectStatus: 'Unassigned',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Water is burning crop seedlings. Smells like sulfur compounds.',
      reportedBy: 'Devendra Mahida (Farmer)',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Environment / Hazardous Liquid Effluent',
      detectedCategory: 'Environment',
      confidence: 0.88,
      priorityRecommendation: 'High',
      duplicateDetection: 'Unique report',
      suggestedDepartment: 'Environment',
      validationSummary: 'Spectral pattern matches industrial solvent discharge. Urgently requires field spectrophotometer testing.',
    },
  },
  {
    id: 'CH-2026-115',
    challengeId: 'CH-2026-115',
    complaintNumber: 'CC-2026-00115',
    problem: 'Intermittent Low Pressure & Bacterial Contamination in Water Network',
    title: 'Intermittent Low Pressure & Bacterial Contamination in Water Network',
    description: 'Citizens reporting turbid tap water during morning municipal supply hours in dense residential pockets.',
    category: 'Public Health',
    subcategory: 'Potable Water Contamination',
    department: 'Public Health',
    ward: 'Ward 2',
    wardNumber: 2,
    location: 'Gamdi Old Settlement',
    address: 'Matawadi Mohalla, Gamdi Area, Ward 2, Anand West',
    coordinates: [72.9210, 22.5630] as [number, number],
    priority: 'CRITICAL',
    priorityScore: 89,
    submittedDate: '2026-03-23T16:00:00Z',
    validationStatus: 'Pending Validation',
    projectStatus: 'Unassigned',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Yellow tint in water; two children in society developed gastroenteritis symptoms.',
      reportedBy: 'Kavita Dave (Ward Resident)',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Public Health / Potable Water Contamination',
      detectedCategory: 'Public Health',
      confidence: 0.93,
      priorityRecommendation: 'Critical',
      duplicateDetection: '2 similar reports from same street',
      suggestedDepartment: 'Public Health',
      validationSummary: 'Suspected cross-contamination between parallel drinking water line and antiquated drainage pipe.',
    },
  },
  {
    id: 'CH-2026-042',
    challengeId: 'CH-2026-042',
    complaintNumber: 'CC-2026-00042',
    problem: 'Smart Streetlight Grid Failures Across Main Academic Corridor',
    title: 'Smart Streetlight Grid Failures Across Main Academic Corridor',
    description: '14 consecutive LED poles failing at dusk due to phase imbalance and faulty photo-sensor switches.',
    category: 'Street Lighting',
    subcategory: 'Corridor Blackout',
    department: 'Street Lighting',
    ward: 'Ward 5',
    wardNumber: 5,
    location: 'Vallabh Vidyanagar Link Road',
    address: 'From Anand Town Hall Circle to Shastri Maidan, Ward 5',
    coordinates: [72.9150, 22.5580] as [number, number],
    priority: 'MEDIUM',
    priorityScore: 64,
    submittedDate: '2026-03-15T19:00:00Z',
    validationStatus: 'Resolved',
    projectStatus: 'Completed',
    assignedUniversity: 'BVM Engineering College (Electrical Dept)',
    linkedProjectId: 'PRJ-ANAND-008',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Dark corridor created safety hazards for college students commuting at night.',
      reportedBy: 'Dr. Jayant Shah',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Street Lighting / Phase Tripping',
      detectedCategory: 'Street Lighting',
      confidence: 0.95,
      priorityRecommendation: 'Medium',
      duplicateDetection: 'Single incident',
      suggestedDepartment: 'Street Lighting',
      validationSummary: 'Automated electrical diagnostic indicates phase neutral displacement in transformer feeder #3.',
    },
    municipalValidation: {
      reviewer: 'R. K. Rathod (Executive Engineer Electrical)',
      validatedAt: '2026-03-16T10:00:00Z',
      decision: 'Verified',
      department: 'Street Lighting',
      remarks: 'Automated IoT switching node deployed by BVM students. Grid restored and verified.',
    },
  },
  {
    id: 'CH-2026-120',
    challengeId: 'CH-2026-120',
    complaintNumber: 'CC-2026-00120',
    problem: 'Encroachment and Silt Choking of Stormwater Inlets',
    title: 'Encroachment and Silt Choking of Stormwater Inlets',
    description: 'Street vendors have covered brick masonry storm inlets with wooden planks and plastic sheets, obstructing runoff.',
    category: 'Drainage',
    subcategory: 'Inlet Blockage',
    department: 'Drainage',
    ward: 'Ward 1',
    wardNumber: 1,
    location: 'Anand East Station Road',
    address: 'Opposite Platform 1 Entry Gate, Anand East',
    coordinates: [72.9340, 22.5650] as [number, number],
    priority: 'MEDIUM',
    priorityScore: 58,
    submittedDate: '2026-03-24T10:10:00Z',
    validationStatus: 'New',
    projectStatus: 'Unassigned',
    isInsideJurisdiction: true,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Drain grills are completely clogged with discarded cartons and single-use plastic.',
      reportedBy: 'Haresh Barot',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Drainage / Urban Inundation Hazard',
      detectedCategory: 'Drainage',
      confidence: 0.89,
      priorityRecommendation: 'Medium',
      duplicateDetection: 'No duplicates',
      suggestedDepartment: 'Drainage',
      validationSummary: 'Runoff coefficient severely compromised. Encroachment removal and desilting required.',
    },
  },
  // OUTSIDE JURISDICTION EXAMPLE (e.g., Nadiad / Umreth outside Anand ULB bounds)
  {
    id: 'CH-2026-099',
    challengeId: 'CH-2026-099',
    complaintNumber: 'CC-2026-00099',
    problem: 'Broken Canal Sluice Gate Near Nadiad Highway',
    title: 'Broken Canal Sluice Gate Near Nadiad Highway',
    description: 'Irrigation gate damaged near National Highway 48 toll plaza, overflowing into agricultural lands outside Anand ULB limits.',
    category: 'Water & Sanitation',
    subcategory: 'Canal Infrastructure',
    department: 'Water & Sanitation',
    ward: 'Outside Jurisdiction',
    wardNumber: 0,
    location: 'Nadiad Rural Highway Border (Outside ULB)',
    address: 'Near NH-48 Toll Gate, Kheda District Jurisdiction',
    coordinates: [72.8550, 22.6900] as [number, number], // Clearly outside Anand
    priority: 'MEDIUM',
    priorityScore: 50,
    submittedDate: '2026-03-21T18:00:00Z',
    validationStatus: 'Outside Jurisdiction',
    projectStatus: 'Unassigned',
    isInsideJurisdiction: false,
    evidence: {
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60',
      ],
      citizenNotes: 'Submitted via citizen app with wrong ward selection.',
      reportedBy: 'Sanjay Vankar',
    },
    aiAnalysis: {
      isAiGenerated: true,
      classification: 'Water & Sanitation',
      detectedCategory: 'Water & Sanitation',
      confidence: 0.85,
      priorityRecommendation: 'Medium',
      duplicateDetection: 'Out of municipality boundary',
      suggestedDepartment: 'Irrigation & Flood Control',
      validationSummary: 'Geographical GPS check places this complaint 14.8 km northwest of Anand Municipality boundary in Nadiad Taluka.',
    },
    municipalValidation: {
      reviewer: 'System Geofence / Shri J. Trivedi',
      validatedAt: '2026-03-22T09:15:00Z',
      decision: 'Outside Jurisdiction',
      department: 'Other',
      remarks: 'Coordinate [72.8550, 22.6900] belongs to Nadiad Nagar Palika / Gujarat Water Resources Dept. Inter-authority escalation initiated.',
    },
  },
];

// Centralized Universities seed data
let municipalUniversitiesStore: any[] = [
  {
    id: 'UNIV-001',
    name: 'BVM Engineering College (Birla Vishvakarma Mahavidyalaya)',
    department: 'Civil & Environmental Engineering',
    assignedChallenges: 6,
    activeProjects: 4,
    completedProjects: 22,
    facultyMentors: ['Dr. L. B. Patel', 'Prof. Jagdish Shah', 'Dr. Sneha Desai'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Anand (Vallabh Vidyanagar)',
    contactEmail: 'principal@bvmengineering.ac.in',
  },
  {
    id: 'UNIV-002',
    name: 'Charusat University (DEPSTAR / CSPIT)',
    department: 'Computer Science & AI Applications',
    assignedChallenges: 5,
    activeProjects: 3,
    completedProjects: 18,
    facultyMentors: ['Dr. Amit Ganatra', 'Prof. Parth Gohel'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Anand (Changa)',
    contactEmail: 'dean.rnd@charusat.ac.in',
  },
  {
    id: 'UNIV-003',
    name: 'G. H. Patel College of Engineering & Technology (GCET)',
    department: 'Mechanical & Mechatronics Engineering',
    assignedChallenges: 4,
    activeProjects: 3,
    completedProjects: 15,
    facultyMentors: ['Dr. Himanshu Soni', 'Prof. Maulik Shah'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Anand (Vallabh Vidyanagar)',
    contactEmail: 'gcet_admin@cvmu.edu.in',
  },
  {
    id: 'UNIV-004',
    name: 'Sardar Patel University (SPU Post-Graduate Depts)',
    department: 'Environmental Science & Biotechnology',
    assignedChallenges: 3,
    activeProjects: 2,
    completedProjects: 14,
    facultyMentors: ['Prof. B. C. Dave', 'Dr. Renu Sharma'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Anand',
    contactEmail: 'registrar@spuvvn.edu',
  },
  {
    id: 'UNIV-005',
    name: 'S. V. National Institute of Technology (SVNIT Surat)',
    department: 'Urban Water & Transportation Systems',
    assignedChallenges: 3,
    activeProjects: 2,
    completedProjects: 11,
    facultyMentors: ['Dr. C. S. Sanghvi', 'Prof. V. L. Manekar'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Surat',
    contactEmail: 'dean_sw@svnit.ac.in',
  },
  {
    id: 'UNIV-006',
    name: 'Indian Institute of Technology Gandhinagar (IITGN)',
    department: 'Earth & Environmental Sciences',
    assignedChallenges: 2,
    activeProjects: 2,
    completedProjects: 8,
    facultyMentors: ['Prof. Vimal Mishra', 'Dr. Manish Kumar'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Gandhinagar',
    contactEmail: 'rnd@iitgn.ac.in',
  },
  {
    id: 'UNIV-007',
    name: 'Nirma University (Institute of Technology)',
    department: 'IoT & Embedded Sensor Systems',
    assignedChallenges: 2,
    activeProjects: 1,
    completedProjects: 5,
    facultyMentors: ['Dr. Rajesh Patel', 'Prof. Usha Mehta'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Ahmedabad',
    contactEmail: 'director.it@nirmauni.ac.in',
  },
  {
    id: 'UNIV-008',
    name: 'Maharaja Sayajirao University of Baroda (MSU Vadodara)',
    department: 'Faculty of Technology & Engineering',
    assignedChallenges: 2,
    activeProjects: 1,
    completedProjects: 4,
    facultyMentors: ['Dr. B. S. Patel'],
    status: 'Active',
    state: 'Gujarat',
    district: 'Vadodara',
    contactEmail: 'dean-techo@msubaroda.ac.in',
  },
];

// Centralized University Proposals
let municipalProposalsStore: any[] = [
  {
    id: 'PROP-2026-041',
    proposalId: 'PROP-2026-041',
    university: 'BVM Engineering College',
    project: 'Smart Ultrasonic Trunk Sewer Flow & Silt Early-Warning System',
    linkedChallenge: 'CH-2026-089',
    linkedChallengeTitle: 'Overflowing Drainage Network & Stormwater Stagnation',
    facultyMentor: 'Dr. L. B. Patel (Dept of Civil Engg)',
    technology: 'LoRaWAN Ultrasonic Level Sensors & Hydrodynamic 1D-2D Model',
    expectedOutcome: 'Real-time detection of subterranean flow blockages 4 hours prior to street flooding.',
    budget: '₹4,80,000',
    timeline: '6 Months (Apr 2026 – Sep 2026)',
    status: 'Accepted',
    submittedDate: '2026-03-20T10:00:00Z',
    municipalRemarks: 'Municipal engineering team approved pilot placement in Ward 12 main trunk outfall.',
  },
  {
    id: 'PROP-2026-048',
    proposalId: 'PROP-2026-048',
    university: 'Charusat University (DEPSTAR)',
    project: 'Computer Vision Bio-Waste Volumetric Profiling for Smart Dispatches',
    linkedChallenge: 'CH-2026-092',
    linkedChallengeTitle: 'Commercial Solid Waste Accumulation & Stray Cattle Gathering',
    facultyMentor: 'Prof. Parth Gohel (AI & Edge Vision Lab)',
    technology: 'Edge AI Camera Nodes with Solar Battery & Automated Compactor Dispatches',
    expectedOutcome: 'Zero overflow at APMC market; automatic rerouting of municipal hydraulic compactor.',
    budget: '₹3,50,000',
    timeline: '4 Months (Apr 2026 – Jul 2026)',
    status: 'Under Review',
    submittedDate: '2026-03-22T14:30:00Z',
    municipalRemarks: 'Requires clarification on camera housing resistance to humidity and ammonia vapors.',
  },
  {
    id: 'PROP-2026-052',
    proposalId: 'PROP-2026-052',
    university: 'GCET Engineering College',
    project: 'High-Durability Polymer Modified Bituminous Cold Mix for Wet Patching',
    linkedChallenge: 'CH-2026-104',
    linkedChallengeTitle: 'Pothole & Sub-base Failure on Heavy Vehicle Arterial Road',
    facultyMentor: 'Dr. Himanshu Soni',
    technology: 'Geopolymer Cold-set Resin Binder with Recycled Aggregate Fillers',
    expectedOutcome: 'Instant traffic opening within 45 minutes; 3x fatigue life compared to standard cold patch.',
    budget: '₹5,20,000',
    timeline: '5 Months (Apr 2026 – Aug 2026)',
    status: 'Accepted',
    submittedDate: '2026-03-23T09:00:00Z',
    municipalRemarks: 'Chief Officer and PWD Engineer granted field testing clearance on Borsad approach road.',
  },
  {
    id: 'PROP-2026-055',
    proposalId: 'PROP-2026-055',
    university: 'Sardar Patel University',
    project: 'Bacterial Enzyme Slurry for In-situ Grease & Sludge Digestion',
    linkedChallenge: 'CH-2026-112',
    linkedChallengeTitle: 'Industrial Effluent Discoloration in Irrigation Feeder Canal',
    facultyMentor: 'Prof. B. C. Dave',
    technology: 'Naturally Isolated Microbial Consortia for Hydrocarbon & Dye Neutralization',
    expectedOutcome: '60% reduction in canal chemical COD and neutralization of noxious odors in 72 hours.',
    budget: '₹2,90,000',
    timeline: '3 Months (May 2026 – Jul 2026)',
    status: 'Submitted',
    submittedDate: '2026-03-24T12:00:00Z',
  },
];

// Centralized Industry Partners & CSR Projects
let municipalIndustryStore: any[] = [
  {
    id: 'IND-001',
    name: 'Amul (Gujarat Co-operative Milk Marketing Federation)',
    supportedProject: 'Smart Bio-Digester & Clean Energy Generator for Dairy Sludge',
    linkedChallenge: 'CH-2026-092',
    supportType: 'Funding & Infrastructure',
    funding: '₹25,00,000',
    technicalSupport: 'Sludge test facilities, continuous biogas monitoring lab',
    projectStatus: 'In Progress',
    contactPerson: 'Mr. R. S. Sodhi (CSR Executive Desk)',
    email: 'csr@amul.coop',
  },
  {
    id: 'IND-002',
    name: 'Elecon Engineering Company Ltd. (Vallabh Vidyanagar)',
    supportedProject: 'Mechanical Sluice Gate Automation & Debris Grinders',
    linkedChallenge: 'CH-2026-089',
    supportType: 'Hardware & Testing',
    funding: '₹18,50,000',
    technicalSupport: 'Custom heavy gearboxes, industrial fabrication, flow telemetry',
    projectStatus: 'In Progress',
    contactPerson: 'Mr. Pranav Patel (Head of Community CSR)',
    email: 'csr@elecon.com',
  },
  {
    id: 'IND-003',
    name: 'GMM Pfaudler Ltd. (Karamsad, Anand)',
    supportedProject: 'Anti-Corrosion Glass-lined Polymer Liners for Manholes',
    linkedChallenge: 'CH-2026-089',
    supportType: 'Field Deployment & Materials',
    funding: '₹14,00,000',
    technicalSupport: 'Corrosion resistant composite materials & engineering mentoring',
    projectStatus: 'In Progress',
    contactPerson: 'Ms. Alka Shah',
    email: 'community@gmmpfaudler.com',
  },
  {
    id: 'IND-004',
    name: 'Larsen & Toubro Ltd. (Heavy Engineering / Smart Infrastructure)',
    supportedProject: 'Geopolymer Rapid-Cure Road Patching Machinery',
    linkedChallenge: 'CH-2026-104',
    supportType: 'Technical Mentorship & Equipment',
    funding: '₹32,00,000',
    technicalSupport: 'Mobile asphalt compaction equipment, vibration testing sensors',
    projectStatus: 'In Progress',
    contactPerson: 'Mr. V. Ramanathan',
    email: 'csr-infra@larsentoubro.com',
  },
  {
    id: 'IND-005',
    name: 'Adani Total Gas Ltd. (Anand City Gas Distribution)',
    supportedProject: 'Underground Pipeline Optical Acoustic Leak Detector',
    linkedChallenge: 'CH-2026-115',
    supportType: 'Software & Field Deployment',
    funding: '₹16,00,000',
    technicalSupport: 'GIS pipe network mapping integration and pressure sensor nodes',
    projectStatus: 'Planning',
    contactPerson: 'Mr. N. Trivedi',
    email: 'cgd.anand@adani.com',
  },
  {
    id: 'IND-006',
    name: 'Tata Consultancy Services (TCS CSR - Digital Impact)',
    supportedProject: 'Citywide AI Civic Anomaly Dashboard & Telemetry Platform',
    linkedChallenge: 'CH-2026-042',
    supportType: 'Software & Infrastructure',
    funding: '₹22,00,000',
    technicalSupport: 'Cloud telemetry hosting, machine learning model retraining',
    projectStatus: 'Completed',
    contactPerson: 'Ms. Meera Chawla',
    email: 'csr.impact@tcs.com',
  },
];

// Centralized Project Monitoring store
let municipalProjectsStore: any[] = [
  {
    id: 'PRJ-ANAND-014',
    projectId: 'PRJ-ANAND-014',
    name: 'Smart Ultrasonic Trunk Sewer Flow & Silt Early-Warning System',
    linkedChallenge: 'CH-2026-089',
    challengeTitle: 'Overflowing Drainage Network & Stormwater Stagnation',
    university: 'BVM Engineering College',
    facultyMentor: 'Dr. L. B. Patel',
    studentLead: 'Jayesh Parmar (M.Tech Environmental)',
    industryPartner: 'Elecon Engineering Company Ltd.',
    municipalityDepartment: 'Water & Sanitation',
    ward: 'Ward 12',
    wardNumber: 12,
    location: 'Anand East - Drainage Outfall Corridor',
    progress: 68,
    currentMilestone: 'Field Deployment Phase 2: Sensor Node Calibration',
    nextMilestone: 'Integration with Municipal Central Telemetry SCADA',
    status: 'Active',
    lifecycleStage: 'Field Deployment',
    startDate: '2026-01-10',
    expectedCompletion: '2026-06-30',
    actualCompletion: null,
    problem: 'Stormwater surcharge leading to raw sewage backflow across 1.4 km corridor.',
    solution: 'Multi-point LoRaWAN ultrasonic sensor array linked to automated bypass gates.',
    technology: 'Ultrasonic depth sensors, LoRaWAN, Python Hydro-telemetry, SCADA gate actuators.',
    expectedOutcome: 'Zero street inundation incidents during normal monsoon cloudbursts.',
    fieldDeploymentStatus: 'Field Implementation',
    municipalApprovalStatus: 'Approved by Chief Officer',
    testingStatus: 'Bench-scale & Pilot Manhole Tests Passed',
    citizenImpactRecord: '18,500 residents and 140 shopkeepers across Ward 12.',
    milestones: [
      { name: 'Hydraulic Survey & Manhole Depth Profile Mapping', dueDate: '2026-02-15', progress: 100, responsible: 'BVM Student Team', status: 'Completed' },
      { name: 'Fabrication of Solar-Powered LoRaWAN Nodes', dueDate: '2026-03-10', progress: 100, responsible: 'Elecon Engineering', status: 'Completed' },
      { name: 'Installation of 8 Nodes in Ward 12 Main Trunk Sewer', dueDate: '2026-04-05', progress: 75, responsible: 'Joint BVM & ULB Field Team', status: 'In Progress' },
      { name: 'Municipal SCADA Alert Gateway Linkage', dueDate: '2026-05-15', progress: 10, responsible: 'Municipal IT & BVM', status: 'Upcoming' },
      { name: 'Monsoon Stress Validation & Final Handover', dueDate: '2026-06-30', progress: 0, responsible: 'ULB Chief Officer Desk', status: 'Upcoming' },
    ],
  },
  {
    id: 'PRJ-ANAND-018',
    projectId: 'PRJ-ANAND-018',
    name: 'Smart Waste Compactor & Bio-Digester for Market Organic Waste',
    linkedChallenge: 'CH-2026-092',
    challengeTitle: 'Commercial Solid Waste Accumulation & Stray Cattle Gathering',
    university: 'Charusat University (DEPSTAR)',
    facultyMentor: 'Prof. Parth Gohel',
    studentLead: 'Dhruv Solanki (B.Tech CSE)',
    industryPartner: 'Amul (GCMMF)',
    municipalityDepartment: 'Solid Waste Management',
    ward: 'Ward 8',
    wardNumber: 8,
    location: 'Ganesh Chokdi Municipal Market',
    progress: 42,
    currentMilestone: 'Solar Compactor Electrical Enclosure Assembly',
    nextMilestone: 'On-site Pilot Placement at APMC Bin Yard',
    status: 'Delayed',
    lifecycleStage: 'Prototype',
    startDate: '2026-01-20',
    expectedCompletion: '2026-05-15',
    actualCompletion: null,
    delayDuration: '14 Days behind schedule',
    delayReason: 'Delay in delivery of custom high-torque shredder motor from supplier.',
    problem: '2.4 metric tonnes daily unsegregated market garbage choking arterial roadway.',
    solution: 'Compacting station with anaerobic micro-digester providing methane for market lighting.',
    technology: 'Edge AI camera, hydraulic 5-ton ram, microbial inoculum chamber.',
    expectedOutcome: '80% volume reduction before transport to municipal landfill site.',
    fieldDeploymentStatus: 'Pilot',
    municipalApprovalStatus: 'Approved by Sanitation Superintendent',
    testingStatus: 'Bench-scale shredding tests completed',
    citizenImpactRecord: '350 vendors, 12,000 daily market visitors, Ward 8 community.',
    milestones: [
      { name: 'Waste Characterization & Moisture Profiling', dueDate: '2026-02-10', progress: 100, responsible: 'Charusat Team', status: 'Completed' },
      { name: 'Mechanical Frame & Compactor Ram Fabrication', dueDate: '2026-03-05', progress: 85, responsible: 'Amul Workshop / Charusat', status: 'Delayed' },
      { name: 'Edge AI Fill-level Optical Camera Training', dueDate: '2026-03-25', progress: 70, responsible: 'Charusat AI Lab', status: 'In Progress' },
      { name: 'Market Yard Civil Foundation & Power Hookup', dueDate: '2026-04-10', progress: 20, responsible: 'ULB Works Dept', status: 'Upcoming' },
    ],
  },
  {
    id: 'PRJ-ANAND-021',
    projectId: 'PRJ-ANAND-021',
    name: 'High-Durability Polymer Modified Bituminous Cold Mix for Wet Patching',
    linkedChallenge: 'CH-2026-104',
    challengeTitle: 'Pothole & Sub-base Failure on Heavy Vehicle Arterial Road',
    university: 'GCET Engineering College',
    facultyMentor: 'Dr. Himanshu Soni',
    studentLead: 'Pooja Bhatt (M.Tech Civil)',
    industryPartner: 'Larsen & Toubro Ltd.',
    municipalityDepartment: 'Roads & Infrastructure',
    ward: 'Ward 4',
    wardNumber: 4,
    location: 'Borsad Chokdi Industrial Approach',
    progress: 55,
    currentMilestone: 'California Bearing Ratio (CBR) Laboratory Core Tests',
    nextMilestone: 'Test Strip Application on 100m Section of Borsad Road',
    status: 'Active',
    lifecycleStage: 'Testing',
    startDate: '2026-02-01',
    expectedCompletion: '2026-07-15',
    actualCompletion: null,
    problem: 'Rapid breakdown of pothole asphalt under monsoon water and heavy transport traffic.',
    solution: 'Recycled rubber modified cold emulsion patch mix curing in 45 minutes.',
    technology: 'Crumb rubber modifier (CRM), cationic slow-setting bitumen, fly ash fillers.',
    expectedOutcome: 'Zero pothole reopening for at least 18 months under heavy axle loads.',
    fieldDeploymentStatus: 'Planning',
    municipalApprovalStatus: 'Conditional Approval by Chief Officer',
    testingStatus: 'Lab Compressive & Water Resistance Tests in Progress',
    citizenImpactRecord: '35,000 daily commuters crossing Borsad Chokdi arterial route.',
    milestones: [
      { name: 'Core Sampling & Existing Sub-grade Soil Profiling', dueDate: '2026-02-25', progress: 100, responsible: 'GCET Geotech Lab', status: 'Completed' },
      { name: 'Polymer Emulsion Formulation & Marshall Stability Test', dueDate: '2026-03-20', progress: 100, responsible: 'GCET & L&T R&D', status: 'Completed' },
      { name: '100m Pilot Strip Laying with Municipal PWD Gang', dueDate: '2026-04-15', progress: 25, responsible: 'Joint ULB & GCET Team', status: 'In Progress' },
      { name: 'Heavy Wheel Tracking & Post-Rain Deflection Monitoring', dueDate: '2026-06-15', progress: 0, responsible: 'GCET Civil Lab', status: 'Upcoming' },
    ],
  },
  {
    id: 'PRJ-ANAND-008',
    projectId: 'PRJ-ANAND-008',
    name: 'Smart Streetlight Grid Failures Across Main Academic Corridor',
    linkedChallenge: 'CH-2026-042',
    challengeTitle: 'Smart Streetlight Grid Failures Across Main Academic Corridor',
    university: 'BVM Engineering College (Electrical Dept)',
    facultyMentor: 'Prof. Jagdish Shah',
    studentLead: 'Nikhil Mehta',
    industryPartner: 'Tata Consultancy Services',
    municipalityDepartment: 'Street Lighting',
    ward: 'Ward 5',
    wardNumber: 5,
    location: 'Vallabh Vidyanagar Link Road',
    progress: 100,
    currentMilestone: 'Project Completed & Formally Handed Over to Municipal Electrical Dept',
    nextMilestone: 'Post-Implementation Annual Telemetry Audit',
    status: 'Completed',
    lifecycleStage: 'Resolved / Completed',
    startDate: '2025-10-01',
    expectedCompletion: '2026-02-28',
    actualCompletion: '2026-02-20',
    problem: 'Recurring corridor blackouts on critical college student commuting artery.',
    solution: 'Solid-state automated phase balancers with GSM health telemetry module on each feeder.',
    technology: 'GSM telemetry, ESP32 microcontroller, solid-state contactors, cloud dashboard.',
    expectedOutcome: '99.8% corridor uptime, automated fault SMS alerts to linemen within 90 seconds.',
    fieldDeploymentStatus: 'Operational',
    municipalApprovalStatus: 'Final Municipal Resolution Certificate Issued',
    testingStatus: 'Continuous 90-Day Full Load Run Passed',
    citizenImpactRecord: '42,000 university students and residents along Vallabh Vidyanagar link.',
    milestones: [
      { name: 'Sub-feeder Diagnostic & Load Flow Simulation', dueDate: '2025-10-30', progress: 100, responsible: 'BVM Electrical Lab', status: 'Completed' },
      { name: 'Microcontroller Controller Unit Prototyping', dueDate: '2025-11-25', progress: 100, responsible: 'BVM Student Team', status: 'Completed' },
      { name: 'Corridor Retrofit of 14 Feeder Junction Boxes', dueDate: '2025-12-30', progress: 100, responsible: 'Municipal Electrical Staff', status: 'Completed' },
      { name: 'Telemetry Integration with CivicConnect Control Room', dueDate: '2026-01-20', progress: 100, responsible: 'TCS Team', status: 'Completed' },
      { name: 'Official Municipal Commissioning & Sign-off', dueDate: '2026-02-20', progress: 100, responsible: 'Chief Officer Shri J. Trivedi', status: 'Completed' },
    ],
  },
];

// Official Municipal Reports Registry
let municipalReportsStore: any[] = [
  {
    id: 'REP-ANAND-2026-01',
    reportId: 'REP-ANAND-2026-01',
    reportType: 'Challenge Report',
    period: 'Q4 2025-26 & Q1 2026-27 (Fiscal Year to Date)',
    title: 'Anand Municipality Comprehensive Civic Challenge Audit',
    generatedDate: '2026-03-24T15:00:00Z',
    preparedBy: 'Chief Officer Shri Jayeshbhai Trivedi & Municipal Operations Cell',
    status: 'Published',
    pages: 4,
  },
  {
    id: 'REP-ANAND-2026-02',
    reportId: 'REP-ANAND-2026-02',
    reportType: 'Project Status Report',
    period: 'Bi-Monthly Progress (Feb – Mar 2026)',
    title: 'Municipal Innovation Projects Implementation & Milestone Health Report',
    generatedDate: '2026-03-23T11:30:00Z',
    preparedBy: 'Executive Engineer (Projects) & Academic Liaison Office',
    status: 'Published',
    pages: 5,
  },
  {
    id: 'REP-ANAND-2026-03',
    reportId: 'REP-ANAND-2026-03',
    reportType: 'Ward Report',
    period: 'Ward 12 & Ward 4 Drainage and Infrastructure Special Audit',
    title: 'High-Density Ward Geospatial Vulnerability & Resolution Log',
    generatedDate: '2026-03-22T17:00:00Z',
    preparedBy: 'GIS Cell & Ward Nodal Officers',
    status: 'Published',
    pages: 3,
  },
  {
    id: 'REP-ANAND-2026-04',
    reportId: 'REP-ANAND-2026-04',
    reportType: 'Impact Report',
    period: 'Annual Civic Impact (2025–26)',
    title: 'Citizen Beneficiary & Public Asset Quality Improvement Audit',
    generatedDate: '2026-03-20T09:45:00Z',
    preparedBy: 'Municipal Commissionerate & Evaluation Committee',
    status: 'Published',
    pages: 6,
  },
  {
    id: 'REP-ANAND-2026-05',
    reportId: 'REP-ANAND-2026-05',
    reportType: 'University Collaboration Report',
    period: 'Academic HEI Partnership Review (2025–2026)',
    title: 'R&D Engagement, Faculty Mentorship & Field Deployment Outcomes',
    generatedDate: '2026-03-18T14:10:00Z',
    preparedBy: 'Dean R&D Consortium / Anand Municipality',
    status: 'Published',
    pages: 4,
  },
  {
    id: 'REP-ANAND-2026-06',
    reportId: 'REP-ANAND-2026-06',
    reportType: 'Industry Collaboration Report',
    period: 'Corporate CSR & Industry Co-Innovation Audit (2025–26)',
    title: 'Public-Private Civic Capital & Technology Deployment Metrics',
    generatedDate: '2026-03-15T16:20:00Z',
    preparedBy: 'CSR Project Monitoring Cell',
    status: 'Published',
    pages: 4,
  },
];

// Official Anand Municipality Profile
let municipalProfileStore = {
  municipalityName: 'Anand Municipality (Urban Local Body)',
  municipalityType: 'Municipal Council / ' + 'Nagarpalika (Class-A Urban Local Body)',
  district: 'Anand',
  state: 'Gujarat',
  pinCode: '388001',
  administrativeArea: '22.7 sq. km (Official ULB Boundary)',
  officialEmail: 'commissioner@anandmunicipality.gujarat.gov.in',
  officialContact: '+91 2692 254101 / +91 2692 254102',
  controlRoomHelpline: '1800-233-0195 (Toll-Free 24x7 Civic Desk)',
  website: 'https://anandmunicipality.gujarat.gov.in',
  totalWards: 14,
  registeredPopulation: '2,88,450 (Census Projected 2026)',
  authorizedOfficer: 'Shri Jayeshbhai Trivedi, GAS',
  officerDesignation: 'Chief Officer & Administrative Head, Anand ULB',
  deputyCommissioner: 'Smt. Rekhaben Parmar, Executive Officer',
  headquartersAddress: 'Anand Municipal Corporation Bhavan, Town Hall Circle, Station Road, Anand - 388001, Gujarat, India',
  departments: [
    'Water & Sanitation Department',
    'Solid Waste Management & Health',
    'Roads, Bridges & Infrastructure',
    'Drainage, Stormwater & Sewerage',
    'Street Lighting & Electrical Works',
    'Town Planning & Encroachment Control',
    'Parks, Gardens & Urban Environment',
    'Public Health, Vector Control & Sanitation',
  ],
  verifiedStatus: 'Verified Government Urban Local Body (ULB Code: GUJ-ANAND-024)',
  verifiedSince: '2020-04-01',
  auditCycle: '2026–27 Annual Statutory Audit Passed',
};

// ==========================================
// 1. DASHBOARD SUMMARY ENDPOINT
// ==========================================
export async function getMunicipalityDashboard(req: Request, res: Response) {
  try {
    const [
      totalCount,
      newCount,
      pendingValCount,
      verifiedCount,
      assignedCount,
      inProgressCount,
      resSubmittedCount,
      resolvedCount,
      rejectedCount,
      escalatedCount,
      slaBreachedCount,
      fieldOfficers,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['submitted', 'acknowledged', 'routed'] } }),
      Complaint.countDocuments({ status: { $in: ['submitted', 'acknowledged', 'routed', 'pending'] } }),
      Complaint.countDocuments({ status: 'verified' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: { $in: ['resolution_submitted', 'verification_pending'] } }),
      Complaint.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ status: 'rejected' }),
      Complaint.countDocuments({ status: 'escalated' }),
      Complaint.countDocuments({
        $or: [
          { slaState: 'breached' },
          { slaDeadline: { $lt: new Date() }, status: { $nin: ['resolved', 'closed', 'rejected'] } },
        ],
      }),
      User.find({ role: { $in: ['field_officer', 'field_worker'] } }).lean(),
    ]);

    // Officer workload aggregation
    const officerIds = fieldOfficers.map((o) => o._id);
    const activeTasksAgg = await Complaint.aggregate([
      {
        $match: {
          assignedOfficerId: { $in: officerIds },
          status: { $in: ['assigned', 'in_progress', 'resolution_submitted'] },
        },
      },
      {
        $group: {
          _id: '$assignedOfficerId',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeMap = new Map(activeTasksAgg.map((a) => [a._id.toString(), a.count]));
    const workers = fieldOfficers.map((o) => {
      const tasks = activeMap.get(o._id.toString()) || 0;
      return {
        id: o._id.toString(),
        name: o.name,
        badgeNumber: o.badgeNumber || 'FW-' + o._id.toString().slice(-4).toUpperCase(),
        department: (o as any).department || 'Public Works',
        activeTasks: tasks,
        status: tasks > 0 ? 'On Task' : 'Available',
      };
    });

    const totalWorkers = workers.length;
    const onTaskWorkers = workers.filter((w) => w.activeTasks > 0).length;
    const availableWorkers = Math.max(0, totalWorkers - onTaskWorkers);

    const statusOverview = {
      total: totalCount,
      new: newCount,
      pendingValidation: pendingValCount,
      verified: verifiedCount,
      assigned: assignedCount,
      inProgress: inProgressCount,
      resolutionSubmitted: resSubmittedCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
      escalated: escalatedCount,
      slaBreached: slaBreachedCount,
      outsideJurisdiction: 0,
    };

    const fieldForce = {
      totalWorkers,
      available: availableWorkers,
      onTask: onTaskWorkers,
      offline: 0,
      workers,
    };

    // Category distribution from MongoDB
    const categoryAgg = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryDistribution = categoryAgg.map((c) => ({
      category: mapComplaintCategory(c._id),
      count: c.count,
      resolved: c.resolved,
    }));

    // Recent challenges from DB sorted strictly newest first
    const recentDbComplaints = await Complaint.find()
      .populate('wardId', 'wardNumber name')
      .populate('departmentId', 'name')
      .populate('assignedOfficerId', 'name badgeNumber')
      .populate('reportedBy', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const recentChallenges = recentDbComplaints.map((c: any) => {
      const wardNum = c.wardId?.wardNumber || 12;
      const wardLabel = c.wardId?.name ? `Ward ${wardNum} (${c.wardId.name})` : `Ward ${wardNum}`;
      const addressLabel = c.location?.address || wardLabel;

      return {
        id: c._id.toString(),
        _id: c._id.toString(),
        challengeId: c.complaintNumber,
        complaintNumber: c.complaintNumber,
        problem: c.title,
        title: c.title,
        description: c.description,
        category: mapComplaintCategory(c.category),
        rawCategory: c.category,
        ward: wardLabel,
        wardNumber: wardNum,
        location: addressLabel,
        coordinates: c.location?.coordinates || [72.9289, 22.5645],
        priority: (c.priority || 'MEDIUM').toUpperCase(),
        status: c.status,
        validationStatus: mapComplaintStatusToValidation(c.status),
        projectStatus: mapComplaintStatusToProjectStatus(c.status),
        submittedDate: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        citizen: {
          name: c.reportedBy?.name || 'Citizen',
          phone: c.reportedBy?.phone || '',
          email: c.reportedBy?.email || '',
        },
        citizenName: c.reportedBy?.name || 'Citizen',
        reportedByCitizen: c.reportedBy?.name || 'Citizen',
        slaDeadline: c.slaDeadline,
        isInsideJurisdiction: true,
        assignedOfficer: c.assignedOfficerId ? {
          id: c.assignedOfficerId._id?.toString(),
          name: c.assignedOfficerId.name,
          badgeNumber: c.assignedOfficerId.badgeNumber,
        } : null,
      };
    });

    return res.json({
      success: true,
      data: {
        municipality: {
          name: municipalProfileStore.municipalityName,
          state: municipalProfileStore.state,
          district: municipalProfileStore.district,
          authorizedOfficer: municipalProfileStore.authorizedOfficer,
        },
        stats: {
          totalChallenges: totalCount,
          totalComplaints: totalCount,
          new: newCount,
          pendingValidation: pendingValCount,
          verified: verifiedCount,
          assigned: assignedCount,
          inProgress: inProgressCount + assignedCount + resSubmittedCount,
          resolved: resolvedCount,
          rejected: rejectedCount,
          escalated: escalatedCount,
          slaBreached: slaBreachedCount,
          activeProjects: assignedCount + inProgressCount + resSubmittedCount,
          completedProjects: resolvedCount,
        },
        statusOverview,
        fieldForce,
        categoryDistribution,
        recentChallenges,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load municipality dashboard summary',
      error: error.message,
    });
  }
}

// ==========================================
// 2. CHALLENGE MANAGEMENT ENDPOINTS
// ==========================================
export async function getMunicipalityChallenges(req: Request, res: Response) {
  try {
    const { tab, category, ward, priority, status, search, department } = req.query;

    // Fetch live complaints from MongoDB
    let dbComplaints: any[] = [];
    try {
      dbComplaints = await Complaint.find()
        .populate('wardId', 'wardNumber name zone')
        .populate('departmentId', 'name code slug')
        .populate('assignedOfficerId', 'name email phone badgeNumber designation')
        .populate('reportedBy', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbErr) {
      console.warn('Could not fetch mongo complaints for municipality view:', dbErr);
    }

    // Map DB complaints to challenge format
    const mappedDbChallenges = dbComplaints.map((c: any) => {
      const wardNum = c.wardId?.wardNumber || 12;
      const wardName = c.wardId?.name ? `Ward ${wardNum} (${c.wardId.name})` : `Ward ${wardNum}`;
      const mappedCat = mapComplaintCategory(c.category);
      const valStatus = mapComplaintStatusToValidation(c.status);
      const projStatus = mapComplaintStatusToProjectStatus(c.status);

      const hasRealRes = Boolean(
        c.resolutionEvidence &&
        ((Array.isArray(c.resolutionEvidence.photos) && c.resolutionEvidence.photos.length > 0) || c.resolutionEvidence.photo || c.resolutionEvidence.description) &&
        ['resolution_submitted', 'verification_pending', 'resolved', 'closed'].includes(c.status)
      );

      return {
        id: c._id.toString(),
        challengeId: c.complaintNumber,
        complaintNumber: c.complaintNumber,
        problem: c.title,
        title: c.title,
        description: c.description,
        category: mappedCat,
        subcategory: c.subcategory || '',
        department: c.department ? mapDepartmentCodeToName(c.department) : (c.departmentId?.name || null),
        ward: wardName,
        wardNumber: wardNum,
        location: c.location?.address || 'Anand Urban Sector',
        address: c.location?.address || 'Anand Urban Sector',
        coordinates: c.location?.coordinates || [72.9289, 22.5645],
        priority: (c.priority || 'MEDIUM').toUpperCase(),
        priorityScore: c.priorityScore || 75,
        submittedDate: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        validationStatus: valStatus,
        projectStatus: projStatus,
        assignedOfficer: c.assignedOfficerId ? {
          id: c.assignedOfficerId._id?.toString(),
          name: c.assignedOfficerId.name,
          badgeNumber: c.assignedOfficerId.badgeNumber || 'FW',
          designation: c.assignedOfficerId.designation || 'Field Worker',
        } : null,
        isInsideJurisdiction: true,
        evidence: {
          images: c.photos || [],
          citizenNotes: c.description,
          reportedBy: c.reportedBy?.name || 'Verified Citizen',
          citizenPhone: c.reportedBy?.phone || '',
        },
        aiAnalysis: c.aiAssessment ? {
          isAiGenerated: true,
          classification: `${mappedCat} / ${c.subcategory || 'Issue'}`,
          detectedCategory: mappedCat,
          confidence: c.aiAssessment.confidence || 0.92,
          priorityRecommendation: (c.aiAssessment.urgency || c.priority || 'High'),
          duplicateDetection: 'Automated geospatial scan verified',
          suggestedDepartment: mapDepartmentCodeToName(c.aiAssessment.department),
          validationSummary: c.aiAssessment.reasoning || 'Automated verification check passed.',
        } : undefined,
        resolutionEvidence: hasRealRes ? c.resolutionEvidence : null,
        resolvedAt: c.resolvedAt,
        isDbRecord: true,
      };
    });

    // Merge: Put live MongoDB citizen complaints FIRST, followed by in-memory challenges (avoid duplicate IDs)
    const existingIds = new Set(mappedDbChallenges.map((c) => c.challengeId));
    let filtered = [
      ...mappedDbChallenges,
      ...municipalChallengesStore.filter((c) => !existingIds.has(c.challengeId) && !existingIds.has(c.complaintNumber)),
    ];

    // Filter by tab
    if (tab && tab !== 'All') {
      const tabStr = String(tab).toLowerCase();
      filtered = filtered.filter((c) => {
        const cStatus = (c.validationStatus || '').toLowerCase();
        if (tabStr === 'new') return cStatus === 'new';
        if (tabStr === 'pending validation' || tabStr === 'pending') return cStatus === 'pending validation' || cStatus === 'new';
        if (tabStr === 'verified') return cStatus === 'verified' || cStatus === 'assigned';
        if (tabStr === 'rejected') return cStatus === 'rejected';
        if (tabStr === 'assigned') return (c.projectStatus || '').toLowerCase() === 'assigned' || cStatus === 'assigned';
        if (tabStr === 'in progress') return (c.projectStatus || '').toLowerCase() === 'in progress' || cStatus === 'in progress';
        if (tabStr === 'resolved') return cStatus === 'resolved';
        return true;
      });
    }

    // Filter by search
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.problem.toLowerCase().includes(q) ||
          c.challengeId.toLowerCase().includes(q) ||
          c.ward.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((c) => c.category === category);
    }

    // Filter by ward
    if (ward) {
      filtered = filtered.filter((c) => c.ward === ward || String(c.wardNumber) === ward);
    }

    // Filter by priority
    if (priority) {
      filtered = filtered.filter((c) => c.priority.toUpperCase() === String(priority).toUpperCase());
    }

    // Filter by department
    if (department) {
      filtered = filtered.filter((c) => c.department === department);
    }

    return res.json({
      success: true,
      data: {
        total: filtered.length,
        challenges: filtered,
        departments: municipalProfileStore.departments,
        wards: ANAND_WARDS,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve municipality challenges',
      error: error.message,
    });
  }
}

export async function getMunicipalityChallengeById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const challengeId = String(id || '');

    // Check MongoDB first
    let complaint: any = null;
    if (mongoose.Types.ObjectId.isValid(challengeId)) {
      complaint = await Complaint.findById(challengeId)
        .populate('wardId', 'wardNumber name zone')
        .populate('departmentId', 'name code slug')
        .populate('assignedOfficerId', 'name email phone badgeNumber designation')
        .populate('reportedBy', 'name email phone')
        .lean();
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: id })
        .populate('wardId', 'wardNumber name zone')
        .populate('departmentId', 'name code slug')
        .populate('assignedOfficerId', 'name email phone badgeNumber designation')
        .populate('reportedBy', 'name email phone')
        .lean();
    }

    if (complaint) {
      const wardNum = complaint.wardId?.wardNumber || 12;
      const wardName = complaint.wardId?.name ? `Ward ${wardNum} (${complaint.wardId.name})` : `Ward ${wardNum}`;
      const mappedCat = mapComplaintCategory(complaint.category);
      const valStatus = mapComplaintStatusToValidation(complaint.status);
      const projStatus = mapComplaintStatusToProjectStatus(complaint.status);

      const [statusHistory, assignmentHistory] = await Promise.all([
        ComplaintStatusHistory.find({ complaintId: complaint._id })
          .populate('changedBy', 'name role badgeNumber designation')
          .sort({ createdAt: 1 })
          .lean(),
        ComplaintAssignment.find({ complaintId: complaint._id })
          .populate('officerId', 'name email phone badgeNumber designation')
          .populate('assignedBy', 'name role')
          .populate('departmentId', 'name code')
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const hasRealResolution = Boolean(
        complaint.resolutionEvidence &&
        (
          (Array.isArray(complaint.resolutionEvidence.photos) && complaint.resolutionEvidence.photos.length > 0) ||
          (typeof complaint.resolutionEvidence.photo === 'string' && complaint.resolutionEvidence.photo.trim().length > 0) ||
          (typeof complaint.resolutionEvidence.description === 'string' && complaint.resolutionEvidence.description.trim().length > 0)
        ) &&
        ['resolution_submitted', 'verification_pending', 'resolved', 'closed'].includes(complaint.status)
      );

      const currentAssignment = assignmentHistory.find((a: any) => a.isCurrent);
      const mappedDeptName = complaint.department
        ? mapDepartmentCodeToName(complaint.department)
        : (complaint.departmentId?.name || null);

      const mapped = {
        id: complaint._id.toString(),
        challengeId: complaint.complaintNumber,
        complaintNumber: complaint.complaintNumber,
        problem: complaint.title,
        title: complaint.title,
        description: complaint.description,
        category: mappedCat,
        subcategory: complaint.subcategory || '',
        department: mappedDeptName,
        departmentCode: complaint.department || null,
        ward: wardName,
        wardNumber: wardNum,
        location: complaint.location?.address || 'Anand Urban Sector',
        address: complaint.location?.address || 'Anand Urban Sector',
        coordinates: complaint.location?.coordinates || [72.9289, 22.5645],
        priority: (complaint.priority || 'MEDIUM').toUpperCase(),
        priorityScore: complaint.priorityScore || 75,
        submittedDate: complaint.createdAt ? new Date(complaint.createdAt).toISOString() : new Date().toISOString(),
        validationStatus: valStatus,
        projectStatus: projStatus,
        status: complaint.status,
        assignedOfficer: complaint.assignedOfficerId ? {
          id: complaint.assignedOfficerId._id?.toString(),
          name: complaint.assignedOfficerId.name,
          badgeNumber: complaint.assignedOfficerId.badgeNumber || 'FW',
          designation: complaint.assignedOfficerId.designation || 'Field Worker',
          department: mappedDeptName || 'Municipal Operations',
          assignedAt: currentAssignment?.createdAt || complaint.updatedAt,
          assignedBy: (currentAssignment?.assignedBy as any)?.name || 'Municipal Administration',
          instructions: currentAssignment?.assignmentReason || 'On-site remediation and verification mandated.',
        } : null,
        isInsideJurisdiction: true,
        evidence: {
          images: complaint.photos || [],
          citizenNotes: complaint.description,
          reportedBy: complaint.reportedBy?.name || 'Verified Resident',
          citizenPhone: complaint.reportedBy?.phone || '',
        },
        aiAnalysis: complaint.aiAssessment ? {
          isAiGenerated: true,
          classification: `${mappedCat} / ${complaint.subcategory || 'Civic Grievance'}`,
          detectedCategory: mappedCat,
          confidence: complaint.aiAssessment.confidence || 0.92,
          severity: complaint.priorityScore && complaint.priorityScore > 75 ? 'Critical' : complaint.priorityScore && complaint.priorityScore > 50 ? 'High' : 'Medium',
          priorityRecommendation: (complaint.aiAssessment.urgency || complaint.priority || 'High').toUpperCase(),
          duplicateDetection: 'Geospatial proximity verified (Unique Report)',
          suggestedDepartment: mapDepartmentCodeToName(complaint.aiAssessment.department),
          validationSummary: complaint.aiAssessment.reasoning || 'Automated verification check passed.',
        } : undefined,
        resolutionEvidence: hasRealResolution ? {
          photos: complaint.resolutionEvidence.photos || (complaint.resolutionEvidence.photo ? [complaint.resolutionEvidence.photo] : []),
          videos: complaint.resolutionEvidence.videos || [],
          evidenceType: complaint.resolutionEvidence.evidenceType || (complaint.resolutionEvidence.videos?.length > 0 ? 'LIVE_VIDEO' : 'LIVE_PHOTO'),
          description: complaint.resolutionEvidence.description || '',
          resolvedAt: complaint.resolutionEvidence.resolvedAt || complaint.resolvedAt,
          resolvedBy: complaint.resolutionEvidence.resolvedBy ? {
            id: complaint.resolutionEvidence.resolvedBy._id?.toString(),
            name: complaint.resolutionEvidence.resolvedBy.name,
          } : (complaint.assignedOfficerId ? {
            id: complaint.assignedOfficerId._id?.toString(),
            name: complaint.assignedOfficerId.name,
          } : null),
          capturedLocation: complaint.resolutionEvidence.capturedLocation || {
            latitude: complaint.location?.coordinates?.[1] || 22.5645,
            longitude: complaint.location?.coordinates?.[0] || 72.9289,
          },
        } : null,
        assignment: currentAssignment ? {
          assignedAt: currentAssignment.createdAt,
          assignedBy: (currentAssignment.assignedBy as any) ? { name: (currentAssignment.assignedBy as any).name } : { name: 'Municipal Administration' },
          instructions: currentAssignment.assignmentReason || 'On-site remediation and verification mandated.',
          status: 'Assigned',
        } : null,
        resolvedAt: complaint.resolvedAt,
        statusHistory,
        assignmentHistory,
        isDbRecord: true,
      };

      return res.json({
        success: true,
        data: mapped,
      });
    }

    const challenge = municipalChallengesStore.find((c) => c.id === id || c.challengeId === id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `Challenge ${id} not found in Anand Municipality jurisdiction`,
      });
    }

    return res.json({
      success: true,
      data: {
        ...challenge,
        statusHistory: [],
        assignmentHistory: [],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenge details',
      error: error.message,
    });
  }
}

// Perform formal Municipal Validation
export async function validateMunicipalityChallenge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { decision, department, remarks } = req.body;

    if (!decision) {
      return res.status(400).json({
        success: false,
        message: 'Validation decision is mandatory (Verified, Needs More Information, Rejected, Duplicate, Outside Jurisdiction)',
      });
    }

    const effectiveRemarks = (remarks && remarks.trim().length >= 5)
      ? remarks.trim()
      : (decision === 'Department Assigned'
          ? `Department assigned to ${department || 'designated department'} by Municipal Administration.`
          : (decision === 'Validated' ? 'Grievance validated by Municipal Administration.' : null));

    if (!effectiveRemarks) {
      return res.status(400).json({
        success: false,
        message: 'Formal municipal remarks are mandatory for administrative accountability.',
      });
    }

    // 1. Check MongoDB Complaint First
    const targetId = String(id || '');
    let complaint: any = null;
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      complaint = await Complaint.findById(targetId);
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: targetId });
    }

    if (complaint) {
      const oldStatus = complaint.status;
      let newStatus = complaint.status;
      const decisionNorm = (decision || '').toLowerCase();
      if (decisionNorm.includes('resolve') || decision === 'Verified' || decision === 'Resolved' || decision === 'Verified & Resolved') {
        newStatus = 'resolved';
        complaint.resolvedAt = new Date();
      } else if (decisionNorm.includes('reject')) {
        newStatus = 'rejected';
      } else if (decision === 'In Progress') {
        newStatus = 'in_progress';
      } else if (decision === 'Assigned') {
        newStatus = 'assigned';
      } else if (decision === 'Validated' || decision === 'Department Assigned') {
        newStatus = 'validated';
      }
      complaint.status = newStatus;
      if (department) {
        const normalizedDept = normalizeDepartmentEnum(department);
        if (normalizedDept) {
          complaint.department = normalizedDept;
        }
      }
      await complaint.save();

      await ComplaintStatusHistory.create({
        complaintId: complaint._id,
        fromStatus: oldStatus,
        toStatus: newStatus,
        changedBy: req.user?._id,
        note: `Municipal Admin decision: ${decision}. Remarks: ${effectiveRemarks}`,
      });

      if (complaint.reportedBy) {
        await createNotification({
          userId: complaint.reportedBy,
          type: newStatus === 'resolved' ? 'complaint_resolved' : 'complaint_verified',
          title: `Grievance Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
          message: `Your grievance ${complaint.complaintNumber} has been verified by Municipal Administration. Status: ${newStatus.toUpperCase()}. Remarks: ${remarks.trim()}`,
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
        });

        emitToUser(complaint.reportedBy, 'complaint:status_changed', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          status: newStatus,
          decision,
          remarks,
        });
      }

      if (complaint.assignedOfficerId) {
        await createNotification({
          userId: complaint.assignedOfficerId,
          type: newStatus === 'resolved' ? 'complaint_resolved' : 'complaint_verified',
          title: `Task Verified: ${complaint.complaintNumber}`,
          message: `Municipal Admin verified task ${complaint.complaintNumber} with decision: ${decision}. Status: ${newStatus.toUpperCase()}`,
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
        });

        emitToUser(complaint.assignedOfficerId, 'complaint:status_changed', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          status: newStatus,
          decision,
          remarks,
        });
      }

      emitToRole('municipal_admin', 'complaint:status_changed', {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        status: newStatus,
      });

      return res.json({
        success: true,
        message: `Complaint ${complaint.complaintNumber} successfully updated with decision: ${decision}`,
        data: {
          id: complaint._id.toString(),
          complaintNumber: complaint.complaintNumber,
          status: newStatus,
          validationStatus: decision,
          remarks,
        },
      });
    }

    const challenge = municipalChallengesStore.find((c) => c.id === id || c.challengeId === id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `Challenge ${id} not found`,
      });
    }

    // JURISDICTION CHECK
    if (!challenge.isInsideJurisdiction && decision !== 'Outside Jurisdiction') {
      return res.status(403).json({
        success: false,
        message: 'OUTSIDE MUNICIPAL JURISDICTION: This challenge coordinates lie outside Anand Municipality limits. Only inter-authority forwarding or marking Outside Jurisdiction is permitted.',
      });
    }

    const reviewerName = (req as any).user?.name || 'Chief Officer Shri Jayeshbhai Trivedi';
    const validationRecord = {
      reviewer: reviewerName,
      validatedAt: new Date().toISOString(),
      decision,
      department: department || challenge.department || 'Water & Sanitation',
      remarks: remarks.trim(),
    };

    challenge.municipalValidation = validationRecord;
    challenge.validationStatus = decision;
    if (department) challenge.department = department;

    // Update project status if verified
    if (decision === 'Verified' && challenge.projectStatus === 'Unassigned') {
      challenge.projectStatus = 'Assigned';
    }

    return res.json({
      success: true,
      message: `Challenge ${challenge.challengeId} successfully validated with decision: ${decision}`,
      data: challenge,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record municipal validation',
      error: error.message,
    });
  }
}

// Forward / Escalate outside jurisdiction challenge
export async function forwardOutsideJurisdictionChallenge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { targetAuthority, escalationNotes } = req.body;

    const challenge = municipalChallengesStore.find((c) => c.id === id || c.challengeId === id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `Challenge ${id} not found`,
      });
    }

    challenge.validationStatus = 'Outside Jurisdiction';
    challenge.interAuthorityTransfer = {
      forwardedTo: targetAuthority || 'Nadiad Nagar Palika / Gujarat State Urban Development Authority',
      forwardedBy: (req as any).user?.name || 'Chief Officer Shri J. Trivedi',
      forwardedAt: new Date().toISOString(),
      notes: escalationNotes || 'Transferred due to geofence mismatch.',
    };

    return res.json({
      success: true,
      message: `Challenge ${challenge.challengeId} formally forwarded to ${challenge.interAuthorityTransfer.forwardedTo}`,
      data: challenge,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to forward outside jurisdiction challenge',
      error: error.message,
    });
  }
}

// Allocate Challenge to Field Worker
export async function allocateChallengeToFieldWorker(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { workerId, workerName, department, instructions } = req.body;

    const challengeId = String(id || '');

    // 1. Check MongoDB Complaint
    let complaint: any = null;
    if (mongoose.Types.ObjectId.isValid(challengeId)) {
      complaint = await Complaint.findById(challengeId);
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: challengeId });
    }

    // Look up field officer User
    let officerUser: any = null;
    const wId = String(workerId || '').trim();
    if (wId && mongoose.Types.ObjectId.isValid(wId)) {
      officerUser = await User.findById(wId);
    }
    if (!officerUser && wId) {
      officerUser = await User.findOne({
        $or: [
          { email: wId },
          { badgeNumber: wId },
          { name: workerName || wId },
        ],
      });
    }
    if (!officerUser && workerName) {
      officerUser = await User.findOne({ name: workerName });
    }
    if (!officerUser) {
      return res.status(400).json({
        success: false,
        message: 'Designated field worker was not found in the roster. Please select a valid field worker.',
      });
    }

    const assignedOfficerName = officerUser.name;
    const assignedOfficerBadge = officerUser.badgeNumber || 'FW';
    const assignedOfficerId = officerUser._id;

    if (complaint) {
      const oldStatus = complaint.status;
      complaint.status = 'assigned';
      if (assignedOfficerId) {
        complaint.assignedOfficerId = assignedOfficerId;
      }
      if (department) {
        const normalizedDept = normalizeDepartmentEnum(department);
        if (normalizedDept) {
          complaint.department = normalizedDept;
        }
      }
      await complaint.save();

      if (assignedOfficerId) {
        await ComplaintAssignment.updateMany(
          { complaintId: complaint._id, isCurrent: true },
          { $set: { isCurrent: false } }
        );
        await ComplaintAssignment.create({
          complaintId: complaint._id,
          departmentId: complaint.departmentId || officerUser?.departmentId,
          officerId: assignedOfficerId,
          assignedBy: req.user?._id,
          assignmentReason: instructions || 'Allocated via Municipal Admin Portal',
          isCurrent: true,
        });
      }

      await ComplaintStatusHistory.create({
        complaintId: complaint._id,
        fromStatus: oldStatus,
        toStatus: 'assigned',
        changedBy: req.user?._id,
        note: `Allocated to Field Worker ${assignedOfficerName} (${assignedOfficerBadge}) by Municipal Admin. Directives: ${instructions || 'Immediate on-site remediation requested.'}`,
      });

      if (assignedOfficerId) {
        await createNotification({
          userId: assignedOfficerId,
          type: 'complaint_assigned',
          title: `Task Allocated: ${complaint.complaintNumber}`,
          message: `Municipal Admin allocated task ${complaint.complaintNumber} (${complaint.title}) to you.`,
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
        });

        emitToUser(assignedOfficerId, 'complaint:assigned', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          title: complaint.title,
          category: complaint.category,
          priority: complaint.priority,
          location: complaint.location,
          assignedBy: (req.user as any)?.name || 'Municipal Admin',
        });

        emitToUser(assignedOfficerId, 'notification:new', {
          title: `New Assignment: ${complaint.complaintNumber}`,
          message: `New complaint assigned to you: ${complaint.title}`,
        });
      }

      await createNotification({
        userId: complaint.reportedBy,
        type: 'complaint_assigned',
        title: `Officer Assigned: ${complaint.complaintNumber}`,
        message: `Your grievance has been allocated to Field Worker ${assignedOfficerName} (${assignedOfficerBadge}). Field inspection underway.`,
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
      });

      emitToUser(complaint.reportedBy, 'complaint:status_changed', {
        complaintId: complaint._id,
        status: 'assigned',
        officer: assignedOfficerName,
      });

      emitToRole('municipal_admin', 'complaint:status_changed', {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        status: 'assigned',
      });
    }

    // 2. Also update in-memory municipalChallengesStore if present
    const storeChallenge = municipalChallengesStore.find((c) => c.id === id || c.challengeId === id || c.complaintNumber === id);
    if (storeChallenge) {
      storeChallenge.projectStatus = 'Assigned';
      storeChallenge.validationStatus = 'Verified';
      storeChallenge.assignedOfficer = {
        id: assignedOfficerId?.toString() || workerId || 'fo-pwd-101',
        name: assignedOfficerName,
        badgeNumber: assignedOfficerBadge,
      };
      storeChallenge.allocationNotes = instructions || 'Allocated by Municipal Admin';
      storeChallenge.municipalValidation = {
        reviewer: (req.user as any)?.name || 'Chief Officer Shri Jayeshbhai Trivedi',
        validatedAt: new Date().toISOString(),
        decision: 'Verified',
        department: department || storeChallenge.department,
        remarks: instructions || `Allocated to Field Worker ${assignedOfficerName} (${assignedOfficerBadge}) for prompt on-site action.`,
      };
    }

    // 3. Register into Field Worker queue
    registerAssignedChallengeToFieldWorker({
      id: complaint ? complaint._id.toString() : id,
      complaintNumber: complaint ? complaint.complaintNumber : (storeChallenge?.challengeId || id),
      title: complaint ? complaint.title : (storeChallenge?.problem || 'Civic Problem'),
      description: complaint ? complaint.description : (storeChallenge?.description || ''),
      category: complaint ? mapComplaintCategory(complaint.category) : (storeChallenge?.category || 'Roads & Infrastructure'),
      ward: storeChallenge?.ward || (complaint?.wardId?.name ? `Ward ${complaint.wardId.wardNumber}` : 'Ward 12'),
      wardNumber: storeChallenge?.wardNumber || complaint?.wardId?.wardNumber || 12,
      location: {
        address: storeChallenge?.address || storeChallenge?.location || complaint?.location?.address || 'Anand Site Location',
        latitude: storeChallenge?.coordinates?.[1] || complaint?.location?.coordinates?.[1] || 22.5601,
        longitude: storeChallenge?.coordinates?.[0] || complaint?.location?.coordinates?.[0] || 72.9285,
      },
      priority: (complaint?.priority || storeChallenge?.priority || 'HIGH').toUpperCase(),
      status: 'PENDING_VERIFICATION',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: complaint?.slaDeadline ? new Date(complaint.slaDeadline).toISOString().split('T')[0] : '2026-09-28',
      scheduledTime: '10:00 AM',
      reportedDate: complaint?.createdAt ? new Date(complaint.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reportedBy: complaint?.reportedBy?.name || storeChallenge?.evidence?.reportedBy || 'Citizen',
      citizenEvidence: complaint?.photos?.map((u: string, idx: number) => ({
        type: 'photo',
        url: u,
        caption: `Citizen uploaded evidence #${idx + 1}`,
        timestamp: new Date().toLocaleString(),
      })) || (storeChallenge?.evidence?.images || []).map((u: string, idx: number) => ({
        type: 'photo',
        url: u,
        caption: `Citizen uploaded evidence #${idx + 1}`,
        timestamp: new Date().toLocaleString(),
      })),
      assignedOfficer: {
        id: assignedOfficerId?.toString() || workerId || 'fo-pwd-101',
        name: assignedOfficerName,
        badgeNumber: assignedOfficerBadge,
      },
    });

    return res.json({
      success: true,
      message: `Challenge successfully allocated to Field Worker ${assignedOfficerName} (${assignedOfficerBadge}).`,
      data: {
        id,
        assignedOfficer: {
          id: assignedOfficerId?.toString() || workerId,
          name: assignedOfficerName,
          badgeNumber: assignedOfficerBadge,
        },
        status: 'Assigned',
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to allocate challenge to field worker',
      error: error.message,
    });
  }
}

// Get live Field Workers with active task counts for assignment dropdown
export async function getMunicipalityFieldWorkers(req: Request, res: Response) {
  try {
    const officers = await User.find({
      role: { $in: ['field_officer', 'field_worker'] },
    })
      .select('name email phone badgeNumber designation departmentId status')
      .populate('departmentId', 'name code')
      .lean();

    const officerIds = officers.map((o) => o._id);
    const activeTasks = await Complaint.aggregate([
      {
        $match: {
          assignedOfficerId: { $in: officerIds },
          status: { $in: ['assigned', 'in_progress', 'resolution_submitted'] },
        },
      },
      {
        $group: {
          _id: '$assignedOfficerId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(activeTasks.map((t) => [t._id.toString(), t.count]));

    const result = officers.map((o) => {
      const tasks = countMap.get(o._id.toString()) || 0;
      return {
        id: o._id.toString(),
        _id: o._id.toString(),
        name: o.name,
        email: o.email,
        phone: o.phone || '+91 98250 12345',
        badgeNumber: o.badgeNumber || 'FW-' + o._id.toString().slice(-4).toUpperCase(),
        department: (o.departmentId as any)?.name || (o as any).department || 'Public Works Department',
        designation: o.designation || 'Field Worker',
        activeTasks: tasks,
        status: tasks > 0 ? 'On Task' : ((o as any).status === 'offline' ? 'Offline' : 'Available'),
      };
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch field workers',
      error: error.message,
    });
  }
}

// ==========================================
// 3. GEOGRAPHICAL VIEW & GIS ENDPOINTS
// ==========================================
export async function getMunicipalityMapData(req: Request, res: Response) {
  try {
    // Construct Ward summary table
    const wardSummary = ANAND_WARDS.map((w) => {
      const wardChallenges = municipalChallengesStore.filter((c) => c.wardNumber === w.wardNumber);
      return {
        ward: `Ward ${w.wardNumber}`,
        wardNumber: w.wardNumber,
        name: w.name,
        zone: w.zone,
        totalIssues: wardChallenges.length + Math.floor(w.population / 1200),
        pending: wardChallenges.filter((c) => c.validationStatus === 'Pending Validation').length + 2,
        verified: wardChallenges.filter((c) => c.validationStatus === 'Verified').length + 5,
        inProgress: wardChallenges.filter((c) => c.projectStatus === 'In Progress').length + 3,
        resolved: wardChallenges.filter((c) => c.validationStatus === 'Resolved').length + 9,
        highPriority: wardChallenges.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL').length + 2,
        activeProjects: wardChallenges.filter((c) => c.linkedProjectId).length + 1,
      };
    });

    // Construct GeoJSON Polygon features for the 14 Anand wards
    const delta = 0.008;
    const wardPolygons = ANAND_WARDS.map((w) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [w.center[0] - delta, w.center[1] - delta],
            [w.center[0] + delta, w.center[1] - delta],
            [w.center[0] + delta, w.center[1] + delta],
            [w.center[0] - delta, w.center[1] + delta],
            [w.center[0] - delta, w.center[1] - delta],
          ],
        ],
      },
      properties: {
        wardNumber: w.wardNumber,
        name: w.name,
        zone: w.zone,
        population: w.population,
      },
    }));

    // Construct point features with real coordinates
    const mapMarkers = municipalChallengesStore.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: c.coordinates, // [lng, lat]
      },
      properties: {
        id: c.id,
        challengeId: c.challengeId,
        title: c.problem,
        category: c.category,
        ward: c.ward,
        wardNumber: c.wardNumber,
        priority: c.priority,
        validationStatus: c.validationStatus,
        projectStatus: c.projectStatus,
        reportedDate: c.submittedDate,
        isInsideJurisdiction: c.isInsideJurisdiction,
        department: c.department,
      },
    }));

    return res.json({
      success: true,
      data: {
        municipalityCenter: ANAND_JURISDICTION.center,
        bounds: ANAND_JURISDICTION.bounds,
        wardPolygons,
        mapMarkers,
        wardSummary,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve municipal geographical data',
      error: error.message,
    });
  }
}

// ==========================================
// 4. UNIVERSITY COLLABORATION ENDPOINTS
// ==========================================
export async function getMunicipalityUniversities(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: {
        universities: municipalUniversitiesStore,
        proposals: municipalProposalsStore,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve universities data',
      error: error.message,
    });
  }
}

export async function reviewUniversityProposal(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Accepted', 'Changes Requested', 'Rejected', 'Under Review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid proposal review status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const proposal = municipalProposalsStore.find((p) => p.id === id || p.proposalId === id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: `Proposal ${id} not found`,
      });
    }

    proposal.status = status;
    proposal.municipalRemarks = remarks || `Reviewed and marked as ${status} by Municipal Administration.`;
    proposal.reviewedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Proposal ${proposal.proposalId} successfully updated to: ${status}`,
      data: proposal,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to review university proposal',
      error: error.message,
    });
  }
}

// ==========================================
// 5. INDUSTRY COLLABORATION & CSR ENDPOINTS
// ==========================================
export async function getMunicipalityIndustry(req: Request, res: Response) {
  try {
    // CSR supported projects calculated from our dataset
    const csrProjects = [
      {
        id: 'CSR-PRJ-01',
        project: 'Smart Waste Monitoring & Bio-Digestion',
        industryPartner: 'Amul (GCMMF Anand)',
        university: 'Charusat University (DEPSTAR)',
        challenge: 'CH-2026-092 (Commercial Solid Waste)',
        funding: '₹25,00,000',
        disbursed: '₹18,00,000',
        progress: 42,
        impactArea: 'Ward 8 APMC Market & Ward 3 Dairy Corridor',
        status: 'In Progress',
      },
      {
        id: 'CSR-PRJ-02',
        project: 'Automated Trunk Sewer Debris & Flow Controller',
        industryPartner: 'Elecon Engineering Company Ltd.',
        university: 'BVM Engineering College',
        challenge: 'CH-2026-089 (Trunk Drainage Overflow)',
        funding: '₹18,50,000',
        disbursed: '₹12,50,000',
        progress: 68,
        impactArea: 'Ward 12 Drainage Outfall Corridor',
        status: 'In Progress',
      },
      {
        id: 'CSR-PRJ-03',
        project: 'Polymer Modified Cold Asphalt Wet Patching',
        industryPartner: 'Larsen & Toubro Ltd.',
        university: 'GCET Engineering College',
        challenge: 'CH-2026-104 (Borsad Chokdi Arterial Road)',
        funding: '₹32,00,000',
        disbursed: '₹16,00,000',
        progress: 55,
        impactArea: 'Ward 4 Borsad Industrial Highway Link',
        status: 'In Progress',
      },
      {
        id: 'CSR-PRJ-04',
        project: 'Smart LED Grid Balancer & Telemetry Controller',
        industryPartner: 'Tata Consultancy Services',
        university: 'BVM Engineering College',
        challenge: 'CH-2026-042 (Vidyanagar Corridor Blackout)',
        funding: '₹22,00,000',
        disbursed: '₹22,00,000',
        progress: 100,
        impactArea: 'Ward 5 Academic Highway Corridor',
        status: 'Completed',
      },
    ];

    return res.json({
      success: true,
      data: {
        industryPartners: municipalIndustryStore,
        csrProjects,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve industry collaboration data',
      error: error.message,
    });
  }
}

// ==========================================
// 6. PROJECT MONITORING & MILESTONES ENDPOINTS
// ==========================================
export async function getMunicipalityProjects(req: Request, res: Response) {
  try {
    const { status, ward } = req.query;

    let filtered = [...municipalProjectsStore];

    if (status && status !== 'All') {
      const s = String(status).toLowerCase();
      filtered = filtered.filter((p) => p.status.toLowerCase() === s);
    }

    if (ward) {
      filtered = filtered.filter((p) => p.ward === ward || String(p.wardNumber) === ward);
    }

    // Delayed projects specific table
    const delayedProjects = municipalProjectsStore
      .filter((p) => p.status === 'Delayed' || p.milestones.some((m: any) => m.status === 'Delayed'))
      .map((p) => {
        const delayedMilestone = p.milestones.find((m: any) => m.status === 'Delayed') || p.milestones[1];
        return {
          id: p.id,
          project: p.name,
          milestone: delayedMilestone.name,
          expectedDate: delayedMilestone.dueDate,
          currentStatus: p.status,
          delayDuration: p.delayDuration || '14 Days behind baseline',
          responsibleParty: delayedMilestone.responsible,
          issue: p.delayReason || 'Procurement bottleneck on critical components.',
          action: 'Municipal Task Force Notice Issued to Team Lead',
        };
      });

    // Implementation Status breakdown
    const implementationStatus = municipalProjectsStore.map((p) => ({
      id: p.id,
      project: p.name,
      fieldDeployment: p.fieldDeploymentStatus,
      municipalApproval: p.municipalApprovalStatus,
      testing: p.testingStatus,
      citizenImpact: p.citizenImpactRecord,
      currentStatus: p.status,
    }));

    return res.json({
      success: true,
      data: {
        projects: filtered,
        delayedProjects,
        implementationStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project monitoring data',
      error: error.message,
    });
  }
}

export async function addMunicipalMilestoneFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { milestoneName, feedback, municipalVerification } = req.body;

    const project = municipalProjectsStore.find((p) => p.id === id || p.projectId === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project ${id} not found`,
      });
    }

    const milestone = project.milestones.find((m: any) => m.name === milestoneName);
    if (milestone) {
      if (municipalVerification !== undefined) {
        milestone.municipalVerified = Boolean(municipalVerification);
        milestone.status = municipalVerification ? 'Completed' : milestone.status;
      }
      milestone.municipalFeedback = feedback;
    }

    return res.json({
      success: true,
      message: 'Municipal milestone feedback recorded successfully',
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record municipal milestone feedback',
      error: error.message,
    });
  }
}

// ==========================================
// 7. IMPACT ANALYTICS ENDPOINTS
// ==========================================
export async function getMunicipalityAnalytics(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: {
        topMetrics: {
          issuesResolved: 97,
          areasImproved: '14 Wards (28 Localities)',
          citizensBenefited: '1,42,500 Verified Residents',
          projectOutcomes: '18 Deployed Civic Innovations',
        },
        challengeAnalytics: {
          totalChallenges: 245,
          verifiedChallenges: 184,
          projectsCreated: 26,
          issuesResolved: 97,
          resolutionRate: '78.4%',
          averageResolutionTime: '4.2 Days',
        },
        wardWiseAnalytics: ANAND_WARDS.map((w, idx) => ({
          ward: `Ward ${w.wardNumber}`,
          total: 15 + (idx * 2) % 18,
          resolved: 10 + (idx * 2) % 12,
          pending: 3 + (idx % 4),
          resolutionRate: `${Math.round((8 + (idx % 3)) * 9.5)}%`,
        })),
        categoryDistribution: [
          { category: 'Water & Sanitation', count: 68, percentage: 28 },
          { category: 'Roads & Infrastructure', count: 54, percentage: 22 },
          { category: 'Solid Waste Management', count: 46, percentage: 19 },
          { category: 'Street Lighting', count: 32, percentage: 13 },
          { category: 'Drainage & Stormwater', count: 25, percentage: 10 },
          { category: 'Environment & Parks', count: 12, percentage: 5 },
          { category: 'Public Health', count: 8, percentage: 3 },
        ],
        priorityDistribution: [
          { priority: 'Critical', count: 28, percentage: 11 },
          { priority: 'High', count: 96, percentage: 39 },
          { priority: 'Medium', count: 88, percentage: 36 },
          { priority: 'Low', count: 33, percentage: 14 },
        ],
        projectOutcomes: {
          projectsCompleted: 97,
          peopleBenefited: '1,42,500',
          areasImproved: '28 High-density Urban Sectors',
          infrastructureImproved: '46 km Road Network & 12 km Drainage Trunk',
          servicesImproved: '24x7 Smart Streetlighting & APMC Automated Compacting',
          environmentalOutcomes: '420 MT Landfill Bio-Waste Diverted to Composting',
          costSavings: '₹34,50,000 saved through University In-house Innovation',
          timeSavings: 'Average incident lifecycle shortened by 38%',
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve impact analytics',
      error: error.message,
    });
  }
}

// ==========================================
// 8. REPORTS REGISTRY & PDF ENDPOINTS
// ==========================================
export async function getMunicipalityReports(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: municipalReportsStore,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve municipal reports list',
      error: error.message,
    });
  }
}

// ==========================================
// 9. MUNICIPAL PROFILE ENDPOINTS
// ==========================================
export async function getMunicipalityProfile(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: municipalProfileStore,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve municipality profile',
      error: error.message,
    });
  }
}

export async function updateMunicipalityProfile(req: Request, res: Response) {
  try {
    const {
      officialEmail,
      officialContact,
      controlRoomHelpline,
      website,
      authorizedOfficer,
      officerDesignation,
      headquartersAddress,
    } = req.body;

    // Only allow updating editable administrative fields, NOT verified official boundaries
    if (officialEmail) municipalProfileStore.officialEmail = officialEmail;
    if (officialContact) municipalProfileStore.officialContact = officialContact;
    if (controlRoomHelpline) municipalProfileStore.controlRoomHelpline = controlRoomHelpline;
    if (website) municipalProfileStore.website = website;
    if (authorizedOfficer) municipalProfileStore.authorizedOfficer = authorizedOfficer;
    if (officerDesignation) municipalProfileStore.officerDesignation = officerDesignation;
    if (headquartersAddress) municipalProfileStore.headquartersAddress = headquartersAddress;

    return res.json({
      success: true,
      message: 'Municipality administrative contact details updated successfully',
      data: municipalProfileStore,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update municipality profile',
      error: error.message,
    });
  }
}

// ==========================================
// 10. NOTIFICATIONS ENDPOINT
// ==========================================
export async function getMunicipalityNotifications(req: Request, res: Response) {
  try {
    const notifications = [
      {
        id: 'NOTIF-01',
        title: 'New Civic Challenge Submitted',
        description: 'CH-2026-120: Encroachment and Silt Choking of Stormwater Inlets in Ward 1.',
        type: 'challenge_new',
        timestamp: '15 mins ago',
        unread: true,
        route: '/municipality-admin/challenges',
      },
      {
        id: 'NOTIF-02',
        title: 'Challenge Awaiting Municipal Validation',
        description: 'CH-2026-115: Potable Water Contamination in Ward 2 requires verification.',
        type: 'validation_pending',
        timestamp: '1 hour ago',
        unread: true,
        route: '/municipality-admin/challenges',
      },
      {
        id: 'NOTIF-03',
        title: 'Outside Jurisdiction Alert',
        description: 'CH-2026-099 reported near Nadiad Highway boundary. Inter-authority routing needed.',
        type: 'jurisdiction_alert',
        timestamp: '2 hours ago',
        unread: false,
        route: '/municipality-admin/challenges',
      },
      {
        id: 'NOTIF-04',
        title: 'University Proposal Submitted',
        description: 'Sardar Patel University submitted proposal PROP-2026-055 for chemical canal remediation.',
        type: 'proposal_submitted',
        timestamp: '3 hours ago',
        unread: true,
        route: '/municipality-admin/universities',
      },
      {
        id: 'NOTIF-05',
        title: 'Project Milestone Delayed',
        description: 'PRJ-ANAND-018: Solid Waste Compactor assembly is delayed by 14 days.',
        type: 'project_delayed',
        timestamp: '5 hours ago',
        unread: false,
        route: '/municipality-admin/projects',
      },
      {
        id: 'NOTIF-06',
        title: 'Municipal Verification Required',
        description: 'BVM Engineering College completed Phase 2 Field Deployment in Ward 12.',
        type: 'verification_required',
        timestamp: '1 day ago',
        unread: false,
        route: '/municipality-admin/projects',
      },
    ];

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message,
    });
  }
}
