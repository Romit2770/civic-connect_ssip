export interface IChallenge {
  id: string;
  title: string;
  domain: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiClassification: string;
  validationStatus: string;
  assignedDate: string;
  currentStage: string;
  progress: number;
  grantAmount: string;
  facultyMentor: string;
  studentTeam: string;
  leadStudent: string;
  status: 'Assigned' | 'Under Review' | 'Accepted' | 'Rejected' | 'Completed';
  description: string;
  submissionDate: string;
  duplicateStatus: string;
  citizenEvidence: {
    hasEvidence: boolean;
    photos: string[];
    videos: string[];
    documents: string[];
    geolocation: string;
    coordinates: [number, number]; // [lng, lat]
    notes?: string;
  };
  aiAnalysis: {
    category: string;
    domain: string;
    severity: number; // 1-10
    priority: string;
    problemSummary: string;
    evidenceAssessment: string;
    duplicateDetectionResult: string;
    locationRelevance: string;
    recommendedAcademicDomain: string;
    recommendedTechnicalAreas: string[];
  };
}

export interface ITeamMember {
  studentName: string;
  studentId: string;
  department: string;
  role: string;
  skills: string[];
  assignedTasks: string;
  taskStatus: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
}

export interface ITeam {
  id: string;
  name: string;
  facultyMentor: string;
  leadStudent: string;
  departments: string[];
  membersCount: number;
  activeProject: string;
  linkedChallengeId: string;
  skills: string[];
  progress: number;
  currentStage: string;
  status: 'Active' | 'Forming' | 'Completed';
  members: ITeamMember[];
}

export interface IProposal {
  id: string;
  challengeId: string;
  challengeTitle: string;
  proposedSolution: string;
  objectives: string;
  techStack: string;
  facultyMentor: string;
  studentTeam: string;
  industryPartner: string;
  estimatedCost: string;
  timeline: string;
  industrySupport: string;
  technicalRequirements: string;
  expectedOutcomes: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Revision Required' | 'Rejected';
  reviewComments?: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface ISubmission {
  id: string;
  milestoneId: string;
  milestoneName: string;
  projectId: string;
  studentTeam: string;
  submittedDate: string;
  submittedFiles: { name: string; size: string; type: string }[];
  description: string;
  evidence: string[];
  progressUpdate: string;
  status: 'Pending Review' | 'Approved' | 'Revision Required' | 'Rejected';
  mentorComments?: string[];
  reviewedAt?: string;
}

export interface IMilestone {
  id: string;
  name: string;
  projectId: string;
  projectTitle: string;
  assignedTeam: string;
  dueDate: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
  completionPercentage: number;
  assignedTasks: string;
  submissionStatus: 'Not Submitted' | 'Pending Review' | 'Approved' | 'Revision Required';
  submissions?: ISubmission[];
  mentorNotes?: string;
}

export interface IProject {
  id: string;
  challengeId: string;
  title: string;
  domain: string;
  facultyMentor: string;
  studentTeam: string;
  industryPartner: string;
  currentStage:
    | 'Challenge Accepted'
    | 'Team Formed'
    | 'Solution Proposal'
    | 'Industry Collaboration'
    | 'Prototyping'
    | 'Testing'
    | 'Field Pilot'
    | 'Deployment'
    | 'Completed';
  progress: number;
  status: 'Active' | 'Under Review' | 'Delayed' | 'Completed';
  budget: string;
  timeline: string;
  milestones: IMilestone[];
  description?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  photos?: string[];
  coordinates?: [number, number];
  slaState?: 'within_sla' | 'due_soon' | 'breached' | 'escalated';
  slaDeadline?: string;
  citizenReport?: any;
}

export interface IIndustryPartner {
  id: string;
  name: string;
  type: string;
  domain: string;
  location: string;
  matchPercentage: number;
  reason: string;
  capabilities: string[];
  availableSupport: string[];
  contactPerson: string;
  status: 'Recommended' | 'Requested' | 'Accepted' | 'Completed';
}

export interface ICollaborationRequest {
  id: string;
  project: string;
  industry: string;
  requiredSupport: string;
  technicalRequirements?: string;
  expectedDuration?: string;
  fundingRequirement?: string;
  mentorshipRequirement?: string;
  testingRequirement?: string;
  fieldDeploymentRequirement?: string;
  additionalNotes?: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Under Review' | 'Accepted' | 'Rejected' | 'Completed';
}

export interface IReport {
  id: string;
  project: string;
  projectId: string;
  team: string;
  reportType: 'Progress Reports' | 'Testing Reports' | 'Project Reports' | 'Final Solution Reports';
  reportingPeriod?: string;
  progressSummary: string;
  technicalProgress: string;
  teamPerformance: string;
  milestoneProgress: string;
  industryContribution?: string;
  challengesRisks: string;
  nextSteps: string;
  attachments?: { name: string; size: string }[];
  submittedDate: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Revision Required';
  reviewedBy?: string;
}

export interface IFacultyProfile {
  facultyName: string;
  facultyId: string;
  designation: string;
  department: string;
  university: string;
  officialEmail: string;
  phone: string;
  areasOfExpertise: string[];
  researchAreas: string[];
  technicalSkills: string[];
  currentProjectsCount: number;
  mentoredTeamsCount: number;
  yearsOfExperience: number;
  assignedDomains: string[];
  researchInterests: string[];
  availableLabs: string[];
}

export interface IReportBundle {
  report: IReport;
  project: IProject;
  challenge: IChallenge;
  team: ITeam;
  proposal?: IProposal;
  milestones: IMilestone[];
  industryPartner?: IIndustryPartner;
  collaborationRequest?: ICollaborationRequest;
  facultyProfile: IFacultyProfile;
  testingDetails?: {
    objective: string;
    testEnvironment: string;
    testCases: string[];
    accuracy: string;
    snrImprovement: string;
    telemetryRange: string;
    packetLoss: string;
    powerMetrics: string;
    issuesFound: string;
    correctiveActions: string;
    validationResult: string;
  };
  mentorEvaluation: {
    mentorName: string;
    designation: string;
    institution: string;
    evaluationDate: string;
    decision: 'APPROVED' | 'REVISION REQUIRED' | 'UNDER REVIEW' | 'REJECTED';
    rubrics: Record<string, string>;
    comments: string;
  };
  endorsement: {
    facultyMentor: string;
    department: string;
    institution: string;
    industryPartner?: string;
    reportStatus: string;
    reviewDate: string;
    verificationToken: string;
  };
}

// Master synchronized state
class AcademicDataService {
  private challenges: IChallenge[] = [
    {
      id: 'CH-2026-089',
      title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
      domain: 'Water & Sanitation Infrastructure',
      location: 'Ward 4, Bistupur Central',
      priority: 'high',
      aiClassification: 'IoT Network & Hydrodynamics',
      validationStatus: 'Validated by Municipal PWD',
      assignedDate: '2026-08-14',
      submissionDate: '2026-08-10',
      currentStage: 'Field Pilot',
      progress: 85,
      grantAmount: '₹ 4,50,000',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'Smart Water Guild',
      leadStudent: 'Aakash Verma',
      status: 'Accepted',
      duplicateStatus: 'Unique Defect Group (0 Duplicates)',
      description:
        'Continuous localized underground pipe pressure drops and persistent street seepage reported along the main 300mm feeder trunk line in Bistupur Ward 4. PWD manual acoustic surveys have not located fracture depth. Requires an autonomous IoT acoustic + pressure network.',
      citizenEvidence: {
        hasEvidence: true,
        photos: [
          'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=60',
        ],
        videos: [],
        documents: ['PWD_Subsurface_Leak_Inspection_Report_V2.pdf'],
        geolocation: 'Bistupur Central Commercial Belt, Near Main Distribution Chamber #4',
        coordinates: [86.1821, 22.8046],
        notes: 'Citizen photos show street asphalt saturation and geyser micro-bursts during morning high-pressure pumping hours.',
      },
      aiAnalysis: {
        category: 'Water & Sanitation Infrastructure',
        domain: 'Urban Water Distribution & Micro-Acoustics',
        severity: 8,
        priority: 'HIGH',
        problemSummary:
          'High-priority subterranean fluid loss affecting 4,200 households with severe risk of roadbed collapse and contaminant back-siphonage.',
        evidenceAssessment:
          'Photographs verify wet roadbed deformation consistent with sub-surface pipe shearing under cyclic dynamic pressure loads.',
        duplicateDetectionResult: 'No overlapping active grievance found within 400m radius in past 60 days.',
        locationRelevance: 'Critical junction: Ward 4 feeder pipe connects directly to Bistupur primary water reservoir.',
        recommendedAcademicDomain: 'Electronics & Civil Engineering (Fluid Mechanics & Embedded Telemetry)',
        recommendedTechnicalAreas: [
          'LoRaWAN / NB-IoT Long Range Mesh',
          'Piezo-electric Acoustic Wave Sensors',
          'Edge FFT Vibration Spectral Analysis',
          'GIS Ward Hydraulic Mapping',
        ],
      },
    },
    {
      id: 'CH-2026-112',
      title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
      domain: 'Public Works & Roads',
      location: 'Ward 1, Kadma West',
      priority: 'high',
      aiClassification: 'Edge AI & Aerial Photogrammetry',
      validationStatus: 'Validated by City Engineer',
      assignedDate: '2026-08-20',
      submissionDate: '2026-08-16',
      currentStage: 'Prototyping',
      progress: 60,
      grantAmount: '₹ 6,00,000',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'Robotics & Aerial Vision Guild',
      leadStudent: 'Pooja Iyer',
      status: 'Accepted',
      duplicateStatus: 'Unique Defect Group',
      description:
        'Rapid asphalt erosion and repetitive heavy vehicle wheel rutting along Kadma West arterial artery. Traditional inspection requires lane closures and manual string-line measurements.',
      citizenEvidence: {
        hasEvidence: true,
        photos: [
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        ],
        videos: [],
        documents: ['Kadma_PWD_Asphalt_Core_Analysis.pdf'],
        geolocation: 'Kadma Main Link Road, 200m East of Outer Ring Junction',
        coordinates: [86.155, 22.789],
      },
      aiAnalysis: {
        category: 'Public Works & Roads',
        domain: 'Aerial Computer Vision & Pavement Engineering',
        severity: 7,
        priority: 'HIGH',
        problemSummary: 'Macro-potholes exceeding 120mm depth posing severe motorcycle accident risk.',
        evidenceAssessment: 'High-contrast edge defects indicate subsurface aggregate base displacement.',
        duplicateDetectionResult: 'Grouped 3 citizen tickets into master challenge CH-2026-112.',
        locationRelevance: 'Heavy corridor connecting residential Kadma to Tata Steel West Gate.',
        recommendedAcademicDomain: 'Mechanical & Computer Science Engineering',
        recommendedTechnicalAreas: ['Stereo Depth Mapping', 'TensorRT YOLO Edge Detection', 'Drone Flight Planning SDK'],
      },
    },
    {
      id: 'CH-2026-145',
      title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
      domain: 'Solid Waste Management',
      location: 'Ward 7, Sakchi Market',
      priority: 'medium',
      aiClassification: 'Biochemical Waste Processing',
      validationStatus: 'Community Verified',
      assignedDate: '2026-09-02',
      submissionDate: '2026-08-28',
      currentStage: 'Solution Proposal',
      progress: 45,
      grantAmount: '₹ 3,20,000',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'EnviroTech Bio-Circular Unit',
      leadStudent: 'Deepak Roy',
      status: 'Accepted',
      duplicateStatus: 'Unique Group',
      description:
        'Daily organic vegetable and fruit refuse exceeding 6 metric tons overflowing municipal collection dumper bins at Sakchi Market, producing leachate runoff into storm drains.',
      citizenEvidence: {
        hasEvidence: true,
        photos: [
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60',
        ],
        videos: [],
        documents: ['Sakchi_Market_Waste_Audit.pdf'],
        geolocation: 'Sakchi Wholesale Vegetable Market Yard',
        coordinates: [86.203, 22.802],
        notes: 'Citizen photographs substantiate severe bin spillage and organic runoff.',
      },
      aiAnalysis: {
        category: 'Solid Waste Management',
        domain: 'Microbial Composting & Odor Control',
        severity: 5,
        priority: 'MEDIUM',
        problemSummary: 'Organic waste decomposition causing odor and stormwater drain clogging.',
        evidenceAssessment: 'Municipal baseline waste logs confirm high moisture content (72%).',
        duplicateDetectionResult: 'No duplicate complaints.',
        locationRelevance: 'Major commercial food hub in East Singhbhum.',
        recommendedAcademicDomain: 'Biochemical & Environmental Engineering',
        recommendedTechnicalAreas: ['Thermophilic Bacterial Inoculation', 'Solar Aerated Tumbler Design'],
      },
    },
    {
      id: 'CH-2026-188',
      title: 'Solar-Powered LED Smart Streetlighting with Automated LUX & Pedestrian Density Dimming',
      domain: 'Electrical & Street Lighting',
      location: 'Ward 3, Sonari Ring Road',
      priority: 'low',
      aiClassification: 'Renewable Power & Embedded Systems',
      validationStatus: 'Under Municipal Review',
      assignedDate: '2026-09-12',
      submissionDate: '2026-09-10',
      currentStage: 'Prototyping',
      progress: 25,
      grantAmount: '₹ 2,80,000',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'Urban Grid Photovoltaics',
      leadStudent: 'Simran Kaur',
      status: 'Accepted',
      duplicateStatus: 'Unique Group',
      description:
        'Sonari Ring Road streetlights operate on static timers with non-functional photocells, wasting 45% grid battery energy during low pedestrian hours.',
      citizenEvidence: {
        hasEvidence: true,
        photos: [
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60',
        ],
        videos: [],
        documents: ['Sonari_Streetlight_Power_Audit.pdf'],
        geolocation: 'Sonari Ring Road, Pillar 14-38',
        coordinates: [86.166, 22.815],
        notes: 'Photos confirm daylight illumination and burned-out fixtures.',
      },
      aiAnalysis: {
        category: 'Electrical & Street Lighting',
        domain: 'Smart Grid & Renewable Micro-generation',
        severity: 3,
        priority: 'LOW',
        problemSummary: 'Inefficient municipal public illumination requiring adaptive lux regulation.',
        evidenceAssessment: 'Baseline grid telemetry confirms daylight burning defect.',
        duplicateDetectionResult: 'No duplicate complaints.',
        locationRelevance: 'Perimeter bypass road with intermittent vehicular density.',
        recommendedAcademicDomain: 'Electrical Engineering & IoT',
        recommendedTechnicalAreas: ['Dual MPPT Solar Converters', 'PIR Motion Cluster Dimming'],
      },
    },
  ];

  private teams: ITeam[] = [
    {
      id: 'TEAM-01',
      name: 'Smart Water Guild',
      facultyMentor: 'Prof. Ananya Sen',
      leadStudent: 'Aakash Verma',
      departments: ['Computer Science', 'Civil Engineering', 'Electronics'],
      membersCount: 4,
      activeProject: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      linkedChallengeId: 'CH-2026-089',
      skills: ['IoT', 'ESP32', 'Embedded Systems', 'GIS', 'Water Infrastructure', 'LoRaWAN'],
      progress: 85,
      currentStage: 'Field Pilot',
      status: 'Active',
      members: [
        {
          studentName: 'Aakash Verma',
          studentId: '2023UGCS044',
          department: 'Computer Science',
          role: 'Student Lead & Firmware Architect',
          skills: ['ESP32 C++', 'FreeRTOS', 'LoRaWAN', 'MQTT'],
          assignedTasks: 'Calibrate FFT edge vibration filter for ultrasonic transducer',
          taskStatus: 'Under Review',
        },
        {
          studentName: 'Priya Sharma',
          studentId: '2023UGEC019',
          department: 'Electronics & Communication',
          role: 'Hardware & Sensor Engineer',
          skills: ['Analog Front-End', 'Piezo Transducers', 'Power Harvesting'],
          assignedTasks: 'Finalize IP68 enclosure sealing and solar lithium battery charging bench test',
          taskStatus: 'Completed',
        },
        {
          studentName: 'Rohan Banerjee',
          studentId: '2023UGCE032',
          department: 'Civil Engineering',
          role: 'Hydraulic & Pipeline Specialist',
          skills: ['EPANET', 'GIS Hydraulic Modeling', 'Pressure Transient Analysis'],
          assignedTasks: 'Map hydraulic gradient nodes across Ward 4 trunk pipeline distribution',
          taskStatus: 'Completed',
        },
        {
          studentName: 'Sneha Ghosh',
          studentId: '2023UGCS078',
          department: 'Computer Science',
          role: 'Cloud Telemetry & GIS Dashboard Developer',
          skills: ['Node.js', 'PostgreSQL', 'Mapbox GL', 'WebSockets'],
          assignedTasks: 'Deploy real-time pressure anomaly alert endpoint for municipal dispatchers',
          taskStatus: 'In Progress',
        },
      ],
    },
    {
      id: 'TEAM-02',
      name: 'Robotics & Aerial Vision Guild',
      facultyMentor: 'Prof. Ananya Sen',
      leadStudent: 'Pooja Iyer',
      departments: ['Mechanical Engineering', 'Electronics & Comm.', 'AI & Data Science'],
      membersCount: 6,
      activeProject: 'Computer Vision Drone Inspection for Road Macro-Potholes',
      linkedChallengeId: 'CH-2026-112',
      skills: ['PyTorch', 'TensorRT', 'Stereo Depth', 'ROS2', 'Drone Flight SDK'],
      progress: 60,
      currentStage: 'Prototyping',
      status: 'Active',
      members: [
        {
          studentName: 'Pooja Iyer',
          studentId: '2023UGMC012',
          department: 'Mechanical Engineering',
          role: 'Student Lead',
          skills: ['Aerodynamics', 'Gimbal CAD'],
          assignedTasks: 'Assemble vibration isolation dampeners for high-payload flight',
          taskStatus: 'In Progress',
        },
      ],
    },
    {
      id: 'TEAM-03',
      name: 'EnviroTech Bio-Circular Unit',
      facultyMentor: 'Prof. Ananya Sen',
      leadStudent: 'Deepak Roy',
      departments: ['Bio-Engineering', 'Chemical Engineering'],
      membersCount: 4,
      activeProject: 'Decentralized Micro-Composting Digesters',
      linkedChallengeId: 'CH-2026-145',
      skills: ['Bioreactors', 'Microbial Inoculants', 'Soil Chemistry'],
      progress: 45,
      currentStage: 'Solution Proposal',
      status: 'Active',
      members: [
        {
          studentName: 'Deepak Roy',
          studentId: '2023UGBE005',
          department: 'Bio-Engineering',
          role: 'Lead Biochemist',
          skills: ['Thermophilic Culture Isolation', 'pH Sensors'],
          assignedTasks: 'Formulate fast-acting bacterial culture cocktail from market biomass',
          taskStatus: 'Pending',
        },
      ],
    },
    {
      id: 'TEAM-04',
      name: 'Urban Grid Photovoltaics',
      facultyMentor: 'Prof. Ananya Sen',
      leadStudent: 'Simran Kaur',
      departments: ['Electrical Engineering', 'Renewable Energy'],
      membersCount: 4,
      activeProject: 'Solar-Powered LED Smart Streetlighting',
      linkedChallengeId: 'CH-2026-188',
      skills: ['Power Electronics', 'MPPT Controllers', 'PIR Motion Sensors'],
      progress: 10,
      currentStage: 'Solution Proposal',
      status: 'Active',
      members: [],
    },
  ];

  private proposals: IProposal[] = [
    {
      id: 'PROP-2026-01',
      challengeId: 'CH-2026-089',
      challengeTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      proposedSolution:
        'Acoustic & Piezoelectric Real-Time Hydro-Acoustic Leak Locator Network with Edge Signal Filtering',
      objectives:
        'Detect municipal water pipeline bursts within 60 seconds with sub-meter localization accuracy (+/- 0.5m) and zero grid dependency.',
      techStack: 'LoRaWAN, ESP32-S3, Edge Impulse, AWS IoT Core, FreeRTOS, PostGIS',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'Smart Water Guild',
      industryPartner: 'Tata Steel Utilities & Infrastructure Services (TSUISL)',
      estimatedCost: '₹ 4,50,000',
      timeline: '6 Months',
      industrySupport: 'Hardware validation testbenches, acoustic pipe test facility & direct ward pilot deployment',
      technicalRequirements:
        'Piezo transducers with dynamic sensitivity > 50 mV/g, IP68 hermetic casing, 3.6V LiFePO4 batteries with 3-year runtime, bidirectional LoRa gateway.',
      expectedOutcomes:
        'Eliminate 35% non-revenue water loss in Ward 4; reduce average repair dispatch response from 72 hours to under 3 hours.',
      status: 'Approved',
      submittedAt: '2026-08-25',
      reviewComments:
        'Approved by University Research & Academic Council. Excellent multidisciplinary synergy with Civil and ECE departments.',
    },
    {
      id: 'PROP-2026-02',
      challengeId: 'CH-2026-112',
      challengeTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      proposedSolution: 'Stereo-Vision Drone Photogrammetry with Depth-Map Convolutional Neural Networks',
      objectives: 'Survey 15 km of urban roads per charge cycle with automated GIS defect geo-tagging.',
      techStack: 'DJI Matrice SDK, PyTorch, TensorRT, PostGIS, GeoServer',
      facultyMentor: 'Dr. Ramesh Kumar',
      studentTeam: 'Robotics & Aerial Vision Guild',
      industryPartner: 'Larsen & Toubro Smart World',
      estimatedCost: '₹ 6,00,000',
      timeline: '8 Months',
      industrySupport: 'Field telemetry and municipal GIS platform integration',
      technicalRequirements: 'Dual high-resolution RGB stereoscopic sensors, on-edge Jetson Orin Nano compute module.',
      expectedOutcomes: 'Pothole detection accuracy > 92% with volumetric patch material requirement calculation.',
      status: 'Under Review',
      submittedAt: '2026-09-05',
    },
  ];

  private milestones: IMilestone[] = [
    {
      id: 'MLS-01',
      name: 'Requirement Analysis & Stakeholder Field Mapping',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      assignedTeam: 'Smart Water Guild',
      dueDate: '2026-08-30',
      status: 'Completed',
      completionPercentage: 100,
      assignedTasks: 'Interview PWD water inspectors and map Ward 4 feeder chambers',
      submissionStatus: 'Approved',
      mentorNotes: 'Comprehensive baseline field study with accurate GPS coordinates verified.',
    },
    {
      id: 'MLS-02',
      name: 'System Hardware Architecture & CAD Enclosure Design',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      assignedTeam: 'Smart Water Guild',
      dueDate: '2026-09-30',
      status: 'Completed',
      completionPercentage: 100,
      assignedTasks: 'CAD design for IP68 casing and clamp collar for 300mm ductile iron pipe',
      submissionStatus: 'Approved',
      mentorNotes: 'Clamp acoustic coupling verified on NIT Jamshedpur test pipe.',
    },
    {
      id: 'MLS-03',
      name: 'Laboratory Bench Testing & Sensor Calibration',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      assignedTeam: 'Smart Water Guild',
      dueDate: '2026-10-31',
      status: 'In Progress',
      completionPercentage: 80,
      assignedTasks: 'Execute micro-leak acoustic signature recording and FFT frequency bandpass calibration',
      submissionStatus: 'Pending Review',
      submissions: [
        {
          id: 'SUB-2026-01',
          milestoneId: 'MLS-03',
          milestoneName: 'Laboratory Bench Testing & Sensor Calibration',
          projectId: 'PRJ-CH-2026-089',
          studentTeam: 'Smart Water Guild',
          submittedDate: '2026-09-21',
          submittedFiles: [
            { name: 'Acoustic_FFT_Calibration_Log_V1.csv', size: '2.4 MB', type: 'CSV' },
            { name: 'Bench_Test_Oscillogram_Waveforms.pdf', size: '5.1 MB', type: 'PDF' },
            { name: 'Hardware_Assembly_Node_Proof.jpg', size: '1.8 MB', type: 'Image' },
          ],
          description:
            'Bench evaluation conducted across 5 simulated leak pressure gradients (1.5 to 4.5 bar). Achieved 94.2% sensitivity for 2mm orifice orifices. Requires faculty mentor review and feedback.',
          evidence: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          ],
          progressUpdate: '80% test protocols cleared. LoRa transmission latency measured at 1.15 seconds.',
          status: 'Pending Review',
        },
      ],
    },
    {
      id: 'MLS-04',
      name: 'Municipal Ward 4 Pilot Deployment & Telemetry Handshake',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      assignedTeam: 'Smart Water Guild',
      dueDate: '2026-11-30',
      status: 'Upcoming',
      completionPercentage: 15,
      assignedTasks: 'Install 12 autonomous nodes along Bistupur Central water trunk feeder',
      submissionStatus: 'Not Submitted',
    },
    {
      id: 'MLS-05',
      name: 'Final Municipal Validation & ULB Handover Protocol',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      assignedTeam: 'Smart Water Guild',
      dueDate: '2026-12-31',
      status: 'Upcoming',
      completionPercentage: 0,
      assignedTasks: 'Handover open-source firmware, cloud telemetry dashboard, and maintenance manual to PWD',
      submissionStatus: 'Not Submitted',
    },
    {
      id: 'MLS-112-01',
      name: 'Stereo-Vision Edge Model Optimization & Bench Depth Mapping',
      projectId: 'PRJ-CH-2026-112',
      projectTitle: 'Computer Vision Drone Inspection for Road Macro-Potholes',
      assignedTeam: 'Robotics & Aerial Vision Guild',
      dueDate: '2026-10-15',
      status: 'In Progress',
      completionPercentage: 70,
      assignedTasks: 'Calibrate TensorRT YOLO-v8 defect classifier and evaluate depth error < 10mm',
      submissionStatus: 'Pending Review',
      submissions: [
        {
          id: 'SUB-2026-02',
          milestoneId: 'MLS-112-01',
          milestoneName: 'Stereo-Vision Edge Model Optimization',
          projectId: 'PRJ-CH-2026-112',
          studentTeam: 'Robotics & Aerial Vision Guild',
          submittedDate: '2026-09-22',
          submittedFiles: [
            { name: 'Drone_Pothole_Model_Validation.pdf', size: '3.8 MB', type: 'PDF' },
            { name: 'Kadma_Macro_Pothole_Detection_3D.obj', size: '8.2 MB', type: '3D Mesh' },
          ],
          description: 'Evaluated 24 test potholes along Kadma West. Deep crater edge detection reached 92.4% mAP with 8.5ms latency per frame on Jetson Orin Nano.',
          evidence: [
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          ],
          progressUpdate: '70% flight telemetry completed. Ready for mentor sign-off.',
          status: 'Pending Review',
        },
      ],
    },
    {
      id: 'MLS-145-01',
      name: 'Microbial Digestibility Formulation & Odor Suppression Testing',
      projectId: 'PRJ-CH-2026-145',
      projectTitle: 'Decentralized Micro-Composting Digesters',
      assignedTeam: 'EnviroTech Bio-Circular Unit',
      dueDate: '2026-11-10',
      status: 'Upcoming',
      completionPercentage: 30,
      assignedTasks: 'Verify bacterial degradation rate of vegetable cellulose under 55°C thermophilic phase',
      submissionStatus: 'Not Submitted',
    },
    {
      id: 'MLS-188-01',
      name: 'Dynamic LUX Controller Firmware & PIR Cluster Validation',
      projectId: 'PRJ-CH-2026-188',
      projectTitle: 'Solar-Powered LED Smart Streetlighting',
      assignedTeam: 'Urban Grid Photovoltaics',
      dueDate: '2026-11-20',
      status: 'Upcoming',
      completionPercentage: 10,
      assignedTasks: 'Simulate power profile for 24-pole circuit along Sonari bypass corridor',
      submissionStatus: 'Not Submitted',
    },
  ];

  private industryPartners: IIndustryPartner[] = [
    {
      id: 'IND-M01',
      name: 'Tata Steel Utilities & Infrastructure (TSUISL)',
      type: 'Urban Infrastructure & Smart Utility Management',
      domain: 'Water Treatment, Distribution & Civil Automation',
      matchPercentage: 94,
      reason:
        'Operates 1,200+ km of water piping in Jamshedpur with active industrial testbench facilities and dedicated CSR civic pilot grants.',
      capabilities: [
        'Acoustic Pipe Test Benches',
        'Municipal Hardware Validation',
        'Field Deployment Access',
        'Technical Mentorship',
      ],
      availableSupport: [
        'Full test bench access with simulated water leaks',
        'Senior hydraulic engineer mentorship',
        'Direct pilot permission in Jamshedpur utility belt',
        '₹ 2,00,000 matching equipment sponsorship',
      ],
      location: 'Jamshedpur, Jharkhand',
      contactPerson: 'Suresh Nambiar (VP Urban Infrastructure)',
      status: 'Accepted',
    },
    {
      id: 'IND-M02',
      name: 'Larsen & Toubro Smart World & Communication',
      type: 'Smart City System Integrator',
      domain: 'Drone GIS, Road Defect Telemetry & SCADA',
      matchPercentage: 91,
      reason:
        'Lead EPC contractor for regional Command & Control centers; strong match for aerial drone road inspection integration.',
      capabilities: [
        'Integrated Command & Control Platform',
        'Drone Flight Clearance Support',
        'Direct Municipal Handover',
      ],
      availableSupport: [
        'Integration with city GIS dashboard',
        'Flight test range clearance',
        'Technical guidance on SCADA interfaces',
      ],
      location: 'Ranchi Regional Hub',
      contactPerson: 'Arvind Swaminathan (Director AI Mobility)',
      status: 'Recommended',
    },
    {
      id: 'IND-M03',
      name: 'Jindal Steel & Power CSR Foundation',
      type: 'Public-Private Sustainable Innovation Grantor',
      domain: 'Circular Economy, Waste Composting & Clean Energy',
      matchPercentage: 88,
      reason:
        'Active CSR initiative on solid waste valorization; offering seed capital of up to ₹ 10 Lakhs for zero-waste pilots.',
      capabilities: [
        'CSR Project Co-Funding',
        'Bio-Gas Test Lab Access',
        'Field Site Deployment in Industrial Townships',
      ],
      availableSupport: [
        '₹ 3,20,000 direct seed support for micro-composting',
        'Township pilot composting site',
      ],
      location: 'Bokaro / Ranchi',
      contactPerson: 'Meera Chawla (Head Sustainable Development)',
      status: 'Requested',
    },
    {
      id: 'IND-M04',
      name: 'Schneider Electric Smart Grid Innovation Hub',
      type: 'Energy Management & Automation Entity',
      domain: 'Renewable Microgrids & Smart Streetlighting',
      matchPercentage: 85,
      reason: 'Specializes in low-power LoRaWAN lighting controllers and industrial-grade solar charge inverters.',
      capabilities: ['Hardware Component Sponsorship', 'Patent Mentorship', 'Laboratory Certification'],
      availableSupport: [
        'Component donations (microcontrollers & solar sensors)',
        'Patent filing assistance for university teams',
      ],
      location: 'Kolkata Tech Centre',
      contactPerson: 'Debashish Mukherjee (Nodal Innovation Head)',
      status: 'Recommended',
    },
  ];

  private collaborationRequests: ICollaborationRequest[] = [
    {
      id: 'REQ-101',
      project: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
      industry: 'Tata Steel Utilities & Infrastructure (TSUISL)',
      requiredSupport: 'Testbench Access, Prototype Validation & Municipal Pilot Deployment',
      technicalRequirements: 'High-pressure acoustic pipeline test facility with controllable burst simulation',
      expectedDuration: '4 Months',
      fundingRequirement: '₹ 1,50,000 for field sensor node deployment hardware',
      mentorshipRequirement: 'Bi-weekly consultation with Chief Water Network Engineer',
      testingRequirement: 'Hydrostatic pressure burst test up to 8 bar',
      fieldDeploymentRequirement: 'Co-installation with TSUISL maintenance crew in Ward 4',
      additionalNotes: 'TSUISL agreed to provide testbench access and endorse results to Municipal Corporation.',
      date: '2026-08-28',
      status: 'Accepted',
    },
    {
      id: 'REQ-102',
      project: 'Decentralized Micro-Composting Digesters',
      industry: 'Jindal Steel & Power CSR Foundation',
      requiredSupport: 'Seed Capital (₹ 3,20,000) & Community Pilot Testing Facilities',
      date: '2026-09-10',
      status: 'Accepted',
    },
    {
      id: 'REQ-103',
      project: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      industry: 'Larsen & Toubro Smart World & Communication',
      requiredSupport: 'LiDAR Ground-Truth Scans, Flight Telemetry & GIS SCADA Integration',
      date: '2026-09-12',
      status: 'Accepted',
    },
    {
      id: 'REQ-104',
      project: 'Solar-Powered LED Smart Streetlighting',
      industry: 'Schneider Electric Smart Grid Innovation Hub',
      requiredSupport: '10 MPPT Solar Charge Controllers & Doppler Radar Dimming Bench',
      date: '2026-09-15',
      status: 'Accepted',
    },
  ];

  private reports: IReport[] = [
    {
      id: 'REP-2026-01',
      project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      projectId: 'PRJ-CH-2026-089',
      team: 'Smart Water Guild',
      reportType: 'Testing Reports',
      reportingPeriod: 'August 15 – September 15, 2026',
      progressSummary:
        'Successfully completed bench sensitivity calibration across 5 simulated leak pressure gradients. Prototype node firmware optimized with sub-second LoRaWAN telemetry bursts.',
      technicalProgress:
        'Acoustic signal-to-noise ratio improved by 14 dB using custom FIR bandpass filter (2 kHz – 18 kHz). Zero packet loss recorded over 1.8 km distance to NIT gateway.',
      teamPerformance:
        'Excellent multidisciplinary coordination. Civil engineering student mapped all Ward 4 valve nodes while ECE student finalized IP68 enclosure clamp.',
      milestoneProgress: 'Milestones MLS-01 and MLS-02 100% complete; MLS-03 reached 80% completion.',
      industryContribution:
        'TSUISL provided access to their 50m pipe test loop on September 08, 2026, validating localization accuracy within 0.4 meters.',
      challengesRisks:
        'High ambient road traffic noise during peak hours. Addressed via nighttime adaptive spectral subtraction algorithm.',
      nextSteps:
        'Complete mentor sign-off on bench test logs, assemble remaining 10 field units, and initiate Ward 4 municipal trunk line installation.',
      attachments: [
        { name: 'NITJSR_IoT_Water_Testing_Report_V1.pdf', size: '4.2 MB' },
        { name: 'TSUISL_Joint_Validation_Certificate.pdf', size: '1.1 MB' },
      ],
      submittedDate: '2026-09-18',
      status: 'Approved',
      reviewedBy: 'Prof. Ananya Sen',
    },
    {
      id: 'REP-2026-02',
      project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      projectId: 'PRJ-CH-2026-089',
      team: 'Smart Water Guild',
      reportType: 'Progress Reports',
      reportingPeriod: 'September 01 – September 20, 2026',
      progressSummary:
        'Progressed from Prototyping stage into initial Field Pilot setup. Assembled 4 field pilot node enclosures with solar trickle chargers.',
      technicalProgress: 'Battery power consumption profile achieved 11.8 mA during transmission and 18 µA in sleep state.',
      teamPerformance: 'Weekly milestone sprints executed on schedule.',
      milestoneProgress: 'Phase 2 deliverables on track for October 31 review.',
      industryContribution: 'TSUISL assigned Senior Engineer Suresh Nambiar as industrial mentor.',
      challengesRisks: 'Procurement delay of high-temperature piezo sensors resolved.',
      nextSteps: 'Perform outdoor environmental rain test and LoRa antenna radiation pattern validation.',
      attachments: [{ name: 'Biweekly_Sprint_Log_Sept2026.pdf', size: '2.1 MB' }],
      submittedDate: '2026-09-21',
      status: 'Under Review',
    },
    {
      id: 'REP-2026-03',
      project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      projectId: 'PRJ-CH-2026-089',
      team: 'Smart Water Guild',
      reportType: 'Project Reports',
      reportingPeriod: 'Quarter 3 (July – September 2026)',
      progressSummary:
        'Comprehensive mid-term project engineering documentation covering system architecture, hardware schematics, LoRaWAN network design, and testbench validation.',
      technicalProgress:
        'Completed full hardware rev 2 design with dual-layer PCB, integrated ESP32-S3, piezoelectric amplifier, and IP68 sealed acoustic collar.',
      teamPerformance:
        'All 4 student members completed assigned tasks across Civil, Mechanical, and Computer Science domains.',
      milestoneProgress: 'Milestones MLS-01 and MLS-02 certified; MLS-03 calibration in progress.',
      industryContribution:
        'TSUISL co-designed the collar mounting bracket for ductile iron pipes and provided pipe loop access.',
      challengesRisks:
        'Mitigated acoustic wave attenuation over non-metallic PVC pipes by tuning sensor resonant frequency to 8.4 kHz.',
      nextSteps: 'Deploy 6 pilot nodes along Bistupur Ward 4 commercial main line.',
      attachments: [{ name: 'System_Architecture_Dossier_V2.pdf', size: '5.8 MB' }],
      submittedDate: '2026-09-22',
      status: 'Approved',
      reviewedBy: 'Prof. Ananya Sen',
    },
    {
      id: 'REP-2026-04',
      project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      projectId: 'PRJ-CH-2026-089',
      team: 'Smart Water Guild',
      reportType: 'Final Solution Reports',
      reportingPeriod: 'Final Phase Submission (Sept 2026)',
      progressSummary:
        'Final comprehensive solution report for municipal adoption. Validated edge FFT micro-leak detection with 96.2% precision and sub-60 second alert delivery to municipal dashboard.',
      technicalProgress:
        'Zero-packet loss mesh operational over 2.4km urban terrain; solar harvesting ensures indefinite battery lifetime without manual replacement.',
      teamPerformance:
        'Outstanding performance. Filed joint provisional patent application for adaptive acoustic clamp mechanism.',
      milestoneProgress: 'All milestone phases completed and validated by TSUISL and Municipal PWD.',
      industryContribution:
        'TSUISL issued preliminary procurement intent for 50 production units across Ward 4 and Ward 6.',
      challengesRisks: 'Long-term fouling of transducer casing mitigated using hydrophobic ceramic coating.',
      nextSteps: 'Commercial production handover and municipal operator training.',
      attachments: [
        { name: 'Final_Civic_Impact_Assessment.pdf', size: '6.4 MB' },
        { name: 'PWD_Pilot_Endorsement.pdf', size: '2.8 MB' },
      ],
      submittedDate: '2026-09-23',
      status: 'Approved',
      reviewedBy: 'Prof. Ananya Sen',
    },
    {
      id: 'REP-2026-05',
      project: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      projectId: 'PRJ-CH-2026-112',
      team: 'Robotics & Aerial Vision Guild',
      reportType: 'Testing Reports',
      reportingPeriod: 'September 01 – September 20, 2026',
      progressSummary:
        'Flight telemetry testing completed across 8 km stretch of Kadma West arterial road. Real-time edge YOLOv8 model classified 42 asphalt defects with 93.8% precision.',
      technicalProgress:
        'Stereoscopic photogrammetry reconstructed 3D depth-maps of pothole depressions, estimating aggregate asphalt patch volume required within 5% error.',
      teamPerformance:
        'Drone flight pilots maintained zero incidents; lead student Simran optimized onboard TensorRT inference to 38 FPS.',
      milestoneProgress: 'Milestone MLS-04 100% completed; MLS-05 GIS pipeline underway.',
      industryContribution:
        'Larsen & Toubro Smart World provided ground-truth mobile LiDAR scans for accuracy benchmarking.',
      challengesRisks:
        'Afternoon sunlight glint handled via polarizing lens filter and HDR shutter sequencing.',
      nextSteps: 'Deploy automatic municipal PWD work-order generation API.',
      attachments: [
        { name: 'Drone_Photogrammetry_Test_Log_Sept2026.pdf', size: '5.1 MB' },
        { name: 'Pothole_Depth_Volumetric_Map.pdf', size: '3.4 MB' },
      ],
      submittedDate: '2026-09-21',
      status: 'Approved',
      reviewedBy: 'Prof. Ananya Sen',
    },
    {
      id: 'REP-2026-06',
      project: 'Decentralized Micro-Composting Digesters for Wet Market Waste',
      projectId: 'PRJ-CH-2026-145',
      team: 'EnviroTech Bio-Circular Unit',
      reportType: 'Progress Reports',
      reportingPeriod: 'Sprint Cycle 2 (Sept 2026)',
      progressSummary:
        'Thermophilic microbial culture inoculation achieved peak compost chamber temperature of 62°C within 36 hours, accelerating organic decomposition by 4x.',
      technicalProgress:
        'Automated solar-powered aeration impeller successfully balanced dissolved oxygen levels, eliminating foul mercaptan and ammonia emissions.',
      teamPerformance:
        'Biotech and Civil engineering students successfully tested leachate neutralization filtering.',
      milestoneProgress: 'Phase 1 baseline waste audits 100% complete; chamber fabrication at 50%.',
      industryContribution:
        'Jindal Steel & Power CSR Foundation verified site layout at Sakchi Wholesale Vegetable Market.',
      challengesRisks:
        'High moisture content (78%) in vegetable rind waste addressed by adding shredded coconut coir bulking agent.',
      nextSteps:
        'Finalize odorless exhaust bio-filter and deploy prototype tumbler in Sakchi Market Yard.',
      attachments: [{ name: 'Sakchi_Biomass_Compost_Kinetics.pdf', size: '3.8 MB' }],
      submittedDate: '2026-09-22',
      status: 'Under Review',
    },
    {
      id: 'REP-2026-07',
      project: 'Solar-Powered LED Smart Streetlighting with Automated LUX & Pedestrian Density Dimming',
      projectId: 'PRJ-CH-2026-188',
      team: 'Urban Grid Photovoltaics',
      reportType: 'Project Reports',
      reportingPeriod: 'Phase 1 Feasibility & Hardware Design (Sept 2026)',
      progressSummary:
        'Completed dynamic MPPT solar charge controller schematics and microwave Doppler radar pedestrian sensing circuit for Sonari Ring Road pilot.',
      technicalProgress:
        'Simulated adaptive dimming from 100% (high traffic) to 20% (idle midnight), demonstrating 54% net battery power conservation over static LED fixtures.',
      teamPerformance:
        'Electrical engineering team submitted full circuit CAD and optical photometric lumen distribution models.',
      milestoneProgress: 'Milestone MLS-06 on track with 10% prototype completion.',
      industryContribution:
        'Schneider Electric Smart Grid Hub donated 10 industrial-grade MPPT controller sample chipsets.',
      challengesRisks:
        'High monsoon ambient humidity protection addressed with conformal silicon coating.',
      nextSteps:
        'Assemble 5-pole test array on NIT campus ring road prior to municipal installation.',
      attachments: [{ name: 'Sonari_Smart_Lighting_Feasibility_Report.pdf', size: '4.6 MB' }],
      submittedDate: '2026-09-23',
      status: 'Under Review',
    },
  ];

  private facultyProfiles: Record<string, IFacultyProfile> = {
    'Prof. Ananya Sen': {
      facultyName: 'Dr. Ananya Sen',
      facultyId: 'NITJ-CSE-FAC-2015-08',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      university: 'National Institute of Technology Jamshedpur',
      officialEmail: 'faculty.mentor@bitmesra.ac.in',
      phone: '+91 9431102902',
      areasOfExpertise: [
        'Internet of Things (IoT)',
        'Embedded Sensor Networks',
        'Edge Computing & Signal Processing',
        'Smart Municipal Infrastructure',
        'Cyber-Physical Systems',
      ],
      researchAreas: [
        'Subsurface Acoustic Leak Detection in Fluid Conduits',
        'Low-Power LoRaWAN Mesh Networking for Smart Cities',
        'Real-time Edge ML Anomaly Detection',
        'Urban Environmental Telemetry',
      ],
      technicalSkills: [
        'C/C++',
        'Embedded FreeRTOS',
        'LoRaWAN / NB-IoT Protocols',
        'Digital Signal Processing (FFT/FIR)',
        'Microchip & ESP32 Microcontrollers',
        'Python & Edge Impulse',
        'GIS Spatial Analytics',
      ],
      currentProjectsCount: 1,
      mentoredTeamsCount: 1,
      yearsOfExperience: 12,
      assignedDomains: [
        'Water & Sanitation Infrastructure',
        'Smart City Sensor Grid',
        'Municipal Utility Automation',
      ],
      researchInterests: [
        'Real-time Hydro-acoustic sensing for aging urban distribution trunks',
        'Green energy harvesting for perpetual underground monitoring',
      ],
      availableLabs: [
        'IoT & Smart Sensor Calibration Lab (Room 304, R&D Block)',
        'Cyber-Physical Systems Simulation Center (NIIC)',
        'Acoustic Wave & Vibration Analysis Testbed',
      ],
    },
  };

  // Helper to match mentor name flexibly
  private isMentorMatch(mentorField: string, userNameOrEmail?: string): boolean {
    if (!userNameOrEmail) return false;
    const cleanUser = userNameOrEmail.toLowerCase().replace(/^(dr\.|prof\.)\s*/, '').trim();
    const cleanMentor = mentorField.toLowerCase().replace(/^(dr\.|prof\.)\s*/, '').trim();
    return cleanUser.includes(cleanMentor) || cleanMentor.includes(cleanUser);
  }

  // --- Challenges ---
  public getChallenges(filter?: { facultyMentor?: string; status?: string; search?: string }) {
    let list = [...this.challenges];
    if (filter?.facultyMentor) {
      list = list.filter((c) => this.isMentorMatch(c.facultyMentor, filter.facultyMentor));
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((c) => c.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getChallengeById(id: string) {
    return this.challenges.find((c) => c.id === id);
  }

  public updateChallenge(id: string, updates: Partial<IChallenge>) {
    const item = this.challenges.find((c) => c.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }

  public acceptChallengeMentorship(id: string, mentorName: string) {
    const item = this.challenges.find((c) => c.id === id);
    if (!item) return null;
    item.status = 'Accepted';
    item.facultyMentor = mentorName;
    return item;
  }

  // --- Teams ---
  public getTeams(facultyMentor?: string) {
    if (facultyMentor) {
      return this.teams.filter((t) => this.isMentorMatch(t.facultyMentor, facultyMentor));
    }
    return this.teams;
  }

  public getTeamById(id: string) {
    return this.teams.find((t) => t.id === id);
  }

  public createTeam(teamData: Partial<ITeam>) {
    const newTeam: ITeam = {
      id: `TEAM-0${this.teams.length + 1}`,
      name: teamData.name || 'New Innovation Guild',
      facultyMentor: teamData.facultyMentor || 'Prof. Ananya Sen',
      leadStudent: teamData.leadStudent || 'Student Lead',
      departments: teamData.departments || ['Engineering'],
      membersCount: teamData.members?.length || 4,
      activeProject: teamData.activeProject || 'Pending Project Assignment',
      linkedChallengeId: teamData.linkedChallengeId || '',
      skills: teamData.skills || ['IoT', 'Embedded Systems'],
      progress: teamData.progress || 10,
      currentStage: teamData.currentStage || 'Forming',
      status: (teamData.status as any) || 'Active',
      members: teamData.members || [],
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  public updateTeamMemberTask(
    teamId: string,
    studentId: string,
    task: string,
    taskStatus: 'Pending' | 'In Progress' | 'Under Review' | 'Completed'
  ) {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) return null;
    const member = team.members.find((m) => m.studentId === studentId);
    if (!member) return null;
    if (task) member.assignedTasks = task;
    if (taskStatus) member.taskStatus = taskStatus;
    return member;
  }

  // --- Projects ---
  public getProjects(facultyMentor?: string): IProject[] {
    let matchedChallenges = this.challenges;
    if (facultyMentor) {
      matchedChallenges = this.challenges.filter((c) => this.isMentorMatch(c.facultyMentor, facultyMentor));
    }

    return matchedChallenges.map((c) => {
      const projId = `PRJ-${c.id}`;
      const projectMilestones = this.milestones.filter((m) => m.projectId === projId);
      const partner = this.collaborationRequests.find((r) => r.project === c.title)?.industry ||
        'Tata Steel Utilities & Infrastructure';

      return {
        id: projId,
        challengeId: c.id,
        title: c.title,
        domain: c.domain,
        facultyMentor: c.facultyMentor,
        studentTeam: c.studentTeam,
        industryPartner: partner,
        currentStage: c.currentStage as any,
        progress: c.progress,
        status: c.status === 'Accepted' ? 'Active' : 'Under Review',
        budget: c.grantAmount,
        timeline: '6 Months',
        milestones: projectMilestones,
        description: c.description,
        location: c.location,
        priority: c.priority || 'high',
        photos: c.citizenEvidence?.photos && c.citizenEvidence.photos.length > 0
          ? c.citizenEvidence.photos
          : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60'],
        coordinates: c.citizenEvidence?.coordinates || [86.1821, 22.8046],
        slaState: 'within_sla',
        slaDeadline: '2026-09-24T04:31:00.000Z',
        citizenReport: {
          reportId: `CIT-${c.id.replace('CH-', '')}`,
          reporterName: 'Verified Ward Resident Grievance',
          submissionDate: c.submissionDate || '2026-08-10',
          description: c.description,
          notes: c.citizenEvidence?.notes || 'Citizen defect report submitted with verified photographic evidence and GPS coordinates.',
          photos: c.citizenEvidence?.photos || [],
          documents: c.citizenEvidence?.documents || [],
          geolocation: c.citizenEvidence?.geolocation || c.location,
          coordinates: c.citizenEvidence?.coordinates || [86.1821, 22.8046],
          severity: c.aiAnalysis?.severity || 7,
          aiClassification: c.aiClassification || c.domain,
          validationStatus: c.validationStatus || 'Validated by Municipal Corporation',
        },
      };
    });
  }

  // --- Proposals ---
  public getProposals(facultyMentor?: string) {
    if (facultyMentor) {
      return this.proposals.filter((p) => this.isMentorMatch(p.facultyMentor, facultyMentor));
    }
    return this.proposals;
  }

  public saveProposal(proposalData: Partial<IProposal>) {
    if (proposalData.id) {
      const existing = this.proposals.find((p) => p.id === proposalData.id);
      if (existing) {
        Object.assign(existing, proposalData, { updatedAt: new Date().toISOString().split('T')[0] });
        return existing;
      }
    }
    const newProp: IProposal = {
      id: `PROP-2026-0${this.proposals.length + 1}`,
      challengeId: proposalData.challengeId || 'CH-2026-089',
      challengeTitle: proposalData.challengeTitle || 'Innovation Challenge',
      proposedSolution: proposalData.proposedSolution || '',
      objectives: proposalData.objectives || '',
      techStack: proposalData.techStack || '',
      facultyMentor: proposalData.facultyMentor || 'Prof. Ananya Sen',
      studentTeam: proposalData.studentTeam || 'Smart Water Guild',
      industryPartner: proposalData.industryPartner || 'Tata Steel Utilities',
      estimatedCost: proposalData.estimatedCost || '₹ 4,50,000',
      timeline: proposalData.timeline || '6 Months',
      industrySupport: proposalData.industrySupport || '',
      technicalRequirements: proposalData.technicalRequirements || '',
      expectedOutcomes: proposalData.expectedOutcomes || '',
      status: proposalData.status || 'Draft',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    this.proposals.unshift(newProp);
    return newProp;
  }

  // --- Milestones & Submissions ---
  public getMilestones(facultyMentor?: string) {
    const projects = this.getProjects(facultyMentor);
    const projectIds = new Set(projects.map((p) => p.id));
    return this.milestones.filter((m) => projectIds.has(m.projectId));
  }

  public createMilestone(milestoneData: Partial<IMilestone>) {
    const newMls: IMilestone = {
      id: `MLS-0${this.milestones.length + 1}`,
      name: milestoneData.name || 'New Deliverable Milestone',
      projectId: milestoneData.projectId || 'PRJ-CH-2026-089',
      projectTitle: milestoneData.projectTitle || 'Project Deliverable',
      assignedTeam: milestoneData.assignedTeam || 'Smart Water Guild',
      dueDate: milestoneData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: milestoneData.status || 'Upcoming',
      completionPercentage: milestoneData.completionPercentage || 0,
      assignedTasks: milestoneData.assignedTasks || 'Execute milestone requirements',
      submissionStatus: 'Not Submitted',
    };
    this.milestones.push(newMls);
    return newMls;
  }

  public reviewSubmission(
    submissionId: string,
    action: 'APPROVE' | 'REQUEST REVISION' | 'REJECT',
    comment: string,
    mentorName: string
  ) {
    for (const milestone of this.milestones) {
      if (!milestone.submissions) continue;
      const sub = milestone.submissions.find((s) => s.id === submissionId);
      if (sub) {
        if (!sub.mentorComments) sub.mentorComments = [];
        if (comment) sub.mentorComments.push(`[${mentorName}]: ${comment}`);
        sub.reviewedAt = new Date().toISOString().split('T')[0];

        if (action === 'APPROVE') {
          sub.status = 'Approved';
          milestone.submissionStatus = 'Approved';
          milestone.status = 'Completed';
          milestone.completionPercentage = 100;
        } else if (action === 'REQUEST REVISION') {
          sub.status = 'Revision Required';
          milestone.submissionStatus = 'Revision Required';
        } else if (action === 'REJECT') {
          sub.status = 'Rejected';
          milestone.submissionStatus = 'Not Submitted';
        }
        return { milestone, submission: sub };
      }
    }
    return null;
  }

  // --- Industry Matches & Requests ---
  public getIndustryPartners() {
    return this.industryPartners;
  }

  public getCollaborationRequests(facultyMentor?: string) {
    if (facultyMentor) {
      const myProjects = this.getProjects(facultyMentor);
      return this.collaborationRequests.filter((r) =>
        myProjects.some(
          (p) =>
            p.title.toLowerCase().includes(r.project.toLowerCase()) ||
            r.project.toLowerCase().includes(p.title.toLowerCase()) ||
            (p.challengeId && r.project.includes(p.challengeId))
        )
      );
    }
    return this.collaborationRequests;
  }

  public createCollaborationRequest(reqData: Partial<ICollaborationRequest>) {
    const newReq: ICollaborationRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      project: reqData.project || 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      industry: reqData.industry || 'Tata Steel Utilities & Infrastructure (TSUISL)',
      requiredSupport: reqData.requiredSupport || 'Technical Mentorship & Validation',
      technicalRequirements: reqData.technicalRequirements,
      expectedDuration: reqData.expectedDuration || '6 Months',
      fundingRequirement: reqData.fundingRequirement,
      mentorshipRequirement: reqData.mentorshipRequirement,
      testingRequirement: reqData.testingRequirement,
      fieldDeploymentRequirement: reqData.fieldDeploymentRequirement,
      additionalNotes: reqData.additionalNotes,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
    };
    this.collaborationRequests.unshift(newReq);
    return newReq;
  }

  // --- Reports ---
  public getReports(facultyMentor?: string) {
    if (facultyMentor) {
      const myProjects = new Set(this.getProjects(facultyMentor).map((p) => p.id));
      return this.reports.filter((r) => myProjects.has(r.projectId));
    }
    return this.reports;
  }

  public createReport(reportData: Partial<IReport>, mentorName: string) {
    const newReport: IReport = {
      id: `REP-2026-0${this.reports.length + 1}`,
      project: reportData.project || 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      projectId: reportData.projectId || 'PRJ-CH-2026-089',
      team: reportData.team || 'Smart Water Guild',
      reportType: reportData.reportType || 'Progress Reports',
      reportingPeriod: reportData.reportingPeriod || 'Current Sprint',
      progressSummary: reportData.progressSummary || '',
      technicalProgress: reportData.technicalProgress || '',
      teamPerformance: reportData.teamPerformance || '',
      milestoneProgress: reportData.milestoneProgress || '',
      industryContribution: reportData.industryContribution || '',
      challengesRisks: reportData.challengesRisks || '',
      nextSteps: reportData.nextSteps || '',
      attachments: reportData.attachments || [],
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      reviewedBy: mentorName,
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  public getReportById(id: string) {
    return this.reports.find((r) => r.id === id);
  }

  public getReportBundle(reportId: string, mentorName?: string): IReportBundle | null {
    const report = this.getReportById(reportId);
    if (!report) return null;

    // Verify mentor authorization if mentorName is provided and not super admin
    if (mentorName && !mentorName.toLowerCase().includes('admin')) {
      const myProjects = new Set(this.getProjects(mentorName).map((p) => p.id));
      const isAuthorized =
        myProjects.has(report.projectId) ||
        this.isMentorMatch(report.reviewedBy || '', mentorName) ||
        this.isMentorMatch('Prof. Ananya Sen', mentorName);
      if (!isAuthorized) {
        throw new Error('Access denied: You are not authorized to view or download this project report.');
      }
    }

    const challengeId = report.projectId.replace(/^PRJ-/, '');
    const challenge =
      this.challenges.find(
        (c) => c.id === challengeId || c.title.toLowerCase() === report.project.toLowerCase() || c.id === report.projectId
      ) || this.challenges[0];

    const allProjects = this.getProjects();
    const project =
      allProjects.find((p) => p.id === report.projectId || p.title.toLowerCase() === report.project.toLowerCase()) || {
        id: report.projectId,
        challengeId: challenge.id,
        title: report.project,
        domain: challenge.domain,
        facultyMentor: challenge.facultyMentor,
        studentTeam: report.team,
        industryPartner: 'Tata Steel Utilities & Infrastructure (TSUISL)',
        currentStage: challenge.currentStage as any,
        progress: challenge.progress,
        status: (challenge.status === 'Accepted' ? 'Active' : 'Under Review') as any,
        budget: challenge.grantAmount,
        timeline: '6 Months',
        milestones: this.milestones.filter((m) => m.projectId === report.projectId),
      };

    const team =
      this.teams.find(
        (t) =>
          t.name.toLowerCase() === report.team.toLowerCase() ||
          t.linkedChallengeId === challenge.id ||
          t.activeProject.toLowerCase() === report.project.toLowerCase()
      ) || this.teams[0];

    const proposal = this.proposals.find(
      (p) =>
        p.challengeId === challenge.id ||
        p.studentTeam.toLowerCase() === report.team.toLowerCase() ||
        p.challengeTitle.toLowerCase() === report.project.toLowerCase()
    );

    let milestones = this.milestones.filter(
      (m) => m.projectId === report.projectId || m.projectTitle.toLowerCase() === report.project.toLowerCase()
    );
    if (milestones.length === 0) {
      milestones = this.milestones.filter((m) => m.projectId === 'PRJ-CH-2026-089');
    }

    const collaborationRequest = this.collaborationRequests.find(
      (r) =>
        r.project.toLowerCase() === report.project.toLowerCase() ||
        r.project.toLowerCase() === challenge.title.toLowerCase() ||
        r.project.toLowerCase().includes('leakage')
    );

    const industryPartner =
      this.industryPartners.find(
        (p) =>
          p.name === collaborationRequest?.industry ||
          p.name === proposal?.industryPartner ||
          p.name === project.industryPartner ||
          p.name.includes('TSUISL')
      ) || this.industryPartners[0];

    const facultyProfile = this.getFacultyProfile(
      report.reviewedBy || challenge.facultyMentor || mentorName || 'Prof. Ananya Sen'
    );

    return {
      report,
      project,
      challenge,
      team,
      proposal,
      milestones,
      industryPartner,
      collaborationRequest,
      facultyProfile,
      testingDetails: {
        objective:
          'Sub-surface acoustic wave leak pin-pointing and dynamic fluid pressure monitoring for aging municipal trunk mains.',
        testEnvironment:
          'TSUISL 50m Pressurized Hydrology Test Loop & NIT Jamshedpur Sensor Calibration Rig (Water Velocity: 1.4 m/s, Static Pressure: 4.2 bar).',
        testCases: [
          'TC-01: Micro-Leak Acoustic Localization Accuracy (< 0.5m target) — PASSED (0.4m measured)',
          'TC-02: Signal-to-Noise Ratio (SNR) Custom FIR Filter Verification — PASSED (+14 dB improvement)',
          'TC-03: Sub-gigahertz LoRaWAN Telemetry Range (1.8 km to Gateway) — PASSED (0% packet loss)',
          'TC-04: Transducer Low-Power Sleep/Wake Duty Cycle — PASSED (11.8 mA active / 18 uA sleep)',
          'TC-05: Hydrostatic Micro-Burst Latency Alert (< 60s target) — PASSED (42s recorded)',
        ],
        accuracy: '96.2% leak pin-point accuracy (+/- 0.4 meters)',
        snrImprovement: '+14 dB (Adaptive 2 kHz – 18 kHz FIR Filter)',
        telemetryRange: '1.8 km continuous line-of-sight to municipal gateway',
        packetLoss: '0.00% across 5,000 transmitted test packets',
        powerMetrics: '11.8 mA active / 18 uA sleep (Calculated 3.2-year operational battery life)',
        issuesFound:
          'High ambient vehicular vibration during peak morning traffic hours along Bistupur Ward 4 arterial road.',
        correctiveActions:
          'Engineered on-chip adaptive spectral subtraction DSP routine running on ESP32-S3 dual-core microcontroller.',
        validationResult: 'VERIFIED & CERTIFIED BY TSUISL & NIT JAMSHEDPUR LABS',
      },
      mentorEvaluation: {
        mentorName: facultyProfile.facultyName,
        designation: `${facultyProfile.designation}, ${facultyProfile.department}`,
        institution: facultyProfile.university,
        evaluationDate: report.submittedDate,
        decision:
          report.status === 'Approved'
            ? 'APPROVED'
            : report.status === 'Revision Required'
            ? 'REVISION REQUIRED'
            : 'UNDER REVIEW',
        rubrics: {
          'Technical Progress & Engineering Rigor': '9/10 — Exceeds Benchmark',
          'Team Collaboration & Task Delivery': '9/10 — Excellent Multidisciplinary Output',
          'Milestone Schedule Adherence': '8.5/10 — On Schedule',
          'Innovation & IPR Novelty': '9/10 — High (Provisional Patent Prepared)',
          'Industry Partner Integration': '9.5/10 — Outstanding TSUISL Test Loop Collaboration',
          'Testing Quality & Empirical Validation': '9.5/10 — Rigorous Empirical Data Collected',
          'Documentation & Record Integrity': '9/10 — Compliant with Academic & SIH Guidelines',
        },
        comments:
          report.progressSummary ||
          'The student team has demonstrated exceptional technical proficiency and multidisciplinary synergy. The prototype is recommended for formal municipal trunk line pilot installation.',
      },
      endorsement: {
        facultyMentor: facultyProfile.facultyName,
        department: facultyProfile.department,
        institution: facultyProfile.university,
        industryPartner: industryPartner?.name,
        reportStatus: report.status,
        reviewDate: report.submittedDate,
        verificationToken: `CIVICCONNECT-AUTH-REP-${report.id}-2026-SECURE`,
      },
    };
  }

  // --- Profile ---
  public getFacultyProfile(nameOrEmail: string): IFacultyProfile {
    // Return specific profile or default to Prof. Ananya Sen
    const found = Object.values(this.facultyProfiles).find(
      (p) =>
        this.isMentorMatch(p.facultyName, nameOrEmail) ||
        p.officialEmail.toLowerCase() === nameOrEmail.toLowerCase()
    );
    if (found) return found;

    return this.facultyProfiles['Prof. Ananya Sen'];
  }

  public updateFacultyProfile(nameOrEmail: string, updates: Partial<IFacultyProfile>) {
    const profile = this.getFacultyProfile(nameOrEmail);
    // Protect system-generated institutional identity fields
    delete updates.facultyId;
    delete updates.university;
    delete updates.officialEmail;
    delete updates.facultyName;

    Object.assign(profile, updates);
    return profile;
  }
}

export const academicDataService = new AcademicDataService();
