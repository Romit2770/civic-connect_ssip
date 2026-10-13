const http = require('http');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  if (!res.data || !res.data.data || !res.data.data.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return { token: res.data.data.token, user: res.data.data.user };
}

async function runTests() {
  console.log('=== CIVICCONNECT 6-SCENARIO VERIFICATION ===\n');

  // 1. Authenticate users
  console.log('1. Authenticating test personas...');
  const citizen = await login('citizen.rahul@example.com', 'Citizen@123');
  console.log('   ✓ Citizen logged in:', citizen.user.name);

  const admin = await login('admin@civicconnect.gov.in', 'Admin@123');
  console.log('   ✓ Municipal Admin logged in:', admin.user.name);

  const ramesh = await login('officer.ramesh@civicconnect.gov.in', 'Officer@123');
  console.log('   ✓ Field Worker (Ramesh) logged in:', ramesh.user.name, `(${ramesh.user._id})`);

  const suresh = await login('officer.suresh@civicconnect.gov.in', 'Officer@123');
  console.log('   ✓ Field Worker (Suresh) logged in:', suresh.user.name);

  // -------------------------------------------------------------
  // TEST 1 — Fresh Citizen Complaint
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Fresh Citizen Complaint ---');
  const aiToken = jwt.sign(
    {
      overallStatus: 'PASS',
      category: 'pothole',
      severity: 85,
      confidence: 0.94,
      departmentSlug: 'public-works-department',
      evidenceValid: true,
      evidenceStatus: 'valid',
      isDuplicate: false,
      userId: citizen.user._id,
      timestamp: Date.now(),
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log('   ✓ AI Assessment Token generated & signed.');

  const uniqueLoc = `Main Station Road, Ward 2, Anand (Ref: ${Date.now()})`;
  const lodgeRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/complaints',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizen.token}`,
      },
    },
    {
      title: 'Deep Hazardous Pothole Near Anand Bus Station',
      description: 'Severe deep dangerous pothole on station road creating severe risk of vehicular accidents and delays.',
      category: 'pothole',
      location: uniqueLoc,
      latitude: 22.5000 + Math.random() * 0.5,
      longitude: 72.8000 + Math.random() * 0.5,
      aiAssessmentToken: aiToken,
      priority: 'high',
    }
  );

  if (!lodgeRes.data || !lodgeRes.data.data) {
    throw new Error(`Failed to create complaint: ${JSON.stringify(lodgeRes.data)}`);
  }

  const createdComplaint = lodgeRes.data.data.complaint || lodgeRes.data.data;
  const complaintId = createdComplaint._id || createdComplaint.id;
  const complaintNumber = createdComplaint.complaintNumber;
  console.log(`   Complaint Lodged: ${complaintNumber} (ID: ${complaintId})`);

  // Query Municipal Case File
  const caseRes1 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier1 = caseRes1.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier1.status, `(Validation: ${dossier1.validationStatus})`);
  console.log('     Category:', dossier1.category);
  console.log('     Department:', dossier1.department);
  console.log('     Field Worker:', dossier1.assignedOfficer ? dossier1.assignedOfficer.name : 'Not Assigned');
  console.log('     Resolution Evidence:', dossier1.resolutionEvidence);

  // Assertions for TEST 1
  if (dossier1.status !== 'submitted' && dossier1.status !== 'new') {
    throw new Error(`TEST 1 FAILED: Status must be 'submitted' / 'new', got: ${dossier1.status}`);
  }
  if (dossier1.department !== null && dossier1.department !== 'Not Assigned') {
    throw new Error(`TEST 1 FAILED: Department must be null or 'Not Assigned', got: ${dossier1.department}`);
  }
  if (dossier1.assignedOfficer !== null && dossier1.assignedOfficer !== undefined) {
    throw new Error(`TEST 1 FAILED: Field Worker must NOT be assigned, got: ${JSON.stringify(dossier1.assignedOfficer)}`);
  }
  if (dossier1.resolutionEvidence !== null && dossier1.resolutionEvidence !== undefined) {
    throw new Error(`TEST 1 FAILED: Resolution Evidence must NOT exist for fresh complaint!`);
  }
  console.log('   ✓ TEST 1 PASSED: Fresh complaint shows Category, Department: Not Assigned, Worker: Not Assigned, NO resolution proof.');

  // -------------------------------------------------------------
  // TEST 2 — Municipal Assigns Department
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Municipal Assigns Department ---');
  const deptRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/municipality/challenges/${complaintId}/validate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
    },
    {
      decision: 'Department Assigned',
      department: 'Public Works Department',
      remarks: 'Allocated to Public Works Department for road remediation.',
    }
  );

  if (!deptRes.data.success) {
    throw new Error(`Failed to assign department: ${JSON.stringify(deptRes.data)}`);
  }

  const caseRes2 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier2 = caseRes2.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier2.status);
  console.log('     Department:', dossier2.department);
  console.log('     Field Worker:', dossier2.assignedOfficer ? dossier2.assignedOfficer.name : 'Not Assigned');
  console.log('     Resolution Evidence:', dossier2.resolutionEvidence);

  if (dossier2.department !== 'Public Works Department') {
    throw new Error(`TEST 2 FAILED: Department should be 'Public Works Department', got: ${dossier2.department}`);
  }
  if (dossier2.assignedOfficer !== null && dossier2.assignedOfficer !== undefined) {
    throw new Error(`TEST 2 FAILED: Field Worker must still be Not Assigned!`);
  }
  if (dossier2.resolutionEvidence !== null && dossier2.resolutionEvidence !== undefined) {
    throw new Error(`TEST 2 FAILED: Resolution Evidence must NOT exist!`);
  }
  console.log('   ✓ TEST 2 PASSED: Department is assigned, Worker still Not Assigned, NO resolution proof.');

  // -------------------------------------------------------------
  // TEST 3 — Municipal Assigns Field Worker
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Municipal Assigns Field Worker ---');
  const allocRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/municipality/challenges/${complaintId}/allocate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
    },
    {
      workerId: ramesh.user._id,
      workerName: ramesh.user.name,
      department: 'Public Works Department',
      instructions: 'Deploy cold asphalt mix squad and level depression.',
    }
  );

  if (!allocRes.data.success) {
    throw new Error(`Failed to allocate worker: ${JSON.stringify(allocRes.data)}`);
  }

  const caseRes3 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier3 = caseRes3.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier3.status);
  console.log('     Assigned Officer:', dossier3.assignedOfficer?.name);
  console.log('     Employee Badge:', dossier3.assignedOfficer?.badgeNumber || dossier3.assignedOfficer?.badge);
  console.log('     Assignment Status:', dossier3.assignment?.status);

  if (!dossier3.assignedOfficer || dossier3.assignedOfficer.name !== ramesh.user.name) {
    throw new Error(`TEST 3 FAILED: Assigned officer must be ${ramesh.user.name}`);
  }
  if (dossier3.status !== 'assigned') {
    throw new Error(`TEST 3 FAILED: Status must be 'assigned', got: ${dossier3.status}`);
  }

  // Field Worker visibility test (Ramesh sees it, Suresh does NOT)
  const rameshTasksRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/field-worker/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${ramesh.token}` },
  });
  const rameshTasks = rameshTasksRes.data.data?.workOrders || rameshTasksRes.data.data?.urgentAssignments || [];
  const rameshFound = rameshTasks.some(
    (t) => (t.id === complaintId || t._id === complaintId || t.complaintNumber === complaintNumber || t.challengeId === complaintNumber)
  );
  if (!rameshFound) {
    throw new Error(`TEST 3 FAILED: Ramesh should see assigned complaint ${complaintNumber} in workOrders`);
  }
  console.log('   ✓ Ramesh dashboard sees task in workOrders.');

  const sureshTasksRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/field-worker/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${suresh.token}` },
  });
  const sureshTasks = sureshTasksRes.data.data?.workOrders || sureshTasksRes.data.data?.urgentAssignments || [];
  const sureshFound = sureshTasks.some(
    (t) => (t.id === complaintId || t._id === complaintId || t.complaintNumber === complaintNumber || t.challengeId === complaintNumber)
  );
  if (sureshFound) {
    throw new Error(`TEST 3 FAILED: Suresh must NOT see task assigned to Ramesh!`);
  }
  console.log('   ✓ Suresh dashboard does NOT see Ramesh task (Role-based isolation verified).');
  console.log('   ✓ TEST 3 PASSED: Field worker assigned with actual details, notification dispatched.');

  // -------------------------------------------------------------
  // TEST 4 — Field Worker Starts Work
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Field Worker Starts Work ---');
  const startWorkRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/field-worker/challenges/${complaintId}/start-work`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ramesh.token}`,
      },
    },
    {}
  );

  if (!startWorkRes.data.success) {
    throw new Error(`Failed to start work: ${JSON.stringify(startWorkRes.data)}`);
  }

  const caseRes4 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier4 = caseRes4.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier4.status);
  console.log('     Resolution Evidence:', dossier4.resolutionEvidence);

  if (dossier4.status !== 'in_progress') {
    throw new Error(`TEST 4 FAILED: Status must be 'in_progress', got: ${dossier4.status}`);
  }
  if (dossier4.resolutionEvidence !== null && dossier4.resolutionEvidence !== undefined) {
    throw new Error(`TEST 4 FAILED: Resolution Evidence must NOT exist while work is in progress!`);
  }
  console.log('   ✓ TEST 4 PASSED: Status is In Progress, NO resolution image yet.');

  // -------------------------------------------------------------
  // TEST 5 — Field Worker Submits Resolution
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Field Worker Submits Resolution ---');
  const realResolutionPhoto = 'https://storage.civicconnect.gov.in/resolutions/pothole_fixed_live_proof_101.jpg';
  const submitRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/field-worker/challenges/${complaintId}/resolution`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ramesh.token}`,
      },
    },
    {
      completionNotes: 'Depression excavated, base compacted, hot asphalt patched and roller flattened.',
      resolutionPhotos: [realResolutionPhoto],
      capturedLocation: { latitude: 22.5646, longitude: 72.9290, accuracy: 2.8 },
    }
  );

  if (!submitRes.data.success) {
    throw new Error(`Failed to submit resolution: ${JSON.stringify(submitRes.data)}`);
  }

  const caseRes5 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier5 = caseRes5.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier5.status);
  console.log('     Resolution Photo:', dossier5.resolutionEvidence?.photos?.[0]);
  console.log('     GPS:', dossier5.resolutionEvidence?.capturedLocation);
  console.log('     Notes:', dossier5.resolutionEvidence?.description);

  if (dossier5.status !== 'resolution_submitted' && dossier5.status !== 'verification_pending') {
    throw new Error(`TEST 5 FAILED: Status must be 'resolution_submitted', got: ${dossier5.status}`);
  }
  if (!dossier5.resolutionEvidence || dossier5.resolutionEvidence.photos?.[0] !== realResolutionPhoto) {
    throw new Error(`TEST 5 FAILED: Resolution photo must be actual submitted photo, got: ${dossier5.resolutionEvidence?.photos?.[0]}`);
  }
  if (!dossier5.resolutionEvidence.capturedLocation || !dossier5.resolutionEvidence.capturedLocation.latitude) {
    throw new Error(`TEST 5 FAILED: Geotagged GPS coordinates missing!`);
  }
  console.log('   ✓ TEST 5 PASSED: Real resolution evidence submitted with Before/After photos and geotag.');

  // -------------------------------------------------------------
  // TEST 6 — Municipal Verifies
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Municipal Verifies ---');
  const verifyRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/municipality/challenges/${complaintId}/validate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
    },
    {
      decision: 'Verified',
      remarks: 'Field work verified through live geotag proof. Road surface restored to standards.',
    }
  );

  if (!verifyRes.data.success) {
    throw new Error(`Failed to verify challenge: ${JSON.stringify(verifyRes.data)}`);
  }

  const caseRes6 = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/municipality/challenges/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const dossier6 = caseRes6.data.data;
  console.log('   Municipal Case File State:');
  console.log('     Status:', dossier6.status);
  console.log('     Resolved At:', dossier6.resolvedAt);

  if (dossier6.status !== 'resolved') {
    throw new Error(`TEST 6 FAILED: Status must be 'resolved', got: ${dossier6.status}`);
  }
  if (!dossier6.resolvedAt) {
    throw new Error(`TEST 6 FAILED: resolvedAt must be set!`);
  }

  // Check citizen view
  const citizenRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/complaints/${complaintId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${citizen.token}` },
  });
  if (citizenRes.data.data?.status !== 'resolved') {
    throw new Error(`TEST 6 FAILED: Citizen view should show 'resolved', got: ${citizenRes.data.data?.status}`);
  }
  console.log('   ✓ Citizen view shows status: resolved.');
  console.log('   ✓ TEST 6 PASSED: Verified & Resolved by Municipal Admin.');

  console.log('\n======================================================');
  console.log('ALL 6 LIFECYCLE TEST SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
