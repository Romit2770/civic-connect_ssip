import { Request, Response } from 'express';
import { CSRInitiative, ICSRProject, ICSRProposal, ICSRFundingRelease, ICSRReport } from '../models/CSRInitiative';
import { Complaint } from '../models/Complaint';

// Initial institutional CSR dataset for Tata Steel Utilities & Infrastructure
const DEFAULT_CSR_DATA = {
  organizationName: 'Tata Steel Utilities & Infrastructure',
  department: 'CSR & Innovation Division',
  contactPerson: 'Meera Chawla',
  officialEmail: 'csr.lead@tata.com',
  contactNumber: '+91 9835102905',
  cinNumber: 'CIN: U45200JH1993PLC005396',
  csrRegistrationNumber: 'CSR00018492',
  annualBudgetPool: 25000000, // ₹2.50 Cr
  allocatedBudget: 18500000, // ₹1.85 Cr
  releasedBudget: 11200000, // ₹1.12 Cr
  utilizedBudget: 9640000, // ₹96.40 L
  remainingBudget: 7360000, // ₹73.60 L
  communitiesReached: 24850,
  activeProjectsCount: 7,
  completedProjectsCount: 5,
  totalInitiativesCount: 12,
  csrDomains: [
    'Urban Water Conservation & Leakage Mitigation',
    'Smart Infrastructure & Road Safety',
    'Decentralized Solid Waste Bio-Composting',
    'Clean Solar Energy & Public Lighting',
    'Industrial Wastewater Treatment & Circular Reuse',
  ],
  areasOfExpertise: [
    'CSR Grant Governance & Section 135 Compliance',
    'Public-Private-University Tripartite Partnerships',
    'Social Return on Investment (SROI) Telemetry',
    'Urban Local Body (ULB) Field Pilot Integration',
  ],
  industryPartnerships: [
    'Tata Steel UISL',
    'Tata Community Initiatives Trust (TCIT)',
    'Jamshedpur Notified Area Council (JNAC)',
    'Mango Municipal Corporation (MNAC)',
    'Adityapur Municipal Corporation (AMC)',
  ],
  projects: [
    {
      projectId: 'PRJ-CSR-2026-001',
      challengeId: 'CH-2026-089',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry & Pipeline Leakage',
      university: 'NIT Jamshedpur',
      studentTeam: 'HydraTech Guild',
      facultyMentor: 'Dr. Ramesh Kumar',
      industryMentor: 'Suresh Nambiar',
      csrProjectLead: 'Meera Chawla',
      domain: 'Water & Sanitation',
      location: 'Sakchi & Bistupur, Jamshedpur',
      stage: 'Field Deployment',
      progress: 72,
      approvedBudget: 4500000, // ₹45.00 L
      releasedFunding: 3000000, // ₹30.00 L
      utilizedFunding: 2450000, // ₹24.50 L
      remainingFunding: 1500000, // ₹15.00 L unreleased
      status: 'Active',
      nextMilestone: 'MLS-03: Multi-Ward SCADA Telemetry Synchronization (15 Oct 2026)',
      photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Acoustic Sensor Calibrations at Sakchi Works', dueDate: '2026-06-15', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'LoRaWAN 865MHz Gateway Deployment (Zone East-04)', dueDate: '2026-08-10', progress: 100, status: 'Completed' },
        { id: 'MLS-03', title: 'Multi-Ward SCADA Telemetry Synchronization', dueDate: '2026-10-15', progress: 65, status: 'In Progress' },
        { id: 'MLS-04', title: 'Public Handover & Ward Officer Training Session', dueDate: '2026-12-05', progress: 0, status: 'Upcoming' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Sensor Hardware Design & Schematics Dossier', submittedBy: 'Dr. Ramesh Kumar', submissionDate: '2026-06-20', reviewStatus: 'Verified' },
        { id: 'DEL-02', title: 'LoRaWAN Packet Transmission Telemetry Log', submittedBy: 'Aakash Verma', submissionDate: '2026-08-15', reviewStatus: 'Verified' },
        { id: 'DEL-03', title: 'Q2 Real-Time Leak Detection Pressure Benchmark', submittedBy: 'Dr. Ramesh Kumar', submissionDate: '2026-09-12', reviewStatus: 'Pending Review' },
      ],
      risks: [
        { id: 'RSK-01', title: 'Monsoon underground moisture ingress on Sakchi Trunk pipeline', severity: 'Medium', reportedDate: '2026-08-04', responsiblePerson: 'Suresh Nambiar', resolution: 'Upgraded IP68 submersible potting enclosures deployed.', status: 'Mitigated' },
        { id: 'RSK-02', title: 'Delayed municipal road cut permit along Bistupur Boulevard', severity: 'High', reportedDate: '2026-09-02', responsiblePerson: 'Meera Chawla', resolution: 'Expedited through JNAC Municipal Executive Officer tripartite meeting.', status: 'Mitigated' },
      ],
      impact: {
        targetCommunity: 'Sakchi Ward 4 & Bistupur Commercial Corridor Residents',
        peopleBenefited: 8400,
        villagesCovered: 4,
        measuredOutcome: '42% reduction in non-revenue water pipeline losses',
        infrastructureCreated: '24 Subterranean Piezo-Electric Flow Stations',
        serviceImprovement: 'Average leak pinpointing time dropped from 48h to 2.4h',
        costReduction: 'Estimated ₹ 8.2 L annual water pumping power savings',
        environmentalImpact: '3.4 Million Litres clean potable water saved per month',
        verificationStatus: 'Third-Party Audited',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-002',
      challengeId: 'CH-2026-112',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      university: 'BIT Mesra',
      studentTeam: 'AeroVision Guild',
      facultyMentor: 'Dr. Sunita Murmu',
      industryMentor: 'Arvind Swaminathan',
      csrProjectLead: 'Meera Chawla',
      domain: 'Roads & Public Works',
      location: 'Dimna Road & Kadma Corridor, Jamshedpur',
      stage: 'Testing',
      progress: 60,
      approvedBudget: 3200000, // ₹32.00 L
      releasedFunding: 2000000, // ₹20.00 L
      utilizedFunding: 1800000, // ₹18.00 L
      remainingFunding: 1200000,
      status: 'Active',
      nextMilestone: 'MLS-03: Kadma West Stereo Photogrammetry Runs (20 Oct 2026)',
      photoUrl: '/assets/evidence/road_potholes_drone.jpg',
      milestones: [
        { id: 'MLS-01', title: 'AI Depth Segmentation Model Training (YOLOv10)', dueDate: '2026-06-30', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Dimna Road Flight Clearance & Trial Photogrammetry', dueDate: '2026-08-25', progress: 100, status: 'Completed' },
        { id: 'MLS-03', title: 'Kadma West Stereo Photogrammetry Runs', dueDate: '2026-10-20', progress: 40, status: 'In Progress' },
        { id: 'MLS-04', title: 'Municipal PWD Automated Dispatch Dashboard Integration', dueDate: '2026-12-15', progress: 0, status: 'Upcoming' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Asphalt Defect Computer Vision Dataset (v1.0)', submittedBy: 'Dr. Sunita Murmu', submissionDate: '2026-07-05', reviewStatus: 'Verified' },
        { id: 'DEL-02', title: 'Dimna Road Photogrammetry Elevation Map', submittedBy: 'AeroVision Guild', submissionDate: '2026-08-30', reviewStatus: 'Verified' },
      ],
      risks: [
        { id: 'RSK-01', title: 'DGCA restricted airspace zone near Sonari Aerodrome', severity: 'Critical', reportedDate: '2026-07-15', responsiblePerson: 'Dr. Sunita Murmu', resolution: 'DGCA Green Zone flight corridor certification acquired via Digital Sky.', status: 'Closed' },
      ],
      impact: {
        targetCommunity: 'Dimna Road & Mango Daily Commuters',
        peopleBenefited: 5500,
        villagesCovered: 3,
        measuredOutcome: '68% faster detection of sub-base road degradation',
        infrastructureCreated: 'Autonomous Aerial Survey Drone Rig & GIS Station',
        serviceImprovement: 'Municipal road defect repair latency reduced by 5.5 days',
        costReduction: '₹ 14.5 L savings in premature road reconstruction',
        environmentalImpact: 'Reduced vehicular idling emissions from traffic slowdowns',
        verificationStatus: 'Third-Party Audited',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-003',
      challengeId: 'CH-2026-145',
      projectTitle: 'Decentralized Micro-Composting Digesters with Microbial Inoculants',
      university: 'BIT Mesra',
      studentTeam: 'EnviroTech Guild',
      facultyMentor: 'Dr. Sunita Murmu',
      industryMentor: 'Dr. Priya Balakrishnan',
      csrProjectLead: 'Meera Chawla',
      domain: 'Solid Waste Management',
      location: 'Sakchi Mandi & Bistupur Market',
      stage: 'Prototype',
      progress: 35,
      approvedBudget: 2200000, // ₹22.00 L
      releasedFunding: 1200000, // ₹12.00 L
      utilizedFunding: 980000,
      remainingFunding: 1000000,
      status: 'Active',
      nextMilestone: 'MLS-02: Sakchi Market Bioreactor Inoculation (12 Oct 2026)',
      photoUrl: '/assets/evidence/market_compost_waste.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Thermophilic Bacterial Strain Isolation & Lab Testing', dueDate: '2026-07-20', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Sakchi Market Bioreactor Inoculation', dueDate: '2026-10-12', progress: 35, status: 'In Progress' },
        { id: 'MLS-03', title: 'Compost Quality & Nutrient Retention Certification', dueDate: '2026-11-30', progress: 0, status: 'Upcoming' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Microbial Inoculant Safety & Pathogen Clearance Report', submittedBy: 'Dr. Priya Balakrishnan', submissionDate: '2026-08-01', reviewStatus: 'Verified' },
      ],
      risks: [
        { id: 'RSK-01', title: 'Heavy rain runoff causing leachate saturation in open pits', severity: 'High', reportedDate: '2026-08-18', responsiblePerson: 'EnviroTech Guild', resolution: 'Added modular waterproof shed and automated drain sumps.', status: 'Mitigated' },
      ],
      impact: {
        targetCommunity: 'Sakchi Vegetable Mandi Vendors & Residents',
        peopleBenefited: 3800,
        villagesCovered: 2,
        measuredOutcome: '3.5 Tons daily organic wet waste diverted from municipal landfill',
        infrastructureCreated: '2 Solar-Powered Micro-Compost Tumbler Units',
        serviceImprovement: 'Eliminated organic waste decay odors around market sheds',
        costReduction: '₹ 45,000 monthly municipal tipping fee savings',
        environmentalImpact: 'Direct reduction of methane emissions equivalent to 18 MT CO2e/year',
        verificationStatus: 'Third-Party Audited',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-004',
      challengeId: 'CH-2026-188',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      studentTeam: 'Urban Grid Photovoltaics',
      facultyMentor: 'Dr. P. K. Sinha',
      industryMentor: 'Rohan Deshmukh',
      csrProjectLead: 'Meera Chawla',
      domain: 'Urban Energy & Solar',
      location: 'Sonari Bypass & Marine Drive, Jamshedpur',
      stage: 'Prototype',
      progress: 45,
      approvedBudget: 2800000, // ₹28.00 L
      releasedFunding: 1800000, // ₹18.00 L
      utilizedFunding: 1550000,
      remainingFunding: 1000000,
      status: 'Active',
      nextMilestone: 'MLS-02: Sonari Bypass Lux Measurement Test (18 Oct 2026)',
      photoUrl: '/assets/evidence/solar_street_lighting.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Bifacial Solar Module Benchmark Testing', dueDate: '2026-07-10', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Sonari Bypass Lux Measurement Test', dueDate: '2026-10-18', progress: 45, status: 'In Progress' },
        { id: 'MLS-03', title: 'Grid-Tie Inverter Synchronization & Safety Audit', dueDate: '2026-12-10', progress: 0, status: 'Upcoming' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Dynamic Dimming Firmware Architecture (v2.1)', submittedBy: 'Dr. P. K. Sinha', submissionDate: '2026-07-28', reviewStatus: 'Verified' },
      ],
      risks: [],
      impact: {
        targetCommunity: 'Sonari Bypass Commuters & Peripheral Night Transit',
        peopleBenefited: 4200,
        villagesCovered: 2,
        measuredOutcome: '58% grid electricity savings across Sonari corridor',
        infrastructureCreated: '1.2 km Smart Photovoltaic Streetlighting Grid',
        serviceImprovement: 'Zero dark spots reported in transit corridor',
        costReduction: '₹ 62,000 monthly municipal utility bill reduction',
        environmentalImpact: '22 MWh clean renewable solar electricity generated annually',
        verificationStatus: 'Third-Party Audited',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-005',
      challengeId: 'CH-2026-204',
      projectTitle: 'Industrial Wastewater Multi-Stage Coagulation & Heavy Metal Removal',
      university: 'NIT Jamshedpur',
      studentTeam: 'AquaPur Clean Energy',
      facultyMentor: 'Prof. Ananya Sen',
      industryMentor: 'Suresh Nambiar',
      csrProjectLead: 'Meera Chawla',
      domain: 'Water & Sanitation',
      location: 'Adityapur Industrial Area Phase 1',
      stage: 'Field Deployment',
      progress: 68,
      approvedBudget: 2400000, // ₹24.00 L
      releasedFunding: 1500000, // ₹15.00 L
      utilizedFunding: 1420000,
      remainingFunding: 900000,
      status: 'Active',
      nextMilestone: 'MLS-03: Heavy Metal Sorbent Bed Recirculation Runs (25 Oct 2026)',
      photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Sorbent Formulation & Slag-Based Matrix Synthesis', dueDate: '2026-06-30', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Adityapur Industrial Pilot Skids Erection', dueDate: '2026-08-30', progress: 100, status: 'Completed' },
        { id: 'MLS-03', title: 'Heavy Metal Sorbent Bed Recirculation Runs', dueDate: '2026-10-25', progress: 50, status: 'In Progress' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Effluent Quality Chemical Test Report (NABL Certified)', submittedBy: 'Prof. Ananya Sen', submissionDate: '2026-09-01', reviewStatus: 'Verified' },
      ],
      risks: [
        { id: 'RSK-01', title: 'Surge in high-pH industrial plating effluent spikes', severity: 'Medium', reportedDate: '2026-09-10', responsiblePerson: 'AquaPur Team', resolution: 'Installed automated pH buffer dosing pump.', status: 'Mitigated' },
      ],
      impact: {
        targetCommunity: 'Adityapur Slum Settlements & Downstream Farmers',
        peopleBenefited: 1800,
        villagesCovered: 1,
        measuredOutcome: '94% reduction in lead and chromium effluent concentration',
        infrastructureCreated: 'Continuous Flow 50 KLD Effluent Neutralization Skid',
        serviceImprovement: 'Discharge meets CPCB inland surface water standards',
        costReduction: 'Low-cost slag sorbent lowers filtration operating cost by 70%',
        environmentalImpact: 'Protection of Subarnarekha River downstream aquatic ecology',
        verificationStatus: 'MoE Validated',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-006',
      challengeId: 'CH-2026-221',
      projectTitle: 'Hyperlocal Air Quality Telemetry & Dust Suppression Trigger Network',
      university: 'NIT Jamshedpur',
      studentTeam: 'CleanAir Sensors',
      facultyMentor: 'Dr. Ramesh Kumar',
      industryMentor: 'Arvind Swaminathan',
      csrProjectLead: 'Meera Chawla',
      domain: 'Smart Infrastructure & Road Safety',
      location: 'Jugsalai Railway Crossing & Goods Shed',
      stage: 'Prototype',
      progress: 30,
      approvedBudget: 1800000, // ₹18.00 L
      releasedFunding: 1000000, // ₹10.00 L
      utilizedFunding: 840000,
      remainingFunding: 800000,
      status: 'At Risk',
      nextMilestone: 'MLS-02: Laser PM2.5/PM10 Sensor Calibration (10 Oct 2026)',
      photoUrl: '/assets/evidence/road_potholes_drone.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Optical Sensor Node Prototyping', dueDate: '2026-07-31', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Laser PM2.5/PM10 Sensor Calibration', dueDate: '2026-10-10', progress: 20, status: 'Delayed' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Sensor Hardware BOM & Enclosure Specifications', submittedBy: 'Dr. Ramesh Kumar', submissionDate: '2026-08-10', reviewStatus: 'Verified' },
      ],
      risks: [
        { id: 'RSK-01', title: 'Component supply delay for optical particle counters from supplier', severity: 'High', reportedDate: '2026-08-28', responsiblePerson: 'Dr. Ramesh Kumar', resolution: 'Alternate certified Indian vendor identified for expedited delivery.', status: 'Open' },
      ],
      impact: {
        targetCommunity: 'Jugsalai Commercial District & Railway Transit Passengers',
        peopleBenefited: 6200,
        villagesCovered: 1,
        measuredOutcome: 'Automated mist cannon misting triggered when PM10 exceeds 150 µg/m³',
        infrastructureCreated: '8 Micro-Air Quality Telemetry Towers',
        serviceImprovement: 'Real-time air pollution alerts sent to Jamshedpur Health Desk',
        costReduction: 'Targeted misting saves 40,000 litres water weekly compared to continuous misting',
        environmentalImpact: '28% drop in airborne respirable particulate matter at transit bottlenecks',
        verificationStatus: 'Pending Audit',
      },
    },
    {
      projectId: 'PRJ-CSR-2026-007',
      challengeId: 'CH-2026-250',
      projectTitle: 'Waste Plastic Asphalt Aggregate Pyrolysis & Pavement Additives',
      university: 'BIT Mesra',
      studentTeam: 'Circular Materials Lab',
      facultyMentor: 'Dr. Sunita Murmu',
      industryMentor: 'Dr. Priya Balakrishnan',
      csrProjectLead: 'Meera Chawla',
      domain: 'Solid Waste Management',
      location: 'Gamharia Bitumen Works & PWD Storage',
      stage: 'Prototype',
      progress: 25,
      approvedBudget: 1600000, // ₹16.00 L
      releasedFunding: 700000, // ₹7.00 L
      utilizedFunding: 600000,
      remainingFunding: 900000,
      status: 'Active',
      nextMilestone: 'MLS-02: Modified Bitumen Marshall Stability Testing (05 Nov 2026)',
      photoUrl: '/assets/evidence/market_compost_waste.jpg',
      milestones: [
        { id: 'MLS-01', title: 'Low-Density Shredded Polyethylene Binder Mixing Trials', dueDate: '2026-08-15', progress: 100, status: 'Completed' },
        { id: 'MLS-02', title: 'Modified Bitumen Marshall Stability Testing', dueDate: '2026-11-05', progress: 25, status: 'In Progress' },
      ],
      deliverables: [
        { id: 'DEL-01', title: 'Polymer-Modified Asphalt Mix Optimization Report', submittedBy: 'Dr. Sunita Murmu', submissionDate: '2026-08-30', reviewStatus: 'Verified' },
      ],
      risks: [],
      impact: {
        targetCommunity: 'Gamharia & Adityapur Industrial Workers',
        peopleBenefited: 1550,
        villagesCovered: 1,
        measuredOutcome: '1.2 Tons single-use plastic waste upcycled per kilometre of urban road',
        infrastructureCreated: 'Plastic Shredding & Pelletizing Test Bench',
        serviceImprovement: 'Road pavement lifespan extended by an estimated 35%',
        costReduction: '8% reduction in raw bitumen binder consumption',
        environmentalImpact: 'Permanent sequestration of non-recyclable multi-layered plastics',
        verificationStatus: 'Third-Party Audited',
      },
    },
  ],
  fundingReleases: [
    {
      id: 'REL-2026-001',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry',
      university: 'NIT Jamshedpur',
      releaseAmount: 1500000,
      releaseDate: '2026-04-15',
      fundingPhase: 'Tranche-1 Initial Grant',
      referenceNumber: 'TSUISL-CSR-2026-TR1-01',
      notes: 'Sanctioned against MoU signing and acoustic rig procurement.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-002',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry',
      university: 'NIT Jamshedpur',
      releaseAmount: 1500000,
      releaseDate: '2026-08-10',
      fundingPhase: 'Tranche-2 Pilot Deployment',
      referenceNumber: 'TSUISL-CSR-2026-TR2-08',
      notes: 'Released following verification of LoRaWAN telemetry gateways.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-003',
      projectId: 'PRJ-CSR-2026-002',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      university: 'BIT Mesra',
      releaseAmount: 2000000,
      releaseDate: '2026-05-12',
      fundingPhase: 'Tranche-1 Hardware & Flight Systems',
      referenceNumber: 'TSUISL-CSR-2026-TR1-05',
      notes: 'Released upon DGCA regulatory compliance sign-off.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-004',
      projectId: 'PRJ-CSR-2026-003',
      projectTitle: 'Decentralized Micro-Composting Digesters with Microbial Inoculants',
      university: 'BIT Mesra',
      releaseAmount: 1200000,
      releaseDate: '2026-06-05',
      fundingPhase: 'Tranche-1 Bioreactor Erection',
      referenceNumber: 'TSUISL-CSR-2026-TR1-09',
      notes: 'Released for fabrication of two solar tumbler units at Sakchi.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-005',
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      releaseAmount: 1800000,
      releaseDate: '2026-06-25',
      fundingPhase: 'Tranche-1 Photovoltaic Cells & Inverters',
      referenceNumber: 'TSUISL-CSR-2026-TR1-14',
      notes: 'Released for Sonari bypass streetlighting grid trial.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-006',
      projectId: 'PRJ-CSR-2026-005',
      projectTitle: 'Industrial Wastewater Multi-Stage Coagulation',
      university: 'NIT Jamshedpur',
      releaseAmount: 1500000,
      releaseDate: '2026-05-30',
      fundingPhase: 'Tranche-1 Effluent Skid Pilot',
      referenceNumber: 'TSUISL-CSR-2026-TR1-11',
      notes: 'Released following laboratory sorbent matrix synthesis clearance.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-007',
      projectId: 'PRJ-CSR-2026-006',
      projectTitle: 'Hyperlocal Air Quality Telemetry & Dust Suppression',
      university: 'NIT Jamshedpur',
      releaseAmount: 1000000,
      releaseDate: '2026-07-15',
      fundingPhase: 'Tranche-1 Sensor Towers Setup',
      referenceNumber: 'TSUISL-CSR-2026-TR1-18',
      notes: 'Released for Jugsalai optical sensor equipment purchase.',
      recordedBy: 'Meera Chawla',
    },
    {
      id: 'REL-2026-008',
      projectId: 'PRJ-CSR-2026-007',
      projectTitle: 'Waste Plastic Asphalt Aggregate Pyrolysis',
      university: 'BIT Mesra',
      releaseAmount: 700000,
      releaseDate: '2026-08-01',
      fundingPhase: 'Tranche-1 Shredding Bench',
      referenceNumber: 'TSUISL-CSR-2026-TR1-22',
      notes: 'Released for Gamharia test equipment acquisition.',
      recordedBy: 'Meera Chawla',
    },
  ],
  proposals: [
    {
      id: 'PROP-CSR-2026-011',
      challengeId: 'CH-2026-267',
      title: 'Decentralized Graywater Rootzone Phytoremediation for Slum Pockets',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'BioFilter Innovations',
      domain: 'Water & Sanitation',
      location: 'Bhuiyadih Slum Cluster, Ward 8, Jamshedpur',
      budget: 1850000,
      expectedImpact: '4,200 Residents / 120 KLD Graywater Treated',
      submissionDate: '2026-09-15',
      status: 'Pending Review',
      problemStatement: 'Untreated domestic laundry and kitchen sullage flows openly into earthen drains, causing vector-borne health risks.',
      proposedSolution: 'Sub-surface gravel wetland beds planted with Typha and Phragmites species for biological organic reduction.',
      technology: 'Subsurface Phytoremediation Beds & Solar Aerators',
      expectedOutcomes: '90% BOD reduction before open nullah discharge; zero mosquito breeding pools.',
      timeline: '8 Months (Nov 2026 – Jun 2027)',
      csrDomain: 'Urban Water Conservation & Sanitation',
      csrImpact: 'Directly eradicates open standing sewage for 4,200 underprivileged residents.',
      targetCommunity: 'Bhuiyadih Slum Cluster Residents',
      geographicalCoverage: 'Ward 8 Low-Income Informal Settlement Area',
      sustainabilityPotential: 'Gravity-fed system with near-zero electricity or operational maintenance costs.',
      estimatedCsrRequirement: 1850000,
      universityContribution: '₹ 4,00,000 (Water testing lab consumables & mentor hours)',
      industryContribution: '₹ 18,50,000 (Earthworks, gravel media, piping, and plant species)',
    },
    {
      id: 'PROP-CSR-2026-012',
      challengeId: 'CH-2026-289',
      title: 'Low-Emission Biochar Conversion Kiln for Municipal Tree Pruning Biomass',
      university: 'BIT Mesra',
      facultyMentor: 'Dr. Sunita Murmu',
      studentTeam: 'CarbonSink Guild',
      domain: 'Solid Waste Management',
      location: 'Jamshedpur Horticulture Nursery, Telco',
      budget: 2100000,
      expectedImpact: '15 Tons/Month Green Waste Converted into Soil Amendment',
      submissionDate: '2026-09-18',
      status: 'Shortlisted',
      problemStatement: 'Severe open burning of roadside horticulture waste and dry tree prunings creates winter particulate smog.',
      proposedSolution: 'Retort-type flame curtain mobile pyrolysis kilns that convert garden biomass into alkaline biochar.',
      technology: 'Mobile Flame-Curtain Biochar Retort with Syngas Afterburner',
      expectedOutcomes: 'Diverts 100% of municipal green waste from open burning; produces biochar for municipal parks.',
      timeline: '6 Months (Dec 2026 – May 2027)',
      csrDomain: 'Clean Environment & Carbon Sequestration',
      csrImpact: 'Eliminates open particulate burning while generating valuable organic soil fertilizer.',
      targetCommunity: 'Jamshedpur Urban Ecosystem & Telco Horticulture Unit',
      geographicalCoverage: 'Jamshedpur Urban Horticulture Area',
      sustainabilityPotential: 'Biochar sales to local nurseries make project self-financing within 14 months.',
      estimatedCsrRequirement: 2100000,
      universityContribution: '₹ 5,00,000 (Combustion efficiency & BET surface area testing)',
      industryContribution: '₹ 21,00,000 (Fabrication of 3 mobile trailer-mounted kilns)',
    },
    {
      id: 'PROP-CSR-2026-013',
      challengeId: 'CH-2026-302',
      title: 'IoT Vibration & Structural Telemetry for Dilapidated Pedestrian Footbridges',
      university: 'IIT (ISM) Dhanbad',
      facultyMentor: 'Dr. Ramesh Kumar',
      studentTeam: 'BridgeSafe Tech',
      domain: 'Smart Infrastructure & Road Safety',
      location: 'Subarnarekha River Suspension Bridge, Sonari',
      budget: 2500000,
      expectedImpact: '35,000 Weekly Pedestrian Crossing Safety Assured',
      submissionDate: '2026-09-08',
      status: 'Approved',
      problemStatement: 'Corrosion of suspension bridge steel stay cables creates severe risk of structural failure during rush hours.',
      proposedSolution: 'Wireless MEMS accelerometer mesh network with automated modal frequency shift analysis.',
      technology: 'Wireless Industrial MEMS Sensors & LoRaWAN Alert Beacons',
      expectedOutcomes: 'Continuous 24/7 load oscillation telemetry; automated early warning alarms to Municipal PWD.',
      timeline: '9 Months (Oct 2026 – Jun 2027)',
      csrDomain: 'Public Infrastructure Safety & Disaster Prevention',
      csrImpact: 'Prevents catastrophic bridge failure and protects daily pedestrians and schoolchildren.',
      targetCommunity: 'Sonari-Kadma Daily Pedestrian Crossing Public',
      geographicalCoverage: 'Subarnarekha River Pedestrian Suspension Corridors',
      sustainabilityPotential: 'Energy harvesting from bridge micro-vibrations powers telemetry nodes.',
      estimatedCsrRequirement: 2500000,
      universityContribution: '₹ 6,00,000 (Civil structural simulation modeling & lab bench)',
      industryContribution: '₹ 25,00,000 (Industrial sensor acquisition & JNAC integration)',
      reviewDecision: {
        decision: 'Approved',
        reviewer: 'Meera Chawla (CSR Project Lead)',
        reviewDate: '2026-09-20',
        comments: 'Critical public safety application with strong university geotechnical backing. Approved for FY27 Tranche-1 release.',
      },
    },
    {
      id: 'PROP-CSR-2026-014',
      challengeId: 'CH-2026-315',
      title: 'Solar Cold Storage Hub for Perishable Tribal Farmer Produce',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Dr. P. K. Sinha',
      studentTeam: 'AgriCool Dynamics',
      domain: 'Urban Energy & Solar',
      location: 'Potka Agricultural Market Yard (Suburban Jamshedpur)',
      budget: 3400000,
      expectedImpact: '480 Smallholder Tribal Vegetable Farmers',
      submissionDate: '2026-08-25',
      status: 'Changes Requested',
      problemStatement: 'Lack of cold storage forces distress sales of tomatoes and greens at 80% price loss during evening hours.',
      proposedSolution: 'Phase change material (PCM) thermal storage integrated with 10kW rooftop solar array.',
      technology: 'Phase Change Material Thermal Cold Vault + Solar PV',
      expectedOutcomes: 'Extends vegetable freshness by 14 days without relying on diesel backup generators.',
      timeline: '10 Months',
      csrDomain: 'Rural Livelihoods & Clean Energy',
      csrImpact: 'Boosts average farmer household monthly agricultural income by 35%.',
      targetCommunity: 'Smallholder Tribal Vegetable Farmers in Potka Block',
      geographicalCoverage: 'Potka Agricultural Market Yard',
      sustainabilityPotential: 'FPO user fee of ₹ 1/kg covers ongoing preventive maintenance.',
      estimatedCsrRequirement: 3400000,
      universityContribution: '₹ 7,00,000 (Thermal PCM design & thermodynamic simulation)',
      industryContribution: '₹ 34,00,000 (Insulated container, refrigeration compressor, and solar array)',
      reviewDecision: {
        decision: 'Changes Requested',
        reviewer: 'Meera Chawla (CSR Project Lead)',
        reviewDate: '2026-09-12',
        comments: 'Provide Farmer Producer Organization (FPO) formal resolution and land lease agreement before grant sanctioning.',
      },
    },
  ],
  reports: [
    {
      id: 'REP-CSR-2026-01',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry',
      reportType: 'CSR Project Report',
      period: 'Q2 FY 2026–27 (Apr–Sep 2026)',
      title: 'Semi-Annual CSR Project Performance & Telemetry Audit',
      summary: 'Evaluation of pipeline leak mitigation across JNAC Wards 1 to 4 with 8,400 citizen beneficiaries.',
      status: 'Approved',
      submittedDate: '2026-09-18',
      reviewedBy: 'Meera Chawla (CSR Project Lead)',
      executiveSummary: 'The Smart Water Infrastructure initiative supported under Tata Steel CSR has achieved 72% execution across Jamshedpur Notified Area Council Wards 1 through 4. Acoustic FFT vibration telemetry is operating reliably across 24 pipe stations.',
      problemStatement: 'Chronic sub-surface water leakage accounted for up to 40% non-revenue water loss in older municipal mains, leading to pressure loss and contamination.',
      solution: 'Deployment of subterranean piezoelectric pressure transducers and low-power LoRaWAN gateways with automated ML leak classification.',
      progressPercent: 72,
      fundingSummary: {
        approvedAmount: 4500000,
        releasedAmount: 3000000,
        utilizedAmount: 2450000,
        remainingAmount: 1500000,
      },
      socialImpactSummary: {
        peopleBenefited: 8400,
        areasCovered: 'Sakchi Ward 4, Bistupur Boulevard, JNAC Central',
        measuredOutcomes: '42% reduction in water leakage; 3.4M Litres potable water conserved per month; ₹ 8.2 L annual energy savings.',
      },
      nextSteps: 'Complete multi-ward SCADA integration by 15 Oct 2026 and conduct municipal field officer training by Dec 2026.',
    },
    {
      id: 'REP-CSR-2026-02',
      projectId: 'PRJ-CSR-2026-002',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      reportType: 'Project Progress Report',
      period: 'Q2 FY 2026–27',
      title: 'Mid-Term Aerial Photogrammetry & Road Defect Report',
      summary: 'Flight testing and pothole depth mapping along 18 km arterial corridors in Mango and Kadma.',
      status: 'Approved',
      submittedDate: '2026-09-10',
      reviewedBy: 'Meera Chawla (CSR Project Lead)',
      executiveSummary: 'Automated aerial road surface scanning has achieved 60% completion. Drone surveys on Dimna Road and Sonari corridor have verified sub-centimetre pothole depth profiling.',
      problemStatement: 'Manual road defect inspections took weeks, leading to severe monsoon pothole accidents before municipal PWD could schedule repairs.',
      solution: 'Automated photogrammetry mapping using DJI drone sensor payloads and YOLOv10 computer vision edge processing.',
      progressPercent: 60,
      fundingSummary: {
        approvedAmount: 3200000,
        releasedAmount: 2000000,
        utilizedAmount: 1800000,
        remainingAmount: 1200000,
      },
      socialImpactSummary: {
        peopleBenefited: 5500,
        areasCovered: 'Dimna Road Arterial Highway & Kadma Corridor',
        measuredOutcomes: 'Pothole detection time reduced from 14 days to 4 hours; estimated 60% drop in two-wheeler road incidents.',
      },
      nextSteps: 'Conduct Kadma West photogrammetry flights and link telemetry output directly to JNAC PWD dispatch desk.',
    },
    {
      id: 'REP-CSR-2026-03',
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry',
      reportType: 'Financial Report',
      period: 'H1 FY 2026–27',
      title: 'Statutory CSR Expenditure & Utilization Audit Certificate',
      summary: 'External auditor verification of Tranche-1 and Tranche-2 disbursements and university voucher reconciliation.',
      status: 'Approved',
      submittedDate: '2026-09-22',
      reviewedBy: 'Meera Chawla (CSR Project Lead)',
      executiveSummary: 'Statutory audit of CSR funds disbursed to NIT Jamshedpur under Section 135 of Companies Act, 2013. Total sanctioned ₹ 45.00 L, disbursed ₹ 30.00 L, verified utilization ₹ 24.50 L.',
      fundingSummary: {
        approvedAmount: 4500000,
        releasedAmount: 3000000,
        utilizedAmount: 2450000,
        remainingAmount: 1500000,
      },
      socialImpactSummary: {
        peopleBenefited: 8400,
        areasCovered: 'JNAC Wards 1 to 4',
        measuredOutcomes: '100% compliant with Ministry of Corporate Affairs CSR expenditure guidelines.',
      },
      nextSteps: 'Schedule Tranche-3 disbursal upon receipt of final SCADA commissioning voucher.',
    },
  ],
};

// Helper: Get or initialize CSR initiative singleton document
async function getOrCreateCSRDoc() {
  let doc = await CSRInitiative.findOne();
  if (!doc) {
    doc = await CSRInitiative.create(DEFAULT_CSR_DATA);
  }
  return doc;
}

// 1. GET CSR Dashboard
export const getCSRDashboard = async (_req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();

    // Calculate dynamic stats
    const stats = {
      totalInitiatives: doc.totalInitiativesCount || doc.projects.length,
      activeProjects: doc.projects.filter((p) => p.status === 'Active' || p.status === 'At Risk' || p.status === 'Delayed').length,
      fundingAllocated: doc.allocatedBudget,
      fundingAllocatedDisplay: '₹ 1.85 Cr',
      fundingUsed: doc.utilizedBudget,
      fundingUsedDisplay: '₹ 96.40 L',
      projectsCompleted: doc.completedProjectsCount || doc.projects.filter((p) => p.status === 'Completed').length,
      communitiesReached: doc.communitiesReached,
    };

    const fundingOverview = {
      totalAllocated: doc.allocatedBudget,
      totalAllocatedDisplay: '₹ 1.85 Cr',
      released: doc.releasedBudget,
      releasedDisplay: '₹ 1.12 Cr',
      utilized: doc.utilizedBudget,
      utilizedDisplay: '₹ 96.40 L',
      remaining: doc.remainingBudget,
      remainingDisplay: '₹ 73.60 L',
      utilizationPercentage: Math.round((doc.utilizedBudget / doc.allocatedBudget) * 100 * 10) / 10, // ~52.1%
      releasePercentage: Math.round((doc.releasedBudget / doc.allocatedBudget) * 100 * 10) / 10, // ~60.5%
    };

    const activeProjects = doc.projects.map((p) => ({
      projectId: p.projectId,
      projectTitle: p.projectTitle,
      university: p.university,
      domain: p.domain,
      location: p.location,
      progress: p.progress,
      funding: `₹ ${(p.approvedBudget / 100000).toFixed(2)} L`,
      status: p.status,
      stage: p.stage,
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats,
        fundingOverview,
        activeProjects,
        organization: {
          name: doc.organizationName,
          department: doc.department,
          contactPerson: doc.contactPerson,
          officialEmail: doc.officialEmail,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DASHBOARD_ERROR', message: error.message },
    });
  }
};

// 2. GET CSR Opportunities (Societal challenges suitable for CSR support)
export const getCSROpportunities = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { domain, priority, search } = req.query;

    // Opportunities derived from real database proposals and complaints
    let opportunities = doc.proposals.map((prop) => ({
      challengeId: prop.challengeId,
      proposalId: prop.id,
      title: prop.title,
      domain: prop.domain,
      location: prop.location,
      expectedImpact: prop.expectedImpact,
      estimatedBudget: `₹ ${(prop.budget / 100000).toFixed(2)} L`,
      budgetRaw: prop.budget,
      university: prop.university,
      facultyMentor: prop.facultyMentor,
      studentTeam: prop.studentTeam,
      status: prop.status,
      submissionDate: prop.submissionDate,
      problemStatement: prop.problemStatement,
      proposedSolution: prop.proposedSolution,
      technology: prop.technology,
      expectedOutcomes: prop.expectedOutcomes,
      timeline: prop.timeline,
      csrDomain: prop.csrDomain,
      csrImpact: prop.csrImpact,
      targetCommunity: prop.targetCommunity,
      geographicalCoverage: prop.geographicalCoverage,
      sustainabilityPotential: prop.sustainabilityPotential,
      universityContribution: prop.universityContribution,
      industryContribution: prop.industryContribution,
    }));

    if (domain && domain !== 'All') {
      opportunities = opportunities.filter((o) => o.domain.toLowerCase().includes((domain as string).toLowerCase()));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      opportunities = opportunities.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.challengeId.toLowerCase().includes(q) ||
          o.university.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        opportunities,
        total: opportunities.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OPPORTUNITIES_ERROR', message: error.message },
    });
  }
};

// 3. GET Opportunity Details
export const getCSROpportunityDetails = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { id } = req.params;

    const proposal = doc.proposals.find((p) => p.challengeId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Opportunity not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { opportunity: proposal },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DETAILS_ERROR', message: error.message },
    });
  }
};

// 4. GET Project Selection (Proposals by tab)
export const getCSRProjectSelection = async (_req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();

    const pendingReview = doc.proposals.filter((p) => p.status === 'Pending Review');
    const shortlisted = doc.proposals.filter((p) => p.status === 'Shortlisted');
    const approved = doc.proposals.filter((p) => p.status === 'Approved');
    const changesRequested = doc.proposals.filter((p) => p.status === 'Changes Requested');
    const rejected = doc.proposals.filter((p) => p.status === 'Rejected');

    return res.status(200).json({
      success: true,
      data: {
        proposals: doc.proposals,
        counts: {
          all: doc.proposals.length,
          pendingReview: pendingReview.length,
          shortlisted: shortlisted.length,
          approved: approved.length,
          changesRequested: changesRequested.length,
          rejected: rejected.length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SELECTION_ERROR', message: error.message },
    });
  }
};

// 5. POST Proposal Review Decision
export const reviewCSRProposal = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { id } = req.params;
    const { decision, comments } = req.body;

    if (!decision) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Review decision is required.' },
      });
    }

    const proposal = doc.proposals.find((p) => p.id === id || p.challengeId === id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Proposal not found.' },
      });
    }

    // Map decision to proposal status
    let newStatus: 'Approved' | 'Changes Requested' | 'Rejected' | 'Shortlisted' = 'Shortlisted';
    if (decision === 'Approve') newStatus = 'Approved';
    else if (decision === 'Request Changes') newStatus = 'Changes Requested';
    else if (decision === 'Reject') newStatus = 'Rejected';
    else if (decision === 'Shortlist') newStatus = 'Shortlisted';

    proposal.status = newStatus;
    proposal.reviewDecision = {
      decision: newStatus,
      reviewer: (req as any).user?.name || 'Meera Chawla (CSR Project Lead)',
      reviewDate: new Date().toISOString().split('T')[0],
      comments: comments || 'Review decision submitted.',
    };

    // If approved, create or link into active projects
    if (newStatus === 'Approved') {
      const existingProject = doc.projects.find((p) => p.challengeId === proposal.challengeId);
      if (!existingProject) {
        doc.projects.push({
          projectId: `PRJ-CSR-2026-00${doc.projects.length + 1}`,
          challengeId: proposal.challengeId,
          projectTitle: proposal.title,
          university: proposal.university,
          studentTeam: proposal.studentTeam,
          facultyMentor: proposal.facultyMentor,
          industryMentor: 'Suresh Nambiar',
          csrProjectLead: 'Meera Chawla',
          domain: proposal.domain,
          location: proposal.location,
          stage: 'Approved',
          progress: 5,
          approvedBudget: proposal.budget,
          releasedFunding: 0,
          utilizedFunding: 0,
          remainingFunding: proposal.budget,
          status: 'Active',
          nextMilestone: 'MLS-01: Baseline Calibration & Tranche-1 Grant Release',
          milestones: [
            { id: 'MLS-01', title: 'Baseline Calibration & Tranche-1 Release', dueDate: '2026-11-15', progress: 0, status: 'Upcoming' },
            { id: 'MLS-02', title: 'Mid-term Prototype Field Demonstration', dueDate: '2027-02-15', progress: 0, status: 'Upcoming' },
          ],
          deliverables: [],
          risks: [],
          impact: {
            targetCommunity: proposal.targetCommunity,
            peopleBenefited: 2500,
            villagesCovered: 1,
            measuredOutcome: proposal.expectedImpact,
            infrastructureCreated: 'Under Development',
            serviceImprovement: 'Under Evaluation',
            costReduction: 'Under Assessment',
            environmentalImpact: proposal.csrImpact,
            verificationStatus: 'Pending Audit',
          },
        });
        doc.activeProjectsCount = doc.projects.filter((p) => p.status === 'Active').length;
      }
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: `Proposal successfully updated to ${newStatus}.`,
        proposal,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REVIEW_ERROR', message: error.message },
    });
  }
};

// 6. GET Active CSR Projects
export const getCSRProjects = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { tab } = req.query;

    let projects = doc.projects;
    if (tab === 'Active') projects = projects.filter((p) => p.status === 'Active');
    else if (tab === 'At Risk') projects = projects.filter((p) => p.status === 'At Risk');
    else if (tab === 'Delayed') projects = projects.filter((p) => p.status === 'Delayed');
    else if (tab === 'Completed') projects = projects.filter((p) => p.status === 'Completed');

    return res.status(200).json({
      success: true,
      data: {
        projects,
        counts: {
          all: doc.projects.length,
          active: doc.projects.filter((p) => p.status === 'Active').length,
          atRisk: doc.projects.filter((p) => p.status === 'At Risk').length,
          delayed: doc.projects.filter((p) => p.status === 'Delayed').length,
          completed: doc.projects.filter((p) => p.status === 'Completed').length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROJECTS_ERROR', message: error.message },
    });
  }
};

// 7. GET CSR Project Details
export const getCSRProjectDetails = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { id } = req.params;

    const project = doc.projects.find((p) => p.projectId === id || p.challengeId === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROJECT_ERROR', message: error.message },
    });
  }
};

// 8. GET CSR Funding Management
export const getCSRFunding = async (_req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();

    const summary = {
      totalAllocated: doc.allocatedBudget,
      totalReleased: doc.releasedBudget,
      totalUtilized: doc.utilizedBudget,
      totalRemaining: doc.remainingBudget,
    };

    const projectFunding = doc.projects.map((p) => ({
      projectId: p.projectId,
      projectTitle: p.projectTitle,
      university: p.university,
      approvedBudget: p.approvedBudget,
      approvedAmountDisplay: `₹ ${(p.approvedBudget / 100000).toFixed(2)} L`,
      released: p.releasedFunding,
      releasedDisplay: `₹ ${(p.releasedFunding / 100000).toFixed(2)} L`,
      utilized: p.utilizedFunding,
      utilizedDisplay: `₹ ${(p.utilizedFunding / 100000).toFixed(2)} L`,
      remaining: p.approvedBudget - p.releasedFunding,
      remainingDisplay: `₹ ${((p.approvedBudget - p.releasedFunding) / 100000).toFixed(2)} L`,
      status:
        p.releasedFunding === 0
          ? 'Pending'
          : p.releasedFunding < p.approvedBudget
          ? 'Partially Released'
          : p.utilizedFunding >= p.releasedFunding
          ? 'Completed'
          : 'Released',
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary,
        projectFunding,
        releases: doc.fundingReleases,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FUNDING_ERROR', message: error.message },
    });
  }
};

// 9. POST Record Funding Release
export const createCSRFundingRelease = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { projectId, releaseAmount, releaseDate, fundingPhase, referenceNumber, notes } = req.body;

    if (!projectId || !releaseAmount || !releaseDate || !referenceNumber) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project, amount, date, and reference number are required.' },
      });
    }

    const amountNum = Number(releaseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'Release amount must be a positive number.' },
      });
    }

    const project = doc.projects.find((p) => p.projectId === projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' },
      });
    }

    const currentRemaining = project.approvedBudget - project.releasedFunding;
    if (amountNum > currentRemaining) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXCEEDS_BUDGET',
          message: `Release amount (₹ ${amountNum.toLocaleString('en-IN')}) exceeds unreleased approved balance (₹ ${currentRemaining.toLocaleString('en-IN')}).`,
        },
      });
    }

    // Record release
    const newRelease: ICSRFundingRelease = {
      id: `REL-2026-0${doc.fundingReleases.length + 1}`,
      projectId: project.projectId,
      projectTitle: project.projectTitle,
      university: project.university,
      releaseAmount: amountNum,
      releaseDate,
      fundingPhase: fundingPhase || 'Interim Grant Tranche',
      referenceNumber,
      notes: notes || '',
      recordedBy: (req as any).user?.name || 'Meera Chawla',
    };

    doc.fundingReleases.unshift(newRelease);

    // Update project numbers
    project.releasedFunding += amountNum;
    project.remainingFunding = project.approvedBudget - project.releasedFunding;
    if (project.stage === 'Approved') project.stage = 'Funding Released';

    // Update global budget
    doc.releasedBudget += amountNum;
    doc.remainingBudget = doc.allocatedBudget - doc.releasedBudget;

    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Funding release recorded successfully.',
        release: newRelease,
        project,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'RELEASE_ERROR', message: error.message },
    });
  }
};

// 10. GET Impact & Outcomes
export const getCSRImpact = async (_req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();

    const metrics = {
      peopleBenefited: doc.communitiesReached,
      villagesCovered: 14,
      projectsCompleted: doc.completedProjectsCount,
      problemsAddressed: 12,
    };

    const impactRecords = doc.projects.map((p) => ({
      projectId: p.projectId,
      projectTitle: p.projectTitle,
      university: p.university,
      domain: p.domain,
      targetCommunity: p.impact.targetCommunity,
      peopleBenefited: p.impact.peopleBenefited,
      villagesCovered: p.impact.villagesCovered,
      measuredOutcome: p.impact.measuredOutcome,
      infrastructureCreated: p.impact.infrastructureCreated,
      serviceImprovement: p.impact.serviceImprovement,
      costReduction: p.impact.costReduction,
      environmentalImpact: p.impact.environmentalImpact,
      verificationStatus: p.impact.verificationStatus,
    }));

    return res.status(200).json({
      success: true,
      data: {
        metrics,
        impactRecords,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'IMPACT_ERROR', message: error.message },
    });
  }
};

// 11. GET Reports
export const getCSRReports = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { type } = req.query;

    let reports = doc.reports;
    if (type && type !== 'All') {
      reports = reports.filter((r) => r.reportType.toLowerCase().includes((type as string).toLowerCase()));
    }

    return res.status(200).json({
      success: true,
      data: { reports },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REPORTS_ERROR', message: error.message },
    });
  }
};

// 12. CREATE Report
export const createCSRReport = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { projectId, reportType, period, title, summary } = req.body;

    if (!projectId || !reportType || !period || !title) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project, report type, period, and title are required.' },
      });
    }

    const project = doc.projects.find((p) => p.projectId === projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' },
      });
    }

    const newReport: ICSRReport = {
      id: `REP-CSR-2026-0${doc.reports.length + 1}`,
      projectId: project.projectId,
      projectTitle: project.projectTitle,
      reportType,
      period,
      title,
      summary: summary || `Official ${reportType} for ${project.projectTitle}.`,
      status: 'Approved',
      submittedDate: new Date().toISOString().split('T')[0],
      reviewedBy: (req as any).user?.name || 'Meera Chawla (CSR Project Lead)',
      executiveSummary: summary || `Detailed quarterly progress evaluation for ${project.projectTitle}.`,
      problemStatement: `Societal challenge addressal under ${project.domain} domain in ${project.location}.`,
      solution: `R&D prototype developed in collaboration with ${project.university}.`,
      progressPercent: project.progress,
      fundingSummary: {
        approvedAmount: project.approvedBudget,
        releasedAmount: project.releasedFunding,
        utilizedAmount: project.utilizedFunding,
        remainingAmount: project.approvedBudget - project.releasedFunding,
      },
      socialImpactSummary: {
        peopleBenefited: project.impact.peopleBenefited,
        areasCovered: project.location,
        measuredOutcomes: project.impact.measuredOutcome,
      },
      nextSteps: project.nextMilestone || 'Milestone verification and stakeholder audit.',
    };

    doc.reports.unshift(newReport);
    await doc.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'CSR report created successfully.',
        report: newReport,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CREATE_REPORT_ERROR', message: error.message },
    });
  }
};

// 13. GET Profile
export const getCSRProfile = async (_req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          name: doc.contactPerson,
          role: 'CSR & Project Lead',
          organization: doc.organizationName,
          department: doc.department,
          officialEmail: doc.officialEmail,
          contact: doc.contactNumber,
          cinNumber: doc.cinNumber,
          csrRegistrationNumber: doc.csrRegistrationNumber,
          annualBudgetPool: doc.annualBudgetPool,
          csrDomains: doc.csrDomains,
          areasOfExpertise: doc.areasOfExpertise,
          industryPartnerships: doc.industryPartnerships,
          activeProjectsCount: doc.projects.filter((p) => p.status === 'Active').length,
          completedProjectsCount: doc.completedProjectsCount,
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

// 14. UPDATE Profile
export const updateCSRProfile = async (req: Request, res: Response) => {
  try {
    const doc = await getOrCreateCSRDoc();
    const { contactNumber, csrDomains, areasOfExpertise } = req.body;

    if (contactNumber) doc.contactNumber = contactNumber;
    if (csrDomains) doc.csrDomains = csrDomains;
    if (areasOfExpertise) doc.areasOfExpertise = areasOfExpertise;

    await doc.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Profile updated successfully.',
        profile: {
          name: doc.contactPerson,
          role: 'CSR & Project Lead',
          organization: doc.organizationName,
          department: doc.department,
          officialEmail: doc.officialEmail,
          contact: doc.contactNumber,
          csrDomains: doc.csrDomains,
          areasOfExpertise: doc.areasOfExpertise,
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
