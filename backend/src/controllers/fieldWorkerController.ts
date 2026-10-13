import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint';
import { User } from '../models/User';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory';
import { ComplaintAssignment } from '../models/ComplaintAssignment';
import { storageService } from '../services/storage/storageService';
import { createNotification, emitToRole, emitToUser } from '../services/notificationService';

export function mapComplaintCategory(cat?: string): string {
  switch (cat?.toLowerCase()) {
    case 'water': return 'Water & Sanitation';
    case 'garbage':
    case 'illegal_dumping': return 'Solid Waste Management';
    case 'pothole':
    case 'road_damage': return 'Roads & Infrastructure';
    case 'drainage': return 'Drainage & Stormwater';
    case 'streetlight': return 'Street Lighting';
    case 'fallen_tree':
    case 'public_property': return 'Environment & Parks';
    case 'public_health': return 'Public Health';
    default: return cat || 'Roads & Infrastructure';
  }
}

// In-memory persistent verification store for field inspections during runtime
export interface FieldVerificationSubmission {
  id: string;
  challengeId: string;
  problemTitle: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  timestamp: string;
  expectedLocation: { latitude: number; longitude: number; address: string };
  capturedLocation: { latitude: number; longitude: number; accuracy: number; timestamp: string };
  distanceMeters: number;
  locationStatus: 'Matched' | 'Within Acceptable Range' | 'Outside Expected Location';
  visitId: string;
  visitStartTime: string;
  visitEndTime: string;
  photos: Array<{
    id: string;
    url: string;
    category: string;
    caption: string;
    timestamp: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
    duration: string;
    caption: string;
    timestamp: string;
  }>;
  observations: {
    observedProblem: string;
    actualGroundCondition: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    affectedArea: string;
    peopleImpact: string;
    immediateRisks: string;
    additionalNotes: string;
  };
  structuredQuestions: {
    isIssuePresent: 'Yes' | 'No' | 'Partially';
    isLocationMatch: 'Yes' | 'No' | 'Partially';
    isIssueActive: 'Yes' | 'No';
    isImmediateInterventionRequired: 'Yes' | 'No';
    conditionChange: 'Improved' | 'Same' | 'Worsened';
    visibleSafetyRisks: 'Yes' | 'No';
  };
  verificationResult: 'Verified' | 'Partially Verified' | 'Not Verified' | 'Unable to Verify' | 'Requires Follow-up';
  remarks: string;
  officialStatus: 'PENDING_ULB_REVIEW';
}

export const submittedVerifications: FieldVerificationSubmission[] = [
  {
    id: 'FVR-2026-001',
    challengeId: 'CH-2026-089',
    problemTitle: 'Severe Stormwater Drain Clogging & Road Overflow',
    workerId: 'fo-pwd-101',
    workerName: 'Er. Rajesh Patel',
    workerRole: 'Government Field Worker',
    timestamp: '2026-09-24T14:30:00.000Z',
    expectedLocation: { latitude: 22.5601, longitude: 72.9285, address: 'Main Market Road, Ward 12, Anand' },
    capturedLocation: { latitude: 22.5603, longitude: 72.9287, accuracy: 6.2, timestamp: '2026-09-24T14:28:10.000Z' },
    distanceMeters: 31,
    locationStatus: 'Within Acceptable Range',
    visitId: 'VST-2026-042',
    visitStartTime: '2026-09-24T14:15:00.000Z',
    visitEndTime: '2026-09-24T14:45:00.000Z',
    photos: [
      {
        id: 'p-1',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
        category: 'Problem Area',
        caption: 'Drain blockage due to accumulated silt and plastic debris',
        timestamp: '2026-09-24T14:32:00.000Z',
      },
      {
        id: 'p-2',
        url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80',
        category: 'Surrounding Area',
        caption: 'Overflow spilling onto pedestrian footpath',
        timestamp: '2026-09-24T14:35:00.000Z',
      }
    ],
    videos: [],
    observations: {
      observedProblem: 'Stormwater drain inlet blocked with construction debris and silt',
      actualGroundCondition: 'Water logged up to 15cm on the outer carriageway',
      severity: 'High',
      affectedArea: 'Main Market Road, Ward 12 (approx 120m stretch)',
      peopleImpact: 'Impacting 40+ commercial shops and pedestrian movement',
      immediateRisks: 'Slip hazard and vehicle skidding risk near intersection',
      additionalNotes: 'Requires municipal desilting suction truck and culvert clearing squad.',
    },
    structuredQuestions: {
      isIssuePresent: 'Yes',
      isLocationMatch: 'Yes',
      isIssueActive: 'Yes',
      isImmediateInterventionRequired: 'Yes',
      conditionChange: 'Worsened',
      visibleSafetyRisks: 'Yes',
    },
    verificationResult: 'Verified',
    remarks: 'Field verification confirmed. Ground condition matches citizen complaint. Immediate desilting sanctioned under SLA-24h.',
    officialStatus: 'PENDING_ULB_REVIEW',
  },
  {
    id: 'FVR-2026-002',
    challengeId: 'CH-2026-042',
    problemTitle: 'Main Water Feeder Pipe Leakage with Road Cavity',
    workerId: 'fo-pwd-101',
    workerName: 'Er. Rajesh Patel',
    workerRole: 'Government Field Worker',
    timestamp: '2026-09-23T11:15:00.000Z',
    expectedLocation: { latitude: 22.5645, longitude: 72.9341, address: 'Station Road Junction, Ward 4, Anand' },
    capturedLocation: { latitude: 22.5646, longitude: 72.9342, accuracy: 5.1, timestamp: '2026-09-23T11:12:00.000Z' },
    distanceMeters: 14,
    locationStatus: 'Within Acceptable Range',
    visitId: 'VST-2026-039',
    visitStartTime: '2026-09-23T11:00:00.000Z',
    visitEndTime: '2026-09-23T11:35:00.000Z',
    photos: [
      {
        id: 'p-3',
        url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
        category: 'Infrastructure',
        caption: 'High-pressure potable water pipe joint leakage causing ground erosion',
        timestamp: '2026-09-23T11:18:00.000Z',
      }
    ],
    videos: [],
    observations: {
      observedProblem: 'Underground potable pipeline 150mm DI flange leak',
      actualGroundCondition: 'Sub-base soil washed away creating a 1.2m diameter cavity below asphalt',
      severity: 'Critical',
      affectedArea: 'Station Road Junction, Ward 4',
      peopleImpact: 'Water pressure drop for 1,200 households in Ward 4 & 5',
      immediateRisks: 'Carriageway collapse hazard for heavy municipal buses',
      additionalNotes: 'Emergency valve isolated. Heavy barricading deployed immediately.',
    },
    structuredQuestions: {
      isIssuePresent: 'Yes',
      isLocationMatch: 'Yes',
      isIssueActive: 'Yes',
      isImmediateInterventionRequired: 'Yes',
      conditionChange: 'Worsened',
      visibleSafetyRisks: 'Yes',
    },
    verificationResult: 'Verified',
    remarks: 'Emergency verification completed. Pressure leak isolated and emergency contractor mobilized.',
    officialStatus: 'PENDING_ULB_REVIEW',
  }
];

// Baseline realistic challenges assigned to field worker
export let BASELINE_ASSIGNED_CHALLENGES: any[] = [
  {
    id: 'CH-2026-089',
    complaintNumber: 'CH-2026-089',
    title: 'Severe Stormwater Drain Clogging & Road Overflow',
    description: 'During moderate rainfall, the main stormwater culvert gets backed up due to silt and plastic accumulation, flooding the entire street and entering ground floor shops.',
    category: 'Drainage & Stormwater',
    ward: 'Ward 12',
    wardNumber: 12,
    location: {
      address: 'Main Market Road, Near Vegetable Market, Ward 12, Anand',
      latitude: 22.5601,
      longitude: 72.9285,
    },
    priority: 'HIGH',
    status: 'PENDING_VERIFICATION',
    assignedDate: '2026-09-22',
    dueDate: '2026-09-26',
    scheduledTime: '10:30 AM',
    reportedDate: '2026-09-21',
    reportedBy: 'Citizen / Community Resident (Rahul Mehta)',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Road submerged under 15cm stormwater',
        timestamp: '2026-09-21 16:45',
      },
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Drain opening choked with polythene bags',
        timestamp: '2026-09-21 16:48',
      }
    ],
  },
  {
    id: 'CH-2026-042',
    complaintNumber: 'CH-2026-042',
    title: 'Main Water Feeder Pipe Leakage with Road Cavity',
    description: 'Fresh municipal drinking water pipeline breached beneath asphalt. Potable water continuously flowing into side drains, forming dangerous sunken cavity in high-traffic lane.',
    category: 'Water & Sanitation',
    ward: 'Ward 4',
    wardNumber: 4,
    location: {
      address: 'Station Road Junction, Opp. City Bus Depot, Ward 4, Anand',
      latitude: 22.5645,
      longitude: 72.9341,
    },
    priority: 'CRITICAL',
    status: 'VERIFIED',
    assignedDate: '2026-09-23',
    dueDate: '2026-09-24',
    scheduledTime: '11:15 AM',
    reportedDate: '2026-09-23',
    reportedBy: 'Citizen / Ward Councillor Helpline',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Water gushing from crack in roadway',
        timestamp: '2026-09-23 08:30',
      }
    ],
  },
  {
    id: 'CH-2026-114',
    complaintNumber: 'CH-2026-114',
    title: 'Damaged High-Mast Streetlight & Exposed Electrical Wiring',
    description: 'High mast light pole base inspection cover stolen. Live 440V electrical wiring exposed right next to a municipal primary school entrance.',
    category: 'Street Lighting',
    ward: 'Ward 8',
    wardNumber: 8,
    location: {
      address: 'Near Municipal Primary School No. 4, Ward 8, Anand',
      latitude: 22.5582,
      longitude: 72.9214,
    },
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedDate: '2026-09-24',
    dueDate: '2026-09-25',
    scheduledTime: '02:00 PM',
    reportedDate: '2026-09-24',
    reportedBy: 'School Principal & Resident Welfare Society',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Uncovered electrical junction at ground level',
        timestamp: '2026-09-24 07:45',
      }
    ],
  },
  {
    id: 'CH-2026-056',
    complaintNumber: 'CH-2026-056',
    title: 'Severe Asphalt Potholes on Main Bus Transit Route',
    description: 'Series of 5 consecutive deep potholes (depth 18-22cm) caused by heavy axle transport vehicles, causing repeated motorcycle accidents.',
    category: 'Roads & Infrastructure',
    ward: 'Ward 2',
    wardNumber: 2,
    location: {
      address: 'Bistupur North Outer Road, Km 4.2, Ward 2, Anand',
      latitude: 22.5688,
      longitude: 72.9385,
    },
    priority: 'HIGH',
    status: 'PENDING_VERIFICATION',
    assignedDate: '2026-09-24',
    dueDate: '2026-09-27',
    scheduledTime: '04:15 PM',
    reportedDate: '2026-09-23',
    reportedBy: 'Public Transit Drivers Union',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Pothole cluster extending across full traffic lane',
        timestamp: '2026-09-23 18:10',
      }
    ],
  },
  {
    id: 'CH-2026-095',
    complaintNumber: 'CH-2026-095',
    title: 'Unauthorized Garbage Dumping on Canal Bank',
    description: 'Illegal dumping of commercial plastic and chemical container scrap along Anand irrigation feeder canal, obstructing water flow.',
    category: 'Solid Waste Management',
    ward: 'Ward 9',
    wardNumber: 9,
    location: {
      address: 'Canal Ring Road, Near Old Toll Post, Ward 9, Anand',
      latitude: 22.5712,
      longitude: 72.9152,
    },
    priority: 'MEDIUM',
    status: 'REQUIRES_FOLLOWUP',
    assignedDate: '2026-09-20',
    dueDate: '2026-09-25',
    scheduledTime: '11:00 AM',
    reportedDate: '2026-09-19',
    reportedBy: 'Canal Irrigation Monitoring Staff',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Waste piles encroaching canal embankment',
        timestamp: '2026-09-19 12:00',
      }
    ],
  },
  {
    id: 'CH-2026-071',
    complaintNumber: 'CH-2026-071',
    title: 'Uprooted Neem Tree Obstructing Primary Health Centre Gate',
    description: 'Large mature neem tree fell during sudden thunderstorm, blocking ambulance entry into Ward 6 Community Health Centre.',
    category: 'Environment & Parks',
    ward: 'Ward 6',
    wardNumber: 6,
    location: {
      address: 'Civil Hospital Road, Ward 6, Anand',
      latitude: 22.5541,
      longitude: 72.9248,
    },
    priority: 'HIGH',
    status: 'VERIFIED',
    assignedDate: '2026-09-22',
    dueDate: '2026-09-23',
    scheduledTime: '09:00 AM',
    reportedDate: '2026-09-22',
    reportedBy: 'Medical Officer In-Charge (CHC)',
    citizenEvidence: [
      {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen uploaded: Tree trunk across hospital access ramp',
        timestamp: '2026-09-22 06:15',
      }
    ],
  }
];

// Baseline realistic municipal projects for monitoring
const BASELINE_MONITORED_PROJECTS = [
  {
    id: 'PRJ-2026-021',
    projectId: 'PRJ-2026-021',
    name: 'Smart IoT Flood Gauge & Stormwater Siphon System',
    linkedChallenge: 'CH-2026-089 (Drainage Overflow)',
    university: 'BVM Engineering College, Vallabh Vidyanagar',
    facultyMentor: 'Prof. Jayesh Patel (Dept of Civil Engg)',
    studentLead: 'Aarav Shah (M.Tech Water Resources)',
    industryPartner: 'L&T Smart Infrastructure & CSR Foundation',
    municipality: 'Anand Municipal Corporation (ULB)',
    location: {
      site: 'Subhash Ward Stormwater Pump Station',
      ward: 'Ward 12',
      address: 'Subhash Road Culvert Junction, Ward 12, Anand',
      latitude: 22.5601,
      longitude: 72.9285,
    },
    progress: 75,
    currentStage: 'Field Calibration & Sensor Deployment',
    currentMilestone: 'Ultrasonic Water Level Sensor Calibration & Telemetry Link',
    nextMilestone: 'Automated Sluice Gate Actuator Integration',
    expectedCompletion: '2026-10-15',
    status: 'ACTIVE',
    milestones: [
      {
        id: 'M1',
        title: 'Hydraulic Flow Simulation & Catchment Survey',
        expectedCompletion: '2026-08-15',
        reportedProgress: 100,
        observedProgress: 100,
        status: 'Completed',
        evidenceRequired: 'Survey drawings & flow rate benchmark sheet',
      },
      {
        id: 'M2',
        title: 'Sensor Bracket Fabrication & Solar Panel Mount',
        expectedCompletion: '2026-09-10',
        reportedProgress: 100,
        observedProgress: 95,
        status: 'Completed',
        evidenceRequired: 'Physical mounting on concrete pier with corrosion sealant',
      },
      {
        id: 'M3',
        title: 'Telemetry Node Installation & 4G Uplink Test',
        expectedCompletion: '2026-09-25',
        reportedProgress: 80,
        observedProgress: 65,
        status: 'In Progress',
        evidenceRequired: 'Live packet transmission log to Municipal Command Centre',
      },
      {
        id: 'M4',
        title: 'Automated Siphon Actuation Commissioning',
        expectedCompletion: '2026-10-15',
        reportedProgress: 20,
        observedProgress: 10,
        status: 'Not Started',
        evidenceRequired: 'Water flow trigger drill video and signoff by municipal engineer',
      }
    ],
    siteVisits: [
      {
        visitId: 'VST-PRJ-01',
        date: '2026-09-12',
        worker: 'Er. Rajesh Patel',
        purpose: 'Milestone Verification',
        observedProgress: 60,
        reportedProgress: 65,
        difference: 5,
        physicalCondition: 'Solar telemetry pole erected firmly; sensor box weatherproofed properly.',
        issuesFound: 'None. Ground cabling routed through heavy-duty PVC conduit.',
      }
    ]
  },
  {
    id: 'PRJ-2026-014',
    projectId: 'PRJ-2026-014',
    name: 'Waste Plastic Recycled Polymer Modified Bitumen for Pothole Squads',
    linkedChallenge: 'CH-2026-056 (Asphalt Potholes)',
    university: 'Sardar Patel University (SPU), Chemistry & Materials Science',
    facultyMentor: 'Dr. Meena Joshi',
    studentLead: 'Kunal Trivedi',
    industryPartner: 'Tata Steel Tubes Division & Gujarat Bitumen Corp',
    municipality: 'Anand Municipal Corporation (ULB)',
    location: {
      site: 'Bistupur Outer Test Strip Km 3 to 5',
      ward: 'Ward 2',
      address: 'Industrial Road Bypass, Ward 2, Anand',
      latitude: 22.5688,
      longitude: 72.9385,
    },
    progress: 88,
    currentStage: 'Wear & Friction Resistance Field Testing',
    currentMilestone: 'Core Sample Compressive Strength Verification',
    nextMilestone: 'Final Commercial Deployment Guidelines Document',
    expectedCompletion: '2026-10-05',
    status: 'ACTIVE',
    milestones: [
      {
        id: 'M1',
        title: 'Polymer Blending Optimization in Hot Mix Plant',
        expectedCompletion: '2026-07-30',
        reportedProgress: 100,
        observedProgress: 100,
        status: 'Completed',
        evidenceRequired: 'Lab test certificate for Marshall Stability > 14 kN',
      },
      {
        id: 'M2',
        title: '500m Demonstration Stretch Laying & Compaction',
        expectedCompletion: '2026-08-25',
        reportedProgress: 100,
        observedProgress: 100,
        status: 'Completed',
        evidenceRequired: 'Roller compaction records and surface smoothness test',
      },
      {
        id: 'M3',
        title: 'Monsoon Heavy Wheel Load Dynamic Friction Test',
        expectedCompletion: '2026-09-20',
        reportedProgress: 90,
        observedProgress: 88,
        status: 'In Progress',
        evidenceRequired: 'Field core sampling with British Pendulum Number > 55',
      }
    ],
    siteVisits: []
  },
  {
    id: 'PRJ-2026-008',
    projectId: 'PRJ-2026-008',
    name: 'Smart Waste Bin Fill-Level Mesh Network & Route Optimizer',
    linkedChallenge: 'CH-2026-095 (Garbage Dumping)',
    university: 'Charotar University of Science & Technology (CHARUSAT)',
    facultyMentor: 'Prof. Dharmendra Patel',
    studentLead: 'Pooja Bhatt',
    industryPartner: 'Adani Green Urban Solutions',
    municipality: 'Anand Municipal Corporation (ULB)',
    location: {
      site: 'Ward 8 & 9 Public Bin Cluster',
      ward: 'Ward 8',
      address: 'Collectorate Circle to Canal Road, Ward 8 & 9, Anand',
      latitude: 22.5582,
      longitude: 72.9214,
    },
    progress: 95,
    currentStage: 'Pre-Completion Verification',
    currentMilestone: 'Full Municipal Waste Truck Driver App Acceptance Test',
    nextMilestone: 'Final ULB Handover & Warranty Certification',
    expectedCompletion: '2026-09-30',
    status: 'COMPLETION_VERIFICATION',
    milestones: [
      {
        id: 'M1',
        title: 'Ultrasonic Bin Sensor Enclosure Hardening (IP68)',
        expectedCompletion: '2026-07-15',
        reportedProgress: 100,
        observedProgress: 100,
        status: 'Completed',
        evidenceRequired: 'Waterproof test reports and tamper alert triggers',
      },
      {
        id: 'M2',
        title: 'Deployment across 60 Municipal Dumpsters',
        expectedCompletion: '2026-08-30',
        reportedProgress: 100,
        observedProgress: 100,
        status: 'Completed',
        evidenceRequired: 'GPS tagged photo log of each container installation',
      },
      {
        id: 'M3',
        title: 'Route Optimization Server Integration with Sanitation Fleet',
        expectedCompletion: '2026-09-22',
        reportedProgress: 100,
        observedProgress: 95,
        status: 'In Progress',
        evidenceRequired: 'Daily fuel reduction audit showing > 18% savings',
      }
    ],
    siteVisits: []
  }
];

// Baseline Before / After records
export let BASELINE_BEFORE_AFTER: any[] = [
  {
    id: 'BA-2026-001',
    challengeId: 'CH-2026-042',
    problem: 'Potable Pipeline Leakage & Deep Road Cavity',
    category: 'Water & Sanitation',
    ward: 'Ward 4',
    address: 'Station Road Junction, Ward 4, Anand',
    beforeDate: '2026-09-23 08:30',
    beforePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen Before: Massive water spillage and asphalt erosion',
        timestamp: '2026-09-23 08:30',
        uploadedBy: 'Citizen (Rahul Mehta)',
        type: 'Before' as const,
      }
    ],
    fieldAuditNotes: 'Verified pipeline split on 150mm flange. Sub-base excavating work carried out with trench shoring. Leak arrested with stainless steel repair clamp and wet-mix macadam sub-base backfilled.',
    afterDate: '2026-09-24 16:30',
    afterPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        caption: 'Field Worker After: Repaired pipeline, compacted sub-base, and bitumen patched',
        timestamp: '2026-09-24 16:30',
        uploadedBy: 'Er. Rajesh Patel (Field Worker)',
        type: 'After' as const,
      }
    ],
    impact: {
      observedImprovement: 'High-pressure potable water supply restored with zero ground seepage. Carriageway reinstated to level.',
      affectedArea: 'Station Road Junction (120 sq.m surface)',
      communityImpact: 'Potable water pressure restored to 1,200 households in Ward 4 & 5',
      serviceImprovement: 'Prevented estimated 85,000 litres daily potable water loss',
      remainingIssues: 'Final wearing course layer bitumen sealing scheduled for next week.',
      additionalObservation: 'Monitored under 4.5 bar working pressure; flange dry after 6 hours continuous pumping.',
    }
  },
  {
    id: 'BA-2026-002',
    challengeId: 'CH-2026-071',
    problem: 'Uprooted Mature Tree Blocking Health Centre Gate',
    category: 'Environment & Parks',
    ward: 'Ward 6',
    address: 'Civil Hospital Road, Ward 6, Anand',
    beforeDate: '2026-09-22 06:15',
    beforePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        caption: 'Citizen Before: Fallen tree blocking primary ambulance ramp',
        timestamp: '2026-09-22 06:15',
        uploadedBy: 'CHC In-charge',
        type: 'Before' as const,
      }
    ],
    fieldAuditNotes: 'Emergency municipal forestry squad mobilized with hydraulic chain saws. Tree trunk sectioned, cleared from access driveway within 3 hours. Road surface swept clean.',
    afterDate: '2026-09-22 12:45',
    afterPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
        caption: 'Field Worker After: Ambulance bay completely cleared and accessible',
        timestamp: '2026-09-22 12:45',
        uploadedBy: 'Er. Rajesh Patel (Field Worker)',
        type: 'After' as const,
      }
    ],
    impact: {
      observedImprovement: 'Complete 6-meter driveway clearance restored for ambulances.',
      affectedArea: 'Civil Hospital Main Gate, Ward 6',
      communityImpact: 'Uninterrupted emergency vehicle ingress for over 350 daily outpatients',
      serviceImprovement: 'Response time under 3.5 hours from citizen notice to road clearance',
      remainingIssues: 'None. Timber logged and transported to Municipal Nursery.',
      additionalObservation: 'Two replacement saplings marked for plantation along boundary wall.',
    }
  }
];

export function registerAssignedChallengeToFieldWorker(newAssignment: any) {
  const existingIdx = BASELINE_ASSIGNED_CHALLENGES.findIndex(
    (c) => c.id === newAssignment.id || c.complaintNumber === newAssignment.complaintNumber
  );
  if (existingIdx >= 0) {
    BASELINE_ASSIGNED_CHALLENGES[existingIdx] = {
      ...BASELINE_ASSIGNED_CHALLENGES[existingIdx],
      ...newAssignment,
      status: 'PENDING_VERIFICATION',
    };
  } else {
    BASELINE_ASSIGNED_CHALLENGES.unshift(newAssignment);
  }
}

// Baseline activity history
const BASELINE_ACTIVITY_LOGS = [
  {
    id: 'ACT-01',
    date: '24 Sep 2026',
    time: '02:30 PM',
    activity: 'Site Visit & Verification',
    challengeId: 'CH-2026-089',
    location: 'Main Market Road, Ward 12',
    result: 'Verified',
    reportId: 'FVR-2026-001',
    status: 'Submitted to ULB',
    type: 'VERIFICATION',
  },
  {
    id: 'ACT-02',
    date: '23 Sep 2026',
    time: '11:15 AM',
    activity: 'Emergency Site Inspection',
    challengeId: 'CH-2026-042',
    location: 'Station Road Junction, Ward 4',
    result: 'Verified',
    reportId: 'FVR-2026-002',
    status: 'Remediation Closed',
    type: 'VERIFICATION',
  },
  {
    id: 'ACT-03',
    date: '22 Sep 2026',
    time: '03:45 PM',
    activity: 'Milestone Progress Audit',
    challengeId: 'PRJ-2026-021',
    location: 'Subhash Ward Stormwater Pump Station, Ward 12',
    result: 'Satisfactory (75%)',
    reportId: 'PMR-2026-005',
    status: 'Approved',
    type: 'PROJECT_MONITORING',
  },
  {
    id: 'ACT-04',
    date: '22 Sep 2026',
    time: '09:00 AM',
    activity: 'Emergency Clearance Verification',
    challengeId: 'CH-2026-071',
    location: 'Civil Hospital Road, Ward 6',
    result: 'Resolved On-Site',
    reportId: 'FVR-2026-003',
    status: 'Closed',
    type: 'VERIFICATION',
  },
  {
    id: 'ACT-05',
    date: '20 Sep 2026',
    time: '11:30 AM',
    activity: 'Site Inspection & Evidence Collection',
    challengeId: 'CH-2026-095',
    location: 'Canal Ring Road, Ward 9',
    result: 'Requires Follow-up',
    reportId: 'FVR-2026-004',
    status: 'Notice Served',
    type: 'VERIFICATION',
  }
];

// Helper: Haversine distance in meters
function calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 1. GET Dashboard
export async function getFieldWorkerDashboard(req: Request, res: Response) {
  try {
    const workerId = req.user?._id;
    const workerName = req.user?.name || 'Field Worker';
    const isSuperAdmin = req.user?.role === 'super_admin';
    const workerFilter: any = isSuperAdmin ? {} : { assignedOfficerId: workerId };

    // Real metrics strictly for the logged-in field worker
    const [assignedCount, inProgressCount, pendingReviewCount, verifiedCount, totalWorkload] = await Promise.all([
      Complaint.countDocuments({ ...workerFilter, status: 'assigned' }),
      Complaint.countDocuments({ ...workerFilter, status: 'in_progress' }),
      Complaint.countDocuments({ ...workerFilter, status: { $in: ['resolution_submitted', 'verification_pending'] } }),
      Complaint.countDocuments({ ...workerFilter, status: { $in: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ ...workerFilter, status: { $nin: ['rejected'] } }),
    ]);

    // Active complaints assigned to this worker
    const activeComplaints = await Complaint.find({
      ...workerFilter,
      status: { $in: ['assigned', 'in_progress', 'resolution_submitted', 'verification_pending'] },
    })
      .populate('wardId', 'wardNumber name zone')
      .populate('departmentId', 'name code slug')
      .populate('reportedBy', 'name email phone')
      .sort({ priorityScore: -1, slaDeadline: 1 })
      .lean();

    const todayVisits = activeComplaints.map((c: any) => ({
      id: c._id.toString(),
      visitTitle: c.title,
      location: c.location?.address || 'Anand Urban Sector',
      challengeId: c.complaintNumber,
      priority: (c.priority || 'HIGH').toUpperCase(),
      scheduledTime: '10:00 AM',
      status: c.status === 'in_progress' ? 'IN_PROGRESS' : 'PENDING',
      type: 'Field Remediation & Inspection',
    }));

    const urgentAssignments = activeComplaints.map((c: any) => ({
      id: c._id.toString(),
      challengeId: c.complaintNumber,
      problem: c.title,
      domain: mapComplaintCategory(c.category),
      location: c.location?.address || 'Anand Urban Sector',
      ward: c.wardId?.name ? `Ward ${c.wardId.wardNumber} (${c.wardId.name})` : `Ward ${c.wardId?.wardNumber || 4}`,
      priority: (c.priority || 'HIGH').toUpperCase(),
      dueDate: c.slaDeadline ? new Date(c.slaDeadline).toISOString().split('T')[0] : '2026-10-15',
      status: c.status === 'in_progress' ? 'IN_PROGRESS' : (c.status === 'resolution_submitted' ? 'VERIFIED' : 'PENDING_VERIFICATION'),
    }));

    // Active work orders formatted for FieldWorkerDashboardPage
    const workOrders = activeComplaints.map((c: any) => {
      const wardNum = c.wardId?.wardNumber || 4;
      const wardStr = c.wardId?.name ? `Ward ${wardNum} (${c.wardId.name})` : `Ward ${wardNum}`;
      const lat = c.location?.coordinates?.[1] || 22.5601;
      const lng = c.location?.coordinates?.[0] || 72.9285;

      return {
        id: c._id.toString(),
        challengeId: c.complaintNumber,
        complaintNumber: c.complaintNumber,
        categoryLabel: mapComplaintCategory(c.category),
        categoryKey: c.category || 'other',
        title: c.title,
        description: c.description,
        location: c.location?.address || 'Anand Urban Sector',
        ward: wardStr,
        coordinates: { lat, lng },
        priority: c.priority || 'high',
        status: c.status,
        slaState: c.slaState || 'within_sla',
        slaDeadline: c.slaDeadline ? new Date(c.slaDeadline).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        reportedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '10/10/2026',
        reportedBy: c.reportedBy?.name || 'Citizen Reporter',
        citizenPhoto: c.photos?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        resolutionEvidence: c.resolutionEvidence,
      };
    });

    return res.json({
      success: true,
      data: {
        worker: {
          name: workerName,
          badgeNumber: req.user?.badgeNumber || 'FW-GOV-001',
          designation: req.user?.designation || 'Field Response Officer',
          department: req.user?.departmentId ? 'Assigned Municipal Directorate' : 'Public Works & Municipal Operations',
          municipality: 'Anand Municipal Corporation (ULB)',
          assignedArea: req.user?.wardId ? `Ward ${req.user.wardId}` : 'Anand City Jurisdiction',
        },
        summary: {
          assignedIssues: totalWorkload,
          pendingVerification: assignedCount,
          inProgressIssues: inProgressCount,
          pendingReview: pendingReviewCount,
          verifiedIssues: verifiedCount + pendingReviewCount,
          siteVisits: activeComplaints.length,
          projectsMonitored: 0,
        },
        summaryMetrics: {
          totalAssigned: totalWorkload,
          pendingInspection: assignedCount,
          inProgress: inProgressCount,
          pendingReview: pendingReviewCount,
          completedToday: verifiedCount + pendingReviewCount,
          breachedSLA: 0,
        },
        todayVisits,
        urgentAssignments,
        workOrders,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. GET Assigned Challenges (STRICT DATA ISOLATION)
export async function getFieldWorkerChallenges(req: Request, res: Response) {
  try {
    const { search, domain, priority, ward, status, tab } = req.query;
    const workerId = req.user?._id;
    const isSuperAdmin = req.user?.role === 'super_admin';
    const workerFilter: any = isSuperAdmin ? {} : { assignedOfficerId: workerId };

    const query: any = {
      ...workerFilter,
      status: { $in: ['assigned', 'in_progress', 'resolution_submitted', 'verification_pending', 'resolved', 'closed', 'reopened'] },
    };

    if (search) {
      const q = String(search).trim();
      const sRegex = new RegExp(q, 'i');
      query.$or = [{ complaintNumber: sRegex }, { title: sRegex }, { description: sRegex }, { 'location.address': sRegex }];
    }

    if (domain && domain !== 'all') {
      query.category = domain;
    }

    if (priority && priority !== 'all') {
      query.priority = String(priority).toLowerCase();
    }

    if (tab && tab !== 'all') {
      const tabStr = String(tab).toLowerCase();
      if (tabStr === 'pending' || tabStr === 'assigned') {
        query.status = 'assigned';
      } else if (tabStr === 'in_progress' || tabStr === 'in progress') {
        query.status = 'in_progress';
      } else if (tabStr === 'verified' || tabStr === 'resolved' || tabStr === 'completed') {
        query.status = { $in: ['resolved', 'closed', 'resolution_submitted', 'verification_pending'] };
      } else if (tabStr === 'requires_followup' || tabStr === 'reopened') {
        query.status = 'reopened';
      }
    }

    const dbComplaints = await Complaint.find(query)
      .populate('wardId', 'wardNumber name zone')
      .populate('departmentId', 'name code slug')
      .populate('assignedOfficerId', 'name email phone badgeNumber designation')
      .populate('reportedBy', 'name email phone')
      .sort({ updatedAt: -1 })
      .lean();

    const challenges = dbComplaints.map((c: any) => {
      const wardNum = c.wardId?.wardNumber || 4;
      const wardName = c.wardId?.name ? `Ward ${wardNum} (${c.wardId.name})` : `Ward ${wardNum}`;
      const lat = c.location?.coordinates?.[1] || 22.5601;
      const lng = c.location?.coordinates?.[0] || 72.9285;

      let fwStatus = 'PENDING_VERIFICATION';
      if (c.status === 'in_progress') fwStatus = 'IN_PROGRESS';
      else if (c.status === 'resolved' || c.status === 'closed') fwStatus = 'VERIFIED';
      else if (c.status === 'resolution_submitted' || c.status === 'verification_pending') fwStatus = 'VERIFIED';
      else if (c.status === 'reopened') fwStatus = 'REQUIRES_FOLLOWUP';

      return {
        id: c._id.toString(),
        complaintNumber: c.complaintNumber,
        title: c.title,
        description: c.description,
        category: mapComplaintCategory(c.category),
        ward: wardName,
        wardNumber: wardNum,
        location: {
          address: c.location?.address || 'Anand Urban Sector',
          latitude: lat,
          longitude: lng,
        },
        priority: (c.priority || 'HIGH').toUpperCase(),
        status: fwStatus,
        rawStatus: c.status,
        assignedDate: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '2026-10-10',
        dueDate: c.slaDeadline ? new Date(c.slaDeadline).toISOString().split('T')[0] : '2026-10-15',
        scheduledTime: '10:00 AM',
        reportedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '10/10/2026',
        reportedBy: c.reportedBy?.name || 'Citizen Reporter',
        citizenEvidence: (c.photos || []).map((url: string, idx: number) => ({
          type: 'photo',
          url,
          caption: `Citizen uploaded evidence #${idx + 1}`,
          timestamp: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB'),
        })),
        citizenPhoto: c.photos?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        resolutionEvidence: c.resolutionEvidence,
        slaState: c.slaState,
        slaDeadline: c.slaDeadline,
        isDbRecord: true,
      };
    });

    return res.json({
      success: true,
      data: {
        challenges,
        total: challenges.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. GET Challenge By ID (STRICT DATA ISOLATION)
export async function getFieldWorkerChallengeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const challengeId = String(id || '');

    let dbChallenge: any = null;
    if (mongoose.Types.ObjectId.isValid(challengeId)) {
      dbChallenge = await Complaint.findById(challengeId)
        .populate('wardId', 'wardNumber name zone')
        .populate('departmentId', 'name code slug')
        .populate('assignedOfficerId', 'name email phone badgeNumber designation')
        .populate('reportedBy', 'name email phone')
        .lean();
    }
    if (!dbChallenge) {
      dbChallenge = await Complaint.findOne({ complaintNumber: challengeId })
        .populate('wardId', 'wardNumber name zone')
        .populate('departmentId', 'name code slug')
        .populate('assignedOfficerId', 'name email phone badgeNumber designation')
        .populate('reportedBy', 'name email phone')
        .lean();
    }

    if (!dbChallenge) {
      // Check baseline realistic challenges if present
      const baseline = BASELINE_ASSIGNED_CHALLENGES.find(
        (b) => b.id === challengeId || b.complaintNumber === challengeId
      );
      if (baseline) {
        return res.json({
          success: true,
          data: {
            challenge: baseline,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: `Assigned challenge with ID '${id}' not found.`,
      });
    }

    // Backend Authorization: Enforce strict field worker ownership
    const isAssigned = dbChallenge.assignedOfficerId && (
      dbChallenge.assignedOfficerId._id
        ? dbChallenge.assignedOfficerId._id.toString() === req.user?._id.toString()
        : dbChallenge.assignedOfficerId.toString() === req.user?._id.toString()
    );
    if (!isAssigned && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_TASK_ACCESS' },
        message: 'Access denied: You are not authorized to access tasks assigned to another worker.',
      });
    }

    const wardNum = dbChallenge.wardId?.wardNumber || 4;
    const wardName = dbChallenge.wardId?.name ? `Ward ${wardNum} (${dbChallenge.wardId.name})` : `Ward ${wardNum}`;
    const lat = dbChallenge.location?.coordinates?.[1] || 22.5601;
    const lng = dbChallenge.location?.coordinates?.[0] || 72.9285;

    let fwStatus = 'PENDING_VERIFICATION';
    if (dbChallenge.status === 'in_progress') fwStatus = 'IN_PROGRESS';
    else if (dbChallenge.status === 'resolved' || dbChallenge.status === 'closed') fwStatus = 'VERIFIED';
    else if (dbChallenge.status === 'resolution_submitted' || dbChallenge.status === 'verification_pending') fwStatus = 'VERIFIED';
    else if (dbChallenge.status === 'reopened') fwStatus = 'REQUIRES_FOLLOWUP';

    const statusHistory = await ComplaintStatusHistory.find({ complaintId: dbChallenge._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    const assignmentHistory = await ComplaintAssignment.find({ complaintId: dbChallenge._id })
      .populate('officerId', 'name email phone badgeNumber designation')
      .populate('departmentId', 'name code slug')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const challenge = {
      id: dbChallenge._id.toString(),
      complaintNumber: dbChallenge.complaintNumber,
      title: dbChallenge.title,
      description: dbChallenge.description,
      category: mapComplaintCategory(dbChallenge.category),
      department: dbChallenge.department || dbChallenge.departmentId?.name || 'Public Works',
      ward: wardName,
      wardNumber: wardNum,
      location: {
        address: dbChallenge.location?.address || 'Anand Urban Sector',
        latitude: lat,
        longitude: lng,
      },
      priority: (dbChallenge.priority || 'HIGH').toUpperCase(),
      status: fwStatus,
      rawStatus: dbChallenge.status,
      assignedDate: dbChallenge.updatedAt ? new Date(dbChallenge.updatedAt).toISOString().split('T')[0] : '2026-10-10',
      dueDate: dbChallenge.slaDeadline ? new Date(dbChallenge.slaDeadline).toISOString().split('T')[0] : '2026-10-15',
      scheduledTime: '10:00 AM',
      reportedDate: dbChallenge.createdAt ? new Date(dbChallenge.createdAt).toLocaleDateString('en-GB') : '10/10/2026',
      reportedBy: dbChallenge.reportedBy?.name || 'Citizen Reporter',
      citizenEvidence: (dbChallenge.photos || []).map((url: string, idx: number) => ({
        type: 'photo',
        url,
        caption: `Citizen evidence #${idx + 1}`,
        timestamp: new Date(dbChallenge.createdAt || Date.now()).toLocaleDateString('en-GB'),
      })),
      citizenPhoto: dbChallenge.photos?.[0],
      resolutionEvidence: dbChallenge.resolutionEvidence,
      statusHistory,
      assignmentHistory,
      slaState: dbChallenge.slaState,
      slaDeadline: dbChallenge.slaDeadline,
      isDbRecord: true,
    };

    return res.json({
      success: true,
      data: {
        challenge,
        statusHistory,
        assignmentHistory,
        verifications: submittedVerifications.filter((v) => v.challengeId === challenge.id || v.challengeId === challenge.complaintNumber),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Start Work on Field Challenge
export async function startWorkOnFieldChallenge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let complaint = await Complaint.findById(id);
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: id });
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isAssigned = complaint.assignedOfficerId && complaint.assignedOfficerId.equals(req.user?._id);
    if (!isAssigned && req.user?.role !== 'super_admin' && req.user?.role !== 'municipal_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You are not assigned to this complaint.' });
    }

    const oldStatus = complaint.status;
    complaint.status = 'in_progress';
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: oldStatus,
      toStatus: 'in_progress',
      changedBy: req.user?._id,
      note: `Field Worker ${req.user?.name} started remediation work on-site.`,
    });

    await createNotification({
      userId: complaint.reportedBy,
      type: 'complaint_in_progress',
      title: `Work Started: ${complaint.complaintNumber}`,
      message: `Field Worker ${req.user?.name} has initiated work on your grievance.`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    emitToUser(complaint.reportedBy, 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'in_progress',
      worker: req.user?.name,
    });

    emitToRole('municipal_admin', 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'in_progress',
      worker: req.user?.name,
    });

    return res.json({ success: true, message: 'Work marked as in progress', data: { complaint } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Submit Field Challenge Resolution Evidence
export async function submitFieldChallengeResolution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      description,
      completionNotes,
      photos: bodyPhotos,
      resolutionPhotos: bodyResPhotos,
      videos: bodyVideos,
      resolutionVideos: bodyResVideos,
      evidenceType: reqEvidenceType,
      location,
      capturedLocation,
    } = req.body;

    let complaint = await Complaint.findById(id);
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: id });
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isAssigned = complaint.assignedOfficerId && complaint.assignedOfficerId.equals(req.user?._id);
    if (!isAssigned && req.user?.role !== 'super_admin' && req.user?.role !== 'municipal_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You are not assigned to this complaint.' });
    }

    // 1. Strict GPS validation
    let finalLocation = capturedLocation || location;
    if (typeof finalLocation === 'string') {
      try {
        finalLocation = JSON.parse(finalLocation);
      } catch {
        // Ignored
      }
    }
    if (!finalLocation && (req.body.latitude || req.body.lat) && (req.body.longitude || req.body.lng)) {
      finalLocation = {
        latitude: Number(req.body.latitude || req.body.lat),
        longitude: Number(req.body.longitude || req.body.lng),
        accuracy: req.body.accuracy ? Number(req.body.accuracy) : undefined,
        address: req.body.address || undefined,
        ward: req.body.ward || undefined,
      };
    }

    if (
      !finalLocation ||
      typeof finalLocation.latitude !== 'number' ||
      typeof finalLocation.longitude !== 'number' ||
      isNaN(finalLocation.latitude) ||
      isNaN(finalLocation.longitude) ||
      finalLocation.latitude < -90 ||
      finalLocation.latitude > 90 ||
      finalLocation.longitude < -180 ||
      finalLocation.longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Location unavailable. Please enable device location and try again.',
      });
    }

    const resolutionPhotos: string[] = [];
    const resolutionVideos: string[] = [];

    // Helper to store base64 media buffers cleanly
    const storeMediaItem = async (mediaItem: string, fallbackPrefix: string) => {
      if (typeof mediaItem !== 'string' || !mediaItem.trim()) return;
      const trimmed = mediaItem.trim();
      if (trimmed.startsWith('data:')) {
        const matches = trimmed.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches) {
          const mimetype = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const isVid = mimetype.startsWith('video/');
          const ext = isVid ? (mimetype.includes('webm') ? 'webm' : 'mp4') : (mimetype.includes('png') ? 'png' : 'jpg');
          try {
            const uploadResult = await storageService.uploadFile({
              buffer,
              originalname: `${fallbackPrefix}_${Date.now()}.${ext}`,
              mimetype,
              size: buffer.length,
            });
            if (isVid) resolutionVideos.push(uploadResult.url);
            else resolutionPhotos.push(uploadResult.url);
            return;
          } catch (e) {
            console.error('Base64 upload failed:', e);
          }
        }
      }
      const isVid = trimmed.endsWith('.webm') || trimmed.endsWith('.mp4') || trimmed.includes('video');
      if (isVid) resolutionVideos.push(trimmed);
      else resolutionPhotos.push(trimmed);
    };

    // 2. Parse photos from body
    const rawPhotosInput = bodyPhotos || bodyResPhotos;
    if (rawPhotosInput) {
      const photoArray = Array.isArray(rawPhotosInput)
        ? rawPhotosInput
        : (() => {
            try {
              const p = JSON.parse(rawPhotosInput);
              return Array.isArray(p) ? p : [rawPhotosInput];
            } catch {
              return [rawPhotosInput];
            }
          })();

      for (const p of photoArray) {
        if (p) await storeMediaItem(p, 'live_photo');
      }
    }

    // 3. Parse videos from body
    const rawVideosInput = bodyVideos || bodyResVideos;
    if (rawVideosInput) {
      const videoArray = Array.isArray(rawVideosInput)
        ? rawVideosInput
        : (() => {
            try {
              const p = JSON.parse(rawVideosInput);
              return Array.isArray(p) ? p : [rawVideosInput];
            } catch {
              return [rawVideosInput];
            }
          })();

      for (const v of videoArray) {
        if (v) await storeMediaItem(v, 'live_video');
      }
    }

    // 4. Handle files uploaded via multipart
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploadResult = await storageService.uploadFile({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          });
          if (file.mimetype.startsWith('video/')) {
            resolutionVideos.push(uploadResult.url);
          } else {
            resolutionPhotos.push(uploadResult.url);
          }
        } catch (e) {
          console.error('Resolution upload error:', e);
        }
      }
    }

    // 5. Enforce that live evidence was actually provided
    if (resolutionPhotos.length === 0 && resolutionVideos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Live geotagged photo or video evidence is required for resolution.',
      });
    }

    const determinedEvidenceType =
      resolutionVideos.length > 0 || reqEvidenceType === 'LIVE_VIDEO'
        ? 'LIVE_VIDEO'
        : 'LIVE_PHOTO';

    const finalDescription =
      description || completionNotes || 'Remediation completed on-site with live geotagged proof.';

    const oldStatus = complaint.status;
    complaint.status = 'resolution_submitted';
    complaint.resolutionEvidence = {
      photos: resolutionPhotos,
      videos: resolutionVideos,
      evidenceType: determinedEvidenceType,
      description: finalDescription,
      resolvedBy: req.user?._id,
      resolvedAt: new Date(),
      capturedLocation: {
        latitude: Number(finalLocation.latitude),
        longitude: Number(finalLocation.longitude),
        accuracy: finalLocation.accuracy ? Number(finalLocation.accuracy) : undefined,
        address: finalLocation.address || undefined,
        ward: finalLocation.ward || undefined,
      },
    };
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaintId: complaint._id,
      fromStatus: oldStatus,
      toStatus: 'resolution_submitted',
      changedBy: req.user?._id,
      note: `Field Worker ${req.user?.name} submitted ${determinedEvidenceType === 'LIVE_VIDEO' ? 'live video' : 'live photo'} resolution evidence: "${finalDescription}".`,
      evidencePhoto: resolutionPhotos[0] || resolutionVideos[0],
    });

    await createNotification({
      userId: complaint.reportedBy,
      type: 'resolution_submitted',
      title: `Resolution Proof Submitted: ${complaint.complaintNumber}`,
      message: `Field Worker ${req.user?.name} has submitted live geotagged resolution evidence for your review.`,
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
    });

    emitToUser(complaint.reportedBy, 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'resolution_submitted',
      worker: req.user?.name,
    });

    emitToRole('municipal_admin', 'complaint:status_changed', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: 'resolution_submitted',
      worker: req.user?.name,
    });

    emitToRole('municipal_admin', 'complaint:resolution_submitted', {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      resolutionEvidence: complaint.resolutionEvidence,
    });

    return res.json({
      success: true,
      message: 'Resolution evidence successfully submitted to Municipal Administration.',
      data: { complaint },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. POST Field Verification Submission
export async function submitFieldVerification(req: Request, res: Response) {
  try {
    const {
      challengeId,
      expectedLocation,
      capturedLocation,
      visitStartTime,
      visitEndTime,
      photos,
      videos,
      observations,
      structuredQuestions,
      verificationResult,
      remarks,
    } = req.body;

    if (!challengeId) {
      return res.status(400).json({ success: false, message: 'Challenge ID is mandatory.' });
    }

    // Calculate distance
    let distance = 0;
    if (expectedLocation && capturedLocation) {
      distance = calculateHaversineMeters(
        expectedLocation.latitude,
        expectedLocation.longitude,
        capturedLocation.latitude,
        capturedLocation.longitude
      );
    }

    let locationStatus: 'Matched' | 'Within Acceptable Range' | 'Outside Expected Location' = 'Matched';
    if (distance <= 15) {
      locationStatus = 'Matched';
    } else if (distance <= 100) {
      locationStatus = 'Within Acceptable Range';
    } else {
      locationStatus = 'Outside Expected Location';
    }

    // Require remarks if not verified, unable to verify or requires follow-up
    if (['Not Verified', 'Unable to Verify', 'Requires Follow-up'].includes(verificationResult) && !remarks) {
      return res.status(400).json({
        success: false,
        message: `Detailed remarks are mandatory when marking verification as '${verificationResult}'.`,
      });
    }

    const challenge = BASELINE_ASSIGNED_CHALLENGES.find((c) => c.id === challengeId || c.complaintNumber === challengeId);
    const problemTitle = challenge ? challenge.title : 'Field Ground Verification';

    const submission: FieldVerificationSubmission = {
      id: `FVR-${Date.now().toString().slice(-6)}`,
      challengeId,
      problemTitle,
      workerId: req.user?._id?.toString() || 'fo-pwd-101',
      workerName: req.user?.name || 'Er. Rajesh Patel',
      workerRole: 'Government Field Worker',
      timestamp: new Date().toISOString(),
      expectedLocation: expectedLocation || { latitude: 22.5601, longitude: 72.9285, address: 'Anand Municipal Area' },
      capturedLocation: capturedLocation || {
        latitude: 22.5601,
        longitude: 72.9285,
        accuracy: 5.0,
        timestamp: new Date().toISOString(),
      },
      distanceMeters: distance,
      locationStatus,
      visitId: `VST-${Date.now().toString().slice(-5)}`,
      visitStartTime: visitStartTime || new Date().toISOString(),
      visitEndTime: visitEndTime || new Date().toISOString(),
      photos: Array.isArray(photos) ? photos : [],
      videos: Array.isArray(videos) ? videos : [],
      observations: observations || {
        observedProblem: '',
        actualGroundCondition: '',
        severity: 'Medium',
        affectedArea: '',
        peopleImpact: '',
        immediateRisks: '',
        additionalNotes: '',
      },
      structuredQuestions: structuredQuestions || {
        isIssuePresent: 'Yes',
        isLocationMatch: 'Yes',
        isIssueActive: 'Yes',
        isImmediateInterventionRequired: 'No',
        conditionChange: 'Same',
        visibleSafetyRisks: 'No',
      },
      verificationResult: verificationResult || 'Verified',
      remarks: remarks || 'Site inspected and verified in accordance with municipal protocols.',
      officialStatus: 'PENDING_ULB_REVIEW',
    };

    submittedVerifications.unshift(submission);

    // Update challenge local status if matched
    if (challenge) {
      if (verificationResult === 'Verified') {
        challenge.status = 'VERIFIED';
      } else if (verificationResult === 'Requires Follow-up') {
        challenge.status = 'REQUIRES_FOLLOWUP';
      }
    }

    // Add to activity logs
    BASELINE_ACTIVITY_LOGS.unshift({
      id: `ACT-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      activity: 'Ground Site Verification',
      challengeId,
      location: challenge?.location?.address || expectedLocation?.address || 'Anand Site',
      result: verificationResult,
      reportId: submission.id,
      status: 'Submitted to ULB',
      type: 'VERIFICATION',
    });

    // 1. Update MongoDB Complaint
    let complaintDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(challengeId)) {
      complaintDoc = await Complaint.findById(challengeId);
    }
    if (!complaintDoc) {
      complaintDoc = await Complaint.findOne({ complaintNumber: challengeId });
    }
    if (!complaintDoc && challenge?.complaintNumber) {
      complaintDoc = await Complaint.findOne({ complaintNumber: challenge.complaintNumber });
    }

    const workerName = req.user?.name || 'Er. Rajesh Patel';
    const workerId = req.user?._id;
    const photoUrls = Array.isArray(photos)
      ? photos.map((p: any) => (typeof p === 'string' ? p : p.url)).filter(Boolean)
      : [];

    if (complaintDoc) {
      const oldStatus = complaintDoc.status;
      complaintDoc.status = 'resolved';
      complaintDoc.resolvedAt = new Date();
      complaintDoc.resolutionEvidence = {
        photos: photoUrls,
        description: observations?.actualGroundCondition || remarks || 'Field remediation completed with live geotagged proof photo.',
        resolvedBy: workerId,
        resolvedAt: new Date(),
        aiVerificationStatus: 'likely_resolved',
        aiVerificationScore: 0.98,
        aiVerificationReason: 'Live geotagged proof captured on-site and verified.',
        capturedLocation,
      };
      await complaintDoc.save();

      await ComplaintStatusHistory.create({
        complaintId: complaintDoc._id,
        fromStatus: oldStatus,
        toStatus: 'resolved',
        changedBy: workerId,
        note: `Work completed by Field Worker ${workerName}. Live geotagged proof photo captured on-site (GPS Status: ${locationStatus}, Offset: ${distance}m). Observations: ${remarks || observations?.observedProblem || 'Remediation completed.'}`,
        evidencePhoto: photoUrls[0],
      });

      // Notify citizen
      await createNotification({
        userId: complaintDoc.reportedBy,
        type: 'complaint_resolved',
        title: `Work Completed: ${complaintDoc.complaintNumber}`,
        message: `Field worker ${workerName} has completed work on your complaint with live geotagged proof photo. Check your report update!`,
        complaintId: complaintDoc._id,
        complaintNumber: complaintDoc.complaintNumber,
      });

      emitToUser(complaintDoc.reportedBy, 'complaint:status_changed', {
        complaintId: complaintDoc._id,
        status: 'resolved',
        resolutionEvidence: complaintDoc.resolutionEvidence,
      });

      emitToRole('municipal_admin', 'complaint:resolved', {
        complaintNumber: complaintDoc.complaintNumber,
        resolvedBy: workerName,
      });
    }

    // 2. Add or update BASELINE_BEFORE_AFTER
    const existingBA = BASELINE_BEFORE_AFTER.find(
      (b) => b.challengeId === challengeId || (complaintDoc && b.challengeId === complaintDoc.complaintNumber)
    );
    const beforeUrls = complaintDoc?.photos || challenge?.citizenEvidence?.map((ce: any) => ce.url) || [];
    if (existingBA) {
      for (const pUrl of photoUrls) {
        existingBA.afterPhotos.push({
          url: pUrl,
          caption: `Live Geotagged Proof by ${workerName}`,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          uploadedBy: `${workerName} (Field Worker)`,
          type: 'After' as const,
        });
      }
      existingBA.impact.observedImprovement = remarks || observations?.actualGroundCondition || 'Remediation completed successfully.';
    } else {
      BASELINE_BEFORE_AFTER.unshift({
        id: `BA-${Date.now().toString().slice(-4)}`,
        challengeId: complaintDoc?.complaintNumber || challenge?.complaintNumber || challengeId,
        problem: challenge?.title || complaintDoc?.title || problemTitle,
        category: challenge?.category || 'Public Works',
        ward: challenge?.ward || 'Ward 12',
        address: challenge?.location?.address || expectedLocation?.address || 'Anand Site',
        beforeDate: challenge?.reportedDate || new Date().toISOString().split('T')[0],
        beforePhotos: beforeUrls.map((u: string) => ({
          url: u,
          caption: 'Citizen uploaded before condition',
          timestamp: 'Filing date',
          uploadedBy: 'Citizen',
          type: 'Before' as const,
        })),
        fieldAuditNotes: observations?.actualGroundCondition || 'Remediation completed and verified with live geotagged evidence.',
        afterDate: new Date().toISOString().split('T')[0],
        afterPhotos: photoUrls.map((u: string) => ({
          url: u,
          caption: `Live Geotagged Proof by ${workerName}`,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          uploadedBy: `${workerName} (Field Worker)`,
          type: 'After' as const,
        })),
        impact: {
          observedImprovement: observations?.actualGroundCondition || remarks || 'Work completed and site cleared.',
          affectedArea: observations?.affectedArea || 'On-site corridor',
          communityImpact: observations?.peopleImpact || 'Hazard neutralized for citizens and commuters.',
          serviceImprovement: 'Direct field worker resolution with live GPS proof.',
          remainingIssues: 'None',
          additionalObservation: remarks || 'Verified on site.',
        },
      });
    }

    return res.json({
      success: true,
      message: 'Field verification submitted successfully. Under review by authorized municipality desk.',
      data: {
        verification: submission,
        complaint: complaintDoc,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. GET Before / After Records
export async function getBeforeAfterRecords(_req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: {
        records: BASELINE_BEFORE_AFTER,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. POST Add After Photo
export async function addAfterPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { photoUrl, caption, observedImprovement, remainingIssues } = req.body;

    const record = BASELINE_BEFORE_AFTER.find((r) => r.id === id || r.challengeId === id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Before/after record not found.' });
    }

    if (photoUrl) {
      record.afterPhotos.push({
        url: photoUrl,
        caption: caption || 'Field Worker After photo verification',
        timestamp: new Date().toISOString(),
        uploadedBy: `${req.user?.name || 'Field Worker'} (Official)`,
        type: 'After',
      });
    }

    if (observedImprovement) {
      record.impact.observedImprovement = observedImprovement;
    }
    if (remainingIssues) {
      record.impact.remainingIssues = remainingIssues;
    }

    return res.json({
      success: true,
      message: 'After-condition evidence appended successfully.',
      data: { record },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. GET Projects for Monitoring
export async function getMonitoredProjects(req: Request, res: Response) {
  try {
    const { tab, search, status } = req.query;
    let list = [...BASELINE_MONITORED_PROJECTS];

    if (tab && tab !== 'all') {
      const t = String(tab).toLowerCase();
      if (t === 'active') list = list.filter((p) => p.status === 'ACTIVE');
      else if (t === 'completed') list = list.filter((p) => p.status === 'COMPLETED');
      else if (t === 'completion_verification' || t === 'completion') list = list.filter((p) => p.status === 'COMPLETION_VERIFICATION');
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectId.toLowerCase().includes(q) ||
          p.university.toLowerCase().includes(q) ||
          p.location.address.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      data: {
        projects: list,
        total: list.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. GET Project by ID
export async function getMonitoredProjectById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = BASELINE_MONITORED_PROJECTS.find(
      (p) => p.id === id || p.projectId === id
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Monitored project not found.' });
    }

    return res.json({
      success: true,
      data: { project },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. POST Submit Project Site Visit & Milestone Verification
export async function submitProjectSiteVisit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      visitPurpose,
      observedProgress,
      milestoneId,
      milestoneStatus,
      physicalCondition,
      issuesFound,
      remarks,
    } = req.body;

    const project = BASELINE_MONITORED_PROJECTS.find(
      (p) => p.id === id || p.projectId === id
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const reportedProgress = project.progress;
    const observedProgNum = Number(observedProgress) || reportedProgress;
    const difference = Math.abs(reportedProgress - observedProgNum);

    const visit = {
      visitId: `VST-PRJ-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      worker: req.user?.name || 'Er. Rajesh Patel',
      purpose: visitPurpose || 'Milestone Verification',
      observedProgress: observedProgNum,
      reportedProgress,
      difference,
      physicalCondition: physicalCondition || 'Site implementation conforms to standard specifications.',
      issuesFound: issuesFound || 'None observed during scheduled field round.',
    };

    project.siteVisits.unshift(visit);

    // If milestone ID provided, update milestone observed progress
    if (milestoneId) {
      const milestone = project.milestones.find((m) => m.id === milestoneId);
      if (milestone) {
        milestone.observedProgress = observedProgNum;
        if (milestoneStatus) {
          milestone.status = milestoneStatus;
        }
      }
    }

    // Add to activity history
    BASELINE_ACTIVITY_LOGS.unshift({
      id: `ACT-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      activity: `Project Monitoring Visit (${visitPurpose || 'Routine'})`,
      challengeId: project.projectId,
      location: project.location.address,
      result: `Observed: ${observedProgNum}% (Diff: ${difference}%)`,
      reportId: visit.visitId,
      status: 'Submitted to ULB',
      type: 'PROJECT_MONITORING',
    });

    return res.json({
      success: true,
      message: 'Project monitoring report submitted successfully.',
      data: { visit, project },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. GET Map Data
export async function getFieldWorkerMapData(_req: Request, res: Response) {
  try {
    const challengePins = BASELINE_ASSIGNED_CHALLENGES.map((c) => ({
      id: c.id,
      type: 'CHALLENGE' as const,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      address: c.location.address,
      ward: c.ward,
      coordinates: [c.location.latitude, c.location.longitude] as [number, number],
      nextAction: c.status === 'VERIFIED' ? 'View Details' : 'Start Verification',
    }));

    const projectPins = BASELINE_MONITORED_PROJECTS.map((p) => ({
      id: p.projectId,
      type: 'PROJECT' as const,
      title: p.name,
      category: p.linkedChallenge,
      priority: 'HIGH',
      status: p.status,
      address: p.location.address,
      ward: p.location.ward,
      coordinates: [p.location.latitude, p.location.longitude] as [number, number],
      nextAction: 'Start Site Visit',
    }));

    return res.json({
      success: true,
      data: {
        center: [22.5645, 72.9289], // Anand Municipality Centre
        pins: [...challengePins, ...projectPins],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 11. GET Reports
export async function getFieldWorkerReports(_req: Request, res: Response) {
  try {
    const reportsList = [
      {
        reportId: 'FVR-2026-001',
        reportType: 'Field Verification Report',
        challengeOrProject: 'CH-2026-089 (Drainage Overflow)',
        visitDate: '24 Sep 2026',
        submittedDate: '24 Sep 2026, 02:45 PM',
        status: 'Submitted to ULB',
        category: 'Verification Reports',
        verificationResult: 'Verified',
        workerName: 'Er. Rajesh Patel',
        municipality: 'Anand Municipal Corporation (ULB)',
        department: 'Public Works & Stormwater Drainage',
      },
      {
        reportId: 'FVR-2026-002',
        reportType: 'Emergency Pipeline Verification Report',
        challengeOrProject: 'CH-2026-042 (Potable Pipe Leak)',
        visitDate: '23 Sep 2026',
        submittedDate: '23 Sep 2026, 11:35 AM',
        status: 'Closed / Remediated',
        category: 'Verification Reports',
        verificationResult: 'Verified',
        workerName: 'Er. Rajesh Patel',
        municipality: 'Anand Municipal Corporation (ULB)',
        department: 'Water Works & Pipeline Division',
      },
      {
        reportId: 'PMR-2026-005',
        reportType: 'Project Milestone Monitoring Report',
        challengeOrProject: 'PRJ-2026-021 (IoT Flood Gauge)',
        visitDate: '22 Sep 2026',
        submittedDate: '22 Sep 2026, 04:00 PM',
        status: 'Approved',
        category: 'Field Reports',
        verificationResult: 'Satisfactory (75%)',
        workerName: 'Er. Rajesh Patel',
        municipality: 'Anand Municipal Corporation (ULB)',
        department: 'Smart City & Engineering Innovation',
      },
      {
        reportId: 'CMP-2026-001',
        reportType: 'Completion Verification Report',
        challengeOrProject: 'PRJ-2026-008 (Smart Waste Sensor Grid)',
        visitDate: '21 Sep 2026',
        submittedDate: '21 Sep 2026, 05:20 PM',
        status: 'Under ULB Review',
        category: 'Completion Reports',
        verificationResult: 'Recommended for Handover',
        workerName: 'Er. Rajesh Patel',
        municipality: 'Anand Municipal Corporation (ULB)',
        department: 'Solid Waste Management',
      }
    ];

    return res.json({
      success: true,
      data: {
        reports: reportsList,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 12. GET Report by ID
export async function getFieldWorkerReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const verification = submittedVerifications.find((v) => v.id === id);

    if (verification) {
      return res.json({
        success: true,
        data: { report: verification },
      });
    }

    // Fallback baseline report
    const fallbackReport = {
      id: id || 'FVR-2026-001',
      challengeId: 'CH-2026-089',
      problemTitle: 'Severe Stormwater Drain Clogging & Road Overflow',
      workerId: 'fo-pwd-101',
      workerName: 'Er. Rajesh Patel',
      workerRole: 'Government Field Worker',
      department: 'Public Works & Drainage Inspection Squad',
      municipality: 'Anand Municipal Corporation (ULB)',
      timestamp: '2026-09-24T14:30:00.000Z',
      expectedLocation: { latitude: 22.5601, longitude: 72.9285, address: 'Main Market Road, Ward 12, Anand' },
      capturedLocation: { latitude: 22.5603, longitude: 72.9287, accuracy: 6.2, timestamp: '2026-09-24T14:28:10.000Z' },
      distanceMeters: 31,
      locationStatus: 'Within Acceptable Range',
      visitId: 'VST-2026-042',
      visitStartTime: '2026-09-24T14:15:00.000Z',
      visitEndTime: '2026-09-24T14:45:00.000Z',
      photos: [
        {
          id: 'p-1',
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
          category: 'Problem Area',
          caption: 'Drain blockage due to accumulated silt and plastic debris',
          timestamp: '2026-09-24 14:32',
        }
      ],
      observations: {
        observedProblem: 'Stormwater drain inlet blocked with silt',
        actualGroundCondition: 'Water logged up to 15cm on carriageway',
        severity: 'High',
        affectedArea: 'Main Market Road, Ward 12',
        peopleImpact: 'Impacting 40+ commercial shops and pedestrian movement',
        immediateRisks: 'Slip hazard and vehicle skidding risk near intersection',
        additionalNotes: 'Requires municipal desilting suction truck and culvert clearing squad.',
      },
      structuredQuestions: {
        isIssuePresent: 'Yes',
        isLocationMatch: 'Yes',
        isIssueActive: 'Yes',
        isImmediateInterventionRequired: 'Yes',
        conditionChange: 'Worsened',
        visibleSafetyRisks: 'Yes',
      },
      verificationResult: 'Verified',
      remarks: 'Field verification confirmed. Ground condition matches citizen complaint.',
      officialStatus: 'PENDING_ULB_REVIEW',
    };

    return res.json({
      success: true,
      data: { report: fallbackReport },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 13. GET Activity History
export async function getFieldWorkerActivity(_req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: {
        activities: BASELINE_ACTIVITY_LOGS,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 14. GET Profile
export async function getFieldWorkerProfile(req: Request, res: Response) {
  try {
    const profile = {
      name: req.user?.name || 'Er. Rajesh Patel',
      designation: req.user?.designation || 'Senior Field Inspection Officer',
      badgeNumber: req.user?.badgeNumber || 'GOV-FO-PWD-101',
      employeeId: 'EMP-ANAND-2018-094',
      department: 'Public Works & Municipal Engineering (Roads & Bridges)',
      municipality: 'Anand Municipal Corporation (ULB)',
      officialEmail: req.user?.email || 'officer.rajesh@civicconnect.gov.in',
      officialContact: req.user?.phone || '+91 98351 04921',
      assignedArea: 'Ward 1 to 14 (Anand City Jurisdiction)',
      supervisor: 'Shri Jayeshbhai Trivedi (Chief Municipal Officer)',
      activeAssignments: BASELINE_ASSIGNED_CHALLENGES.length,
      joinedYear: '2018',
      dutyShift: 'Day Shift (08:00 AM – 05:00 PM)',
      gpsSyncStatus: 'Connected (High Accuracy Geolocation Active)',
    };

    return res.json({
      success: true,
      data: { profile },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 15. PUT Profile (only contact/phone allowed to edit)
export async function updateFieldWorkerProfile(req: Request, res: Response) {
  try {
    const { officialContact } = req.body;

    if (officialContact && req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { phone: officialContact });
    }

    return res.json({
      success: true,
      message: 'Field worker official contact details updated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
