import { academicDataService } from './academicDataService';

export interface IStudentTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedStudentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'completed' | 'overdue';
  progress: number;
  milestoneId: string;
  milestoneName: string;
  expectedDeliverable: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isLockedForReview?: boolean;
}

export interface IProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type: 'Proposal' | 'Research' | 'Prototype' | 'Testing' | 'Progress Reports' | 'Final Reports';
  description: string;
  uploadedBy: string;
  uploadedById: string;
  version: string;
  uploadedDate: string;
  fileSize: string;
  fileType: string;
  status: 'Approved' | 'Under Review' | 'Draft' | 'Archived';
  fileUrl: string;
}

export interface IProjectMessage {
  id: string;
  projectId: string;
  channel: 'faculty' | 'industry' | 'team';
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: { name: string; size: string; url: string }[];
  isUnread?: boolean;
}

export interface IProjectNotification {
  id: string;
  projectId: string;
  title: string;
  message: string;
  type: 'milestone' | 'task' | 'industry' | 'team' | 'faculty';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface IStudentEditableProject {
  gitRepositoryUrl?: string;
  labStationWorkstation?: string;
  studentTechnicalNotes?: string;
  hardwareBOMUpdates?: string;
  weeklyMeetingSchedule?: string;
  riskMitigationActions?: string;
}

class StudentLeadDataService {
  private activeProject = {
    challengeId: 'CH-2026-089',
    projectId: 'PRJ-CH-2026-089',
    title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
    domain: 'Water & Sanitation Infrastructure',
    location: 'Ward 4, Bistupur Central',
    currentStage: 'Field Pilot' as const,
    progress: 68,
    facultyMentor: 'Prof. Ananya Sen',
    facultyMentorDept: 'Computer Science & Engineering',
    facultyMentorInst: 'Birla Institute of Technology Mesra',
    facultyMentorEmail: 'faculty.mentor@bitmesra.ac.in',
    industryPartner: 'Tata Steel Utilities & Infrastructure',
    industryLead: 'Er. Suresh Nambiar (VP Urban Infrastructure)',
    industryContactEmail: 'industry.admin@tatasteel.com',
    studentTeam: 'Smart Water Guild',
    studentLeadName: 'Aakash Verma',
    studentLeadId: '2023UGC044',
    studentLeadDept: 'Computer Science & Engineering',
    studentLeadInst: 'National Institute of Technology Jamshedpur',
    budget: '₹ 4,85,000',
    timeline: '15 July 2026 – 30 November 2026 (20 Weeks)',
    problemStatement:
      'Undetected subsurface potable water trunk pipeline breaches and persistent pressure anomalies across the Bistupur municipal distribution grid cause up to 34% non-revenue water (NRW) loss, municipal supply shortages, and secondary contamination risks in low-pressure zones.',
    proposedSolution:
      'Multi-node edge telemetry network featuring solar-powered piezoelectric & ultrasonic acoustic transceivers non-intrusively clamped to distribution valves, integrated with LoRaWAN wireless telemetry (865 MHz) and cloud-based transient pressure wave analysis for sub-meter leak localization.',
    technologyStack:
      'ESP32-S3 Microcontrollers, C/C++ Firmware, FreeRTOS, LoRaWAN 865-867 MHz, Piezoelectric Acoustic Sensors, Node.js Microservices, TimescaleDB, Mapbox GL GIS, Python Scikit-Learn Leak Classifier',
    expectedOutcomes:
      'Reduction of NRW loss below 12%, automated SCADA/SMS alerts to municipal engineers within 90 seconds of pressure drops, sub-meter leak localization accuracy (< 0.5m), and low BOM manufacturing cost (< ₹4,200 per sensor node).',
    lifecycleStages: [
      { stage: 'Challenge Accepted', completion: 100, status: 'Completed', date: '15 Jul 2026' },
      { stage: 'Team Formed', completion: 100, status: 'Completed', date: '28 Jul 2026' },
      { stage: 'Solution Proposal', completion: 100, status: 'Completed', date: '10 Aug 2026' },
      { stage: 'Industry Collaboration', completion: 100, status: 'Completed', date: '28 Aug 2026' },
      { stage: 'Prototyping', completion: 100, status: 'Completed', date: '12 Sep 2026' },
      { stage: 'Testing', completion: 100, status: 'Completed', date: '20 Sep 2026' },
      { stage: 'Field Pilot', completion: 68, status: 'In Progress', date: 'Ongoing (Active Stage)' },
      { stage: 'Deployment', completion: 0, status: 'Upcoming', date: '01 Nov 2026' },
      { stage: 'Completed', completion: 0, status: 'Upcoming', date: '30 Nov 2026' },
    ],
    studentEditableInfo: {
      gitRepositoryUrl: 'https://github.com/CivicConnect-Academic/smart-water-telemetry-firmware',
      labStationWorkstation: 'Embedded Systems Lab 3, Workstation E-14, NIT Jamshedpur',
      studentTechnicalNotes:
        'Acoustic signal-to-noise ratio increased by 14 dB using custom FIR bandpass filter (2 kHz - 18 kHz). Zero packet loss verified up to 1.8 km distance.',
      hardwareBOMUpdates: 'Batch 1 of 6 nodes assembled with solar charge harvesting circuitry and IP68 sealed conduit glands.',
      weeklyMeetingSchedule: 'Tuesdays 16:30 IST with Prof. Ananya Sen; Alternate Saturdays 10:00 IST with TSUISL Field Team.',
      riskMitigationActions: 'Pre-flight battery temperature cut-off tested for high-ambient midday conditions.',
    },
  };

  private teamMembers = [
    {
      studentName: 'Aakash Verma',
      studentId: '2023UGC044',
      department: 'Computer Science',
      role: 'Student Lead',
      skills: ['ESP32', 'C++', 'FreeRTOS', 'LoRaWAN'],
      assignedTasksCount: 5,
      taskProgress: 80,
      status: 'Active',
      email: 'student.lead@iitism.ac.in',
      phone: '+91 94311-02903',
      currentTasks: [
        'Finalize sensor enclosure CAD (TSK-014)',
        'Calibrate FFT edge vibration filter for ultrasonic transducer (TSK-009)',
        'Submit laboratory bench testing report to faculty portal (TSK-010)',
      ],
      completedTasks: [
        'Draft technical solution architecture (TSK-001)',
        'Configure FreeRTOS dual-core task affinity on ESP32 (TSK-003)',
      ],
      pendingTasks: ['Finalize sensor enclosure CAD (TSK-014)'],
      recentActivity: 'Submitted Sensor Calibration Report for Faculty Review (2 hours ago)',
    },
    {
      studentName: 'Priya Sharma',
      studentId: '2023UGEC019',
      department: 'Electronics',
      role: 'Hardware & Sensor Engineer',
      skills: ['Analog', 'PCB', 'Sensors', 'Power Harvesting'],
      assignedTasksCount: 4,
      taskProgress: 70,
      status: 'Active',
      email: 'priya.sharma@nitjsr.ac.in',
      phone: '+91 98351-04911',
      currentTasks: [
        'Calibrate ultrasonic transducers against water test rig (TSK-015)',
        'Conduct solar MPPT charging efficiency cycle test (TSK-011)',
      ],
      completedTasks: [
        'Design 2-layer sensor conditioning PCB schematic in KiCad (TSK-002)',
        'Solder piezo amplifier surface mount circuit (TSK-005)',
      ],
      pendingTasks: ['Calibrate ultrasonic transducers against water test rig (TSK-015)'],
      recentActivity: 'Updated hardware testing task telemetry benchmarks (5 hours ago)',
    },
    {
      studentName: 'Rohan Banerjee',
      studentId: '2023UGCE032',
      department: 'Civil Engineering',
      role: 'Hydraulic Specialist',
      skills: ['GIS', 'Hydraulics', 'EPANET', 'Surge Analysis'],
      assignedTasksCount: 3,
      taskProgress: 60,
      status: 'Active',
      email: 'rohan.banerjee@nitjsr.ac.in',
      phone: '+91 94711-09822',
      currentTasks: [
        'Map Ward 4 pipeline junction pressure nodes in EPANET (TSK-016)',
        'Collect baseline municipal distribution flow logs from PWD (TSK-012)',
      ],
      completedTasks: [
        'Survey Ward 4 Bistupur 300mm trunk line valves and manholes (TSK-004)',
      ],
      pendingTasks: ['Map Ward 4 pipeline junction pressure nodes in EPANET (TSK-016)'],
      recentActivity: 'Completed hydraulic mapping across Ward 4 trunk pipeline distribution (Yesterday)',
    },
    {
      studentName: 'Sneha Ghosh',
      studentId: '2023UGCS078',
      department: 'Computer Science',
      role: 'Cloud & GIS Developer',
      skills: ['Node.js', 'PostgreSQL', 'WebSockets', 'Mapbox GL'],
      assignedTasksCount: 4,
      taskProgress: 55,
      status: 'Active',
      email: 'sneha.ghosh@nitjsr.ac.in',
      phone: '+91 97711-44319',
      currentTasks: [
        'Configure WebSocket stream for real-time SCADA dashboard (TSK-017)',
        'Develop TimescaleDB spatial aggregation endpoint (TSK-013)',
      ],
      completedTasks: [
        'Build Node.js LoRaWAN payload decoder microservice (TSK-006)',
        'Create Mapbox GIS vector layer of Jamshedpur water grid (TSK-008)',
      ],
      pendingTasks: ['Configure WebSocket stream for real-time SCADA dashboard (TSK-017)'],
      recentActivity: 'Integrated Mapbox vector tiles for live telemetry overlay (2 days ago)',
    },
    {
      studentName: 'Vikram Patel',
      studentId: '2023UGME015',
      department: 'Mechanical Engineering',
      role: 'CAD & Enclosure Specialist',
      skills: ['SolidWorks', 'IP68 Sealing', '3D Printing', 'Thermal Analysis'],
      assignedTasksCount: 1,
      taskProgress: 90,
      status: 'Active',
      email: 'vikram.patel@nitjsr.ac.in',
      phone: '+91 94311-88231',
      currentTasks: ['3D print ASA weather-resistant pipe clamp collar (TSK-007)'],
      completedTasks: ['Finalize 3D model of snap-fit electronics housing (TSK-007)'],
      pendingTasks: [],
      recentActivity: 'Assembled IP68 silicone O-ring enclosure prototypes (3 days ago)',
    },
    {
      studentName: 'Ankit Ray',
      studentId: '2023UGEC041',
      department: 'Electronics',
      role: 'RF & Telemetry Technician',
      skills: ['LoRaWAN', 'Antennas', 'Spectrum Analyzer', 'Field Deployment'],
      assignedTasksCount: 1,
      taskProgress: 85,
      status: 'Active',
      email: 'ankit.ray@nitjsr.ac.in',
      phone: '+91 98351-77123',
      currentTasks: ['Conduct outdoor LoRaWAN range & packet-loss benchmark (TSK-018)'],
      completedTasks: ['Tune 865 MHz quarter-wave whip antenna matching network (TSK-018)'],
      pendingTasks: [],
      recentActivity: 'Measured -118 dBm RSSI across 1.8km link to NIT central gateway (4 days ago)',
    },
  ];

  private tasks: IStudentTask[] = [
    {
      id: 'TSK-001',
      projectId: 'PRJ-CH-2026-089',
      title: 'Literature review & acoustic leak frequency benchmark',
      description: 'Review existing piezoelectric pipeline transducers and document 2 kHz - 20 kHz vibration profile.',
      assignedTo: 'Aakash Verma',
      assignedStudentId: '2023UGC044',
      priority: 'high',
      startDate: '2026-07-20',
      dueDate: '2026-08-05',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-01',
      milestoneName: 'Problem Definition & Literature Benchmark',
      expectedDeliverable: 'Literature summary document with FFT frequency tables',
      createdAt: '2026-07-20',
      updatedAt: '2026-08-05',
    },
    {
      id: 'TSK-002',
      projectId: 'PRJ-CH-2026-089',
      title: 'Design dual-channel analog piezo sensor preamplifier circuit',
      description: 'Schematic in KiCad featuring high-impedance FET input stage and low-noise operational amplifier.',
      assignedTo: 'Priya Sharma',
      assignedStudentId: '2023UGEC019',
      priority: 'critical',
      startDate: '2026-08-01',
      dueDate: '2026-08-20',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-02',
      milestoneName: 'Sensor Circuit Design & PCB Fabrication',
      expectedDeliverable: 'KiCad schematics and SPICE simulation transient response curves',
      createdAt: '2026-08-01',
      updatedAt: '2026-08-20',
    },
    {
      id: 'TSK-003',
      projectId: 'PRJ-CH-2026-089',
      title: 'Configure FreeRTOS firmware dual-core task affinity on ESP32-S3',
      description: 'Dedicated core 0 for I2S acoustic sampling and core 1 for LoRaWAN packetization and power management.',
      assignedTo: 'Aakash Verma',
      assignedStudentId: '2023UGC044',
      priority: 'high',
      startDate: '2026-08-10',
      dueDate: '2026-08-25',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-02',
      milestoneName: 'Sensor Circuit Design & PCB Fabrication',
      expectedDeliverable: 'ESP-IDF C/C++ firmware repository commit v1.0',
      createdAt: '2026-08-10',
      updatedAt: '2026-08-25',
    },
    {
      id: 'TSK-004',
      projectId: 'PRJ-CH-2026-089',
      title: 'Field survey of Ward 4 Bistupur potable water distribution trunk',
      description: 'Catalogue pipe material (ductile iron vs cast iron), nominal diameter (300mm), and valve chamber depths.',
      assignedTo: 'Rohan Banerjee',
      assignedStudentId: '2023UGCE032',
      priority: 'medium',
      startDate: '2026-08-12',
      dueDate: '2026-08-28',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-01',
      milestoneName: 'Problem Definition & Literature Benchmark',
      expectedDeliverable: 'GPS coordinate survey sheet of 12 candidate sensor valves',
      createdAt: '2026-08-12',
      updatedAt: '2026-08-28',
    },
    {
      id: 'TSK-005',
      projectId: 'PRJ-CH-2026-089',
      title: 'Fabricate PCB test coupons and assemble 6 amplifier boards',
      description: 'SMD soldering of Texas Instruments OPA1642 and precision passives with ultrasonic cleaning.',
      assignedTo: 'Priya Sharma',
      assignedStudentId: '2023UGEC019',
      priority: 'high',
      startDate: '2026-08-22',
      dueDate: '2026-09-05',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-02',
      milestoneName: 'Sensor Circuit Design & PCB Fabrication',
      expectedDeliverable: '6 tested bare-board amplifier modules ready for sensor connection',
      createdAt: '2026-08-22',
      updatedAt: '2026-09-05',
    },
    {
      id: 'TSK-006',
      projectId: 'PRJ-CH-2026-089',
      title: 'Develop Node.js LoRaWAN payload decoder & MQTT consumer',
      description: 'Parse 16-byte binary acoustic energy telemetry frames into JSON and write to TimescaleDB.',
      assignedTo: 'Sneha Ghosh',
      assignedStudentId: '2023UGCS078',
      priority: 'medium',
      startDate: '2026-08-25',
      dueDate: '2026-09-08',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-04',
      milestoneName: 'LoRaWAN Gateway Integration & Cloud Telemetry',
      expectedDeliverable: 'Express.js ingestion API with unit test coverage > 90%',
      createdAt: '2026-08-25',
      updatedAt: '2026-09-08',
    },
    {
      id: 'TSK-007',
      projectId: 'PRJ-CH-2026-089',
      title: '3D print weather-resistant ASA clamp collar for 300mm pipe',
      description: 'SolidWorks parametric model with rubber acoustic isolator and stainless steel hex tensioners.',
      assignedTo: 'Vikram Patel',
      assignedStudentId: '2023UGME015',
      priority: 'medium',
      startDate: '2026-08-28',
      dueDate: '2026-09-12',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-02',
      milestoneName: 'Sensor Circuit Design & PCB Fabrication',
      expectedDeliverable: 'Functional physical clamp collar prototype verified on test pipe',
      createdAt: '2026-08-28',
      updatedAt: '2026-09-12',
    },
    {
      id: 'TSK-008',
      projectId: 'PRJ-CH-2026-089',
      title: 'Construct Mapbox GL vector telemetry map for Bistupur sector',
      description: 'Render GIS water pipeline network with color-coded live pressure and acoustic threshold markers.',
      assignedTo: 'Sneha Ghosh',
      assignedStudentId: '2023UGCS078',
      priority: 'medium',
      startDate: '2026-09-01',
      dueDate: '2026-09-15',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-04',
      milestoneName: 'LoRaWAN Gateway Integration & Cloud Telemetry',
      expectedDeliverable: 'Interactive web map dashboard component integrated into CivicConnect',
      createdAt: '2026-09-01',
      updatedAt: '2026-09-15',
    },
    {
      id: 'TSK-009',
      projectId: 'PRJ-CH-2026-089',
      title: 'Calibrate FFT edge vibration filter for ultrasonic transducer',
      description: 'Tune 1024-point real-time FFT algorithm on ESP32 to eliminate ambient motor and traffic harmonics.',
      assignedTo: 'Aakash Verma',
      assignedStudentId: '2023UGC044',
      priority: 'critical',
      startDate: '2026-09-08',
      dueDate: '2026-09-22',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-03',
      milestoneName: 'Laboratory Bench Testing & Sensor Calibration',
      expectedDeliverable: 'Filter response plot and optimized fixed-point DSP assembly routine',
      createdAt: '2026-09-08',
      updatedAt: '2026-09-22',
    },
    {
      id: 'TSK-010',
      projectId: 'PRJ-CH-2026-089',
      title: 'Compile laboratory bench calibration data into formal report',
      description: 'Document 5 simulated orifice sizes (0.5mm to 4.0mm) across 2 bar, 4 bar, and 6 bar water pressures.',
      assignedTo: 'Aakash Verma',
      assignedStudentId: '2023UGC044',
      priority: 'high',
      startDate: '2026-09-15',
      dueDate: '2026-09-24',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-03',
      milestoneName: 'Laboratory Bench Testing & Sensor Calibration',
      expectedDeliverable: 'DOC-05 Testing Report PDF submitted to Faculty Portal',
      createdAt: '2026-09-15',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-011',
      projectId: 'PRJ-CH-2026-089',
      title: 'Execute continuous 72-hour solar harvesting power profile test',
      description: 'Measure 2W solar panel energy buffer against 3.7V 3500mAh 18650 Li-ion cell under simulated rain cycles.',
      assignedTo: 'Priya Sharma',
      assignedStudentId: '2023UGEC019',
      priority: 'medium',
      startDate: '2026-09-16',
      dueDate: '2026-09-25',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-05',
      milestoneName: 'Enclosure Weatherproofing & IP68 Certification',
      expectedDeliverable: 'Battery voltage decay and replenishment telemetry log CSV',
      createdAt: '2026-09-16',
      updatedAt: '2026-09-25',
    },
    {
      id: 'TSK-012',
      projectId: 'PRJ-CH-2026-089',
      title: 'Analyze municipal water pump operational schedules with PWD engineers',
      description: 'Correlate morning (06:00-09:00) and evening (17:00-20:00) pumping surges with transient pressure peaks.',
      assignedTo: 'Rohan Banerjee',
      assignedStudentId: '2023UGCE032',
      priority: 'low',
      startDate: '2026-09-18',
      dueDate: '2026-09-26',
      status: 'completed',
      progress: 100,
      milestoneId: 'MLS-01',
      milestoneName: 'Problem Definition & Literature Benchmark',
      expectedDeliverable: 'Pump surge timetable and baseline operating pressure envelope document',
      createdAt: '2026-09-18',
      updatedAt: '2026-09-26',
    },
    {
      id: 'TSK-013',
      projectId: 'PRJ-CH-2026-089',
      title: 'Develop TimescaleDB spatial aggregation endpoint',
      description: 'Write PostgreSQL hypertables queries calculating 15-minute rolling averages of pressure gradients.',
      assignedTo: 'Sneha Ghosh',
      assignedStudentId: '2023UGCS078',
      priority: 'medium',
      startDate: '2026-09-20',
      dueDate: '2026-09-27',
      status: 'in_progress',
      progress: 85,
      milestoneId: 'MLS-04',
      milestoneName: 'LoRaWAN Gateway Integration & Cloud Telemetry',
      expectedDeliverable: 'API endpoint returning GeoJSON feature collection with telemetry properties',
      createdAt: '2026-09-20',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-014',
      projectId: 'PRJ-CH-2026-089',
      title: 'Finalize sensor enclosure CAD',
      description: 'Incorporate PG9 cable glands, IP68 silicone perimeter seal, and external magnetic wake-up reed switch.',
      assignedTo: 'Aakash Verma',
      assignedStudentId: '2023UGC044',
      priority: 'high',
      startDate: '2026-09-21',
      dueDate: '2026-09-28',
      status: 'in_progress',
      progress: 70,
      milestoneId: 'MLS-05',
      milestoneName: 'Enclosure Weatherproofing & IP68 Certification',
      expectedDeliverable: 'Production-ready STEP file and 3D print verification report',
      createdAt: '2026-09-21',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-015',
      projectId: 'PRJ-CH-2026-089',
      title: 'Calibrate ultrasonic transducers against water test rig',
      description: 'Mount sensor pair on Tata Steel 50-meter test bench and measure acoustic time-of-flight delta.',
      assignedTo: 'Priya Sharma',
      assignedStudentId: '2023UGEC019',
      priority: 'critical',
      startDate: '2026-09-22',
      dueDate: '2026-09-30',
      status: 'in_progress',
      progress: 75,
      milestoneId: 'MLS-03',
      milestoneName: 'Laboratory Bench Testing & Sensor Calibration',
      expectedDeliverable: 'Calibration certificate signed by TSUISL Hydraulic Lab Officer',
      createdAt: '2026-09-22',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-016',
      projectId: 'PRJ-CH-2026-089',
      title: 'Map Ward 4 pipeline junction pressure nodes in EPANET',
      description: 'Build hydraulic network model incorporating elevation data, pipe roughness coefficients, and demand nodes.',
      assignedTo: 'Rohan Banerjee',
      assignedStudentId: '2023UGCE032',
      priority: 'high',
      startDate: '2026-09-23',
      dueDate: '2026-10-02',
      status: 'in_progress',
      progress: 60,
      milestoneId: 'MLS-06',
      milestoneName: 'Ward 4 Bistupur Pilot Installation & Field Sensor Run',
      expectedDeliverable: 'EPANET .inp file with calibrated simulated pressure contours',
      createdAt: '2026-09-23',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-017',
      projectId: 'PRJ-CH-2026-089',
      title: 'Configure WebSocket stream for real-time SCADA dashboard',
      description: 'Emit pressure drop events to connected municipal operator clients with latency < 200ms.',
      assignedTo: 'Sneha Ghosh',
      assignedStudentId: '2023UGCS078',
      priority: 'high',
      startDate: '2026-09-24',
      dueDate: '2026-10-05',
      status: 'in_progress',
      progress: 40,
      milestoneId: 'MLS-06',
      milestoneName: 'Ward 4 Bistupur Pilot Installation & Field Sensor Run',
      expectedDeliverable: 'WebSocket server module with automated reconnection fallback',
      createdAt: '2026-09-24',
      updatedAt: '2026-09-24',
    },
    {
      id: 'TSK-018',
      projectId: 'PRJ-CH-2026-089',
      title: 'Conduct outdoor LoRaWAN range & packet-loss benchmark',
      description: 'Test transmission from subterranean chamber valve locations through cast iron access covers.',
      assignedTo: 'Ankit Ray',
      assignedStudentId: '2023UGEC041',
      priority: 'medium',
      startDate: '2026-09-25',
      dueDate: '2026-10-08',
      status: 'not_started',
      progress: 0,
      milestoneId: 'MLS-06',
      milestoneName: 'Ward 4 Bistupur Pilot Installation & Field Sensor Run',
      expectedDeliverable: 'Path loss curve and antenna height recommendation report',
      createdAt: '2026-09-24',
      updatedAt: '2026-09-24',
    },
  ];

  private milestones = [
    {
      id: 'MLS-01',
      name: 'Problem Definition & Literature Benchmark',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-08-30',
      assignedTasksCount: 3,
      completionPercentage: 100,
      status: 'Completed' as const,
      submissionStatus: 'Approved' as const,
      facultyReviewStatus: 'Approved by Prof. Ananya Sen on 31 Aug 2026',
      facultyComments: 'Comprehensive baseline field survey and acoustic frequency range validation confirmed.',
      requiredDeliverables: 'Field survey GPS log, acoustic frequency band study, EPANET preliminary baseline model',
      currentProgress: 100,
      assignedTeamMembers: ['Aakash Verma', 'Rohan Banerjee', 'Priya Sharma'],
      linkedTasks: ['TSK-001', 'TSK-004', 'TSK-012'],
    },
    {
      id: 'MLS-02',
      name: 'Sensor Circuit Design & PCB Fabrication',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-09-15',
      assignedTasksCount: 4,
      completionPercentage: 100,
      status: 'Completed' as const,
      submissionStatus: 'Approved' as const,
      facultyReviewStatus: 'Approved by Prof. Ananya Sen on 16 Sep 2026',
      facultyComments: 'Excellent 2-layer PCB layout with low-noise ground plane. FreeRTOS task partition verified.',
      requiredDeliverables: 'KiCad schematics, Gerber archives, ESP32-S3 FreeRTOS firmware codebase v1.0',
      currentProgress: 100,
      assignedTeamMembers: ['Priya Sharma', 'Aakash Verma', 'Vikram Patel'],
      linkedTasks: ['TSK-002', 'TSK-003', 'TSK-005', 'TSK-007'],
    },
    {
      id: 'MLS-03',
      name: 'Laboratory Bench Testing & Sensor Calibration',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-09-30',
      assignedTasksCount: 3,
      completionPercentage: 80,
      status: 'In Progress' as const,
      submissionStatus: 'Pending Faculty Review' as const,
      facultyReviewStatus: 'Under Review by Prof. Ananya Sen (Submitted 24 Sep 2026)',
      facultyComments: 'Submission received with DOC-05 calibration logs. Bench validation review underway.',
      requiredDeliverables: 'Bench calibration logs, FIR filter response plot, simulated orifice acoustic signatures',
      currentProgress: 80,
      assignedTeamMembers: ['Aakash Verma', 'Priya Sharma'],
      linkedTasks: ['TSK-009', 'TSK-010', 'TSK-015'],
    },
    {
      id: 'MLS-04',
      name: 'LoRaWAN Gateway Integration & Cloud Telemetry',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-10-15',
      assignedTasksCount: 3,
      completionPercentage: 100,
      status: 'Completed' as const,
      submissionStatus: 'Approved' as const,
      facultyReviewStatus: 'Approved by Prof. Ananya Sen on 22 Sep 2026',
      facultyComments: 'Telemetry ingestion verified with sub-second WebSocket dispatch. Zero packet loss on campus test.',
      requiredDeliverables: 'Node.js MQTT ingestion service, Mapbox GIS layer, TimescaleDB hypertable schema',
      currentProgress: 100,
      assignedTeamMembers: ['Sneha Ghosh', 'Aakash Verma'],
      linkedTasks: ['TSK-006', 'TSK-008', 'TSK-013'],
    },
    {
      id: 'MLS-05',
      name: 'Enclosure Weatherproofing & IP68 Certification',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-10-25',
      assignedTasksCount: 2,
      completionPercentage: 70,
      status: 'In Progress' as const,
      submissionStatus: 'Not Submitted' as const,
      facultyReviewStatus: 'In Progress by Student Team',
      facultyComments: 'Awaiting submersion test logs and finalized STEP files.',
      requiredDeliverables: 'Final CAD STEP files, 24-hour water submersion pressure test certificate',
      currentProgress: 70,
      assignedTeamMembers: ['Vikram Patel', 'Aakash Verma', 'Priya Sharma'],
      linkedTasks: ['TSK-011', 'TSK-014'],
    },
    {
      id: 'MLS-06',
      name: 'Ward 4 Bistupur Pilot Installation & Field Sensor Run',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-11-10',
      assignedTasksCount: 3,
      completionPercentage: 25,
      status: 'Upcoming' as const,
      submissionStatus: 'Not Submitted' as const,
      facultyReviewStatus: 'Upcoming Phase',
      facultyComments: 'Municipal permission letter confirmed by Jamshedpur Notified Area Committee.',
      requiredDeliverables: 'Field deployment photo log of 12 installed nodes, baseline pressure transient stream',
      currentProgress: 25,
      assignedTeamMembers: ['Aakash Verma', 'Rohan Banerjee', 'Sneha Ghosh', 'Ankit Ray'],
      linkedTasks: ['TSK-016', 'TSK-017', 'TSK-018'],
    },
    {
      id: 'MLS-07',
      name: 'Comparative SCADA Data Validation with Tata Steel',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-11-20',
      assignedTasksCount: 1,
      completionPercentage: 0,
      status: 'Upcoming' as const,
      submissionStatus: 'Not Submitted' as const,
      facultyReviewStatus: 'Upcoming Phase',
      facultyComments: 'Scheduled post Ward 4 installation.',
      requiredDeliverables: 'Joint SCADA error comparison table, sub-meter leak localization verification report',
      currentProgress: 0,
      assignedTeamMembers: ['Aakash Verma', 'Priya Sharma', 'Rohan Banerjee'],
      linkedTasks: [],
    },
    {
      id: 'MLS-08',
      name: 'Final Solution Report & National SIH Submission',
      projectId: 'PRJ-CH-2026-089',
      targetDate: '2026-11-30',
      assignedTasksCount: 1,
      completionPercentage: 0,
      status: 'Upcoming' as const,
      submissionStatus: 'Not Submitted' as const,
      facultyReviewStatus: 'Upcoming Final Deliverable',
      facultyComments: 'Comprehensive project thesis, source code, and municipal handover docket.',
      requiredDeliverables: 'Final Solution Report, Video Demonstration, Municipal Handover Acceptance Certificate',
      currentProgress: 0,
      assignedTeamMembers: ['Smart Water Guild Team'],
      linkedTasks: [],
    },
  ];

  private documents: IProjectDocument[] = [
    {
      id: 'DOC-01',
      projectId: 'PRJ-CH-2026-089',
      name: 'Project Technical Proposal & Scope of Work',
      type: 'Proposal',
      description: 'Formal technical proposal outlining LoRaWAN acoustic sensor architecture for Smart India Hackathon.',
      uploadedBy: 'Aakash Verma (Student Lead)',
      uploadedById: '2023UGC044',
      version: 'v2.1',
      uploadedDate: '2026-08-10',
      fileSize: '3.4 MB',
      fileType: 'PDF',
      status: 'Approved',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_Proposal_v2.1.pdf',
    },
    {
      id: 'DOC-02',
      projectId: 'PRJ-CH-2026-089',
      name: 'Literature Benchmark & Acoustic Transducer Review',
      type: 'Research',
      description: 'Comparative benchmark of ultrasonic, piezoelectric, and hydrophone sensors for pipeline leak detection.',
      uploadedBy: 'Aakash Verma (Student Lead)',
      uploadedById: '2023UGC044',
      version: 'v1.4',
      uploadedDate: '2026-08-25',
      fileSize: '2.8 MB',
      fileType: 'PDF',
      status: 'Approved',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_Research_Notes_v1.4.pdf',
    },
    {
      id: 'DOC-03',
      projectId: 'PRJ-CH-2026-089',
      name: 'Embedded Telemetry Hardware System Architecture',
      type: 'Prototype',
      description: 'Block diagram, power budget calculation, and FreeRTOS task partition specification for ESP32-S3.',
      uploadedBy: 'Priya Sharma',
      uploadedById: '2023UGEC019',
      version: 'v1.8',
      uploadedDate: '2026-09-02',
      fileSize: '4.1 MB',
      fileType: 'PDF',
      status: 'Approved',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_Hardware_Architecture_v1.8.pdf',
    },
    {
      id: 'DOC-04',
      projectId: 'PRJ-CH-2026-089',
      name: 'Sensor PCB Schematics, Bill of Materials & Gerber Archive',
      type: 'Prototype',
      description: 'Complete KiCad PCB layout, surface mount BOM component list, and drill files for node fabrication.',
      uploadedBy: 'Priya Sharma',
      uploadedById: '2023UGEC019',
      version: 'v2.0',
      uploadedDate: '2026-09-10',
      fileSize: '6.7 MB',
      fileType: 'ZIP',
      status: 'Approved',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_PCB_Gerber_Archive_v2.0.zip',
    },
    {
      id: 'DOC-05',
      projectId: 'PRJ-CH-2026-089',
      name: 'Laboratory Bench Calibration & Orifice Leak Testing Report',
      type: 'Testing',
      description: 'Detailed frequency response curves, FFT acoustic waterfall charts, and signal-to-noise validation.',
      uploadedBy: 'Aakash Verma (Student Lead)',
      uploadedById: '2023UGC044',
      version: 'v1.2',
      uploadedDate: '2026-09-24',
      fileSize: '4.5 MB',
      fileType: 'PDF',
      status: 'Under Review',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_Bench_Testing_Report_v1.2.pdf',
    },
    {
      id: 'DOC-06',
      projectId: 'PRJ-CH-2026-089',
      name: 'Municipal Ward 4 Bistupur Pilot Installation Protocol',
      type: 'Progress Reports',
      description: 'Step-by-step installation SOP for mounting non-intrusive sensor clamps on PWD water distribution valves.',
      uploadedBy: 'Rohan Banerjee',
      uploadedById: '2023UGCE032',
      version: 'v1.0',
      uploadedDate: '2026-09-22',
      fileSize: '1.9 MB',
      fileType: 'DOCX',
      status: 'Draft',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_Field_Pilot_SOP_v1.0.docx',
    },
    {
      id: 'DOC-07',
      projectId: 'PRJ-CH-2026-089',
      name: 'Mid-Term Comprehensive Academic Progress Report',
      type: 'Progress Reports',
      description: 'Formal mid-term evaluation report endorsed by Faculty Mentor Prof. Ananya Sen for MoHUA SIH review.',
      uploadedBy: 'Aakash Verma (Student Lead)',
      uploadedById: '2023UGC044',
      version: 'v1.5',
      uploadedDate: '2026-09-18',
      fileSize: '5.2 MB',
      fileType: 'PDF',
      status: 'Approved',
      fileUrl: '/uploads/documents/PRJ-CH-2026-089_MidTerm_Report_v1.5.pdf',
    },
  ];

  private messages: IProjectMessage[] = [
    {
      id: 'MSG-001',
      projectId: 'PRJ-CH-2026-089',
      channel: 'faculty',
      senderName: 'Prof. Ananya Sen',
      senderRole: 'Faculty Mentor',
      message:
        'Aakash, ensure the FFT edge filter accounts for acoustic dampening in 300mm ductile iron conduits before Friday’s bench testing run.',
      timestamp: '2026-09-23T10:15:00.000Z',
      isUnread: false,
    },
    {
      id: 'MSG-002',
      projectId: 'PRJ-CH-2026-089',
      channel: 'faculty',
      senderName: 'Aakash Verma',
      senderRole: 'Student Lead',
      message:
        'Yes Ma’am, Priya and I calibrated the FIR bandpass between 2 kHz and 18 kHz. Lab testing report DOC-05 has been uploaded for your review.',
      timestamp: '2026-09-23T11:30:00.000Z',
      attachments: [{ name: 'Bench_Calibration_Summary.pdf', size: '1.2 MB', url: '#' }],
      isUnread: false,
    },
    {
      id: 'MSG-003',
      projectId: 'PRJ-CH-2026-089',
      channel: 'faculty',
      senderName: 'Prof. Ananya Sen',
      senderRole: 'Faculty Mentor',
      message:
        'Received. I will review the calibration data this evening and sign off on Milestone MLS-03. Excellent work team.',
      timestamp: '2026-09-24T08:00:00.000Z',
      isUnread: true,
    },
    {
      id: 'MSG-004',
      projectId: 'PRJ-CH-2026-089',
      channel: 'industry',
      senderName: 'Er. Suresh Nambiar',
      senderRole: 'Industry Mentor (Tata Steel Utilities)',
      message:
        'Aakash, the test loop at Bistupur Water Treatment Plant is primed at 6 bar for your Saturday morning run. Our technicians will be on site.',
      timestamp: '2026-09-23T14:45:00.000Z',
      isUnread: false,
    },
    {
      id: 'MSG-005',
      projectId: 'PRJ-CH-2026-089',
      channel: 'industry',
      senderName: 'Aakash Verma',
      senderRole: 'Student Lead',
      message:
        'Thank you Sir. The team will arrive with 3 assembled prototype clamp nodes by 09:30 AM with our LoRaWAN field gateway.',
      timestamp: '2026-09-23T15:20:00.000Z',
      isUnread: false,
    },
    {
      id: 'MSG-006',
      projectId: 'PRJ-CH-2026-089',
      channel: 'team',
      senderName: 'Aakash Verma',
      senderRole: 'Student Lead',
      message:
        'Team, Vikram will hand over the 3D-printed enclosure clamp tonight. Priya, let’s mount the transducer early tomorrow morning.',
      timestamp: '2026-09-23T18:00:00.000Z',
      isUnread: false,
    },
    {
      id: 'MSG-007',
      projectId: 'PRJ-CH-2026-089',
      channel: 'team',
      senderName: 'Priya Sharma',
      senderRole: 'Hardware & Sensor Engineer',
      message:
        'Understood. Transducer impedance matching circuit is ready on testbench with silver thermal paste ready.',
      timestamp: '2026-09-23T18:15:00.000Z',
      isUnread: false,
    },
    {
      id: 'MSG-008',
      projectId: 'PRJ-CH-2026-089',
      channel: 'team',
      senderName: 'Rohan Banerjee',
      senderRole: 'Hydraulic Specialist',
      message:
        'Node locations 1 to 12 along Bistupur Main Road are mapped in EPANET with static pressure calculations ready for cross-comparison.',
      timestamp: '2026-09-23T19:00:00.000Z',
      isUnread: false,
    },
  ];

  private notifications: IProjectNotification[] = [
    {
      id: 'NOTIF-01',
      projectId: 'PRJ-CH-2026-089',
      title: 'Milestone Review Update',
      message: 'Faculty mentor Prof. Ananya Sen approved Milestone MLS-02 (Sensor Circuit Design & PCB Fabrication).',
      type: 'faculty',
      timestamp: '2026-09-16T15:00:00.000Z',
      isRead: true,
      link: '/student-lead/milestones',
    },
    {
      id: 'NOTIF-02',
      projectId: 'PRJ-CH-2026-089',
      title: 'Upcoming Task Due Date',
      message: 'Task TSK-014 (Finalize sensor enclosure CAD) is due on 28 Sep 2026.',
      type: 'task',
      timestamp: '2026-09-24T06:00:00.000Z',
      isRead: false,
      link: '/student-lead/tasks',
    },
    {
      id: 'NOTIF-03',
      projectId: 'PRJ-CH-2026-089',
      title: 'Industry Partner Message',
      message: 'Er. Suresh Nambiar (Tata Steel Utilities) confirmed Saturday test loop access.',
      type: 'industry',
      timestamp: '2026-09-23T14:45:00.000Z',
      isRead: false,
      link: '/student-lead/communication',
    },
    {
      id: 'NOTIF-04',
      projectId: 'PRJ-CH-2026-089',
      title: 'Milestone Submission Pending',
      message: 'Milestone MLS-03 (Laboratory Bench Testing) submission is currently under Faculty Review.',
      type: 'milestone',
      timestamp: '2026-09-24T08:00:00.000Z',
      isRead: false,
      link: '/student-lead/milestones',
    },
    {
      id: 'NOTIF-05',
      projectId: 'PRJ-CH-2026-089',
      title: 'Team Member Task Completed',
      message: 'Rohan Banerjee completed hydraulic gradient mapping across Ward 4 feeder chambers.',
      type: 'team',
      timestamp: '2026-09-23T19:00:00.000Z',
      isRead: true,
      link: '/student-lead/team',
    },
  ];

  // ==========================================
  // API Methods
  // ==========================================

  public getDashboardData() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = this.tasks.filter((t) => t.status === 'in_progress').length;
    const pendingTasks = this.tasks.filter((t) => t.status !== 'completed').length;
    const totalMilestones = this.milestones.length;
    const completedMilestones = this.milestones.filter((m) => m.status === 'Completed').length;
    const totalDocuments = this.documents.length;
    const completedDocuments = this.documents.filter((d) => d.status === 'Approved').length;

    const upcomingDeadlines = [
      {
        title: 'Sensor Calibration & Bench Sign-off',
        dueDate: '28 Sep 2026',
        priority: 'critical',
        type: 'Milestone',
        assignee: 'Aakash Verma & Priya Sharma',
      },
      {
        title: 'CAD Enclosure Submission & 3D Print',
        dueDate: '30 Sep 2026',
        priority: 'high',
        type: 'Task',
        assignee: 'Vikram Patel',
      },
      {
        title: 'Field Testing Report with Tata Steel',
        dueDate: '05 Oct 2026',
        priority: 'high',
        type: 'Deliverable',
        assignee: 'Smart Water Guild',
      },
      {
        title: 'Ward 4 Bistupur Pilot Installation Start',
        dueDate: '10 Nov 2026',
        priority: 'medium',
        type: 'Milestone',
        assignee: 'All Guild Members',
      },
    ];

    const recentTeamActivity = [
      {
        studentName: 'Aakash Verma',
        action: 'submitted Laboratory Bench Calibration Report (DOC-05) for faculty review',
        timeAgo: '2 hours ago',
      },
      {
        studentName: 'Priya Sharma',
        action: 'updated ultrasonic sensor bench telemetry calibration logs',
        timeAgo: '5 hours ago',
      },
      {
        studentName: 'Rohan Banerjee',
        action: 'completed hydraulic gradient mapping across Ward 4 feeder chambers',
        timeAgo: 'Yesterday',
      },
      {
        studentName: 'Sneha Ghosh',
        action: 'deployed WebSocket ingestion endpoint for real-time SCADA telemetry',
        timeAgo: '2 days ago',
      },
      {
        studentName: 'Vikram Patel',
        action: 'assembled 3D printed IP68 ASA pipe clamp collar test unit',
        timeAgo: '3 days ago',
      },
    ];

    return {
      stats: {
        myProject: 1,
        projectProgress: this.activeProject.progress, // 68%
        teamMembers: this.teamMembers.length, // 6
        tasks: totalTasks, // 18
        completedTasks, // 12
        pendingTasks, // 4
        inProgressTasks,
        milestones: totalMilestones, // 8
        completedMilestones, // 5
        documents: 10,
        completedDocuments: 7,
      },
      activeProject: this.activeProject,
      progressBreakdown: {
        overallProgress: this.activeProject.progress,
        taskCompletionText: `${completedTasks} / ${totalTasks}`,
        taskCompletionPercent: Math.round((completedTasks / totalTasks) * 100),
        milestoneCompletionText: `${completedMilestones} / ${totalMilestones}`,
        milestoneCompletionPercent: Math.round((completedMilestones / totalMilestones) * 100),
        documentCompletionText: `7 / 10`,
        documentCompletionPercent: 70,
      },
      upcomingDeadlines,
      recentTeamActivity,
      notifications: this.notifications,
    };
  }

  public getProjectData() {
    return {
      ...this.activeProject,
      teamMembers: this.teamMembers,
      milestonesCount: this.milestones.length,
      tasksCount: this.tasks.length,
      documentsCount: this.documents.length,
    };
  }

  public updateStudentEditableProject(updates: IStudentEditableProject) {
    this.activeProject.studentEditableInfo = {
      ...this.activeProject.studentEditableInfo,
      ...updates,
    };
    return this.activeProject;
  }

  public getTeam() {
    return {
      teamName: this.activeProject.studentTeam,
      projectTitle: this.activeProject.title,
      facultyMentor: this.activeProject.facultyMentor,
      industryPartner: this.activeProject.industryPartner,
      members: this.teamMembers,
      totalMembers: this.teamMembers.length,
    };
  }

  public getTasks(filter?: { status?: string; search?: string; priority?: string; assignee?: string }) {
    let list = [...this.tasks];

    if (filter?.status && filter.status !== 'all') {
      if (filter.status === 'my_tasks') {
        list = list.filter((t) => t.assignedTo.toLowerCase().includes('aakash'));
      } else if (filter.status === 'assigned') {
        list = list.filter((t) => t.status !== 'completed');
      } else if (filter.status === 'in_progress') {
        list = list.filter((t) => t.status === 'in_progress');
      } else if (filter.status === 'completed') {
        list = list.filter((t) => t.status === 'completed');
      } else if (filter.status === 'overdue') {
        list = list.filter((t) => t.status === 'overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'completed'));
      }
    }

    if (filter?.priority && filter.priority !== 'all') {
      list = list.filter((t) => t.priority.toLowerCase() === filter.priority!.toLowerCase());
    }

    if (filter?.assignee && filter.assignee !== 'all') {
      list = list.filter((t) => t.assignedTo.toLowerCase().includes(filter.assignee!.toLowerCase()));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q) ||
          t.milestoneName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public createTask(data: {
    title: string;
    description: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    startDate: string;
    dueDate: string;
    milestoneId: string;
    expectedDeliverable: string;
  }) {
    if (!data.title || !data.title.trim()) {
      throw new Error('Task title is mandatory.');
    }
    if (!data.assignedTo || !data.assignedTo.trim()) {
      throw new Error('Assignee is mandatory.');
    }
    if (!data.dueDate) {
      throw new Error('Due date is mandatory.');
    }

    const member = this.teamMembers.find((m) => m.studentName.toLowerCase().includes(data.assignedTo.toLowerCase()));
    const assignedStudentId = member ? member.studentId : '2023UGC000';
    const milestone = this.milestones.find((m) => m.id === data.milestoneId);
    const milestoneName = milestone ? milestone.name : 'General Project Execution';

    const nextIdNumber = this.tasks.length + 1;
    const taskId = `TSK-${nextIdNumber < 10 ? '00' : nextIdNumber < 100 ? '0' : ''}${nextIdNumber}`;

    const newTask: IStudentTask = {
      id: taskId,
      projectId: this.activeProject.projectId,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      assignedTo: data.assignedTo.trim(),
      assignedStudentId,
      priority: data.priority || 'medium',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: 'in_progress',
      progress: 0,
      milestoneId: data.milestoneId || 'MLS-05',
      milestoneName,
      expectedDeliverable: data.expectedDeliverable || 'Project milestone artifact',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    this.tasks.push(newTask);

    // Update team member tasks count
    if (member) {
      member.assignedTasksCount += 1;
      member.currentTasks.push(`${newTask.title} (${newTask.id})`);
    }

    // Add activity
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      projectId: this.activeProject.projectId,
      title: 'New Task Created',
      message: `Task ${newTask.id} (${newTask.title}) was created and assigned to ${newTask.assignedTo}.`,
      type: 'task',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student-lead/tasks',
    });

    return newTask;
  }

  public updateTask(
    taskId: string,
    updates: Partial<IStudentTask> & {
      notes?: string;
    }
  ) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (task.isLockedForReview && (updates.status === 'completed' || updates.assignedTo)) {
      throw new Error('Cannot modify assignment or finalize a task currently locked under official faculty review.');
    }

    if (updates.title) task.title = updates.title.trim();
    if (updates.description !== undefined) task.description = updates.description.trim();
    if (updates.assignedTo) {
      task.assignedTo = updates.assignedTo.trim();
      const m = this.teamMembers.find((mem) => mem.studentName.toLowerCase().includes(updates.assignedTo!.toLowerCase()));
      if (m) task.assignedStudentId = m.studentId;
    }
    if (updates.priority) task.priority = updates.priority;
    if (updates.dueDate) task.dueDate = updates.dueDate;
    if (updates.status) task.status = updates.status;
    if (updates.progress !== undefined) task.progress = Number(updates.progress);
    if (updates.expectedDeliverable) task.expectedDeliverable = updates.expectedDeliverable;
    if (updates.notes !== undefined) task.notes = updates.notes;

    task.updatedAt = new Date().toISOString().split('T')[0];

    // If marked completed, set progress to 100
    if (task.status === 'completed') {
      task.progress = 100;
    }

    return task;
  }

  public getMilestones(filter?: { status?: string }) {
    let list = [...this.milestones];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((m) => m.status.toLowerCase() === filter.status!.toLowerCase());
    }
    return list;
  }

  public getMilestoneById(id: string) {
    return this.milestones.find((m) => m.id === id);
  }

  public updateMilestoneProgress(id: string, progress: number, remarks?: string) {
    const milestone = this.milestones.find((m) => m.id === id);
    if (!milestone) return null;

    milestone.completionPercentage = Math.min(100, Math.max(0, Number(progress)));
    milestone.currentProgress = milestone.completionPercentage;
    if (milestone.completionPercentage === 100 && milestone.submissionStatus !== 'Approved') {
      milestone.status = 'In Progress';
    }

    return milestone;
  }

  public submitMilestone(id: string, data: { description: string; files: { name: string; size: string }[] }) {
    const milestone = this.milestones.find((m) => m.id === id);
    if (!milestone) return null;

    milestone.submissionStatus = 'Pending Faculty Review';
    milestone.facultyReviewStatus = `Submitted by Student Lead on ${new Date().toLocaleDateString('en-GB')}. Awaiting Faculty Mentor Review.`;

    // Also push to academicDataService submissions so Faculty Mentor sees it in pending reviews!
    academicDataService.getMilestones('Prof. Ananya Sen').forEach((m) => {
      if (m.id === id) {
        m.submissionStatus = 'Pending Review';
        if (!m.submissions) m.submissions = [];
        m.submissions.push({
          id: `SUB-${Date.now()}`,
          milestoneId: id,
          milestoneName: milestone.name,
          projectId: milestone.projectId,
          studentTeam: this.activeProject.studentTeam,
          submittedDate: new Date().toISOString().split('T')[0],
          submittedFiles: data.files.map((f) => ({ name: f.name, size: f.size, type: 'PDF' })),
          description: data.description || 'Milestone deliverables submitted for academic evaluation.',
          evidence: [],
          progressUpdate: `${milestone.completionPercentage}% completed`,
          status: 'Pending Review',
        });
      }
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      projectId: this.activeProject.projectId,
      title: 'Milestone Submitted for Faculty Review',
      message: `Milestone ${milestone.id} (${milestone.name}) has been submitted to Prof. Ananya Sen for academic evaluation.`,
      type: 'faculty',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student-lead/milestones',
    });

    return milestone;
  }

  public getDocuments(filter?: { type?: string; search?: string }) {
    let list = [...this.documents];

    if (filter?.type && filter.type !== 'all') {
      list = list.filter((d) => d.type.toLowerCase().includes(filter.type!.toLowerCase().replace(' ', '')));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.uploadedBy.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public addDocument(data: {
    name: string;
    type: 'Proposal' | 'Research' | 'Prototype' | 'Testing' | 'Progress Reports' | 'Final Reports';
    description: string;
    version: string;
    fileUrl: string;
    fileSize: string;
    fileType: string;
    uploadedBy?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Document name is mandatory.');
    }
    if (!data.fileUrl) {
      throw new Error('Uploaded file is mandatory.');
    }

    const nextId = `DOC-${this.documents.length + 1 < 10 ? '0' : ''}${this.documents.length + 1}`;
    const newDoc: IProjectDocument = {
      id: nextId,
      projectId: this.activeProject.projectId,
      name: data.name.trim(),
      type: data.type || 'Progress Reports',
      description: data.description || '',
      uploadedBy: data.uploadedBy || 'Aakash Verma (Student Lead)',
      uploadedById: '2023UGC044',
      version: data.version || 'v1.0',
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: data.fileSize || '2.4 MB',
      fileType: data.fileType || 'PDF',
      status: 'Under Review',
      fileUrl: data.fileUrl,
    };

    this.documents.unshift(newDoc);

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      projectId: this.activeProject.projectId,
      title: 'New Document Uploaded',
      message: `Document ${newDoc.name} (${newDoc.version}) was uploaded by ${newDoc.uploadedBy}.`,
      type: 'milestone',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student-lead/documents',
    });

    return newDoc;
  }

  public getMessages(channel: 'faculty' | 'industry' | 'team') {
    return this.messages.filter((m) => m.channel === channel);
  }

  public sendMessage(data: {
    channel: 'faculty' | 'industry' | 'team';
    senderName: string;
    senderRole: string;
    message: string;
    attachments?: { name: string; size: string; url: string }[];
  }) {
    if (!data.message || !data.message.trim()) {
      throw new Error('Message content cannot be empty.');
    }

    const newMessage: IProjectMessage = {
      id: `MSG-${Date.now()}`,
      projectId: this.activeProject.projectId,
      channel: data.channel,
      senderName: data.senderName || 'Aakash Verma',
      senderRole: data.senderRole || 'Student Lead',
      message: data.message.trim(),
      timestamp: new Date().toISOString(),
      attachments: data.attachments || [],
      isUnread: false,
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  public getNotifications() {
    return this.notifications;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }
}

export const studentLeadDataService = new StudentLeadDataService();
