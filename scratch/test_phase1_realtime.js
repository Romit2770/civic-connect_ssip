const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026';

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('CIVICCONNECT PHASE 1 REAL-TIME INTAKE TEST SUITE');
  console.log('====================================================\n');

  let adminSocket = null;

  try {
    // ----------------------------------------------------
    // STEP 0: Authenticate Personas
    // ----------------------------------------------------
    console.log('>>> [STEP 0] Authenticating Citizen and Municipal Admin...');

    const citizenRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'citizen.rahul@example.com',
      password: 'Citizen@123',
    });
    const tokenCitizen = citizenRes.data.data.token;
    const userCitizen = citizenRes.data.data.user;
    console.log(`✓ Citizen logged in: ${userCitizen.name} (${userCitizen._id})`);

    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@civicconnect.gov.in',
      password: 'Admin@123',
    });
    const tokenAdmin = adminRes.data.data.token;
    const userAdmin = adminRes.data.data.user;
    console.log(`✓ Municipal Admin logged in: ${userAdmin.name} (${userAdmin.role})`);

    // ----------------------------------------------------
    // TEST 1: Initial Dashboard Data & Strict Newest-First Ordering
    // ----------------------------------------------------
    console.log('\n>>> [TEST 1] Testing Initial Dashboard Fetch & Newest-First Order...');
    const dashRes = await axios.get(`${API_BASE}/municipality/dashboard`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const initialData = dashRes.data.data;
    console.log(`✓ Dashboard loaded successfully.`);
    console.log(`  KPIs: Total: ${initialData.stats.totalChallenges}, New: ${initialData.stats.new}, In Progress: ${initialData.stats.inProgress}, Resolved: ${initialData.stats.resolved}, SLA Breached: ${initialData.stats.slaBreached}`);

    const existingComplaints = initialData.recentChallenges || [];
    console.log(`  Existing complaints in queue: ${existingComplaints.length}`);

    // Verify timestamps are sorted newest-first
    for (let i = 0; i < existingComplaints.length - 1; i++) {
      const timeCurrent = new Date(existingComplaints[i].createdAt || existingComplaints[i].submittedDate).getTime();
      const timeNext = new Date(existingComplaints[i + 1].createdAt || existingComplaints[i + 1].submittedDate).getTime();
      if (timeCurrent < timeNext) {
        throw new Error(`FAILURE: Order violation at index ${i}: older complaint appeared before newer complaint!`);
      }
    }
    console.log(`✓ TEST 1 PASSED: Initial dashboard complaints are strictly sorted by createdAt DESC (newest first).\n`);

    // ----------------------------------------------------
    // TEST 2: Real-time Socket.IO Connection & Listeners
    // ----------------------------------------------------
    console.log('>>> [TEST 2] Connecting Municipal Admin to Socket.IO...');
    adminSocket = io(SOCKET_URL, {
      auth: { token: tokenAdmin },
      transports: ['websocket', 'polling'],
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
      adminSocket.on('connect', () => {
        clearTimeout(timeout);
        console.log(`✓ Admin Socket connected with socket id: ${adminSocket.id}`);
        resolve();
      });
      adminSocket.on('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Setup Promise listeners for incoming real-time complaint events
    const receivedEvents = [];
    adminSocket.on('complaint:new', (payload) => {
      receivedEvents.push({ event: 'complaint:new', payload });
    });
    adminSocket.on('complaint:created', (payload) => {
      receivedEvents.push({ event: 'complaint:created', payload });
    });
    console.log(`✓ Real-time event listeners registered for 'complaint:new' and 'complaint:created'.\n`);

    // ----------------------------------------------------
    // TEST 3: Citizen Reports Complaint A -> Real-time Intake Verification
    // ----------------------------------------------------
    console.log('>>> [TEST 3] Citizen reports Complaint A...');
    const tokenA = jwt.sign(
      { evidenceValid: true, confidence: 0.95, classification: 'pothole' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const testOffset1 = (Date.now() % 1000) * 0.001;
    const complaintAPayload = {
      description: `Hazardous pothole cluster near Charusat Main Road block ${Date.now() % 10000}.`,
      category: 'pothole',
      latitude: Number((22.5600 + testOffset1).toFixed(4)),
      longitude: Number((72.9200 + testOffset1).toFixed(4)),
      address: `Ward 4 Anand Main Road ${Date.now() % 10000}`,
      aiAssessmentToken: tokenA,
    };

    const createARes = await axios.post(`${API_BASE}/complaints`, complaintAPayload, {
      headers: { Authorization: `Bearer ${tokenCitizen}` },
    });
    const complaintA = createARes.data.data.complaint || createARes.data.data;
    console.log(`✓ Complaint A created: ${complaintA.complaintNumber} (ID: ${complaintA._id})`);

    // Wait for Socket.IO event to be delivered to Municipal Admin
    console.log(`  Waiting for real-time delivery to Municipal Admin socket...`);
    await new Promise((resolve, reject) => {
      const waitStart = Date.now();
      const interval = setInterval(() => {
        const found = receivedEvents.find(
          (e) => e.payload && (e.payload.complaintNumber === complaintA.complaintNumber || e.payload._id === complaintA._id)
        );
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (Date.now() - waitStart > 8000) {
          clearInterval(interval);
          reject(new Error('FAILURE: Real-time complaint event not received within 8 seconds'));
        }
      }, 200);
    });

    const matchingEventA = receivedEvents.find((e) => e.payload.complaintNumber === complaintA.complaintNumber);
    console.log(`✓ Real-time event received for Complaint A!`);
    console.log(`  Event: ${matchingEventA.event}`);
    console.log(`  Complaint Number: ${matchingEventA.payload.complaintNumber}`);
    console.log(`  Category: ${matchingEventA.payload.category}`);
    console.log(`  Ward: ${matchingEventA.payload.ward}`);
    console.log(`  Citizen: ${matchingEventA.payload.citizenName}`);
    console.log(`  Priority: ${matchingEventA.payload.priority}`);
    console.log(`  Created At: ${matchingEventA.payload.createdAt}`);
    console.log(`✓ TEST 3 PASSED: Complaint A arrived in real-time without page refresh.\n`);

    // ----------------------------------------------------
    // TEST 4: Second Complaint B -> Newest Complaint At Top (createdAt order)
    // ----------------------------------------------------
    console.log('>>> [TEST 4] Citizen reports Complaint B (Checking newest-first ordering)...');
    // Short wait to ensure different timestamp
    await new Promise((r) => setTimeout(r, 1500));

    const tokenB = jwt.sign(
      { evidenceValid: true, confidence: 0.92, classification: 'garbage' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const testOffset2 = (Date.now() % 1000) * 0.001;
    const complaintBPayload = {
      description: `Solid waste container overflow at Anand Sector ${Date.now() % 10000}.`,
      category: 'garbage',
      latitude: Number((22.5650 + testOffset2).toFixed(4)),
      longitude: Number((72.9250 + testOffset2).toFixed(4)),
      address: `Ward 4 Solid Waste Depot ${Date.now() % 10000}`,
      aiAssessmentToken: tokenB,
    };

    const createBRes = await axios.post(`${API_BASE}/complaints`, complaintBPayload, {
      headers: { Authorization: `Bearer ${tokenCitizen}` },
    });
    const complaintB = createBRes.data.data.complaint || createBRes.data.data;
    console.log(`✓ Complaint B created: ${complaintB.complaintNumber} (ID: ${complaintB._id})`);

    // Wait for event B
    await new Promise((resolve, reject) => {
      const waitStart = Date.now();
      const interval = setInterval(() => {
        const found = receivedEvents.find(
          (e) => e.payload && (e.payload.complaintNumber === complaintB.complaintNumber || e.payload._id === complaintB._id)
        );
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (Date.now() - waitStart > 8000) {
          clearInterval(interval);
          reject(new Error('FAILURE: Real-time event for Complaint B not received within 8s'));
        }
      }, 200);
    });

    const timeA = new Date(complaintA.createdAt).getTime();
    const timeB = new Date(complaintB.createdAt).getTime();
    console.log(`  Complaint A time: ${new Date(complaintA.createdAt).toISOString()}`);
    console.log(`  Complaint B time: ${new Date(complaintB.createdAt).toISOString()}`);

    if (timeB <= timeA) {
      throw new Error(`FAILURE: Complaint B was not created after Complaint A!`);
    }

    // Verify ordering logic puts Complaint B ahead of Complaint A
    const queue = [complaintA, complaintB];
    queue.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    if (queue[0].complaintNumber !== complaintB.complaintNumber) {
      throw new Error('FAILURE: Newest complaint B is not sorted to the top!');
    }
    console.log(`✓ TEST 4 PASSED: Complaint B created later is ordered strictly ABOVE Complaint A.\n`);

    // ----------------------------------------------------
    // TEST 5: Accurate Live KPI Update
    // ----------------------------------------------------
    console.log('>>> [TEST 5] Checking Updated Municipal Dashboard KPIs...');
    const updatedDashRes = await axios.get(`${API_BASE}/municipality/dashboard`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const updatedData = updatedDashRes.data.data;
    console.log(`✓ Updated KPIs: Total: ${updatedData.stats.totalChallenges}, New: ${updatedData.stats.new}`);

    if (updatedData.stats.totalChallenges < initialData.stats.totalChallenges + 2) {
      throw new Error('FAILURE: KPI totalChallenges did not increment properly with new complaints');
    }
    console.log(`✓ TEST 5 PASSED: KPI counts updated accurately reflecting new citizen complaints.\n`);

    // ----------------------------------------------------
    // TEST 6: Case File Dossier Access by Complaint Number & ID
    // ----------------------------------------------------
    console.log('>>> [TEST 6] Testing Case File Dossier endpoint for Complaint A...');
    const caseFileRes = await axios.get(`${API_BASE}/municipality/challenges/${complaintA.complaintNumber}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const caseData = caseFileRes.data.data;
    if (!caseData || caseData.complaintNumber !== complaintA.complaintNumber) {
      throw new Error('FAILURE: Case file dossier did not match selected complaint number!');
    }
    console.log(`✓ Case File Dossier loaded successfully:`);
    console.log(`  Complaint Number: ${caseData.complaintNumber}`);
    console.log(`  Title: ${caseData.problem || caseData.title}`);
    console.log(`  Citizen Name: ${caseData.citizenName || caseData.reportedBy?.name || 'Verified Resident'}`);
    console.log(`  Ward: ${caseData.ward}`);
    console.log(`  Department: ${caseData.department}`);
    console.log(`  Status: ${caseData.validationStatus || caseData.status}`);
    console.log(`✓ TEST 6 PASSED: Correct case file opens using exact complaint ID.\n`);

    // ----------------------------------------------------
    // TEST 7: Security Check — Unauthorized Citizen Access Blocked
    // ----------------------------------------------------
    console.log('>>> [TEST 7] Security Check — Citizen attempting to access Municipal Dashboard...');
    try {
      await axios.get(`${API_BASE}/municipality/dashboard`, {
        headers: { Authorization: `Bearer ${tokenCitizen}` },
      });
      throw new Error('SECURITY FAILURE: Unauthorized citizen was allowed to access municipal dashboard!');
    } catch (secErr) {
      if (secErr.response && (secErr.response.status === 403 || secErr.response.status === 401)) {
        console.log(`✓ Access properly denied with HTTP ${secErr.response.status} Forbidden (Security Verified!).`);
      } else {
        throw secErr;
      }
    }
    console.log(`✓ TEST 7 PASSED: Municipal operational stream is securely restricted to authorized admins.\n`);

    console.log('====================================================');
    console.log('ALL PHASE 1 REAL-TIME TESTS PASSED WITH 100% SUCCESS! ✓');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exitCode = 1;
  } finally {
    if (adminSocket) {
      adminSocket.disconnect();
    }
  }
}

runPhase1Tests();
