const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5001/api';
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026';

async function runE2ETests() {
  console.log('====================================================');
  console.log('CIVICCONNECT END-TO-END COMPLAINT LIFECYCLE TEST SUITE');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 0: Log in all 5 test users
    // ----------------------------------------------------
    console.log('>>> [STEP 0] Authenticating test users...');

    // Citizen A: Rahul Patel
    const citizenARes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'citizen.rahul@example.com',
      password: 'Citizen@123',
    });
    const tokenCitizenA = citizenARes.data.data.token;
    const userCitizenA = citizenARes.data.data.user;
    console.log(`✓ Citizen A logged in: ${userCitizenA.name} (${userCitizenA._id})`);

    // Citizen B: Sneha Dave
    const citizenBRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'citizen.sneha@example.com',
      password: 'Citizen@123',
    });
    const tokenCitizenB = citizenBRes.data.data.token;
    const userCitizenB = citizenBRes.data.data.user;
    console.log(`✓ Citizen B logged in: ${userCitizenB.name} (${userCitizenB._id})`);

    // Municipal Admin
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@civicconnect.gov.in',
      password: 'Admin@123',
    });
    const tokenAdmin = adminRes.data.data.token;
    const userAdmin = adminRes.data.data.user;
    console.log(`✓ Municipal Admin logged in: ${userAdmin.name} (${userAdmin.role})`);

    // Field Worker A: Ramesh Patel
    const rameshRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'officer.ramesh@civicconnect.gov.in',
      password: 'Officer@123',
    });
    const tokenRamesh = rameshRes.data.data.token;
    const userRamesh = rameshRes.data.data.user;
    console.log(`✓ Field Worker A logged in: ${userRamesh.name} (${userRamesh.role}, ID: ${userRamesh._id})`);

    // Field Worker B: Suresh Patel
    const sureshRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'officer.suresh@civicconnect.gov.in',
      password: 'Officer@123',
    });
    const tokenSuresh = sureshRes.data.data.token;
    const userSuresh = sureshRes.data.data.user;
    console.log(`✓ Field Worker B logged in: ${userSuresh.name} (${userSuresh.role}, ID: ${userSuresh._id})\n`);

    // ----------------------------------------------------
    // TEST 1: Citizen A creates Complaint A
    // ----------------------------------------------------
    console.log('>>> [TEST 1] Citizen A reports problem...');

    // Generate valid AI assessment gate token
    const tokenA = jwt.sign(
      { evidenceValid: true, confidence: 0.95, classification: 'garbage' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate unique coordinates per test run to avoid duplicate detection
    const testOffset = (Date.now() % 1000) * 0.001;
    const latA = Number((22.5300 + testOffset).toFixed(4));
    const lngA = Number((72.9100 + testOffset).toFixed(4));

    const complaintAPayload = {
      description: `Large solid waste accumulation at Anand Sector ${Date.now() % 10000} creating health hazard.`,
      category: 'garbage',
      latitude: latA,
      longitude: lngA,
      address: `Ward 4 Area Sector ${Date.now() % 10000}, Anand`,
      aiAssessmentToken: tokenA,
    };

    const createARes = await axios.post(`${API_BASE}/complaints`, complaintAPayload, {
      headers: { Authorization: `Bearer ${tokenCitizenA}` },
    });
    const complaintA = createARes.data.data.complaint || createARes.data.data;
    console.log(`✓ Complaint A created: ${complaintA.complaintNumber} (ID: ${complaintA._id || complaintA.id})`);
    console.log(`  Title: "${complaintA.title}"`);
    console.log(`  Initial Status: "${complaintA.status}"`);

    // Verify it appears in Municipal Queue
    const adminQueueRes = await axios.get(`${API_BASE}/municipality/challenges?tab=All`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const foundInQueueA = adminQueueRes.data.data.challenges.find(
      (c) => c.complaintNumber === complaintA.complaintNumber || c.id === complaintA._id
    );
    if (!foundInQueueA) {
      throw new Error(`FAILURE: Complaint A (${complaintA.complaintNumber}) did not appear in Municipal Queue!`);
    }
    console.log(`✓ TEST 1 PASSED: Complaint A immediately appeared in Municipal Complaint Queue with status "${foundInQueueA.validationStatus}".\n`);

    // ----------------------------------------------------
    // TEST 2: Municipal Admin assigns Complaint A to Ramesh Patel
    // ----------------------------------------------------
    console.log('>>> [TEST 2] Municipal Admin allocates Complaint A to Field Worker A (Ramesh Patel)...');
    
    // Check field workers list from admin endpoint
    const workersRes = await axios.get(`${API_BASE}/municipality/field-workers`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const rameshFromList = workersRes.data.data.find((w) => w.id === userRamesh._id || w.name === userRamesh.name);
    console.log(`  Found worker in admin roster: ${rameshFromList?.name} (Tasks: ${rameshFromList?.activeTasks})`);

    const allocateARes = await axios.post(
      `${API_BASE}/municipality/challenges/${complaintA._id || complaintA.id}/allocate`,
      {
        workerId: userRamesh._id,
        workerName: userRamesh.name,
        department: 'Solid Waste Management',
        instructions: 'Clear accumulated waste completely, sanitize area, and upload geotagged proof.',
      },
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    console.log(`✓ Allocation successful: ${allocateARes.data.message}`);

    // Verify Ramesh Dashboard sees Complaint A
    const rameshTasksRes = await axios.get(`${API_BASE}/field-worker/challenges`, {
      headers: { Authorization: `Bearer ${tokenRamesh}` },
    });
    const rameshSeesA = rameshTasksRes.data.data.challenges.find(
      (c) => c.complaintNumber === complaintA.complaintNumber || c.id === (complaintA._id || complaintA.id)
    );
    if (!rameshSeesA) {
      throw new Error('FAILURE: Ramesh Patel does NOT see Complaint A on his dashboard!');
    }
    console.log(`✓ Ramesh Patel sees Complaint A: ${rameshSeesA.complaintNumber} (Status: ${rameshSeesA.status})`);

    // Verify Suresh Dashboard does NOT see Complaint A
    const sureshTasksRes1 = await axios.get(`${API_BASE}/field-worker/challenges`, {
      headers: { Authorization: `Bearer ${tokenSuresh}` },
    });
    const sureshSeesA = sureshTasksRes1.data.data.challenges.find(
      (c) => c.complaintNumber === complaintA.complaintNumber || c.id === (complaintA._id || complaintA.id)
    );
    if (sureshSeesA) {
      throw new Error('FAILURE: Suresh Patel can see Complaint A which was assigned to Ramesh! Isolation breached!');
    }
    console.log(`✓ Suresh Patel CANNOT see Complaint A in his tasks roster (Data Isolation Verified!).`);

    // Verify Suresh cannot access Complaint A via direct API endpoint
    try {
      await axios.get(`${API_BASE}/field-worker/challenges/${complaintA._id || complaintA.id}`, {
        headers: { Authorization: `Bearer ${tokenSuresh}` },
      });
      throw new Error('FAILURE: Suresh accessed Complaint A directly without 403 Forbidden!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`✓ Direct access by Suresh to Complaint A correctly rejected with 403 Forbidden: "${err.response.data.message || err.response.data.error?.message}"`);
      } else {
        throw err;
      }
    }
    console.log('✓ TEST 2 PASSED: Complaint A isolated to Ramesh; Suresh strictly prohibited.\n');

    // ----------------------------------------------------
    // TEST 3: Citizen B creates Complaint B -> Admin assigns to Suresh
    // ----------------------------------------------------
    console.log('>>> [TEST 3] Citizen B creates Complaint B, Municipal Admin assigns to Suresh Patel...');
    // Generate valid AI assessment gate token
    const tokenB = jwt.sign(
      { evidenceValid: true, confidence: 0.95, classification: 'water' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const latB = Number((22.5700 + testOffset).toFixed(4));
    const lngB = Number((72.9400 + testOffset).toFixed(4));

    const complaintBPayload = {
      description: `Potable water pipe burst flooding road at Ward 10 Junction ${Date.now() % 10000}.`,
      category: 'water',
      latitude: latB,
      longitude: lngB,
      address: `Station Road Near Town Hall Circle, Ward 10, Anand`,
      aiAssessmentToken: tokenB,
    };

    const createBRes = await axios.post(`${API_BASE}/complaints`, complaintBPayload, {
      headers: { Authorization: `Bearer ${tokenCitizenB}` },
    });
    const complaintB = createBRes.data.data.complaint || createBRes.data.data;
    console.log(`✓ Complaint B created: ${complaintB.complaintNumber} (ID: ${complaintB._id || complaintB.id})`);

    // Assign Complaint B to Suresh
    await axios.post(
      `${API_BASE}/municipality/challenges/${complaintB._id || complaintB.id}/allocate`,
      {
        workerId: userSuresh._id,
        workerName: userSuresh.name,
        department: 'Water & Sanitation',
        instructions: 'Repair underground water pipe collar and seal road surface.',
      },
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    console.log(`✓ Complaint B assigned to Suresh Patel.`);

    // Check Suresh sees Complaint B
    const sureshTasksRes2 = await axios.get(`${API_BASE}/field-worker/challenges`, {
      headers: { Authorization: `Bearer ${tokenSuresh}` },
    });
    const sureshSeesB = sureshTasksRes2.data.data.challenges.find(
      (c) => c.complaintNumber === complaintB.complaintNumber || c.id === (complaintB._id || complaintB.id)
    );
    if (!sureshSeesB) {
      throw new Error('FAILURE: Suresh does not see Complaint B!');
    }
    console.log(`✓ Suresh sees Complaint B: ${sureshSeesB.complaintNumber}`);

    // Check Ramesh CANNOT see Complaint B
    const rameshTasksRes2 = await axios.get(`${API_BASE}/field-worker/challenges`, {
      headers: { Authorization: `Bearer ${tokenRamesh}` },
    });
    const rameshSeesB = rameshTasksRes2.data.data.challenges.find(
      (c) => c.complaintNumber === complaintB.complaintNumber || c.id === (complaintB._id || complaintB.id)
    );
    if (rameshSeesB) {
      throw new Error('FAILURE: Ramesh can see Complaint B assigned to Suresh!');
    }
    console.log(`✓ Ramesh CANNOT see Complaint B in his tasks roster.`);

    // Check Ramesh direct access to Complaint B returns 403
    try {
      await axios.get(`${API_BASE}/field-worker/challenges/${complaintB._id || complaintB.id}`, {
        headers: { Authorization: `Bearer ${tokenRamesh}` },
      });
      throw new Error('FAILURE: Ramesh accessed Complaint B directly without 403 Forbidden!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`✓ Direct access by Ramesh to Complaint B correctly rejected with 403 Forbidden.`);
      } else {
        throw err;
      }
    }
    console.log('✓ TEST 3 PASSED: Complaint B isolated to Suresh; Ramesh strictly prohibited.\n');

    // ----------------------------------------------------
    // TEST 4: Ramesh starts work on Complaint A
    // ----------------------------------------------------
    console.log('>>> [TEST 4] Field Worker Ramesh starts work on Complaint A...');
    const startWorkRes = await axios.post(
      `${API_BASE}/field-worker/challenges/${complaintA._id || complaintA.id}/start-work`,
      {},
      { headers: { Authorization: `Bearer ${tokenRamesh}` } }
    );
    console.log(`✓ Start work response: ${startWorkRes.data.message}`);

    // Verify status on Ramesh Dashboard
    const rameshCheckA = await axios.get(
      `${API_BASE}/field-worker/challenges/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenRamesh}` } }
    );
    const rameshStatus = rameshCheckA.data.data.challenge?.status;
    console.log(`  Ramesh Portal Status: "${rameshStatus}"`);
    if (rameshStatus?.toLowerCase() !== 'in_progress') {
      throw new Error(`FAILURE: Expected status "in_progress", got "${rameshStatus}"`);
    }

    // Verify status on Municipal Admin Dashboard
    const adminCheckA = await axios.get(
      `${API_BASE}/municipality/challenges/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    const adminStatus = adminCheckA.data.data.status || adminCheckA.data.data.validationStatus;
    console.log(`  Municipal Dashboard Status: "${adminCheckA.data.data.status}" (Validation: "${adminCheckA.data.data.validationStatus}")`);
    if (adminCheckA.data.data.status?.toLowerCase() !== 'in_progress') {
      throw new Error(`FAILURE: Municipal status not updated to "in_progress", got "${adminCheckA.data.data.status}"`);
    }
    console.log('✓ TEST 4 PASSED: Status updated to IN PROGRESS across Ramesh portal and Municipal Admin.\n');

    // ----------------------------------------------------
    // TEST 5: Ramesh submits resolution evidence
    // ----------------------------------------------------
    console.log('>>> [TEST 5] Field Worker Ramesh submits resolution evidence...');
    const resolutionPayload = {
      description: 'Solid waste fully cleared using hydraulic compactor. Street swept, bleached and deodorized.',
      resolutionEvidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
      photos: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
      ],
      latitude: latA,
      longitude: lngA,
    };

    const submitRes = await axios.post(
      `${API_BASE}/field-worker/challenges/${complaintA._id || complaintA.id}/resolution`,
      resolutionPayload,
      { headers: { Authorization: `Bearer ${tokenRamesh}` } }
    );
    console.log(`✓ Resolution submission response: ${submitRes.data.message}`);

    // Verify Municipal Admin Case File
    const adminDossierRes = await axios.get(
      `${API_BASE}/municipality/challenges/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    const caseFile = adminDossierRes.data.data;
    console.log(`  Case File Complaint Number: ${caseFile.complaintNumber}`);
    console.log(`  Case File Status: ${caseFile.status}`);
    console.log(`  Resolution Evidence Description: "${caseFile.resolutionEvidence?.description}"`);
    console.log(`  Resolution Photos: ${caseFile.resolutionEvidence?.photos?.length || 0} photo(s)`);
    console.log(`  Assignment History entries: ${caseFile.assignmentHistory?.length || 0}`);
    console.log(`  Status History entries: ${caseFile.statusHistory?.length || 0}`);

    if (!caseFile.resolutionEvidence) {
      throw new Error('FAILURE: resolutionEvidence not visible in Municipal Admin Case File!');
    }
    if (!caseFile.assignmentHistory || caseFile.assignmentHistory.length === 0) {
      throw new Error('FAILURE: assignmentHistory not visible in Municipal Admin Case File!');
    }
    if (!caseFile.statusHistory || caseFile.statusHistory.length < 3) {
      throw new Error('FAILURE: complete statusHistory timeline not populated in Case File!');
    }

    console.log('✓ TEST 5 PASSED: Resolution evidence, assignment history, and complete timeline verified in Municipal Case File.\n');

    // ----------------------------------------------------
    // TEST 6: Municipal Admin verifies resolution
    // ----------------------------------------------------
    console.log('>>> [TEST 6] Municipal Admin verifies resolution and resolves complaint...');
    const verifyRes = await axios.post(
      `${API_BASE}/municipality/challenges/${complaintA._id || complaintA.id}/validate`,
      {
        decision: 'Verified',
        department: 'Solid Waste Management',
        remarks: 'Remediation inspected via geotagged photo. Site clearance verified satisfactory. Case closed.',
      },
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    console.log(`✓ Verification response: ${verifyRes.data.message}`);

    // Check final status on Municipal Admin
    const finalAdminCheck = await axios.get(
      `${API_BASE}/municipality/challenges/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    console.log(`  Final Municipal Status: "${finalAdminCheck.data.data.status}"`);

    // Check final status on Citizen A side
    const finalCitizenCheck = await axios.get(
      `${API_BASE}/complaints/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenCitizenA}` } }
    );
    console.log(`  Final Citizen Status: "${finalCitizenCheck.data.data.status}"`);

    // Check final status on Ramesh side
    const finalRameshCheck = await axios.get(
      `${API_BASE}/field-worker/challenges/${complaintA._id || complaintA.id}`,
      { headers: { Authorization: `Bearer ${tokenRamesh}` } }
    );
    const rameshFinalStatus = finalRameshCheck.data.data.challenge?.rawStatus || finalRameshCheck.data.data.challenge?.status;
    console.log(`  Final Field Worker Status: "${rameshFinalStatus}" (FW mapped: "${finalRameshCheck.data.data.challenge?.status}")`);

    if (
      finalAdminCheck.data.data.status?.toLowerCase() !== 'resolved' ||
      finalCitizenCheck.data.data.status?.toLowerCase() !== 'resolved' ||
      (rameshFinalStatus?.toLowerCase() !== 'resolved' && rameshFinalStatus?.toLowerCase() !== 'verified')
    ) {
      throw new Error('FAILURE: Final status not uniform across all portals!');
    }

    // Check Municipal Dashboard Counts
    const dashStatsRes = await axios.get(`${API_BASE}/municipality/dashboard`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    console.log('\n>>> Live Municipal Dashboard Counts:');
    console.log('  Total Challenges:', dashStatsRes.data.data.stats.totalChallenges);
    console.log('  Resolved:', dashStatsRes.data.data.stats.resolved);
    console.log('  Field Force:', dashStatsRes.data.data.fieldForce);

    console.log('\n====================================================');
    console.log('ALL 6 END-TO-END TESTS PASSED SUCCESSFULLY! ✓');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETests();
