import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { University } from '../models/University';
import { Industry } from '../models/Industry';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { academicDataService } from '../services/academicDataService';

// In-Memory store for University runtime modifications (persisted with DB synchronization)
let challengesState = [
  {
    id: 'CH-2026-089',
    title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
    domain: 'Water & Sanitation Infrastructure',
    location: 'Ward 4 (Bistupur Central)',
    priority: 'high',
    aiClassification: 'IoT Network & Hydrodynamics',
    validationStatus: 'Validated by Municipal PWD',
    assignedDate: '2026-08-14',
    currentStage: 'Field Pilot',
    progress: 85,
    grantAmount: '₹ 4,50,000',
    facultyMentor: 'Prof. Ananya Sen',
    studentTeam: 'Smart Water Guild (CSE + Civil)',
    leadStudent: 'Aakash Verma',
    status: 'Accepted',
    description: 'Autonomous battery-powered ultrasonic sensor nodes deployed along main distribution trunk lines to identify localized pressure drops and early fracture micro-bursts with sub-meter localization accuracy.',
  },
  {
    id: 'CH-2026-112',
    title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
    domain: 'Public Works & Roads',
    location: 'Ward 1 (Kadma West)',
    priority: 'high',
    aiClassification: 'Edge AI & Aerial Photogrammetry',
    validationStatus: 'Validated by City Engineer',
    assignedDate: '2026-08-20',
    currentStage: 'Prototyping',
    progress: 60,
    grantAmount: '₹ 6,00,000',
    facultyMentor: 'Dr. Ramesh Kumar',
    studentTeam: 'Robotics Guild (Mechanical + ECE)',
    leadStudent: 'Pooja Iyer',
    status: 'Accepted',
    description: 'UAV-mounted multi-spectral stereoscopic cameras coupled with on-edge TensorRT model to automatically classify depth, area, and volumetric asphalt loss for proactive patch dispatch before monsoons.',
  },
  {
    id: 'CH-2026-145',
    title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
    domain: 'Solid Waste Management',
    location: 'Ward 7 (Sakchi Market)',
    priority: 'medium',
    aiClassification: 'Biochemical Waste Processing',
    validationStatus: 'Community Verified',
    assignedDate: '2026-09-02',
    currentStage: 'Team Formed',
    progress: 35,
    grantAmount: '₹ 3,20,000',
    facultyMentor: 'Dr. Sunita Murmu',
    studentTeam: 'EnviroTech (BioTech + Chemical)',
    leadStudent: 'Deepak Roy',
    status: 'Under Review',
    description: 'Thermophilic bacterial culture formulations in aerated solar-heated tumblers converting wet market organic remnants into high-grade humus within 11 days, mitigating landfill transfer costs.',
  },
  {
    id: 'CH-2026-188',
    title: 'Solar-Powered LED Smart Streetlighting with Automated LUX & Pedestrian Density Dimming',
    domain: 'Electrical & Street Lighting',
    location: 'Ward 3 (Sonari Ring Road)',
    priority: 'low',
    aiClassification: 'Renewable Power & Embedded Systems',
    validationStatus: 'Under Municipal Review',
    assignedDate: '2026-09-12',
    currentStage: 'Assigned',
    progress: 10,
    grantAmount: '₹ 2,80,000',
    facultyMentor: 'Prof. K. Rajagopal',
    studentTeam: 'Photonics Lab (Electrical)',
    leadStudent: 'Simran Kaur',
    status: 'Assigned',
    description: 'Microcontroller controlled dual MPPT solar lighting fixtures that adjust output lumen based on PIR movement clusters to save 45% battery capacity during zero-footfall midnight hours.',
  },
];

let teamsState = [
  {
    id: 'TEAM-01',
    name: 'Smart Water Guild',
    facultyMentor: 'Prof. Ananya Sen',
    leadStudent: 'Aakash Verma',
    departments: ['Computer Science', 'Civil Engineering', 'Electronics'],
    membersCount: 5,
    activeProject: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    status: 'Active',
  },
  {
    id: 'TEAM-02',
    name: 'Robotics & Aerial Vision Guild',
    facultyMentor: 'Dr. Ramesh Kumar',
    leadStudent: 'Pooja Iyer',
    departments: ['Mechanical Engineering', 'Electronics & Comm.', 'AI & Data Science'],
    membersCount: 6,
    activeProject: 'Computer Vision Drone Inspection for Road Macro-Potholes',
    status: 'Active',
  },
  {
    id: 'TEAM-03',
    name: 'EnviroTech Bio-Circular Unit',
    facultyMentor: 'Dr. Sunita Murmu',
    leadStudent: 'Deepak Roy',
    departments: ['Bio-Engineering', 'Chemical Engineering'],
    membersCount: 4,
    activeProject: 'Decentralized Micro-Composting Digesters',
    status: 'Forming',
  },
  {
    id: 'TEAM-04',
    name: 'Urban Grid Photovoltaics',
    facultyMentor: 'Prof. K. Rajagopal',
    leadStudent: 'Simran Kaur',
    departments: ['Electrical Engineering', 'Renewable Energy'],
    membersCount: 4,
    activeProject: 'Solar-Powered LED Smart Streetlighting',
    status: 'Active',
  },
];

let proposalsState = [
  {
    id: 'PROP-2026-01',
    challengeId: 'CH-2026-089',
    challengeTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    proposedSolution: 'Acoustic & Piezoelectric Real-Time Hydro-Acoustic Leak Locator Network',
    objectives: 'Detect leakages over 50 meters with +/- 0.5 meter precision within 60 seconds.',
    techStack: 'LoRaWAN, ESP32-S3, Edge Impulse, AWS IoT Core, Node-RED',
    facultyMentor: 'Prof. Ananya Sen',
    studentTeam: 'Smart Water Guild',
    estimatedCost: '₹ 4,50,000',
    timeline: '6 Months',
    industrySupport: 'Tata Steel Utilities & Infrastructure Services (Hardware validation + testbench)',
    status: 'Approved',
    submittedAt: '2026-08-25',
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
    estimatedCost: '₹ 6,00,000',
    timeline: '8 Months',
    industrySupport: 'Larsen & Toubro Smart World (Field telemetry & GIS integration)',
    status: 'Under Review',
    submittedAt: '2026-09-05',
  },
];

let industryMatchesState = [
  {
    id: 'IND-M01',
    name: 'Tata Steel Utilities & Infrastructure (TSUISL)',
    type: 'Urban Infrastructure & Smart Utility Management',
    domain: 'Water Treatment, Distribution & Civil Automation',
    matchPercentage: 94,
    reason: 'Operates 1,200+ km of water piping in Jamshedpur; has active industrial testbench facilities and CSR grant program.',
    capabilities: ['Acoustic Pipe Test Benches', 'Municipal Hardware Validation', 'Direct Pilot Deployment'],
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
    reason: 'Lead EPC contractor for regional Command & Control centers; strong match for aerial drone road inspection integration.',
    capabilities: ['Integrated Command & Control Platform', 'Drone Flight Clearance Support', 'Direct Municipal Handover'],
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
    reason: 'Active CSR initiative on solid waste valorization; offering seed capital of up to ₹ 10 Lakhs for zero-waste pilots.',
    capabilities: ['CSR Project Co-Funding', 'Bio-Gas Test Lab Access', 'Field Site Deployment in Industrial Townships'],
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
    location: 'Kolkata Tech Centre',
    contactPerson: 'Debashish Mukherjee (Nodal Innovation Head)',
    status: 'Recommended',
  },
];

let collaborationRequestsState = [
  {
    id: 'REQ-101',
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    industry: 'Tata Steel Utilities & Infrastructure (TSUISL)',
    requestedSupport: 'Testbench Access, Prototype Validation & Municipal Pilot Deployment',
    date: '2026-08-28',
    status: 'Accepted',
  },
  {
    id: 'REQ-102',
    project: 'Decentralized Micro-Composting Digesters',
    industry: 'Jindal Steel & Power CSR Foundation',
    requestedSupport: 'Seed Capital (₹ 3,20,000) & Community Pilot Testing Facilities',
    date: '2026-09-10',
    status: 'Pending',
  },
];

let testingLogsState = [
  {
    id: 'TEST-01',
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    stage: 'Lab Test Bench Evaluation',
    metrics: 'Pressure sensitivity: 0.05 bar; Latency to LoRa gateway: 1.2s; Battery draw: 12mA',
    result: 'Passed',
    verifiedBy: 'Dr. Ramesh Kumar (Dean R&D)',
    date: '2026-09-08',
  },
  {
    id: 'TEST-02',
    project: 'Computer Vision Drone Inspection for Road Macro-Potholes',
    stage: 'Stereo Vision Depth Calibration',
    metrics: 'Mean Average Precision (mAP): 89.4%; Volume error margin: +/- 4.2%',
    result: 'Passed',
    verifiedBy: 'Prof. Ananya Sen',
    date: '2026-09-15',
  },
  {
    id: 'TEST-03',
    project: 'Decentralized Micro-Composting Digesters',
    stage: 'Microbial Pathogen Elimination Test',
    metrics: 'Thermophilic temperature attained: 58°C sustained for 72 hrs; Salmonella: Negative',
    result: 'Passed',
    verifiedBy: 'Dr. Sunita Murmu',
    date: '2026-09-18',
  },
];

// Helper to get current user institution
const getInstitutionName = (req: Request) => {
  return (req as any).user?.institutionName || 'National Institute of Technology Jamshedpur';
};

// 1. Dashboard Overview API
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const institution = getInstitutionName(req);

    res.json({
      success: true,
      data: {
        institution,
        stats: {
          totalChallenges: challengesState.length,
          activeProjects: challengesState.filter((c) => c.status === 'Accepted').length,
          facultyMentors: 18,
          studentTeams: teamsState.length,
          industryCollaborations: industryMatchesState.filter((m) => m.status === 'Accepted').length,
          completedProjects: 5,
          pendingProposals: proposalsState.filter((p) => p.status === 'Under Review').length,
          delayedProjects: 1,
        },
        priorityChallenges: challengesState.slice(0, 3),
        teams: teamsState,
        recentActivity: [
          { time: '10 mins ago', user: 'Prof. Ananya Sen', action: 'Uploaded Lab Calibration Log for CH-2026-089', type: 'testing' },
          { time: '2 hours ago', user: 'Tata Steel Utilities', action: 'Accepted Industry Collaboration Request for IoT Pipeline Sensors', type: 'industry' },
          { time: 'Yesterday', user: 'Dr. Ramesh Kumar', action: 'Assigned Robotics Guild to Drone Macro-Pothole Inspection', type: 'team' },
          { time: '3 days ago', user: 'Municipal PWD', action: 'Routed New Validated Civic Challenge CH-2026-188', type: 'challenge' },
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Challenges Management APIs
export const getChallenges = async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;
    let list = [...challengesState];

    if (status && status !== 'all') {
      list = list.filter((c) => c.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (priority && priority !== 'all') {
      list = list.filter((c) => c.priority.toLowerCase() === (priority as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q));
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateChallengeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, facultyMentor, studentTeam } = req.body;

    const item = challengesState.find((c) => c.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (status) item.status = status;
    if (facultyMentor) item.facultyMentor = facultyMentor;
    if (studentTeam) item.studentTeam = studentTeam;

    academicDataService.updateChallenge(id as string, {
      ...(status && { status: status as any }),
      ...(facultyMentor && { facultyMentor }),
      ...(studentTeam && { studentTeam }),
    });

    res.json({ success: true, message: `Challenge ${id} updated successfully`, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Team Management APIs
export const getTeams = async (req: Request, res: Response) => {
  try {
    const faculty = await User.find({ role: 'faculty_mentor' }).select('name email phone designation institutionName isActive lastLoginAt');
    const students = await User.find({ role: 'student_lead' }).select('name email phone designation institutionName isActive lastLoginAt');

    res.json({
      success: true,
      data: {
        multidisciplinaryTeams: teamsState,
        facultyMentors: faculty,
        studentLeads: students,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, facultyMentor, leadStudent, departments, activeProject } = req.body;
    if (!name || !facultyMentor || !leadStudent) {
      return res.status(400).json({ success: false, message: 'Name, faculty mentor, and student lead are required.' });
    }

    const newTeam = {
      id: `TEAM-0${teamsState.length + 1}`,
      name,
      facultyMentor,
      leadStudent,
      departments: departments || ['Engineering'],
      membersCount: 4,
      activeProject: activeProject || 'Pending Project Assignment',
      status: 'Active',
    };

    teamsState.push(newTeam);
    academicDataService.createTeam({
      name,
      facultyMentor,
      leadStudent,
      departments: departments || ['Engineering'],
      activeProject: activeProject || 'Pending Project Assignment',
    });
    res.status(201).json({ success: true, message: 'Multidisciplinary team created successfully', data: newTeam });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Projects & Milestones APIs
export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = challengesState.map((c, index) => ({
      id: `PRJ-${c.id}`,
      challengeId: c.id,
      title: c.title,
      domain: c.domain,
      facultyMentor: c.facultyMentor,
      studentTeam: c.studentTeam,
      stage: c.currentStage,
      progress: c.progress,
      status: c.status,
      grantAmount: c.grantAmount,
      milestones: [
        { name: 'Requirement Analysis & Stakeholder Mapping', status: 'Completed', deadline: '2026-08-30' },
        { name: 'System Hardware Architecture & CAD Design', status: c.progress >= 40 ? 'Completed' : 'In Progress', deadline: '2026-09-30' },
        { name: 'Laboratory Bench Testing & Sensor Calibration', status: c.progress >= 70 ? 'Completed' : c.progress >= 40 ? 'In Progress' : 'Pending', deadline: '2026-10-31' },
        { name: 'Municipal Ward Pilot Deployment', status: c.progress >= 85 ? 'In Progress' : 'Pending', deadline: '2026-11-30' },
        { name: 'Final Validation & Handover to Urban Local Body', status: 'Pending', deadline: '2026-12-31' },
      ],
    }));

    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Solution Proposals APIs
export const getProposals = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: proposalsState });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProposal = async (req: Request, res: Response) => {
  try {
    const { challengeId, challengeTitle, proposedSolution, objectives, techStack, facultyMentor, studentTeam, estimatedCost, timeline, industrySupport } = req.body;

    const newProposal = {
      id: `PROP-2026-0${proposalsState.length + 1}`,
      challengeId,
      challengeTitle,
      proposedSolution,
      objectives,
      techStack,
      facultyMentor,
      studentTeam,
      estimatedCost,
      timeline,
      industrySupport,
      status: 'Under Review',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    proposalsState.unshift(newProposal);
    res.status(201).json({ success: true, message: 'Solution proposal submitted successfully', data: newProposal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Industry Matching & Collaboration APIs
export const getIndustryMatching = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        matches: industryMatchesState,
        requests: collaborationRequestsState,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendIndustryRequest = async (req: Request, res: Response) => {
  try {
    const { industryName, projectTitle, requestedSupport } = req.body;
    if (!industryName || !projectTitle) {
      return res.status(400).json({ success: false, message: 'Industry name and project title are required.' });
    }

    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      project: projectTitle,
      industry: industryName,
      requestedSupport: requestedSupport || 'Technical Mentorship & Test Bench Access',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    collaborationRequestsState.unshift(newReq);
    res.status(201).json({ success: true, message: 'Collaboration request dispatched to industry partner successfully.', data: newReq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Testing & Validation APIs
export const getTestingLogs = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: testingLogsState });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Internal University Credential Management (Faculty, Student Leads, Staff)
export const getUniversityCredentials = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const institution = currentUser?.institutionName || 'National Institute of Technology Jamshedpur';

    const users = await User.find({
      role: { $in: ['faculty_mentor', 'student_lead'] },
    }).select('-password');

    res.json({
      success: true,
      data: {
        institution,
        users,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUniversityCredential = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { name, email, phone, role, designation, username, password } = req.body;

    if (!name || !email || !role || !username) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and role are required.' });
    }

    // Role hierarchy rule: University Admin can only create Faculty or Student accounts
    if (!['faculty_mentor', 'student_lead'].includes(role)) {
      return res.status(403).json({ success: false, message: 'University Admin can only create Faculty Mentor or Student Lead credentials.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const tempPassword = password || `Univ#${Math.floor(100000 + Math.random() * 900000)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const adminId = `UNIV-${role === 'faculty_mentor' ? 'FAC' : 'STU'}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      role,
      designation: designation || (role === 'faculty_mentor' ? 'Assistant Professor' : 'Innovation Lead'),
      institutionName: currentUser?.institutionName || 'National Institute of Technology Jamshedpur',
      adminId,
      username,
      isActive: true,
      createdBy: currentUser?._id,
    });

    res.status(201).json({
      success: true,
      message: 'University credential created successfully.',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        adminId: newUser.adminId,
        username: newUser.username,
        role: newUser.role,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUniversityCredentialStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Ensure target user is within university scope
    if (!['faculty_mentor', 'student_lead'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized target role.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ success: true, message: `Account ${isActive ? 'activated' : 'deactivated'} successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. University Profile APIs
export const getUniversityProfile = async (req: Request, res: Response) => {
  try {
    const institution = getInstitutionName(req);
    const profile = {
      name: institution,
      institutionId: 'AISHE-U-0142',
      state: 'Jharkhand',
      district: 'East Singhbhum (Jamshedpur)',
      website: 'https://www.nitjsr.ac.in',
      contactEmail: 'univ.admin@nitjsr.ac.in',
      nodalDean: 'Dr. Ramesh Kumar (Dean of R&D and Academic Collaboration)',
      departments: [
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
        'Civil & Environmental Engineering',
        'Mechanical Engineering',
        'Electrical Engineering',
        'Metallurgical & Materials Engineering',
      ],
      incubationCenters: ['NIT Jamshedpur Innovation & Incubation Council (NIIC)', 'MSME Nodal Incubator Center'],
      researchLabs: [
        'IoT & Smart Sensor Calibration Lab',
        'Environmental Wastewater & Composting Testing Unit',
        'Autonomous Aerial Robotics Testing Range',
        'Renewable Solar & Smart Microgrid Testbed',
      ],
      patentsPublished: 14,
      activeStartups: 8,
    };

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
