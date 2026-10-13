import { Request, Response } from 'express';
import {
  CorporatePartnerCollaboration,
  ICorporatePartnerCollaboration,
} from '../models/CorporatePartnerCollaboration';

// Centralized Seed Data for Corporate Partner (Rohan Mittal / Jindal Steel & Power Ltd.)
const DEFAULT_PARTNER_EMAIL = 'partner.lead@jindalsteel.com';

const INITIAL_SEED: Partial<ICorporatePartnerCollaboration> = {
  partnerEmail: DEFAULT_PARTNER_EMAIL,
  partnerName: 'Rohan Mittal',
  designation: 'Senior Technical Consultant & Industry Reviewer',
  organizationName: 'Jindal Steel & Power Ltd.',
  department: 'Corporate Technology & Innovation Group',
  officialEmail: DEFAULT_PARTNER_EMAIL,
  officialContact: '+91 9835102906',
  industryDomain: 'Smart Infrastructure & Industrial IoT Telemetry',
  technicalExpertise: [
    'Subterranean IoT Acoustic Sensor Arrays',
    'Industrial LoRaWAN Gateway Deployment',
    'Structural Vibration & Modal Analysis',
    'Cloud API Telemetry Ingestion',
    'Field Test Skid Engineering & Calibration',
  ],
  professionalSkills: [
    'Technical Project Mentorship',
    'Hardware-in-the-Loop (HIL) Testing',
    'NABL Quality Compliance Auditing',
    'Municipal Sensor Network Architecture',
  ],
  yearsOfExperience: 14,
  areasOfInterest: [
    'Urban Water Conservation',
    'Clean Energy Solar Infrastructure',
    'Structural Health Telemetry',
    'University Applied R&D Partnerships',
  ],
  mentorshipAreas: [
    'System Architecture Design',
    'Field Testing Protocol Setup',
    'Embedded Firmware Optimization',
    'Product Validation & Commercial Readiness',
  ],

  // 2 Active Assigned Projects
  assignedProjects: [
    {
      projectId: 'PRJ-CSR-2026-001',
      challengeId: 'CH-2026-089',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      studentLead: 'Rahul Patel',
      studentTeam: 'AquaPur Clean Energy Lab',
      domain: 'Water & Sanitation',
      location: 'Sakchi & Bistupur Corridor, Jamshedpur',
      partnerRole: 'Technical Mentor & IoT Architect',
      progress: 72,
      currentMilestone: 'MLS-03: Autonomous Pressure Relief & LoRa Calibration',
      nextMilestone: 'Sensor Testing & Subterranean Validation (15 Oct 2026)',
      status: 'Active',
      currentStage: 'Testing',
      problemStatement: 'Sub-surface municipal pipeline leakages causing non-revenue water loss exceeding 35% in older distribution corridors.',
      proposedSolution: 'Piezoelectric subterranean acoustic sensors paired with low-power LoRaWAN gateways and ML leak classification.',
      technology: 'Piezoelectric Hydrophones, LoRaWAN Gateway, Edge ML MCU',
      expectedOutcome: 'Averts 3.5 Million Litres potable water loss monthly; 42% reduction in unbilled civic distribution losses.',
      milestones: [
        { id: 'MLS-01', title: 'System Architecture & IoT Baseline Benchmark', dueDate: '2026-06-30', progress: 100, status: 'Completed', feedback: 'Architecture conforms to ISO/IEC 30141 standard.' },
        { id: 'MLS-02', title: 'Pilot Sensor Array Deployment (24 Points)', dueDate: '2026-08-30', progress: 100, status: 'Completed', feedback: 'Verified IP68 ruggedization in municipal manholes.' },
        { id: 'MLS-03', title: 'Autonomous Pressure Relief & LoRa Calibration', dueDate: '2026-10-15', progress: 65, status: 'In Progress', feedback: 'Awaiting secondary gateway sync from campus telemetry node.' },
        { id: 'MLS-04', title: 'Municipal SCADA Central Server Handover', dueDate: '2026-12-15', progress: 0, status: 'Upcoming' },
      ],
    },
    {
      projectId: 'PRJ-CSR-2026-004',
      challengeId: 'CH-2026-188',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      facultyMentor: 'Dr. P. K. Sinha',
      studentLead: 'Sneha Kumari',
      studentTeam: 'Urban Grid Photovoltaics',
      domain: 'Urban Energy & Solar',
      location: 'Sonari Bypass & Marine Drive, Jamshedpur',
      partnerRole: 'Industry Reviewer & Power Electronics Advisor',
      progress: 45,
      currentMilestone: 'MLS-02: Sonari Bypass Lux Measurement Test',
      nextMilestone: 'Lux Measurement & Grid-Tie Synchronization (18 Oct 2026)',
      status: 'Active',
      currentStage: 'Prototype',
      problemStatement: 'High energy consumption from non-dimmable conventional municipal sodium-vapor streetlights along suburban transit routes.',
      proposedSolution: 'Bifacial solar modules with smart dynamic dimming MPPT controllers adapting light intensity to vehicle radar presence.',
      technology: 'Bifacial Monocrystalline PV, GaN MPPT Inverter, Doppler Radar Dimming',
      expectedOutcome: '58% grid electricity savings across Sonari corridor; zero dark spots reported in transit corridor.',
      milestones: [
        { id: 'MLS-01', title: 'Bifacial Solar Module Benchmark Testing', dueDate: '2026-07-10', progress: 100, status: 'Completed', feedback: 'Tested successfully on laboratory solar simulator.' },
        { id: 'MLS-02', title: 'Sonari Bypass Lux Measurement Test', dueDate: '2026-10-18', progress: 45, status: 'In Progress', feedback: 'Field lux meter calibration kit dispatched to campus team.' },
        { id: 'MLS-03', title: 'Grid-Tie Inverter Synchronization & Safety Audit', dueDate: '2026-12-10', progress: 0, status: 'Upcoming' },
      ],
    },
  ],

  // 4 Collaborations Total (2 Active, 1 Completed, 1 Pending)
  collaborations: [
    {
      id: 'COL-2026-001',
      challengeId: 'CH-2026-089',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      department: 'Civil & Environmental Engineering',
      facultyMentor: 'Prof. Ananya Sen',
      studentLead: 'Rahul Patel',
      partnerRole: 'Technical Mentor & IoT Architect',
      startDate: '2026-05-15',
      expectedDuration: '8 Months',
      supportType: 'Technical Mentorship + Cloud API',
      status: 'Active',
      partnerResponsibilities: [
        'Weekly technical architecture guidance with student developers',
        'Provisioning corporate IoT telemetry ingestion endpoint',
        'Reviewing NABL hydro-lab acoustic transducer test results',
      ],
      universityResponsibilities: [
        'Lab bench prototyping and fabrication',
        'Field deployment coordination with Jamshedpur Municipal PWD',
        'Bi-weekly milestone submission and progress reporting',
      ],
      expectedContribution: 'Industrial IoT engineering review and Cloud API cloud license.',
      technicalResources: 'Cloud API Endpoint (IoT Ingest v2.4) + 4 Ruggedized LoRa Gateways',
    },
    {
      id: 'COL-2026-002',
      challengeId: 'CH-2026-188',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      department: 'Electrical Engineering',
      facultyMentor: 'Dr. P. K. Sinha',
      studentLead: 'Sneha Kumari',
      partnerRole: 'Industry Reviewer & Power Electronics Advisor',
      startDate: '2026-06-01',
      expectedDuration: '6 Months',
      supportType: 'Hardware Testing + Power Electronics Advisory',
      status: 'Active',
      partnerResponsibilities: [
        'GaN MPPT inverter efficiency reviews and thermal stress simulations',
        'Supplying field lux calibration radiometer equipment',
        'Participating in monthly project milestone reviews',
      ],
      universityResponsibilities: [
        'Firmware development for Doppler radar dynamic dimming',
        'Structural mast wind-load mechanical testing',
      ],
      expectedContribution: 'Radiometric calibration testing and electrical grid safety advisory.',
      technicalResources: 'Field Calibrated Lux Radiometer + Thermal Imaging Camera',
    },
    {
      id: 'COL-2026-003',
      challengeId: 'CH-2026-042',
      projectId: 'PRJ-CSR-2025-019',
      projectTitle: 'Industrial Slag Geopolymer Road Base Sub-grade Stabilization',
      university: 'NIT Jamshedpur',
      department: 'Civil Engineering',
      facultyMentor: 'Dr. Rajesh Verma',
      studentLead: 'Vikas Kumar',
      partnerRole: 'Materials Testing Advisor',
      startDate: '2025-09-01',
      expectedDuration: '6 Months',
      supportType: 'Materials Testing & Lab Skids',
      status: 'Completed',
      partnerResponsibilities: [
        'Conducted ASTM California Bearing Ratio (CBR) compression tests',
        'Delivered final industrial partner signoff report',
      ],
      universityResponsibilities: [
        'Laboratory chemical batch formulation and test paving',
      ],
      expectedContribution: 'Furnished 50 metric tons granulated blast furnace slag test material.',
      technicalResources: 'GBFS Slag Test Batches + Heavy Compression Hydraulic Press',
    },
    {
      id: 'COL-2026-004',
      challengeId: 'CH-2026-302',
      projectTitle: 'IoT Vibration & Structural Telemetry for Dilapidated Pedestrian Footbridges',
      university: 'IIT (ISM) Dhanbad',
      department: 'Applied Geophysics & Structures',
      facultyMentor: 'Dr. Ramesh Kumar',
      studentLead: 'Deepak Mondal',
      partnerRole: 'Structural Telemetry Mentor',
      startDate: '2026-09-22',
      expectedDuration: '9 Months',
      supportType: 'API & Infrastructure Support',
      status: 'Pending',
      partnerResponsibilities: [
        'Review MEMS accelerometer mesh network placement along suspension cables',
        'Provide high-throughput vibration FFT cloud telemetry broker',
      ],
      universityResponsibilities: [
        'Finite element structural simulation and modal frequency mapping',
      ],
      expectedContribution: 'Cloud MQTT broker access and specialized accelerometer enclosures.',
      technicalResources: 'MQTT Telemetry Broker + High-G MEMS Accelerometers',
    },
  ],

  // 8 Mentorship Sessions (Scheduled & Completed)
  mentorshipSessions: [
    {
      id: 'SES-2026-01',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      studentTeam: 'AquaPur Clean Energy Lab',
      university: 'NIT Jamshedpur',
      date: '2026-09-26',
      time: '11:00 AM',
      topic: 'Subterranean Sensor Calibration & Noise Filtering Algorithms',
      meetingType: 'Online',
      meetingLink: 'https://meet.gov.in/civicconnect-nit-water-01',
      agenda: 'Scrutinize acoustic hydrophone FFT spectrum data to differentiate traffic vibration from pipe water leakage hiss.',
      status: 'Scheduled',
    },
    {
      id: 'SES-2026-02',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      studentTeam: 'Urban Grid Photovoltaics',
      university: 'IIT (ISM) Dhanbad',
      date: '2026-09-28',
      time: '03:00 PM',
      topic: 'MPPT Dynamic Dimming Firmware Architecture & Doppler Range Tuning',
      meetingType: 'Hybrid',
      meetingLink: 'https://meet.gov.in/civicconnect-iitism-solar-02',
      agenda: 'Review Doppler radar sensitivity curves to avoid false dimming triggers caused by swaying tree branches.',
      status: 'Scheduled',
    },
    {
      id: 'SES-2026-03',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      studentTeam: 'AquaPur Clean Energy Lab',
      university: 'NIT Jamshedpur',
      date: '2026-09-12',
      time: '10:30 AM',
      topic: 'LoRaWAN Payload Compression & Battery Life Optimization',
      meetingType: 'Online',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Team successfully compressed telemetry packet size to 24 bytes, extending predicted field battery lifespan from 18 to 36 months.',
        studentProgress: 'Excellent progress. Rahul and Priya handled C-firmware bit-packing efficiently.',
        strengths: 'Deep understanding of LoRaWAN ADR (Adaptive Data Rate) and deep sleep states.',
        issues: 'Watchdog timer reset sequence needed correction for brownout protection.',
        recommendedImprovements: 'Implement CRC-16 checksum verification prior to transmission.',
        nextSteps: 'Proceed with 24-point pilot deployment in Sakchi municipal manholes.',
        submittedAt: '2026-09-12T12:45:00Z',
      },
    },
    {
      id: 'SES-2026-04',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      studentTeam: 'Urban Grid Photovoltaics',
      university: 'IIT (ISM) Dhanbad',
      date: '2026-08-20',
      time: '02:00 PM',
      topic: 'GaN Power Inverter Thermal Dissipation Simulation',
      meetingType: 'Online',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Thermal simulations show junction temperature remains below 72°C even during peak 44°C ambient summer afternoons.',
        studentProgress: 'PCB heatsink thermal plane redesigned with copper-filled vias.',
        strengths: 'Strong analytical skills in ANSYS Icepak thermal modeling.',
        issues: 'Surface mount component spacing was tight around high-frequency inductors.',
        recommendedImprovements: 'Increase creepage distance by 1.5mm near the high-voltage DC bus.',
        nextSteps: 'Manufacture revised 4-layer prototype PCB revision 2.1.',
        submittedAt: '2026-08-20T16:15:00Z',
      },
    },
    {
      id: 'SES-2026-05',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      studentTeam: 'AquaPur Clean Energy Lab',
      university: 'NIT Jamshedpur',
      date: '2026-08-05',
      time: '11:00 AM',
      topic: 'Acoustic Sensor Placement on Ductile Iron Water Mains',
      meetingType: 'Offline',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Conducted field trial along Sakchi main distribution line; optimal sensor spacing determined at 120 meters.',
        studentProgress: 'Hands-on pipe mounting clamp design verified against pipeline vibration.',
        strengths: 'Good mechanical clamping solution using 316 stainless steel bands.',
        issues: 'Surface rust on old ductile iron pipes impaired initial acoustic coupling.',
        recommendedImprovements: 'Require wire-brush prep and silicone acoustic gel prior to transducer mounting.',
        nextSteps: 'Document acoustic coupling protocol in field operational handbook.',
        submittedAt: '2026-08-05T14:30:00Z',
      },
    },
    {
      id: 'SES-2026-06',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      studentTeam: 'Urban Grid Photovoltaics',
      university: 'IIT (ISM) Dhanbad',
      date: '2026-07-15',
      time: '04:00 PM',
      topic: 'Bifacial Solar Albedo Gain Analysis on Roadway Asphalt',
      meetingType: 'Online',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Verified rear-side albedo gain of 14.8% on standard bitumen asphalt surface.',
        studentProgress: 'Accurate pyranometer measurements completed across morning and afternoon sun angles.',
        strengths: 'Solid methodology adhering to IEC 61215 PV standards.',
        issues: 'Road dust accumulation degrades ground reflectance over time.',
        recommendedImprovements: 'Incorporate 5% derating factor in year-round power budget calculations.',
        nextSteps: 'Finalize battery sizing calculation sheet for monsoon overcast days.',
        submittedAt: '2026-07-15T17:50:00Z',
      },
    },
    {
      id: 'SES-2026-07',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      studentTeam: 'AquaPur Clean Energy Lab',
      university: 'NIT Jamshedpur',
      date: '2026-06-18',
      time: '10:00 AM',
      topic: 'Project Inception & Architectural Boundary Scoping',
      meetingType: 'Online',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Defined end-to-end architecture from transducer sensor nodes to corporate cloud dashboard.',
        studentProgress: 'Team finalized division of software, hardware, and hydraulic roles.',
        strengths: 'Clear team delegation under student lead Rahul Patel.',
        issues: 'Cloud telemetry protocol needed standardization.',
        recommendedImprovements: 'Adopt MQTT over TLS 1.3 with X.509 device certificates.',
        nextSteps: 'Order prototype hydrophones and develop MCU firmware skeleton.',
        submittedAt: '2026-06-18T12:00:00Z',
      },
    },
    {
      id: 'SES-2026-08',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      studentTeam: 'Urban Grid Photovoltaics',
      university: 'IIT (ISM) Dhanbad',
      date: '2026-06-25',
      time: '03:30 PM',
      topic: 'Inception Review & Highway Illumination Code Compliance',
      meetingType: 'Online',
      status: 'Completed',
      feedback: {
        technicalFeedback: 'Reviewed IRC:SP:84 and IS 1944 Indian highway lighting standards with team.',
        studentProgress: 'Team mapped lux contour requirements for Class A2 transit corridors.',
        strengths: 'Strong theoretical grasp of photometric polar curves.',
        issues: 'Dynamic dimming ratio was too abrupt in initial plan.',
        recommendedImprovements: 'Smooth dimming ramp rate to 3 seconds to avoid vehicle driver distraction.',
        nextSteps: 'Integrate soft-start PWM dimming ramp in microcontroller timer routines.',
        submittedAt: '2026-06-25T17:10:00Z',
      },
    },
  ],

  // 12 Assigned Project Deliverables (Across projects)
  deliverables: [
    { id: 'DEL-2026-01', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'Acoustic Transducer Hydrodynamic Test Report (NABL Certified)', submittedBy: 'Prof. Ananya Sen', submissionDate: '2026-08-28', version: 'v1.2', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'All transducer frequency response curves within ±1.5 dB tolerance.', reviewedDate: '2026-09-02' },
    { id: 'DEL-2026-02', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'Subterranean Sensor Enclosure IP68 Waterproof Certification', submittedBy: 'Rahul Patel', submissionDate: '2026-08-15', version: 'v1.0', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'Passed 72-hour continuous 3-meter water submersion test.', reviewedDate: '2026-08-18' },
    { id: 'DEL-2026-03', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'LoRaWAN Payload Serialization Protocol Specification', submittedBy: 'AquaPur Lab', submissionDate: '2026-09-05', version: 'v2.0', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'Efficient bit-packing verified against corporate IoT gateway parser.', reviewedDate: '2026-09-08' },
    { id: 'DEL-2026-04', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'Machine Learning Leak Discrimination Model Weights & Validation Matrix', submittedBy: 'Priya Sharma', submissionDate: '2026-09-18', version: 'v1.4', partnerReviewStatus: 'Pending Review', status: 'Under Review' },
    { id: 'DEL-2026-05', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'Pilot Municipal Manhole Deployment Blueprint (Wards 1–4)', submittedBy: 'NIT Jamshedpur Team', submissionDate: '2026-09-20', version: 'v2.1', partnerReviewStatus: 'Pending Review', status: 'Under Review' },
    { id: 'DEL-2026-06', projectId: 'PRJ-CSR-2026-001', projectTitle: 'Smart Water Monitoring System', deliverableName: 'SCADA Telemetry Integration API Documentation', submittedBy: 'Rahul Patel', submissionDate: '2026-09-22', version: 'v0.9', partnerReviewStatus: 'Revision Requested', status: 'Under Review', feedback: 'Add TLS mutual authentication setup guide for municipal server handshake.', reviewedDate: '2026-09-23' },
    { id: 'DEL-2026-07', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'Bifacial PV Module Flash Test & Albedo Measurement Sheet', submittedBy: 'Dr. P. K. Sinha', submissionDate: '2026-07-25', version: 'v1.0', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'Verified 14.8% rear-side gain on dark bitumen test pad.', reviewedDate: '2026-07-28' },
    { id: 'DEL-2026-08', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'MPPT GaN Inverter Schematic & PCB Gerber Archive (Rev 2.1)', submittedBy: 'Sneha Kumari', submissionDate: '2026-08-10', version: 'v2.1', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'Creepage distances and thermal reliefs comply with IEC 62109.', reviewedDate: '2026-08-14' },
    { id: 'DEL-2026-09', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'Doppler Radar Dynamic Dimming Control Firmware Source Code', submittedBy: 'Urban Grid Photovoltaics', submissionDate: '2026-08-30', version: 'v2.0', partnerReviewStatus: 'Reviewed & Approved', status: 'Verified', feedback: 'Smooth 3-second dimming transition tested and validated.', reviewedDate: '2026-09-04' },
    { id: 'DEL-2026-10', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'Sonari Bypass Corridor Photometric Lux Mapping Report', submittedBy: 'IIT (ISM) Dhanbad Team', submissionDate: '2026-09-15', version: 'v1.1', partnerReviewStatus: 'Pending Review', status: 'Under Review' },
    { id: 'DEL-2026-11', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'Structural Steel Pole Wind-Load Aerodynamic Simulation', submittedBy: 'Dr. P. K. Sinha', submissionDate: '2026-09-19', version: 'v1.0', partnerReviewStatus: 'Pending Review', status: 'Under Review' },
    { id: 'DEL-2026-12', projectId: 'PRJ-CSR-2026-004', projectTitle: 'Solar-Powered LED Smart Streetlighting', deliverableName: 'Battery Management System (BMS) Thermal Cutoff Safety Protocol', submittedBy: 'Sneha Kumari', submissionDate: '2026-09-23', version: 'v1.0', partnerReviewStatus: 'Pending Review', status: 'Submitted' },
  ],

  // Technical Support Items (Grouped across categories)
  technicalSupportItems: [
    {
      id: 'SUP-2026-018',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      supportType: 'API',
      category: 'APIs',
      description: 'Provisioning dedicated cloud MQTT broker and REST telemetry ingestion endpoint with token-based authentication.',
      requestedBy: 'Student Lead (Rahul Patel)',
      date: '2026-09-20',
      expectedDelivery: '2026-09-25',
      resourceDetails: 'Cloud Endpoint: https://api.jindal-iot.in/v2/telemetry/pipeline-water',
      status: 'In Progress',
    },
    {
      id: 'SUP-2026-019',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      supportType: 'Hardware',
      category: 'Hardware',
      description: 'Providing 2 industrial optical pyranometer sensors and handheld NABL-calibrated lux meter for roadway photometry.',
      requestedBy: 'Faculty Mentor (Dr. P. K. Sinha)',
      date: '2026-09-18',
      expectedDelivery: '2026-09-26',
      resourceDetails: 'Kipp & Zonen CMP3 Solar Pyranometer Kit + Testodo Luxmeter',
      status: 'Accepted',
    },
    {
      id: 'SUP-2026-020',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      supportType: 'Testing',
      category: 'Testing',
      description: 'Access to industrial hydraulic test loop for simulating 4-bar pipeline pinhole burst acoustic frequency spectra.',
      requestedBy: 'Prof. Ananya Sen',
      date: '2026-09-14',
      expectedDelivery: '2026-09-28',
      resourceDetails: 'Jindal Steel Utilities Hydraulic Flow Rig (Jamshedpur Facility)',
      status: 'Accepted',
    },
    {
      id: 'SUP-2026-021',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      supportType: 'Infrastructure',
      category: 'Infrastructure',
      description: 'Supplying 4 units of solar-backed IP67 outdoor LoRaWAN gateway towers for Sakchi municipal perimeter coverage.',
      requestedBy: 'Rahul Patel',
      date: '2026-08-20',
      expectedDelivery: '2026-08-30',
      resourceDetails: 'Kerlink Wirnet iStation 868MHz Outdoor Gateway Units',
      status: 'Completed',
    },
    {
      id: 'SUP-2026-022',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      supportType: 'Technical Expertise',
      category: 'Expertise',
      description: 'Conducting peer review of GaN transistor high-voltage surge protection circuit under lightning impulse strike conditions.',
      requestedBy: 'Sneha Kumari',
      date: '2026-08-12',
      expectedDelivery: '2026-08-16',
      resourceDetails: 'Power Electronics Technical Memo & Circuit CAD Markup (Rohan Mittal)',
      status: 'Completed',
    },
  ],

  // Testing Records
  testingRecords: [
    {
      id: 'TST-2026-01',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring System',
      testType: 'Hardware',
      environment: 'Subterranean Municipal Manhole (Sakchi Ward 2)',
      submittedDate: '2026-09-15',
      result: 'Passed',
      partnerReviewStatus: 'Verified',
      feedback: 'Acoustic transducer maintained 48dB signal-to-noise ratio in active street traffic conditions.',
      status: 'Completed',
    },
    {
      id: 'TST-2026-02',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring System',
      testType: 'API',
      environment: 'Staging IoT Telemetry Cloud Ingestion Broker',
      submittedDate: '2026-09-22',
      result: 'Passed',
      partnerReviewStatus: 'Verified',
      feedback: 'Handled burst of 500 simulated sensor packets per second with latency under 65ms.',
      status: 'Completed',
    },
    {
      id: 'TST-2026-03',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting',
      testType: 'Field',
      environment: 'Sonari Bypass Transit Highway Corridor (Km 4.2 to 5.4)',
      submittedDate: '2026-09-20',
      result: 'Under Evaluation',
      partnerReviewStatus: 'Pending Review',
      issuesFound: 'Minor lux dip of 3 lux observed during high-speed heavy truck passages.',
      recommendations: 'Extend hold time from 5s to 8s before lowering dimmer.',
      status: 'In Progress',
    },
    {
      id: 'TST-2026-04',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting',
      testType: 'Performance',
      environment: 'Solar Array Laboratory Test Bench (IIT ISM Dhanbad)',
      submittedDate: '2026-08-28',
      result: 'Passed',
      partnerReviewStatus: 'Verified',
      feedback: 'MPPT tracking efficiency clocked at 99.1% under dynamic irradiance step changes.',
      status: 'Completed',
    },
  ],

  // Project Communication
  messages: [
    {
      id: 'MSG-001',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      senderName: 'Rahul Patel',
      senderRole: 'Student Lead',
      senderEmail: 'rahul.patel@nitjsr.ac.in',
      recipientName: 'Rohan Mittal',
      message: 'Sir, we have calibrated the piezoelectric hydrophone sensitivity matrix. Could you review the frequency response curve before our session on Friday?',
      timestamp: '2026-09-23T14:30:00Z',
      isRead: false,
      attachments: [{ name: 'Hydrophone_Calibration_Curves_v1.pdf', size: '1.8 MB' }],
    },
    {
      id: 'MSG-002',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      senderName: 'Prof. Ananya Sen',
      senderRole: 'Faculty Mentor',
      senderEmail: 'faculty.mentor@nitjsr.ac.in',
      recipientName: 'Rohan Mittal',
      message: 'Dear Mr. Mittal, the JNAC municipal engineers have granted permission for the Manhole 14 deployment this weekend. We would appreciate your team verifying the gateway telemetry link.',
      timestamp: '2026-09-22T09:15:00Z',
      isRead: true,
    },
    {
      id: 'MSG-003',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      senderName: 'Sneha Kumari',
      senderRole: 'Student Lead',
      senderEmail: 'sneha.kumari@iitism.ac.in',
      recipientName: 'Rohan Mittal',
      message: 'Hello Sir, the Kipp & Zonen pyranometer arrived safely in Dhanbad yesterday! We are running the Sonari Bypass albedo benchmark today.',
      timestamp: '2026-09-21T16:45:00Z',
      isRead: true,
    },
  ],
};

// Helper: Get or initialize partner document
async function getOrCreatePartnerDoc(email: string = DEFAULT_PARTNER_EMAIL): Promise<ICorporatePartnerCollaboration> {
  let doc = await CorporatePartnerCollaboration.findOne({ partnerEmail: email });
  if (!doc) {
    doc = new CorporatePartnerCollaboration({
      ...INITIAL_SEED,
      partnerEmail: email,
    });
    await doc.save();
  }
  return doc;
}

// 1. GET Partner Dashboard
export const getPartnerDashboard = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);

    const activeProjects = doc.assignedProjects.filter((p) => p.status === 'Active');
    const pendingCollaborations = doc.collaborations.filter((c) => c.status === 'Pending');

    const summaryCards = {
      myCollaborations: doc.collaborations.length, // 4
      activeProjects: activeProjects.length,       // 2
      pendingRequests: pendingCollaborations.length, // 3 (or pending requests count)
      mentorshipSessions: doc.mentorshipSessions.length, // 8
      deliverables: doc.deliverables.length,       // 12
    };

    // Pending requests awaiting partner acceptance/review
    const pendingRequests = doc.collaborations
      .filter((c) => c.status === 'Pending')
      .map((c) => ({
        id: c.id,
        university: c.university,
        project: c.projectTitle,
        challengeId: c.challengeId,
        requestedSupport: c.supportType,
        requestedDate: c.startDate,
        status: c.status,
      }));

    // Upcoming scheduled mentorship meetings
    const upcomingMentorship = doc.mentorshipSessions
      .filter((s) => s.status === 'Scheduled')
      .map((s) => ({
        id: s.id,
        date: s.date,
        time: s.time,
        studentTeam: s.studentTeam,
        university: s.university,
        project: s.projectTitle,
        topic: s.topic,
        meetingType: s.meetingType,
        meetingLink: s.meetingLink,
        status: s.status,
      }));

    return res.status(200).json({
      success: true,
      data: {
        partner: {
          name: doc.partnerName,
          designation: doc.designation,
          organization: doc.organizationName,
          department: doc.department,
          domain: doc.industryDomain,
        },
        summaryCards,
        activeProjects: doc.assignedProjects,
        pendingRequests,
        upcomingMentorship,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DASHBOARD_ERROR', message: error.message },
    });
  }
};

// 2. GET Recommended Opportunities
export const getRecommendedOpportunities = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { domain, search, stage } = req.query;

    const opportunities = [
      {
        challengeId: 'CH-2026-089',
        title: 'Low-Cost Subterranean Pipeline Leakage Detection System',
        university: 'NIT Jamshedpur',
        domain: 'Water Infrastructure',
        requiredExpertise: 'IoT / Sensors / Hydrodynamics',
        projectRequirement: 'Technical Mentorship + Testing Skids',
        location: 'Jamshedpur, Jharkhand',
        projectStage: 'Testing',
        technology: 'Acoustic Sensors & LoRaWAN',
        status: 'OPEN',
        priority: 'High',
        problemDescription: 'Frequent sub-surface pipeline ruptures go undetected for days, losing municipal non-revenue water.',
        proposedSolution: 'Subterranean acoustic hydrophones communicating via long-range wireless gateways to municipal telemetry desk.',
        facultyMentor: 'Prof. Ananya Sen',
        studentTeam: 'AquaPur Clean Energy Lab',
        matchReason: 'Direct match for your IoT Sensor and Water Infrastructure expertise.',
      },
      {
        challengeId: 'CH-2026-188',
        title: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
        university: 'IIT (ISM) Dhanbad',
        domain: 'Urban Energy & Solar',
        requiredExpertise: 'Power Electronics / Bifacial PV',
        projectRequirement: 'Hardware Support + Radiometry Equipment',
        location: 'Sonari Transit Highway, Jamshedpur',
        projectStage: 'Prototype',
        technology: 'Bifacial Solar PV & GaN Inverters',
        status: 'OPEN',
        priority: 'High',
        problemDescription: 'High municipal electricity tariffs from standard non-dimming streetlights across peripheral transit bypass corridors.',
        proposedSolution: 'Solar PV grid with radar vehicle detection dimming lights during zero-traffic intervals.',
        facultyMentor: 'Dr. P. K. Sinha',
        studentTeam: 'Urban Grid Photovoltaics',
        matchReason: 'Matches your Power Electronics Advisory and Industrial PV experience.',
      },
      {
        challengeId: 'CH-2026-302',
        title: 'IoT Vibration & Structural Telemetry for Dilapidated Pedestrian Footbridges',
        university: 'IIT (ISM) Dhanbad',
        domain: 'Smart Infrastructure & Public Safety',
        requiredExpertise: 'MEMS Accelerometer / Cloud Telemetry Broker',
        projectRequirement: 'API Support + High-G Vibration Sensors',
        location: 'Subarnarekha River Suspension Bridge, Sonari',
        projectStage: 'Approval',
        technology: 'LoRaWAN MEMS Sensors & Modal Simulation',
        status: 'OPEN',
        priority: 'Urgent',
        problemDescription: 'Cable wear on pedestrian suspension bridges creates severe safety hazard during peak daily school commutes.',
        proposedSolution: 'Real-time wireless oscillation sensors monitoring frequency shift and alerting municipal engineers.',
        facultyMentor: 'Dr. Ramesh Kumar',
        studentTeam: 'BridgeSafe Tech',
        matchReason: 'Directly aligns with your Structural Vibration and Cloud Telemetry profile.',
      },
      {
        challengeId: 'CH-2026-315',
        title: 'Solar Cold Storage Hub for Perishable Tribal Farmer Produce',
        university: 'NIT Jamshedpur',
        domain: 'Rural Livelihoods & Clean Energy',
        requiredExpertise: 'Refrigeration Engineering / Thermal Storage',
        projectRequirement: 'Thermal PCM Testing + Inverter Support',
        location: 'Potka Agricultural Market Yard',
        projectStage: 'Proposal',
        technology: 'Phase Change Materials & 10kW Solar PV',
        status: 'OPEN',
        priority: 'Medium',
        problemDescription: 'Lack of cold storage forces distress sales of perishable produce among tribal vegetable farmers.',
        proposedSolution: 'Phase change material thermal cooling storage powered by rooftop solar array.',
        facultyMentor: 'Dr. P. K. Sinha',
        studentTeam: 'AgriCool Dynamics',
        matchReason: 'Clean Energy & Thermal Infrastructure opportunity.',
      },
      {
        challengeId: 'CH-2026-221',
        title: 'Hyperlocal Air Quality Telemetry & Dust Suppression Trigger Network',
        university: 'NIT Jamshedpur',
        domain: 'Smart Infrastructure & Road Safety',
        requiredExpertise: 'Optical PM2.5/PM10 Sensors / Automation',
        projectRequirement: 'Sensor Calibration + Field Enclosures',
        location: 'Jugsalai Railway Goods Shed, Jamshedpur',
        projectStage: 'Prototype',
        technology: 'Laser Particle Counters & Relay Triggers',
        status: 'OPEN',
        priority: 'High',
        problemDescription: 'Unmonitored fugitive dust emissions during coal and slag transshipment impairing air quality.',
        proposedSolution: 'Automated telemetry network triggering micro-mist cannons when PM10 exceeds statutory thresholds.',
        facultyMentor: 'Dr. Ramesh Kumar',
        studentTeam: 'CleanAir Sensors',
        matchReason: 'Industrial environmental telemetry and sensor enclosure support.',
      },
    ];

    let filtered = opportunities;
    if (domain && domain !== 'All') {
      filtered = filtered.filter((o) => o.domain.toLowerCase().includes((domain as string).toLowerCase()));
    }
    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes((search as string).toLowerCase()) ||
          o.challengeId.toLowerCase().includes((search as string).toLowerCase()) ||
          o.university.toLowerCase().includes((search as string).toLowerCase())
      );
    }
    if (stage && stage !== 'All') {
      filtered = filtered.filter((o) => o.projectStage.toLowerCase() === (stage as string).toLowerCase());
    }

    return res.status(200).json({
      success: true,
      data: {
        opportunities: filtered,
        total: filtered.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OPPORTUNITIES_ERROR', message: error.message },
    });
  }
};

// 3. POST Request Collaboration
export const createCollaborationRequest = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const {
      challengeId,
      projectTitle,
      university,
      department,
      facultyMentor,
      studentLead,
      expertise,
      supportType,
      expectedContribution,
      availableHours,
      expectedDuration,
      technicalResources,
      additionalMessage,
    } = req.body;

    if (!challengeId || !projectTitle || !supportType) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Challenge, project title, and support type are required.' },
      });
    }

    const newCollaboration = {
      id: `COL-2026-0${doc.collaborations.length + 1}`,
      challengeId,
      projectTitle,
      university: university || 'NIT Jamshedpur',
      department: department || 'Engineering Faculty',
      facultyMentor: facultyMentor || 'Prof. Faculty Mentor',
      studentLead: studentLead || 'Assigned Student Lead',
      partnerRole: supportType,
      startDate: new Date().toISOString().split('T')[0],
      expectedDuration: expectedDuration || '6 Months',
      supportType,
      status: 'Pending' as const,
      partnerResponsibilities: [
        `Provide ${supportType} guidance`,
        `Commit ${availableHours || '4-6'} hours monthly for technical mentorship`,
        `Support student team in milestone deliverable reviews`,
      ],
      universityResponsibilities: [
        'Furnish laboratory testing skids and research logs',
        'Participate in scheduled partner mentorship sessions',
      ],
      expectedContribution: expectedContribution || 'Industrial mentorship and specialized resource access.',
      technicalResources: technicalResources || 'Technical documentation and testing support.',
      additionalMessage,
    };

    doc.collaborations.unshift(newCollaboration);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Collaboration request submitted successfully and stored in the central registry.',
        collaboration: newCollaboration,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REQUEST_ERROR', message: error.message },
    });
  }
};

// 4. GET Partner Collaborations
export const getPartnerCollaborations = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { tab } = req.query;

    let list = doc.collaborations;
    if (tab && tab !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === (tab as string).toLowerCase());
    }

    return res.status(200).json({
      success: true,
      data: {
        collaborations: list,
        counts: {
          all: doc.collaborations.length,
          pending: doc.collaborations.filter((c) => c.status === 'Pending').length,
          active: doc.collaborations.filter((c) => c.status === 'Active').length,
          completed: doc.collaborations.filter((c) => c.status === 'Completed').length,
          declined: doc.collaborations.filter((c) => c.status === 'Declined').length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'COLLABORATIONS_ERROR', message: error.message },
    });
  }
};

// 5. POST Respond to Collaboration (Accept/Decline)
export const respondToCollaboration = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { id } = req.params;
    const { action } = req.body; // 'Accept' | 'Decline'

    const collab = doc.collaborations.find((c) => c.id === id);
    if (!collab) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Collaboration record not found.' },
      });
    }

    collab.status = action === 'Accept' ? 'Active' : 'Declined';
    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: `Collaboration request marked as ${collab.status}.`,
        collaboration: collab,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESPOND_ERROR', message: error.message },
    });
  }
};

// 6. GET Mentorship (Teams, Sessions, Feedback)
export const getPartnerMentorship = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);

    // Assigned student teams derived from assigned projects
    const assignedTeams = doc.assignedProjects.map((p) => ({
      teamName: p.studentTeam,
      university: p.university,
      projectTitle: p.projectTitle,
      projectId: p.projectId,
      facultyMentor: p.facultyMentor,
      studentLead: p.studentLead,
      teamSize: 5,
      projectStage: p.currentStage,
      progress: p.progress,
      members: [
        { name: p.studentLead, role: 'Team Lead & Firmware Developer' },
        { name: 'Priya Sharma', role: 'Telemetry & Cloud Integration' },
        { name: 'Vikas Kumar', role: 'Mechanical Enclosure & CAD' },
        { name: 'Amit Verma', role: 'Sensor Calibration & Testing' },
        { name: 'Ananya Mukherjee', role: 'Data Analysis & Documentation' },
      ],
      skills: ['Embedded C', 'LoRaWAN', 'CAD Modeling', 'Python Data Analysis', 'Circuit Prototyping'],
      objective: {
        problem: p.problemStatement,
        solution: p.proposedSolution,
        technology: p.technology,
        outcome: p.expectedOutcome,
      },
      partnerRole: p.partnerRole,
    }));

    const upcomingSessions = doc.mentorshipSessions.filter((s) => s.status === 'Scheduled');
    const completedSessions = doc.mentorshipSessions.filter((s) => s.status === 'Completed');
    const feedbackList = doc.mentorshipSessions
      .filter((s) => s.feedback)
      .map((s) => ({
        sessionId: s.id,
        projectTitle: s.projectTitle,
        studentTeam: s.studentTeam,
        date: s.date,
        topic: s.topic,
        feedback: s.feedback,
      }));

    return res.status(200).json({
      success: true,
      data: {
        assignedTeams,
        allSessions: doc.mentorshipSessions,
        upcomingSessions,
        completedSessions,
        feedbackList,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'MENTORSHIP_ERROR', message: error.message },
    });
  }
};

// 7. POST Schedule Mentorship Session
export const scheduleMentorshipSession = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { projectId, studentTeam, date, time, topic, meetingType, meetingLink, agenda } = req.body;

    if (!projectId || !studentTeam || !date || !time || !topic) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project, student team, date, time, and topic are required.' },
      });
    }

    const matchedProject = doc.assignedProjects.find((p) => p.projectId === projectId);

    const newSession = {
      id: `SES-2026-0${doc.mentorshipSessions.length + 1}`,
      projectId,
      projectTitle: matchedProject?.projectTitle || 'Assigned Innovation Project',
      studentTeam,
      university: matchedProject?.university || 'NIT Jamshedpur',
      date,
      time,
      topic,
      meetingType: meetingType || 'Online',
      meetingLink: meetingLink || `https://meet.gov.in/civicconnect-${projectId.toLowerCase()}`,
      agenda: agenda || 'Technical project review and milestone inspection.',
      status: 'Scheduled' as const,
    };

    doc.mentorshipSessions.unshift(newSession);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Mentorship session scheduled successfully.',
        session: newSession,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SCHEDULE_ERROR', message: error.message },
    });
  }
};

// 8. POST Submit Mentorship Feedback
export const submitMentorshipFeedback = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { sessionId } = req.params;
    const { technicalFeedback, studentProgress, strengths, issues, recommendedImprovements, nextSteps } = req.body;

    const session = doc.mentorshipSessions.find((s) => s.id === sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Mentorship session not found.' },
      });
    }

    session.status = 'Completed';
    session.feedback = {
      technicalFeedback: technicalFeedback || 'Technical feedback recorded.',
      studentProgress: studentProgress || 'Satisfactory progress maintained.',
      strengths: strengths || 'Strong collaborative teamwork.',
      issues: issues || 'None flagged.',
      recommendedImprovements: recommendedImprovements || 'Proceed to validation testing.',
      nextSteps: nextSteps || 'Complete scheduled milestone deliverables.',
      submittedAt: new Date().toISOString(),
    };

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Mentorship feedback recorded successfully.',
        session,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FEEDBACK_ERROR', message: error.message },
    });
  }
};

// 9. GET Technical Support Tickets
export const getTechnicalSupport = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { category } = req.query;

    let items = doc.technicalSupportItems;
    if (category && category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === (category as string).toLowerCase());
    }

    return res.status(200).json({
      success: true,
      data: {
        supportItems: items,
        counts: {
          all: doc.technicalSupportItems.length,
          apis: doc.technicalSupportItems.filter((i) => i.category === 'APIs').length,
          infrastructure: doc.technicalSupportItems.filter((i) => i.category === 'Infrastructure').length,
          hardware: doc.technicalSupportItems.filter((i) => i.category === 'Hardware').length,
          software: doc.technicalSupportItems.filter((i) => i.category === 'Software').length,
          testing: doc.technicalSupportItems.filter((i) => i.category === 'Testing').length,
          expertise: doc.technicalSupportItems.filter((i) => i.category === 'Expertise').length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SUPPORT_ERROR', message: error.message },
    });
  }
};

// 10. POST Create Technical Support Commitment
export const createTechnicalSupport = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { projectId, supportType, description, resourceDetails, expectedDelivery, notes } = req.body;

    if (!projectId || !supportType || !description) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project, support type, and description are required.' },
      });
    }

    const matchedProject = doc.assignedProjects.find((p) => p.projectId === projectId);

    // Map to category
    let category: 'APIs' | 'Infrastructure' | 'Hardware' | 'Software' | 'Testing' | 'Expertise' = 'Expertise';
    if (supportType === 'API') category = 'APIs';
    else if (supportType === 'Infrastructure') category = 'Infrastructure';
    else if (supportType === 'Hardware') category = 'Hardware';
    else if (supportType === 'Software') category = 'Software';
    else if (supportType === 'Testing') category = 'Testing';

    const newItem = {
      id: `SUP-2026-0${doc.technicalSupportItems.length + 1}`,
      projectId,
      projectTitle: matchedProject?.projectTitle || 'Assigned Innovation Project',
      university: matchedProject?.university || 'NIT Jamshedpur',
      supportType,
      category,
      description,
      requestedBy: (req as any).user?.name || 'Rohan Mittal (Corporate Partner)',
      date: new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDelivery || 'Within 7 business days',
      resourceDetails: resourceDetails || 'Furnished by Corporate Partner',
      notes,
      status: 'Accepted' as const,
    };

    doc.technicalSupportItems.unshift(newItem);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Technical support item logged and committed successfully.',
        item: newItem,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SUPPORT_CREATE_ERROR', message: error.message },
    });
  }
};

// 11. GET Partner Projects (Progress, Milestones, Deliverables, Testing)
export const getPartnerProjects = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { tab } = req.query;

    return res.status(200).json({
      success: true,
      data: {
        projects: doc.assignedProjects,
        deliverables: doc.deliverables,
        testingRecords: doc.testingRecords,
        milestones: doc.assignedProjects.flatMap((p) =>
          p.milestones.map((m) => ({
            ...m,
            projectId: p.projectId,
            projectTitle: p.projectTitle,
          }))
        ),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROJECTS_ERROR', message: error.message },
    });
  }
};

// 12. POST Review Deliverable
export const submitDeliverableReview = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { deliverableId } = req.params;
    const { partnerReviewStatus, feedback } = req.body;

    const del = doc.deliverables.find((d) => d.id === deliverableId);
    if (!del) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Deliverable not found.' },
      });
    }

    del.partnerReviewStatus = partnerReviewStatus || 'Reviewed & Approved';
    del.feedback = feedback || 'Partner technical review signoff recorded.';
    del.reviewedDate = new Date().toISOString().split('T')[0];
    if (del.partnerReviewStatus === 'Reviewed & Approved') {
      del.status = 'Verified';
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: `Deliverable marked as ${del.partnerReviewStatus}.`,
        deliverable: del,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DELIVERABLE_REVIEW_ERROR', message: error.message },
    });
  }
};

// 13. POST Submit Testing Feedback
export const submitTestingFeedback = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { testId } = req.params;
    const { partnerReviewStatus, feedback, issuesFound, recommendations } = req.body;

    const testRec = doc.testingRecords.find((t) => t.id === testId);
    if (!testRec) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Testing record not found.' },
      });
    }

    testRec.partnerReviewStatus = partnerReviewStatus || 'Verified';
    testRec.feedback = feedback;
    testRec.issuesFound = issuesFound;
    testRec.recommendations = recommendations;

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Testing feedback submitted successfully.',
        testRecord: testRec,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TESTING_FEEDBACK_ERROR', message: error.message },
    });
  }
};

// 14. GET Project Communication
export const getPartnerCommunication = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);

    return res.status(200).json({
      success: true,
      data: {
        projects: doc.assignedProjects.map((p) => ({
          projectId: p.projectId,
          projectTitle: p.projectTitle,
          university: p.university,
          facultyMentor: p.facultyMentor,
          studentLead: p.studentLead,
        })),
        messages: doc.messages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'COMMUNICATION_ERROR', message: error.message },
    });
  }
};

// 15. POST Send Project Message
export const sendPartnerMessage = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { projectId, recipientName, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project and message content are required.' },
      });
    }

    const matchedProject = doc.assignedProjects.find((p) => p.projectId === projectId);

    const newMsg = {
      id: `MSG-00${doc.messages.length + 1}`,
      projectId,
      projectTitle: matchedProject?.projectTitle || 'Assigned Innovation Project',
      senderName: doc.partnerName,
      senderRole: 'Corporate Partner',
      senderEmail: doc.partnerEmail,
      recipientName: recipientName || matchedProject?.studentLead || 'Project Team',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    doc.messages.push(newMsg);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Message dispatched successfully.',
        sentMessage: newMsg,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SEND_MSG_ERROR', message: error.message },
    });
  }
};

// 16. GET Profile
export const getPartnerProfile = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          name: doc.partnerName,
          designation: doc.designation,
          organization: doc.organizationName,
          department: doc.department,
          officialEmail: doc.officialEmail,
          officialContact: doc.officialContact,
          industryDomain: doc.industryDomain,
          technicalExpertise: doc.technicalExpertise,
          professionalSkills: doc.professionalSkills,
          yearsOfExperience: doc.yearsOfExperience,
          areasOfInterest: doc.areasOfInterest,
          currentCollaborationsCount: doc.collaborations.length,
          activeProjectsCount: doc.assignedProjects.length,
          mentorshipAreas: doc.mentorshipAreas,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_ERROR', message: error.message },
    });
  }
};

// 17. PATCH Update Profile
export const updatePartnerProfile = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email || DEFAULT_PARTNER_EMAIL;
    const doc = await getOrCreatePartnerDoc(userEmail);
    const { officialContact, technicalExpertise, professionalSkills, areasOfInterest, mentorshipAreas } = req.body;

    if (officialContact) doc.officialContact = officialContact;
    if (technicalExpertise) doc.technicalExpertise = technicalExpertise;
    if (professionalSkills) doc.professionalSkills = professionalSkills;
    if (areasOfInterest) doc.areasOfInterest = areasOfInterest;
    if (mentorshipAreas) doc.mentorshipAreas = mentorshipAreas;

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Corporate Partner profile successfully updated in official registry.',
        profile: {
          name: doc.partnerName,
          designation: doc.designation,
          organization: doc.organizationName,
          officialContact: doc.officialContact,
          technicalExpertise: doc.technicalExpertise,
          professionalSkills: doc.professionalSkills,
          areasOfInterest: doc.areasOfInterest,
          mentorshipAreas: doc.mentorshipAreas,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_UPDATE_ERROR', message: error.message },
    });
  }
};
