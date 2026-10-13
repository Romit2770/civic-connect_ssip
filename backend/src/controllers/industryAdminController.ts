import { Request, Response } from 'express';
import { IndustryCollaboration } from '../models/IndustryCollaboration';
import { Complaint } from '../models/Complaint';

// Initial institutional dataset for Tata Steel Utilities & Infrastructure
const DEFAULT_ORGANIZATION_DATA = {
  organizationName: 'Tata Steel Utilities & Infrastructure',
  registrationId: 'CIN: U45200JH1993PLC005396',
  industryDomain: 'Urban Infrastructure & Smart Utility Management',
  location: 'Jamshedpur, Jharkhand',
  officialEmail: 'industry.admin@tatasteel.com',
  website: 'https://www.tatasteeluisil.com',
  csrFocusAreas: [
    'Urban Water Conservation & Leakage Mitigation',
    'Smart City IoT Sensor Telemetry & Grid Monitoring',
    'Solid & Industrial Wet Waste Bio-Composting',
    'Clean Energy Solar Infrastructure & Streetlighting',
  ],
  technicalExpertise: [
    'Hydraulic Network Modeling',
    'Acoustic Leak Detection',
    'SCADA & Substation Automation',
    'LoRaWAN Mesh Telemetry',
    'Civil Structural Monitoring',
  ],
  testingFacilities: [
    'Hydraulic Flow Meter Calibration Test Bench (Sakchi Works)',
    'LoRaWAN 865MHz Gateway Field Test Range (Zone East-04)',
    'Asphalt Material Stress & Tensile Testing Lab (Bistupur)',
  ],
  equipmentSupport: [
    'Edge FFT Pressure Transducers (100 units)',
    'Stereo Photogrammetry Drone Survey Rigs (2 units)',
    'Solar Thermophilic Composting Digester Tumblers (5 units)',
  ],
  fieldDeploymentCapability: 'Direct Field Access across Jamshedpur Notified Area Council (JNAC) Wards 1 to 12',
  fundingCapacity: '₹ 50,00,000 Annual Corporate CSR Innovation Grant Ceiling',
  partnershipsCount: 6,
  completedCollaborationsCount: 9,
  teamMembers: [
    {
      id: 'EMP-TS-021',
      name: 'Suresh Nambiar',
      employeeId: 'EMP-TS-021',
      email: 'suresh.nambiar@tatasteel.com',
      department: 'Urban Infrastructure',
      designation: 'VP – Urban Infrastructure & Water Utilities',
      expertise: ['Smart Utilities', 'Hydraulic Networks', 'Water Systems'],
      technicalSkills: ['SCADA', 'Pipeline Telemetry', 'Pressure Transducers'],
      experienceYears: 18,
      availableFor: ['Technical Mentoring', 'Field Deployment', 'Testing'],
      assignedProjects: ['PRJ-CH-2026-089', 'PRJ-CH-2026-112'],
      availability: 'Available',
      status: 'Active',
    },
    {
      id: 'EMP-TS-034',
      name: 'Arvind Swaminathan',
      employeeId: 'EMP-TS-034',
      email: 'arvind.s@tatasteel.com',
      department: 'Digital Systems & Automation',
      designation: 'Director – AI Mobility & GIS',
      expertise: ['GIS Mapping', 'Drone Photogrammetry', 'SCADA'],
      technicalSkills: ['Computer Vision', 'Stereo Imagery', 'GeoServer'],
      experienceYears: 14,
      availableFor: ['Technical Mentoring', 'Testing', 'Industry Review'],
      assignedProjects: ['PRJ-CH-2026-112'],
      availability: 'Assigned',
      status: 'Active',
    },
    {
      id: 'EMP-TS-045',
      name: 'Dr. Priya Balakrishnan',
      employeeId: 'EMP-TS-045',
      email: 'priya.b@tatasteel.com',
      department: 'Environmental Engineering & CSR',
      designation: 'Principal Specialist – Circular Waste & Composting',
      expertise: ['Organic Waste Management', 'Microbial Inoculants', 'Soil Bioremediation'],
      technicalSkills: ['Humus Analysis', 'Aerobic Digestion', 'Leachate Control'],
      experienceYears: 12,
      availableFor: ['Research Guidance', 'Equipment Support', 'Technical Mentoring'],
      assignedProjects: ['PRJ-CH-2026-145'],
      availability: 'Available',
      status: 'Active',
    },
    {
      id: 'EMP-TS-058',
      name: 'Rohan Deshmukh',
      employeeId: 'EMP-TS-058',
      email: 'rohan.d@tatasteel.com',
      department: 'Electrical & Power Systems',
      designation: 'Senior Lead Engineer – Smart Streetlighting & Solar Grids',
      expertise: ['Solar Photovoltaics', 'PIR Sensors', 'LoRaWAN Mesh'],
      technicalSkills: ['Lux Modulation', 'MPPT Controllers', 'Lithium Battery Packs'],
      experienceYears: 9,
      availableFor: ['Field Deployment', 'Testing', 'Equipment Support'],
      assignedProjects: ['PRJ-CH-2026-188'],
      availability: 'Available',
      status: 'Active',
    },
  ],
  collaborationRequests: [
    {
      id: 'REQ-COL-2026-001',
      challengeId: 'CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
      universityName: 'National Institute of Technology Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      domain: 'Water & Sanitation Infrastructure',
      requiredSupport: 'Full test bench access with simulated water leaks & 100 prototype IoT transducers',
      technicalExpertise: ['Hydraulic Monitoring', 'IoT Edge FFT', 'SCADA Integration'],
      expectedDuration: '6 Months',
      fundingRequirement: '₹ 2,00,000',
      equipmentRequirement: '100 Piezoelectric Pressure Sensors & LoRaWAN Gateway',
      testingRequirement: 'Acoustic Pipe Vibration Calibration at Sakchi Works',
      fieldDeployment: 'Ward 4, Bistupur Central (JNAC Pilot)',
      additionalNotes: 'Requires municipal street trench authorization from TSUISL civil works division.',
      status: 'Pending',
      requestDate: '2026-09-21',
    },
    {
      id: 'REQ-COL-2026-002',
      challengeId: 'CH-2026-112',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
      universityName: 'National Institute of Technology Jamshedpur',
      facultyMentor: 'Dr. Ramesh Kumar',
      domain: 'Public Works & Roads',
      requiredSupport: 'Stereo drone testing corridor and asphalt aggregate tensile analysis',
      technicalExpertise: ['Drone Photogrammetry', 'Computer Vision', 'Asphalt PWD Standards'],
      expectedDuration: '4 Months',
      fundingRequirement: '₹ 2,50,000',
      equipmentRequirement: 'Stereo Dual-Camera Gimbal Pod',
      testingRequirement: 'Pavement Profiler Cross-Validation at Kadma West',
      fieldDeployment: 'Ward 1, Kadma West Arterial Corridor',
      additionalNotes: 'Airspace clearance approved by District Administration.',
      status: 'Under Review',
      requestDate: '2026-09-22',
    },
    {
      id: 'REQ-COL-2026-003',
      challengeId: 'CH-2026-145',
      projectTitle: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
      universityName: 'BIT Mesra',
      facultyMentor: 'Dr. Sunita Murmu',
      domain: 'Solid Waste Management',
      requiredSupport: 'Sakchi wet market waste sorting shed and laboratory leachate testing',
      technicalExpertise: ['Thermophilic Digestion', 'Compost Soil Quality', 'Odor Control'],
      expectedDuration: '5 Months',
      fundingRequirement: '₹ 1,50,000',
      equipmentRequirement: 'Solar-Assisted Aerobic Tumbler Bins',
      testingRequirement: 'NPK Humus Certification',
      fieldDeployment: 'Ward 7, Sakchi Daily Market',
      status: 'Pending',
      requestDate: '2026-09-23',
    },
  ],
  proposals: [
    {
      id: 'PROP-2026-089',
      university: 'NIT Jamshedpur',
      projectTitle: 'Edge-AI Vibration Transducer for Underground Water Line Rupture Detection',
      challengeId: 'CH-2026-089',
      facultyMentor: 'Prof. Ananya Sen',
      requiredSupport: 'Hydraulic Test Bench, Sensor Deployment, TSUISL SCADA Telemetry API',
      estimatedBudget: '₹ 4,50,000',
      timeline: '6 Months (Milestones 1–4)',
      status: 'Accepted',
      submissionDate: '2026-09-18',
      technicalScope: 'Hardware prototype of ESP32-S3 + MEMS acoustic hydrophone deployed on valve joints.',
    },
    {
      id: 'PROP-2026-112',
      university: 'NIT Jamshedpur',
      projectTitle: 'Automated Macro-Pothole Volumetric Loss Estimation via Autonomous Quadcopter',
      challengeId: 'CH-2026-112',
      facultyMentor: 'Dr. Ramesh Kumar',
      requiredSupport: 'Field testing corridor along Kadma West, Technical Mentor assignment',
      estimatedBudget: '₹ 6,00,000',
      timeline: '5 Months (Milestones 1–3)',
      status: 'Accepted',
      submissionDate: '2026-09-19',
      technicalScope: 'Dense point cloud photogrammetry generating GeoTIFF digital elevation models for PWD.',
    },
    {
      id: 'PROP-2026-145',
      university: 'BIT Mesra',
      projectTitle: 'Accelerated Microbial Bioconversion of Mandi Wet Waste into Grade-1 Humus',
      challengeId: 'CH-2026-145',
      facultyMentor: 'Dr. Sunita Murmu',
      requiredSupport: 'Market organic waste collection access and solar aerator equipment',
      estimatedBudget: '₹ 3,20,000',
      timeline: '4 Months (Milestones 1–3)',
      status: 'Under Review',
      submissionDate: '2026-09-20',
      technicalScope: 'Thermophilic Bacillus & Trichoderma inoculant cocktail formulation testing in 500L tumblers.',
    },
    {
      id: 'PROP-2026-188',
      university: 'IIT (ISM) Dhanbad',
      projectTitle: 'Smart Autonomous Solar Streetlight Mesh with Adaptive Dimming & PIR Sensing',
      challengeId: 'CH-2026-188',
      facultyMentor: 'Dr. P. K. Sinha',
      requiredSupport: 'Pole hardware sponsorship and Sonari bypass pilot installation authorization',
      estimatedBudget: '₹ 4,10,000',
      timeline: '6 Months (Milestones 1–4)',
      status: 'Submitted',
      submissionDate: '2026-09-22',
      technicalScope: 'MPPT charging algorithm with dynamic PWM LED control triggered by radar/PIR motion triggers.',
    },
  ],
  fundingCommitments: [
    {
      id: 'FND-TS-2026-01',
      projectId: 'PRJ-CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      university: 'NIT Jamshedpur',
      committedAmount: 450000,
      disbursedAmount: 300000,
      remainingAmount: 150000,
      commitmentDate: '2026-09-10',
      expectedDisbursementDate: '2026-10-15',
      fundingPurpose: 'Hardware Prototyping, Sensor Rig Testing & Ward 4 Pilot Transducers',
      status: 'Partially Disbursed',
      documents: [
        { title: 'CSR Sanction Letter (TSUISL-CSR-2026-089)', filename: 'TSUISL_CSR_Sanction_089.pdf', date: '2026-09-10' },
        { title: 'Tranche-1 Disbursal Voucher (₹ 3,00,000)', filename: 'Disbursal_Voucher_Tranche1.pdf', date: '2026-09-12' },
      ],
    },
    {
      id: 'FND-TS-2026-02',
      projectId: 'PRJ-CH-2026-112',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Potholes',
      university: 'NIT Jamshedpur',
      committedAmount: 600000,
      disbursedAmount: 400000,
      remainingAmount: 200000,
      commitmentDate: '2026-09-12',
      expectedDisbursementDate: '2026-10-20',
      fundingPurpose: 'Quadcopter Stereo Sensor Pod & Kadma West Roadway Surface Analysis',
      status: 'Partially Disbursed',
      documents: [
        { title: 'MoU Funding Agreement (TSUISL-NITJ-RND-112)', filename: 'MoU_NITJ_112.pdf', date: '2026-09-12' },
        { title: 'Tranche-1 Disbursal Receipt (₹ 4,00,000)', filename: 'Disbursal_Receipt_Tranche1.pdf', date: '2026-09-14' },
      ],
    },
    {
      id: 'FND-TS-2026-03',
      projectId: 'PRJ-CH-2026-145',
      projectTitle: 'Decentralized Micro-Composting Digesters with Microbial Inoculant',
      university: 'BIT Mesra',
      committedAmount: 320000,
      disbursedAmount: 150000,
      remainingAmount: 170000,
      commitmentDate: '2026-09-15',
      expectedDisbursementDate: '2026-11-01',
      fundingPurpose: '500L Solar Composting Drum Rigs & Microbial Inoculant Formulations',
      status: 'Partially Disbursed',
      documents: [
        { title: 'CSR Allocation Note (TSUISL-CSR-2026-145)', filename: 'CSR_Alloc_145.pdf', date: '2026-09-15' },
      ],
    },
    {
      id: 'FND-TS-2026-04',
      projectId: 'PRJ-CH-2026-188',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Lux Dimming',
      university: 'IIT (ISM) Dhanbad',
      committedAmount: 410000,
      disbursedAmount: 150000,
      remainingAmount: 260000,
      commitmentDate: '2026-09-16',
      expectedDisbursementDate: '2026-11-15',
      fundingPurpose: 'MPPT Solar Modules, Lithium Iron Phosphate Batteries & Sonari Bypass Poles',
      status: 'Partially Disbursed',
      documents: [
        { title: 'Corporate Grant Agreement (TSUISL-IITISM-188)', filename: 'Grant_Agreement_188.pdf', date: '2026-09-16' },
      ],
    },
    {
      id: 'FND-TS-2026-05',
      projectId: 'PRJ-CH-2026-054',
      projectTitle: 'Smart Drainage Silt Buildup Acoustic Ultrasound Telemetry',
      university: 'NIT Jamshedpur',
      committedAmount: 70000,
      disbursedAmount: 0,
      remainingAmount: 70000,
      commitmentDate: '2026-09-20',
      expectedDisbursementDate: '2026-12-01',
      fundingPurpose: 'Submersible Ultrasound Sensor Array & Silt Level Telemetry',
      status: 'Committed',
      documents: [
        { title: 'Sanction Memorandum (TSUISL-CSR-2026-054)', filename: 'Sanction_Memo_054.pdf', date: '2026-09-20' },
      ],
    },
  ],
};

// Helper: Ensure IndustryCollaboration document exists
async function getOrCreateCollaborationDoc() {
  let doc = await IndustryCollaboration.findOne({
    organizationName: 'Tata Steel Utilities & Infrastructure',
  });
  if (!doc) {
    doc = await IndustryCollaboration.create(DEFAULT_ORGANIZATION_DATA);
  }
  return doc;
}

// 1. Dashboard Endpoint
export const getIndustryDashboard = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    const stats = {
      challengesRecommended: 24,
      collaborationRequests: doc.collaborationRequests.length,
      activeProjects: 6,
      industryMentors: doc.teamMembers.length,
      fundingCommitments: doc.fundingCommitments.length,
      completedCollaborations: doc.completedCollaborationsCount || 9,
      totalCommitted: doc.fundingCommitments.reduce((acc, c) => acc + c.committedAmount, 0),
      totalDisbursed: doc.fundingCommitments.reduce((acc, c) => acc + c.disbursedAmount, 0),
    };

    const overview = {
      organizationName: doc.organizationName,
      registrationId: doc.registrationId,
      industryDomain: doc.industryDomain,
      location: doc.location,
      activePartnerships: doc.partnershipsCount || 6,
      technicalMentors: doc.teamMembers.length,
      activeProjects: stats.activeProjects,
      totalFundingCommitted: stats.totalCommitted,
      completedCollaborations: stats.completedCollaborations,
    };

    const recommendedChallenges = [
      {
        id: 'CH-2026-089',
        title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
        domain: 'Water & Sanitation Infrastructure',
        location: 'Ward 4, Bistupur Central',
        priority: 'high',
        matchPercent: 94,
        matchReasons: [
          'Water infrastructure domain match',
          'IoT & acoustic sensor capability available',
          'Sakchi hydraulic test bench presence',
          'Jamshedpur Ward 4 field presence',
        ],
        technology: 'IoT / LoRaWAN / Edge FFT',
        requiredExpertise: ['Hydraulic Monitoring', 'IoT Sensors', 'Acoustic FFT'],
        estimatedFunding: '₹ 4,50,000',
        photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
      },
      {
        id: 'CH-2026-112',
        title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
        domain: 'Public Works & Roads',
        location: 'Ward 1, Kadma West',
        priority: 'high',
        matchPercent: 91,
        matchReasons: [
          'Municipal road network expertise',
          'Drone photogrammetry testing corridors',
          'Kadma West arterial corridor presence',
        ],
        technology: 'Quadcopter Stereo Vision / GIS',
        requiredExpertise: ['Drone Photogrammetry', 'Computer Vision', 'PWD Standards'],
        estimatedFunding: '₹ 6,00,000',
        photoUrl: '/assets/evidence/road_potholes_drone.jpg',
      },
      {
        id: 'CH-2026-145',
        title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
        domain: 'Solid Waste Management',
        location: 'Ward 7, Sakchi Market',
        priority: 'medium',
        matchPercent: 88,
        matchReasons: [
          'Solid waste management mandate',
          'Organic wet waste market access',
          'Sakchi daily market waste collection facilities',
        ],
        technology: 'Thermophilic Composting / Bioreactor',
        requiredExpertise: ['Composting Biology', 'Humus Testing', 'Odor Control'],
        estimatedFunding: '₹ 3,20,000',
        photoUrl: '/assets/evidence/market_compost_waste.jpg',
      },
    ];

    const activeProjects = [
      {
        id: 'PRJ-CH-2026-089',
        challengeId: 'CH-2026-089',
        title: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
        university: 'NIT Jamshedpur',
        facultyMentor: 'Prof. Ananya Sen',
        studentTeam: 'Smart Water Guild',
        industryMentor: 'Suresh Nambiar',
        stage: 'Field Pilot',
        progress: 85,
        funding: '₹ 4,50,000',
        nextMilestone: 'MLS-03: Sakchi Test Bench Calibration (30 Sep 2026)',
        photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
      },
      {
        id: 'PRJ-CH-2026-112',
        challengeId: 'CH-2026-112',
        title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
        university: 'NIT Jamshedpur',
        facultyMentor: 'Dr. Ramesh Kumar',
        studentTeam: 'Robotics Guild',
        industryMentor: 'Arvind Swaminathan',
        stage: 'Field Pilot',
        progress: 60,
        funding: '₹ 6,00,000',
        nextMilestone: 'MLS-02: Kadma West Stereo Photogrammetry (05 Oct 2026)',
        photoUrl: '/assets/evidence/road_potholes_drone.jpg',
      },
      {
        id: 'PRJ-CH-2026-145',
        challengeId: 'CH-2026-145',
        title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant',
        university: 'BIT Mesra',
        facultyMentor: 'Dr. Sunita Murmu',
        studentTeam: 'EnviroTech Guild',
        industryMentor: 'Dr. Priya Balakrishnan',
        stage: 'Prototyping',
        progress: 35,
        funding: '₹ 3,20,000',
        nextMilestone: 'MLS-02: Sakchi Market Bioreactor Inoculation (12 Oct 2026)',
        photoUrl: '/assets/evidence/market_compost_waste.jpg',
      },
      {
        id: 'PRJ-CH-2026-188',
        challengeId: 'CH-2026-188',
        title: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
        university: 'IIT (ISM) Dhanbad',
        facultyMentor: 'Dr. P. K. Sinha',
        studentTeam: 'Urban Grid Photovoltaics',
        industryMentor: 'Rohan Deshmukh',
        stage: 'Prototyping',
        progress: 45,
        funding: '₹ 4,10,000',
        nextMilestone: 'MLS-02: Sonari Bypass Lux Measurement Test (18 Oct 2026)',
        photoUrl: '/assets/evidence/solar_street_lighting.jpg',
      },
    ];

    const recentActivity = [
      {
        id: 'ACT-01',
        title: 'Proposal accepted: NIT Jamshedpur Water Pipeline IoT Network',
        timestamp: '2 hours ago',
        category: 'Proposal',
      },
      {
        id: 'ACT-02',
        title: 'Industry Mentor Suresh Nambiar verified Sakchi Test Bench setup',
        timestamp: '5 hours ago',
        category: 'Mentorship',
      },
      {
        id: 'ACT-03',
        title: 'Tranche-1 funding voucher released: ₹ 4,00,000 to Drone Pothole Team',
        timestamp: 'Yesterday',
        category: 'Funding',
      },
      {
        id: 'ACT-04',
        title: 'BIT Mesra uploaded Micro-Composting testing report version 1.2',
        timestamp: '2 days ago',
        category: 'Deliverable',
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats,
        overview,
        recommendedChallenges,
        collaborationRequests: doc.collaborationRequests,
        activeProjects,
        recentActivity,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DASHBOARD_ERROR', message: error.message },
    });
  }
};

// 2. Challenge Discovery Endpoint
export const getIndustryChallenges = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    const allChallenges = [
      {
        id: 'CH-2026-089',
        title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
        domain: 'Water & Sanitation Infrastructure',
        location: 'Ward 4, Bistupur Central',
        priority: 'high',
        matchPercent: 94,
        matchReasons: [
          'Water infrastructure expertise match',
          'Acoustic sensor testing facility available',
          'Direct Ward 4 municipal presence',
        ],
        technology: 'IoT / LoRaWAN / Edge Processing',
        requiredExpertise: ['Hydraulic Monitoring', 'IoT', 'Sensor Networks'],
        estimatedFunding: '₹ 4,50,000',
        status: 'Active',
        category: 'recommended',
        isSaved: true,
        collaborationRequested: true,
        photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
        description:
          'Continuous localized underground pipe pressure drops and persistent street seepage reported along the main 300mm feeder trunk line in Bistupur Ward 4. PWD manual acoustic surveys have not located fracture depth. Requires an autonomous IoT sensor network with edge FFT bandpass filtering.',
        citizenGrievance: 'Citizen photos show street asphalt saturation and geyser micro-bursts during morning high-pressure pumping hours.',
        aiValidation: 'Acoustic telemetry confirms anomalous 1.2 bar pressure drop. High urgency due to commercial district supply disruption.',
      },
      {
        id: 'CH-2026-112',
        title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
        domain: 'Public Works & Roads',
        location: 'Ward 1, Kadma West',
        priority: 'high',
        matchPercent: 91,
        matchReasons: [
          'Municipal road network expertise',
          'Drone photogrammetry testing corridors',
          'Kadma West arterial corridor presence',
        ],
        technology: 'Stereo Photogrammetry / GeoTIFF',
        requiredExpertise: ['Drone Photogrammetry', 'Computer Vision', 'PWD Road Standards'],
        estimatedFunding: '₹ 6,00,000',
        status: 'Active',
        category: 'recommended',
        isSaved: true,
        collaborationRequested: true,
        photoUrl: '/assets/evidence/road_potholes_drone.jpg',
        description:
          'Rapid asphalt erosion and repetitive heavy vehicle wheel rutting along Kadma West arterial artery. Automated stereo drone photogrammetry deployed to quantify asphalt loss volume.',
        citizenGrievance: 'Citizen defect report submitted with verified photographic evidence and GPS coordinates.',
        aiValidation: 'Photogrammetry point cloud reveals 8 macro-craters exceeding 15cm depth.',
      },
      {
        id: 'CH-2026-145',
        title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
        domain: 'Solid Waste Management',
        location: 'Ward 7, Sakchi Market',
        priority: 'medium',
        matchPercent: 88,
        matchReasons: [
          'Municipal solid waste management mandate',
          'Organic wet waste market access',
          'Bio-composting testing laboratory available',
        ],
        technology: 'Thermophilic Bioreactor Tumblers',
        requiredExpertise: ['Composting Biology', 'Humus Testing', 'Leachate Control'],
        estimatedFunding: '₹ 3,20,000',
        status: 'Active',
        category: 'recommended',
        isSaved: false,
        collaborationRequested: true,
        photoUrl: '/assets/evidence/market_compost_waste.jpg',
        description:
          'Thermophilic bacterial culture formulations in aerated solar-heated tumblers converting wet market organic remnants into high-grade humus within 11 days, mitigating landfill transfer costs.',
        citizenGrievance: 'Daily market organic garbage dumper overflowing for 3 days; foul odor and leachate runoff blocking pedestrian footpath.',
        aiValidation: 'Bio-waste volume exceeds 2.4 tons daily. Microbial acceleration feasible for decentralized onsite treatment.',
      },
      {
        id: 'CH-2026-188',
        title: 'Solar-Powered LED Smart Streetlighting with Dynamic Lux Dimming & PIR Sensors',
        domain: 'Urban Energy & Electrical',
        location: 'Ward 9, Sonari Bypass',
        priority: 'high',
        matchPercent: 86,
        matchReasons: [
          'Electrical utility and street grid operations',
          'Solar luminaire installation team',
          'Sonari bypass corridor presence',
        ],
        technology: 'Solar PV / MPPT / LoRaWAN Mesh',
        requiredExpertise: ['Photovoltaics', 'PIR Motion Sensing', 'Mesh Telemetry'],
        estimatedFunding: '₹ 4,10,000',
        status: 'Active',
        category: 'recommended',
        isSaved: true,
        collaborationRequested: false,
        photoUrl: '/assets/evidence/solar_street_lighting.jpg',
        description:
          'Grid-independent photovoltaic luminaires with adaptive PIR night-time dimming and battery health telemetry over LoRaWAN mesh for suburban arterial corridors.',
        citizenGrievance: 'Streetlights on Sonari bypass remain completely dark for two consecutive nights; dangerous for night commuters.',
        aiValidation: 'Power grid disconnect confirmed. Standalone solar luminaire replacement optimal for 3.2km un-electrified sector.',
      },
      {
        id: 'CH-2026-054',
        title: 'Smart Stormwater Drainage Silt Buildup Acoustic Ultrasound Telemetry',
        domain: 'Drainage & Flood Management',
        location: 'Ward 5, Jugsalai Nallah',
        priority: 'critical',
        matchPercent: 84,
        matchReasons: [
          'Stormwater drainage telemetry expertise',
          'Monsoon flood prevention focus',
        ],
        technology: 'Submersible Ultrasound Transducers',
        requiredExpertise: ['Acoustic Ultrasound', 'Hydro-dynamics', 'Embedded Telemetry'],
        estimatedFunding: '₹ 3,80,000',
        status: 'Under Review',
        category: 'all',
        isSaved: false,
        collaborationRequested: false,
        photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
        description: 'Underground silt accretion in culvert trunk lines causing monsoon surface inundation.',
        citizenGrievance: 'Severe drainage backflow during monsoon downpours entering residential ground floors.',
        aiValidation: 'Culvert capacity reduced by 64% due to compacted silt deposits.',
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        challenges: allChallenges,
        categories: ['Recommended', 'All Challenges', 'Saved', 'Collaboration Requested', 'Under Review'],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CHALLENGES_ERROR', message: error.message },
    });
  }
};

// 3. Create Collaboration Request
export const createCollaborationRequest = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();
    const {
      challengeId,
      projectTitle,
      universityName,
      facultyMentor,
      domain,
      requiredSupport,
      technicalExpertise,
      expectedDuration,
      fundingRequirement,
      equipmentRequirement,
      testingRequirement,
      fieldDeployment,
      additionalNotes,
    } = req.body;

    const newRequest = {
      id: `REQ-COL-2026-${String(doc.collaborationRequests.length + 1).padStart(3, '0')}`,
      challengeId: challengeId || 'CH-2026-089',
      projectTitle: projectTitle || 'Civic Infrastructure Research Initiative',
      universityName: universityName || 'National Institute of Technology Jamshedpur',
      facultyMentor: facultyMentor || 'Prof. Ananya Sen',
      domain: domain || 'Urban Infrastructure',
      requiredSupport: requiredSupport || 'Technical Testing & Mentorship',
      technicalExpertise: Array.isArray(technicalExpertise) ? technicalExpertise : [technicalExpertise || 'IoT'],
      expectedDuration: expectedDuration || '6 Months',
      fundingRequirement: fundingRequirement || '₹ 2,00,000',
      equipmentRequirement: equipmentRequirement || 'Hardware Test Bench Access',
      testingRequirement: testingRequirement || 'Field Calibration',
      fieldDeployment: fieldDeployment || 'Municipal Ward Pilot',
      additionalNotes: additionalNotes || '',
      status: 'Pending' as const,
      requestDate: new Date().toISOString().split('T')[0],
    };

    doc.collaborationRequests.unshift(newRequest);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Collaboration request submitted successfully to University Innovation Council.',
        request: newRequest,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REQUEST_ERROR', message: error.message },
    });
  }
};

// 4. University Collaborations & Proposals Endpoint
export const getUniversityCollaborations = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    const universities = [
      {
        id: 'UNIV-NITJSR',
        name: 'National Institute of Technology Jamshedpur',
        location: 'Adityapur, Jamshedpur, Jharkhand',
        researchAreas: ['IoT', 'Embedded Systems', 'Smart Infrastructure', 'GIS', 'Edge Computing'],
        relevantDepartments: ['Civil Engineering', 'Computer Science & Engineering', 'Electrical Engineering'],
        activeProjects: 3,
        industryCompatibility: '96% High Compatibility',
        accreditation: 'NIRF Tier-1 / NAAC A++',
        nodalMoUDate: '12-JAN-2025',
      },
      {
        id: 'UNIV-BITMESRA',
        name: 'Birla Institute of Technology Mesra',
        location: 'Ranchi, Jharkhand',
        researchAreas: ['Environmental Engineering', 'Bio-Composting', 'Waste Bioremediation', 'Remote Sensing'],
        relevantDepartments: ['Bioengineering & Biotechnology', 'Chemical Engineering'],
        activeProjects: 1,
        industryCompatibility: '92% High Compatibility',
        accreditation: 'NIRF Ranked / NAAC A+',
        nodalMoUDate: '24-MAR-2025',
      },
      {
        id: 'UNIV-IITISM',
        name: 'Indian Institute of Technology (ISM) Dhanbad',
        location: 'Dhanbad, Jharkhand',
        researchAreas: ['Solar Photovoltaics', 'LoRaWAN Mesh', 'Geotechnical Sensor Networks'],
        relevantDepartments: ['Electrical Engineering', 'Mining Machinery Engineering'],
        activeProjects: 2,
        industryCompatibility: '90% High Compatibility',
        accreditation: 'Institute of National Importance',
        nodalMoUDate: '08-FEB-2025',
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        universities,
        proposals: doc.proposals,
        collaborationRequests: doc.collaborationRequests,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'COLLABORATIONS_ERROR', message: error.message },
    });
  }
};

// 5. Update Proposal Status
export const updateProposalStatus = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();
    const { proposalId } = req.params;
    const { status, remarks } = req.body;

    const prop = doc.proposals.find((p) => p.id === proposalId);
    if (!prop) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Proposal not found' },
      });
    }

    prop.status = status;
    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: `Proposal ${proposalId} status updated to ${status}.`,
        proposal: prop,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_PROPOSAL_ERROR', message: error.message },
    });
  }
};

// 6. Industry Team Endpoint
export const getIndustryTeam = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    return res.status(200).json({
      success: true,
      data: {
        team: doc.teamMembers,
        totalMembers: doc.teamMembers.length,
        activeMentors: doc.teamMembers.filter((m) => m.status === 'Active').length,
        availableMentors: doc.teamMembers.filter((m) => m.availability === 'Available').length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TEAM_ERROR', message: error.message },
    });
  }
};

// 7. Add Industry Mentor
export const addIndustryMentor = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();
    const {
      name,
      employeeId,
      email,
      department,
      designation,
      expertise,
      technicalSkills,
      experienceYears,
      availableFor,
      assignedProjects,
    } = req.body;

    if (!name || !employeeId || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide all mandatory employee details.' },
      });
    }

    const newMentor = {
      id: employeeId.trim(),
      name: name.trim(),
      employeeId: employeeId.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      designation: designation.trim(),
      expertise: Array.isArray(expertise) ? expertise : [expertise || 'Technical Support'],
      technicalSkills: Array.isArray(technicalSkills) ? technicalSkills : [technicalSkills || 'Standard'],
      experienceYears: Number(experienceYears) || 5,
      availableFor: Array.isArray(availableFor) ? availableFor : ['Technical Mentoring'],
      assignedProjects: Array.isArray(assignedProjects) ? assignedProjects : [],
      availability: 'Available' as const,
      status: 'Active' as const,
    };

    doc.teamMembers.push(newMentor);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Industry technical mentor registered successfully.',
        member: newMentor,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_MENTOR_ERROR', message: error.message },
    });
  }
};

// 8. Projects & Milestones Endpoint
export const getIndustryProjects = async (req: Request, res: Response) => {
  try {
    const projects = [
      {
        id: 'PRJ-CH-2026-089',
        challengeId: 'CH-2026-089',
        title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
        domain: 'Water & Sanitation Infrastructure',
        location: 'Ward 4, Bistupur Central',
        university: 'NIT Jamshedpur',
        facultyMentor: 'Prof. Ananya Sen',
        studentLead: 'Aakash Verma (Smart Water Guild)',
        industryMentor: 'Suresh Nambiar',
        stage: 'Field Pilot',
        lifecycleStageIndex: 6, // 0 to 8
        progress: 85,
        fundingCommitted: '₹ 4,50,000',
        fundingDisbursed: '₹ 3,00,000',
        supportProvided: 'Sakchi Hydraulic Test Bench + 100 Piezoelectric Pressure Sensors',
        status: 'Active',
        photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
        description:
          'Continuous localized underground pipe pressure drops and persistent street seepage reported along the main 300mm feeder trunk line in Bistupur Ward 4.',
        milestones: [
          {
            id: 'MLS-01',
            title: 'Mathematical Acoustic Wave Model & Baseline Telemetry',
            targetDate: '15 Aug 2026',
            progress: 100,
            status: 'Completed',
            industryReview: 'Approved',
            deliverables: ['Mathematical Wave Simulation Report (v1.0)'],
          },
          {
            id: 'MLS-02',
            title: 'Hardware Circuitry & LoRaWAN Node Assembly',
            targetDate: '31 Aug 2026',
            progress: 100,
            status: 'Completed',
            industryReview: 'Approved',
            deliverables: ['PCB Gerber Files', 'Hydrophone Bench Test Log'],
          },
          {
            id: 'MLS-03',
            title: 'Sakchi Test Bench Water Flow Simulation & Calibration',
            targetDate: '30 Sep 2026',
            progress: 80,
            status: 'In Progress',
            industryReview: 'Required',
            deliverables: ['Calibration Log v2.1', 'FFT Noise Floor Spectrum Analysis'],
          },
          {
            id: 'MLS-04',
            title: 'Field Municipal Pilot Live Sensor Deployment (Ward 4)',
            targetDate: '30 Oct 2026',
            progress: 20,
            status: 'Scheduled',
            industryReview: 'Pending Pilot Start',
            deliverables: ['Field Installation Dossier'],
          },
        ],
        deliverables: [
          {
            id: 'DEL-01',
            title: 'Mathematical Wave Simulation & Transducer Circuit Schematics',
            type: 'Technical Documentation',
            submittedBy: 'Aakash Verma (Student Lead)',
            submissionDate: '14 Aug 2026',
            version: 'v1.0',
            industryReview: 'Approved',
            status: 'Verified',
            filename: 'CivicConnect_Pipeline_Wave_Simulation_v1.0.pdf',
          },
          {
            id: 'DEL-02',
            title: 'Sakchi Works Acoustic Transducer Calibration & Bench Test Report',
            type: 'Testing Report',
            submittedBy: 'Prof. Ananya Sen (Faculty Mentor)',
            submissionDate: '21 Sep 2026',
            version: 'v2.1',
            industryReview: 'Action Needed',
            status: 'Under Review',
            filename: 'TSUISL_Sakchi_Test_Bench_Report_v2.1.pdf',
          },
        ],
      },
      {
        id: 'PRJ-CH-2026-112',
        challengeId: 'CH-2026-112',
        title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
        domain: 'Public Works & Roads',
        location: 'Ward 1, Kadma West',
        university: 'NIT Jamshedpur',
        facultyMentor: 'Dr. Ramesh Kumar',
        studentLead: 'Pooja Sharma (Robotics Guild)',
        industryMentor: 'Arvind Swaminathan',
        stage: 'Field Pilot',
        lifecycleStageIndex: 6,
        progress: 60,
        fundingCommitted: '₹ 6,00,000',
        fundingDisbursed: '₹ 4,00,000',
        supportProvided: 'Dual-Gimbal Pod + Asphalt Core Testing Facilities',
        status: 'Active',
        photoUrl: '/assets/evidence/road_potholes_drone.jpg',
        description: 'Automated stereo drone photogrammetry deployed to quantify asphalt loss volume along Kadma West arterial artery.',
        milestones: [
          {
            id: 'MLS-01',
            title: 'Drone Airspace Permitting & Flight Mission Scripting',
            targetDate: '20 Aug 2026',
            progress: 100,
            status: 'Completed',
            industryReview: 'Approved',
            deliverables: ['DGCA Flight Clearance', 'Autonomous Waypoint Script'],
          },
          {
            id: 'MLS-02',
            title: 'Stereo Photogrammetry & Asphalt Loss Volumetric Point Cloud',
            targetDate: '05 Oct 2026',
            progress: 60,
            status: 'In Progress',
            industryReview: 'Required',
            deliverables: ['Kadma West Orthomosaic Map', 'Pothole Volume Calculations'],
          },
        ],
        deliverables: [
          {
            id: 'DEL-03',
            title: 'Autonomous Stereo Flight Path & Spatial Calibration Dossier',
            type: 'Technical Documentation',
            submittedBy: 'Dr. Ramesh Kumar',
            submissionDate: '28 Aug 2026',
            version: 'v1.0',
            industryReview: 'Approved',
            status: 'Verified',
            filename: 'Drone_Airspace_Flight_Path_NITJ.pdf',
          },
        ],
      },
      {
        id: 'PRJ-CH-2026-145',
        challengeId: 'CH-2026-145',
        title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
        domain: 'Solid Waste Management',
        location: 'Ward 7, Sakchi Market',
        university: 'BIT Mesra',
        facultyMentor: 'Dr. Sunita Murmu',
        studentLead: 'Vikramaditya Roy (EnviroTech Guild)',
        industryMentor: 'Dr. Priya Balakrishnan',
        stage: 'Prototyping',
        lifecycleStageIndex: 4,
        progress: 35,
        fundingCommitted: '₹ 3,20,000',
        fundingDisbursed: '₹ 1,50,000',
        supportProvided: 'Sakchi Mandi Waste Sorting Access + Humus Laboratory Quality Certification',
        status: 'Active',
        photoUrl: '/assets/evidence/market_compost_waste.jpg',
        description: 'Thermophilic bacterial culture formulations in aerated solar-heated tumblers converting wet market organic remnants into high-grade humus.',
        milestones: [
          {
            id: 'MLS-01',
            title: 'Microbial Culture Formulation & Lab Bench Titration',
            targetDate: '10 Sep 2026',
            progress: 100,
            status: 'Completed',
            industryReview: 'Approved',
            deliverables: ['Bacteria Formulation Lab Certificate'],
          },
          {
            id: 'MLS-02',
            title: '500L Solar Tumbler Assembly & Aeration Telemetry',
            targetDate: '12 Oct 2026',
            progress: 35,
            status: 'In Progress',
            industryReview: 'Required',
            deliverables: ['Mechanical CAD Drawings', 'Sakchi Pilot Site Plan'],
          },
        ],
        deliverables: [
          {
            id: 'DEL-04',
            title: 'Thermophilic Inoculant Formulation & Bench Trial Assay',
            type: 'Testing Report',
            submittedBy: 'Dr. Sunita Murmu',
            submissionDate: '08 Sep 2026',
            version: 'v1.1',
            industryReview: 'Approved',
            status: 'Verified',
            filename: 'BITMesra_Microbial_Assay_Report.pdf',
          },
        ],
      },
      {
        id: 'PRJ-CH-2026-188',
        challengeId: 'CH-2026-188',
        title: 'Solar-Powered LED Smart Streetlighting with Dynamic Lux Dimming & PIR Sensors',
        domain: 'Urban Energy & Electrical',
        location: 'Ward 9, Sonari Bypass',
        university: 'IIT (ISM) Dhanbad',
        facultyMentor: 'Dr. P. K. Sinha',
        studentLead: 'Ankit Kumar (Urban Grid)',
        industryMentor: 'Rohan Deshmukh',
        stage: 'Prototyping',
        lifecycleStageIndex: 4,
        progress: 45,
        fundingCommitted: '₹ 4,10,000',
        fundingDisbursed: '₹ 1,50,000',
        supportProvided: 'Sonari Bypass Corridor Pole Mounts + MPPT Test Benches',
        status: 'Active',
        photoUrl: '/assets/evidence/solar_street_lighting.jpg',
        description: 'Grid-independent photovoltaic luminaires with adaptive PIR night-time dimming and battery health telemetry over LoRaWAN mesh.',
        milestones: [
          {
            id: 'MLS-01',
            title: 'MPPT Charge Controller Design & Battery Cycle Testing',
            targetDate: '01 Sep 2026',
            progress: 100,
            status: 'Completed',
            industryReview: 'Approved',
            deliverables: ['MPPT Efficiency Curve Data'],
          },
          {
            id: 'MLS-02',
            title: 'Sonari Corridor Luminaire Field Prototype',
            targetDate: '18 Oct 2026',
            progress: 45,
            status: 'In Progress',
            industryReview: 'Required',
            deliverables: ['PIR Range Assessment', 'Field Enclosure IP67 Test'],
          },
        ],
        deliverables: [
          {
            id: 'DEL-05',
            title: 'MPPT Charge Controller & Battery Longevity Simulation Log',
            type: 'Testing Report',
            submittedBy: 'Dr. P. K. Sinha',
            submissionDate: '31 Aug 2026',
            version: 'v1.0',
            industryReview: 'Approved',
            status: 'Verified',
            filename: 'IIT_ISM_MPPT_Charge_Report.pdf',
          },
        ],
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        projects,
        lifecycleStages: [
          'Challenge Accepted',
          'Team Formed',
          'Solution Proposal',
          'Industry Collaboration',
          'Prototyping',
          'Testing',
          'Field Pilot',
          'Deployment',
          'Completed',
        ],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROJECTS_ERROR', message: error.message },
    });
  }
};

// 9. Review Deliverable / Add Industry Feedback
export const reviewProjectDeliverable = async (req: Request, res: Response) => {
  try {
    const { deliverableId } = req.params;
    const { industryReview, feedbackComments } = req.body;

    return res.status(200).json({
      success: true,
      data: {
        message: `Deliverable ${deliverableId} reviewed. Industry status updated to "${industryReview}".`,
        deliverableId,
        industryReview,
        feedbackComments: feedbackComments || 'Technical inspection verified by Industry Lead.',
        reviewedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REVIEW_ERROR', message: error.message },
    });
  }
};

// 10. Funding & CSR Commitments Endpoint
export const getFundingCommitments = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    const totalCommitted = doc.fundingCommitments.reduce((acc, c) => acc + c.committedAmount, 0);
    const totalDisbursed = doc.fundingCommitments.reduce((acc, c) => acc + c.disbursedAmount, 0);
    const totalPending = totalCommitted - totalDisbursed;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCommitted,
          totalDisbursed,
          totalPending,
          activeProjects: 6,
        },
        commitments: doc.fundingCommitments,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FUNDING_ERROR', message: error.message },
    });
  }
};

// 11. Create Funding Commitment
export const createFundingCommitment = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();
    const { projectId, projectTitle, university, committedAmount, fundingPurpose, expectedDisbursementDate } = req.body;

    const amount = Number(committedAmount) || 200000;
    const newCommitment = {
      id: `FND-TS-2026-${String(doc.fundingCommitments.length + 1).padStart(2, '0')}`,
      projectId: projectId || 'PRJ-CH-2026-089',
      projectTitle: projectTitle || 'Civic Research Prototype',
      university: university || 'NIT Jamshedpur',
      committedAmount: amount,
      disbursedAmount: 0,
      remainingAmount: amount,
      commitmentDate: new Date().toISOString().split('T')[0],
      expectedDisbursementDate: expectedDisbursementDate || '2026-11-30',
      fundingPurpose: fundingPurpose || 'Research Prototyping & Field Testing Rigs',
      status: 'Committed' as const,
      documents: [
        {
          title: `CSR Commitment Letter (${doc.organizationName})`,
          filename: `CSR_Commitment_${Date.now()}.pdf`,
          date: new Date().toISOString().split('T')[0],
        },
      ],
    };

    doc.fundingCommitments.push(newCommitment);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'CSR Funding commitment recorded successfully.',
        commitment: newCommitment,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CREATE_FUNDING_ERROR', message: error.message },
    });
  }
};

// 12. Industry Analytics Endpoint
export const getIndustryAnalytics = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    return res.status(200).json({
      success: true,
      data: {
        projectsSupported: {
          total: 15,
          active: 6,
          completed: 9,
          growthPercent: '+25%',
        },
        universitiesPartnered: {
          total: 3,
          active: 3,
          academicLabsUtilized: 8,
        },
        funding: {
          totalCommitted: 1850000,
          totalDisbursed: 1000000,
          pendingTranches: 850000,
          projectsFunded: 6,
          disbursalRatio: '54.05%',
        },
        socialImpact: {
          challengesSupported: 15,
          citizensImpacted: 240000,
          fieldDeploymentsCompleted: 7,
          ulbMunicipalPartnerships: 3, // JNAC, MNAC, Jamshedpur Utility Desk
        },
        technicalContribution: {
          technicalMentors: doc.teamMembers.length,
          mentorshipHoursLogged: 420,
          testingFacilitiesActive: doc.testingFacilities.length,
          hardwareRigsDeployed: 107,
        },
        domainDistribution: [
          { domain: 'Water & Sanitation', projects: 5, budget: '₹ 6,50,000', percent: 35 },
          { domain: 'Roads & Public Works', projects: 4, budget: '₹ 6,00,000', percent: 32 },
          { domain: 'Solid Waste Management', projects: 3, budget: '₹ 3,20,000', percent: 17 },
          { domain: 'Urban Energy & Solar', projects: 3, budget: '₹ 4,10,000', percent: 16 },
        ],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_ERROR', message: error.message },
    });
  }
};

// 13. Organization Profile Endpoint
export const getOrganizationProfile = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();

    return res.status(200).json({
      success: true,
      data: {
        verifiedCredentials: {
          organizationName: doc.organizationName,
          registrationId: doc.registrationId,
          incorporationDate: '1993-08-25',
          corporateStatus: 'Active Statutory Corporation',
          panNumber: 'AAACT2026M',
          gstin: '20AAACT2026M1ZV',
          registeredLocation: doc.location,
          nodalNodalTier: 'Tier-1 Strategic Corporate Partner',
          nodalMoUStatus: 'Statutory MoU Valid through 2028',
          verifiedAt: '2026-01-15T09:00:00Z',
        },
        editableProfile: {
          industryDomain: doc.industryDomain,
          officialEmail: doc.officialEmail,
          website: doc.website,
          csrFocusAreas: doc.csrFocusAreas,
          technicalExpertise: doc.technicalExpertise,
          testingFacilities: doc.testingFacilities,
          equipmentSupport: doc.equipmentSupport,
          fieldDeploymentCapability: doc.fieldDeploymentCapability,
          fundingCapacity: doc.fundingCapacity,
        },
        documents: [
          {
            title: 'Statutory Corporate Partnership MoU (MoHUA & CivicConnect)',
            filename: 'CivicConnect_Corporate_MoU_TataSteel.pdf',
            type: 'Official Accord',
            size: '2.4 MB',
            verified: true,
          },
          {
            title: 'Corporate CSR Grant Board Resolution FY 2026–27',
            filename: 'TSUISL_CSR_Board_Resolution_2026.pdf',
            type: 'Statutory Resolution',
            size: '1.8 MB',
            verified: true,
          },
          {
            title: 'NABL Certified Sakchi Flow Meter Calibration Rig Certificate',
            filename: 'NABL_Calibration_Certification.pdf',
            type: 'Testing Laboratory Credential',
            size: '3.1 MB',
            verified: true,
          },
        ],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_ERROR', message: error.message },
    });
  }
};

// 14. Update Organization Profile
export const updateOrganizationProfile = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCollaborationDoc();
    const {
      industryDomain,
      officialEmail,
      website,
      csrFocusAreas,
      technicalExpertise,
      testingFacilities,
      equipmentSupport,
      fieldDeploymentCapability,
      fundingCapacity,
    } = req.body;

    if (industryDomain) doc.industryDomain = industryDomain;
    if (officialEmail) doc.officialEmail = officialEmail;
    if (website) doc.website = website;
    if (csrFocusAreas) doc.csrFocusAreas = csrFocusAreas;
    if (technicalExpertise) doc.technicalExpertise = technicalExpertise;
    if (testingFacilities) doc.testingFacilities = testingFacilities;
    if (equipmentSupport) doc.equipmentSupport = equipmentSupport;
    if (fieldDeploymentCapability) doc.fieldDeploymentCapability = fieldDeploymentCapability;
    if (fundingCapacity) doc.fundingCapacity = fundingCapacity;

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Organization profile updated successfully.',
        editableProfile: {
          industryDomain: doc.industryDomain,
          officialEmail: doc.officialEmail,
          website: doc.website,
          csrFocusAreas: doc.csrFocusAreas,
          technicalExpertise: doc.technicalExpertise,
          testingFacilities: doc.testingFacilities,
          equipmentSupport: doc.equipmentSupport,
          fieldDeploymentCapability: doc.fieldDeploymentCapability,
          fundingCapacity: doc.fundingCapacity,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_PROFILE_ERROR', message: error.message },
    });
  }
};
