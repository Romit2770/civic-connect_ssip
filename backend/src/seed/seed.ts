import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Ward } from '../models/Ward';
import { Complaint } from '../models/Complaint';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory';
import { ComplaintAssignment } from '../models/ComplaintAssignment';
import { ComplaintComment } from '../models/ComplaintComment';
import { SLAConfiguration } from '../models/SLAConfiguration';
import { Notification } from '../models/Notification';
import { AIAnalysis } from '../models/AIAnalysis';
import { AuditLog } from '../models/AuditLog';

// Base coordinates for municipal city model (Ahmedabad Smart City urban grid)
const BASE_LNG = 72.5714;
const BASE_LAT = 23.0225;

async function seed() {
  try {
    console.log('🌱 Starting CivicConnect Municipal Seed Database Script...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Ward.deleteMany({}),
      Complaint.deleteMany({}),
      ComplaintStatusHistory.deleteMany({}),
      ComplaintAssignment.deleteMany({}),
      ComplaintComment.deleteMany({}),
      SLAConfiguration.deleteMany({}),
      Notification.deleteMany({}),
      AIAnalysis.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('🧹 Cleaned existing database collections.');

    // 1. Seed Departments (with Controlled Department Codes)
    const departmentsData = [
      {
        name: 'Public Works Department',
        code: 'PUBLIC_WORKS' as const,
        slug: 'public_works',
        description: 'Road infrastructure, potholes, bridges, sidewalks, and civil structures.',
        categories: ['pothole', 'broken road', 'damaged footpath', 'road infrastructure', 'damaged pavement', 'road_damage', 'public_property'],
        contactEmail: 'pwd@civicconnect.gov.in',
        contactPhone: '079-25350001',
        icon: 'hammer',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Solid Waste Management & Sanitation',
        code: 'SANITATION' as const,
        slug: 'sanitation',
        description: 'Garbage collection, street sweeping, illegal dumping, and public cleanliness.',
        categories: ['overflowing garbage bin', 'garbage collection', 'illegal dumping', 'waste accumulation', 'public cleanliness', 'garbage vehicle issue', 'garbage'],
        contactEmail: 'sanitation@civicconnect.gov.in',
        contactPhone: '079-25350002',
        icon: 'trash-2',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Electrical & Street Lighting',
        code: 'STREET_LIGHTING' as const,
        slug: 'electrical',
        description: 'Streetlights, electrical poles, junction boxes, and street illumination.',
        categories: ['broken streetlight', 'streetlight not working', 'damaged electric pole', 'dark street', 'streetlight'],
        contactEmail: 'electrical@civicconnect.gov.in',
        contactPhone: '079-25350003',
        icon: 'lightbulb',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Water Supply Department',
        code: 'WATER_SUPPLY' as const,
        slug: 'water_supply',
        description: 'Potable water pipelines, distribution network, leakages, and water tankers.',
        categories: ['water leakage', 'broken water pipeline', 'water supply problem', 'public tap issue', 'water'],
        contactEmail: 'water@civicconnect.gov.in',
        contactPhone: '079-25350004',
        icon: 'droplets',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Drainage & Sewerage Department',
        code: 'SEWERAGE' as const,
        slug: 'drainage',
        description: 'Underground sewerage, manholes, rainwater drains, and waterlogging control.',
        categories: ['sewage overflow', 'blocked sewer', 'sewer problem', 'drainage overflow', 'drainage'],
        contactEmail: 'drainage@civicconnect.gov.in',
        contactPhone: '079-25350005',
        icon: 'waves',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Parks, Gardens & Environment',
        code: 'PARKS_AND_GARDENS' as const,
        slug: 'parks_gardens',
        description: 'Municipal parks, tree maintenance, fallen branches, and green spaces.',
        categories: ['park maintenance', 'damaged garden', 'tree maintenance', 'public green-space issue', 'fallen_tree'],
        contactEmail: 'parks@civicconnect.gov.in',
        contactPhone: '079-25350006',
        icon: 'trees',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Traffic & Road Safety Department',
        code: 'TRAFFIC_AND_ROADS' as const,
        slug: 'traffic_roads',
        description: 'Traffic signals, road signage, speed breakers, and pedestrian crossings.',
        categories: ['traffic signal', 'road signage', 'traffic infrastructure', 'road safety infrastructure', 'traffic'],
        contactEmail: 'traffic@civicconnect.gov.in',
        contactPhone: '079-25350007',
        icon: 'car',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
      {
        name: 'Nodal / General Grievance Pool',
        code: 'OTHER' as const,
        slug: 'other',
        description: 'Unclassified, multi-departmental, or ambiguous civic grievances.',
        categories: ['unclear issue', 'unsupported category', 'low-confidence classification', 'other'],
        contactEmail: 'nodal@civicconnect.gov.in',
        contactPhone: '079-25350008',
        icon: 'building-2',
        active: true,
        notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
      },
    ];

    const createdDepts = await Department.insertMany(departmentsData);
    const deptMap = new Map(createdDepts.map((d) => [d.slug, d._id]));
    console.log(`✅ Seeded ${createdDepts.length} Municipal Departments with Controlled Codes.`);

    // 2. Seed Wards (Wards 1 to 10 with realistic GeoJSON Polygons)
    const wardsData = [];
    for (let i = 1; i <= 10; i++) {
      const offsetLng = (i % 3 - 1) * 0.03;
      const offsetLat = (Math.floor((i - 1) / 3) - 1) * 0.03;
      const centerLng = BASE_LNG + offsetLng;
      const centerLat = BASE_LAT + offsetLat;
      const delta = 0.015;

      const polyCoordinates = [
        [
          [centerLng - delta, centerLat - delta],
          [centerLng + delta, centerLat - delta],
          [centerLng + delta, centerLat + delta],
          [centerLng - delta, centerLat + delta],
          [centerLng - delta, centerLat - delta],
        ],
      ];

      wardsData.push({
        wardNumber: i,
        name: `Ward ${i} (${['Navrangpura', 'Paldi', 'Sabarmati', 'Maninagar', 'Vastrapur', 'Bodakdev', 'Satellite', 'Ellisbridge', 'Naranpura', 'Ghatlodia'][i - 1]})`,
        zone: i <= 3 ? 'West Zone' : i <= 6 ? 'North-West Zone' : i <= 8 ? 'Central Zone' : 'South Zone',
        population: 45000 + i * 5000,
        centerPoint: {
          type: 'Point' as const,
          coordinates: [centerLng, centerLat] as [number, number],
        },
        boundary: {
          type: 'Polygon' as const,
          coordinates: polyCoordinates,
        },
        contactPhone: `079-2685000${i}`,
      });
    }

    const createdWards = await Ward.insertMany(wardsData);
    console.log(`✅ Seeded ${createdWards.length} Municipal Wards with GeoJSON Polygons.`);

    // 3. Seed Users (Super Admin, Municipal Admin, Dept Admins, Field Officers, Citizens)
    const usersToCreate = [
      {
        name: 'Municipal Commissioner (Super Admin)',
        email: 'superadmin@civicconnect.gov.in',
        password: 'Admin@123',
        phone: '+91 9876543210',
        role: 'super_admin' as const,
      },
      {
        name: 'Chief Control Room Admin',
        email: 'admin@civicconnect.gov.in',
        password: 'Admin@123',
        phone: '+91 9876543211',
        role: 'municipal_admin' as const,
      },
      // Department Admins
      {
        name: 'Executive Engineer (PWD)',
        email: 'pwd.head@civicconnect.gov.in',
        password: 'Admin@123',
        phone: '+91 9876543212',
        role: 'department_officer' as const,
        departmentId: deptMap.get('public_works'),
      },
      {
        name: 'Chief Sanitation Inspector',
        email: 'sanitation.head@civicconnect.gov.in',
        password: 'Admin@123',
        phone: '+91 9876543213',
        role: 'department_officer' as const,
        departmentId: deptMap.get('sanitation'),
      },
      // Field Officers
      {
        name: 'Rajesh Patel (PWD Inspector)',
        email: 'officer.rajesh@civicconnect.gov.in',
        password: 'Officer@123',
        phone: '+91 9876543220',
        role: 'field_officer' as const,
        departmentId: deptMap.get('public_works'),
        wardId: createdWards[0]._id,
        badgeNumber: 'PWD-FO-101',
      },
      {
        name: 'Priya Sharma (Sanitation Officer)',
        email: 'officer.priya@civicconnect.gov.in',
        password: 'Officer@123',
        phone: '+91 9876543221',
        role: 'field_officer' as const,
        departmentId: deptMap.get('sanitation'),
        wardId: createdWards[1]._id,
        badgeNumber: 'SWM-FO-204',
      },
      {
        name: 'Vikram Desai (Electrical Line Inspector)',
        email: 'officer.vikram@civicconnect.gov.in',
        password: 'Officer@123',
        phone: '+91 9876543222',
        role: 'field_officer' as const,
        departmentId: deptMap.get('electrical'),
        wardId: createdWards[2]._id,
        badgeNumber: 'ELE-FO-302',
      },
      {
        name: 'Anita Verma (Water & Drainage Engineer)',
        email: 'officer.anita@civicconnect.gov.in',
        password: 'Officer@123',
        phone: '+91 9876543223',
        role: 'field_officer' as const,
        departmentId: deptMap.get('water_supply'),
        wardId: createdWards[3]._id,
        badgeNumber: 'WTR-FO-405',
      },
      // Citizens
      {
        name: 'Rahul Mehta',
        email: 'citizen.rahul@example.com',
        password: 'Citizen@123',
        phone: '+91 9825012345',
        role: 'citizen' as const,
      },
      {
        name: 'Sneha Dave',
        email: 'citizen.sneha@example.com',
        password: 'Citizen@123',
        phone: '+91 9825012346',
        role: 'citizen' as const,
      },
      {
        name: 'Arjun Shah',
        email: 'citizen.arjun@example.com',
        password: 'Citizen@123',
        phone: '+91 9825012347',
        role: 'citizen' as const,
      },
      // University / Higher Education Institution Roles
      {
        name: 'Dr. Ramesh Kumar',
        email: 'univ.admin@nitjsr.ac.in',
        password: 'Univ@123',
        phone: '+91 9431102901',
        role: 'university_admin' as const,
        institutionName: 'National Institute of Technology Jamshedpur',
      },
      {
        name: 'Prof. Ananya Sen',
        email: 'faculty.mentor@bitmesra.ac.in',
        password: 'Faculty@123',
        phone: '+91 9431102902',
        role: 'faculty_mentor' as const,
        institutionName: 'Birla Institute of Technology Mesra',
      },
      {
        name: 'Aakash Verma',
        email: 'student.lead@iitism.ac.in',
        password: 'Student@123',
        phone: '+91 9431102903',
        role: 'student_lead' as const,
        institutionName: 'IIT (ISM) Dhanbad',
      },
      // Industry, CSR & Corporate Partner Roles
      {
        name: 'Suresh Nambiar',
        email: 'industry.admin@tatasteel.com',
        password: 'Industry@123',
        phone: '+91 9835102904',
        role: 'industry_admin' as const,
        organizationName: 'Tata Steel Ltd. Urban Innovation Division',
      },
      {
        name: 'Meera Chawla',
        email: 'csr.lead@tata.com',
        password: 'Industry@123',
        phone: '+91 9835102905',
        role: 'csr_lead' as const,
        organizationName: 'Tata Community Initiatives Trust',
      },
      {
        name: 'Rohan Mittal',
        email: 'partner.lead@jindalsteel.com',
        password: 'Industry@123',
        phone: '+91 9835102906',
        role: 'corporate_partner' as const,
        organizationName: 'Jindal Steel & Power CSR Wing',
      },
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`✅ Seeded ${createdUsers.length} Users across all municipal roles.`);

    const citizenRahul = createdUsers.find((u) => u.email === 'citizen.rahul@example.com')!;
    const citizenSneha = createdUsers.find((u) => u.email === 'citizen.sneha@example.com')!;
    const officerRajesh = createdUsers.find((u) => u.email === 'officer.rajesh@civicconnect.gov.in')!;
    const officerPriya = createdUsers.find((u) => u.email === 'officer.priya@civicconnect.gov.in')!;
    const officerVikram = createdUsers.find((u) => u.email === 'officer.vikram@civicconnect.gov.in')!;

    // 4. Seed SLA Configurations
    const categoriesList = [
      'pothole', 'garbage', 'streetlight', 'water', 'drainage',
      'road_damage', 'public_property', 'fallen_tree', 'illegal_dumping',
      'traffic', 'other',
    ] as const;

    const prioritiesList = ['low', 'medium', 'high', 'critical'] as const;

    const slaConfigs = [];
    for (const cat of categoriesList) {
      for (const pri of prioritiesList) {
        let resHours = 48;
        let respHours = 4;

        if (pri === 'critical') {
          resHours = cat === 'water' || cat === 'traffic' || cat === 'fallen_tree' ? 4 : 12;
          respHours = 1;
        } else if (pri === 'high') {
          resHours = cat === 'garbage' ? 12 : 24;
          respHours = 2;
        } else if (pri === 'medium') {
          resHours = 48;
          respHours = 6;
        } else {
          resHours = 96;
          respHours = 12;
        }

        slaConfigs.push({
          category: cat,
          priority: pri,
          responseTimeHours: respHours,
          resolutionTimeHours: resHours,
          escalationLevel: pri === 'critical' ? 2 : 1,
          warningThresholdPercent: 75,
        });
      }
    }

    await SLAConfiguration.insertMany(slaConfigs);
    console.log(`✅ Seeded ${slaConfigs.length} SLA standard rules.`);

    // 5. Seed Realistic Complaints
    const sampleComplaints = [
      {
        complaintNumber: 'CC-2026-000101',
        title: 'Road Pothole: Deep crater near Navrangpura crossroads',
        description: 'Large and deep pothole causing severe traffic slowdown and severe risk to two-wheelers during evening rush hours.',
        category: 'pothole' as const,
        subcategory: 'Severe Asphalt Crater',
        status: 'in_progress' as const,
        priority: 'high' as const,
        priorityScore: 78,
        priorityExplanation: ['High physical severity (8/10)', 'Arterial transit road', 'Multi-citizen reports'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG + 0.005, BASE_LAT + 0.004] as [number, number],
          address: 'Near Navrangpura Cross Road, Ward 1',
        },
        wardId: createdWards[0]._id,
        departmentId: deptMap.get('public_works'),
        assignedOfficerId: officerRajesh._id,
        reportedBy: citizenRahul._id,
        photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60'],
        slaDeadline: new Date(Date.now() + 8 * 3600 * 1000), // 8 hours left
        slaState: 'within_sla' as const,
        reportCount: 3,
        createdAt: new Date(Date.now() - 16 * 3600 * 1000),
      },
      {
        complaintNumber: 'CC-2026-000102',
        title: 'Garbage Overflow: Large commercial dumpster overflowing on street',
        description: 'Sanitation bin overflowing for 3 days, foul odor spreading, stray cattle gathering around food waste.',
        category: 'garbage' as const,
        subcategory: 'Commercial Bin Overflow',
        status: 'verification_pending' as const,
        priority: 'medium' as const,
        priorityScore: 55,
        priorityExplanation: ['Public health hazard', '3 days pending'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG - 0.008, BASE_LAT + 0.006] as [number, number],
          address: 'Vegetable Market Lane, Paldi Ward 2',
        },
        wardId: createdWards[1]._id,
        departmentId: deptMap.get('sanitation'),
        assignedOfficerId: officerPriya._id,
        reportedBy: citizenSneha._id,
        photos: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60'],
        resolutionEvidence: {
          photos: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60'],
          description: 'Waste completely cleared with hydraulic compactor and bin sanitized with lime powder.',
          resolvedBy: officerPriya._id,
          resolvedAt: new Date(Date.now() - 1 * 3600 * 1000),
          aiVerificationScore: 0.92,
          aiVerificationStatus: 'likely_resolved' as const,
          aiVerificationReason: 'After photo indicates clean pavement and emptied container.',
        },
        slaDeadline: new Date(Date.now() + 12 * 3600 * 1000),
        slaState: 'within_sla' as const,
        reportCount: 1,
        createdAt: new Date(Date.now() - 11 * 3600 * 1000),
      },
      {
        complaintNumber: 'CC-2026-000103',
        title: 'Defective Streetlight: Cluster of 4 poles dark on main lane',
        description: 'Complete blackout for past two nights on residential lane. Dangerous for pedestrians and female commuters.',
        category: 'streetlight' as const,
        subcategory: 'Multiple Streetlight Blackout',
        status: 'assigned' as const,
        priority: 'high' as const,
        priorityScore: 72,
        priorityExplanation: ['Night safety hazard', '4 light poles down'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG + 0.012, BASE_LAT - 0.008] as [number, number],
          address: 'Sabarmati Riverfront Link Road, Ward 3',
        },
        wardId: createdWards[2]._id,
        departmentId: deptMap.get('electrical'),
        assignedOfficerId: officerVikram._id,
        reportedBy: citizenRahul._id,
        photos: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60'],
        slaDeadline: new Date(Date.now() + 4 * 3600 * 1000), // Due in 4 hrs (Due Soon)
        slaState: 'due_soon' as const,
        slaNotifiedDueSoon: true,
        reportCount: 2,
        createdAt: new Date(Date.now() - 20 * 3600 * 1000),
      },
      {
        complaintNumber: 'CC-2026-000104',
        title: 'Water Supply: Underground potable main pipe burst',
        description: 'Massive drinking water fountain on main road. Thousands of liters of drinking water being wasted.',
        category: 'water' as const,
        subcategory: 'Major Pipeline Burst',
        status: 'resolved' as const,
        priority: 'critical' as const,
        priorityScore: 95,
        priorityExplanation: ['Critical drinking water wastage', 'Road base erosion risk'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG + 0.018, BASE_LAT + 0.015] as [number, number],
          address: 'Vastrapur Lake Outer Circle, Ward 5',
        },
        wardId: createdWards[4]._id,
        departmentId: deptMap.get('water_supply'),
        reportedBy: citizenSneha._id,
        photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60'],
        resolutionEvidence: {
          photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60'],
          description: 'Replaced ruptured 150mm ductile iron pipe section and pressure-tested successfully.',
          resolvedAt: new Date(Date.now() - 3 * 3600 * 1000),
          aiVerificationStatus: 'likely_resolved' as const,
        },
        satisfactionRating: 5,
        resolutionFeedback: {
          rating: 5,
          comment: 'Quick response within 3 hours! Truly government grade.',
          submittedAt: new Date(Date.now() - 2 * 3600 * 1000),
          submittedBy: citizenSneha._id,
        },
        resolvedAt: new Date(Date.now() - 3 * 3600 * 1000),
        closedAt: new Date(Date.now() - 2 * 3600 * 1000),
        slaDeadline: new Date(Date.now() - 1 * 3600 * 1000),
        slaState: 'within_sla' as const,
        reportCount: 4,
        createdAt: new Date(Date.now() - 6 * 3600 * 1000),
      },
      {
        complaintNumber: 'CC-2026-000105',
        title: 'Blocked Drainage: Manhole overflowing on commercial walkway',
        description: 'Black sewage overflowing on walkway. Health risk to nearby food stalls.',
        category: 'drainage' as const,
        subcategory: 'Manhole Sewage Blockage',
        status: 'submitted' as const,
        priority: 'high' as const,
        priorityScore: 75,
        priorityExplanation: ['Sanitation hazard', 'Pedestrian corridor'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG - 0.015, BASE_LAT - 0.012] as [number, number],
          address: 'Maninagar Railway Station Approach, Ward 4',
        },
        wardId: createdWards[3]._id,
        departmentId: deptMap.get('drainage'),
        reportedBy: citizenRahul._id,
        photos: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60'],
        slaDeadline: new Date(Date.now() - 5 * 3600 * 1000), // Overdue / Breached
        slaState: 'breached' as const,
        breachedAt: new Date(Date.now() - 5 * 3600 * 1000),
        slaNotifiedBreached: true,
        reportCount: 1,
        createdAt: new Date(Date.now() - 30 * 3600 * 1000),
      },
      {
        complaintNumber: 'CC-2026-000106',
        title: 'Fallen Tree: Heavy neem tree branch blocking lane',
        description: 'Large tree branch broken after sudden squall. Electricity wire is bent underneath.',
        category: 'fallen_tree' as const,
        subcategory: 'Tree Branch on Power Line',
        status: 'reopened' as const,
        priority: 'critical' as const,
        priorityScore: 90,
        priorityExplanation: ['Powerline entanglement risk', 'Citizen reopened case'],
        location: {
          type: 'Point' as const,
          coordinates: [BASE_LNG + 0.022, BASE_LAT - 0.018] as [number, number],
          address: 'Near Ellisbridge Gymkhana, Ward 8',
        },
        wardId: createdWards[7]._id,
        departmentId: deptMap.get('parks_gardens'),
        reportedBy: citizenRahul._id,
        photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=60'],
        slaDeadline: new Date(Date.now() + 6 * 3600 * 1000),
        slaState: 'within_sla' as const,
        reportCount: 2,
        createdAt: new Date(Date.now() - 18 * 3600 * 1000),
      },
    ];

    for (const c of sampleComplaints) {
      const complaint = await Complaint.create(c);

      // Create AI Analysis record
      await AIAnalysis.create({
        complaintId: complaint._id,
        provider: 'gemini',
        category: complaint.category,
        subcategory: complaint.subcategory,
        severity: complaint.priority === 'critical' ? 9 : complaint.priority === 'high' ? 7 : 5,
        priority: complaint.priority,
        confidence: 0.91,
        departmentSlug: 'public_works',
        summary: complaint.title,
        hazards: complaint.priorityExplanation || ['General safety risk'],
        reasoning: 'Multimodal vision model detected surface and environmental defect matching municipal grievance criteria.',
        analysisMethod: 'Gemini 1.5 Flash Vision',
      });

      // Status history
      await ComplaintStatusHistory.create({
        complaintId: complaint._id,
        fromStatus: null,
        toStatus: 'submitted',
        changedBy: complaint.reportedBy,
        note: 'Initial citizen submission',
      });

      if (complaint.status !== 'submitted') {
        await ComplaintStatusHistory.create({
          complaintId: complaint._id,
          fromStatus: 'submitted',
          toStatus: complaint.status,
          changedBy: officerRajesh._id,
          note: `Operational progress: ${complaint.status}`,
        });
      }

      // Sample Comments
      await ComplaintComment.create({
        complaintId: complaint._id,
        authorId: complaint.reportedBy,
        authorRole: 'citizen',
        authorName: 'Citizen Reporter',
        message: 'Please resolve quickly, elderly residents pass through this lane daily.',
        isInternal: false,
      });

      if (complaint.assignedOfficerId) {
        await ComplaintComment.create({
          complaintId: complaint._id,
          authorId: complaint.assignedOfficerId,
          authorRole: 'field_officer',
          authorName: 'Assigned Field Officer',
          message: 'Inspection scheduled. Repair crew dispatched with equipment.',
          isInternal: false,
        });
      }
    }

    console.log(`✅ Seeded ${sampleComplaints.length} Realistic Grievances across all lifecycle states.`);

    // 6. Seed In-App Notifications
    await Notification.create([
      {
        userId: citizenRahul._id,
        type: 'complaint_in_progress',
        title: 'Work In Progress: CC-2026-000101',
        message: 'Field Officer Rajesh Patel has initiated repairs for your road pothole complaint.',
        complaintNumber: 'CC-2026-000101',
      },
      {
        userId: citizenSneha._id,
        type: 'verification_requested',
        title: 'Verification Needed: CC-2026-000102',
        message: 'Sanitation team cleared waste. Please review the photo and verify.',
        complaintNumber: 'CC-2026-000102',
      },
      {
        userId: officerRajesh._id,
        type: 'complaint_assigned',
        title: 'New High Priority Task: CC-2026-000101',
        message: 'Deep road pothole assigned to you in Ward 1 Navrangpura.',
        complaintNumber: 'CC-2026-000101',
      },
    ]);
    console.log('✅ Seeded In-App Notifications.');

    // 7. Seed Initial Audit Logs
    await AuditLog.create([
      {
        actorName: 'System Engine',
        actorRole: 'system',
        action: 'MUNICIPAL_DATABASE_INITIALIZED',
        entityType: 'System',
        entityId: 'ROOT',
        details: { wards: 10, departments: 6, mode: 'Smart India Hackathon 2026' },
      },
    ]);
    console.log('✅ Seeded System Audit Log.');

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎉  CivicConnect Database Successfully Seeded!             ║
║                                                               ║
║   🔐  DEMO ACCOUNTS:                                          ║
║   • Super Admin:        superadmin@civicconnect.gov.in / Admin@123   ║
║   • Municipal Admin:    admin@civicconnect.gov.in / Admin@123        ║
║   • PWD Dept Head:      pwd.head@civicconnect.gov.in / Admin@123     ║
║   • Field Officer:      officer.rajesh@civicconnect.gov.in / Officer@123 ║
║   • Citizen:            citizen.rahul@example.com / Citizen@123     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
    process.exit(1);
  }
}

seed();
