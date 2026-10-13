const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('--- Testing Interactive Faculty Actions ---');

  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'faculty.mentor@bitmesra.ac.in', password: 'Faculty@123' });

  const token = loginRes.body?.data?.token;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 1. Get Challenge Details with Evidence & AI Analysis
  const detailRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/challenges/CH-2026-089',
    method: 'GET',
    headers: authHeaders
  });
  console.log('1. Challenge Detail Status:', detailRes.status);
  console.log('   Title:', detailRes.body?.data?.title);
  console.log('   Citizen Evidence Photos:', detailRes.body?.data?.citizenEvidence?.photos?.length);
  console.log('   GPS Coordinates:', detailRes.body?.data?.citizenEvidence?.coordinates);
  console.log('   AI Severity:', detailRes.body?.data?.aiAnalysis?.severity);
  console.log('   AI Recommended Domain:', detailRes.body?.data?.aiAnalysis?.recommendedAcademicDomain);

  // 2. Test Task Assignment / Update
  const taskRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/teams/TEAM-01/members/2023UGCS044/task',
    method: 'PATCH',
    headers: authHeaders
  }, {
    task: 'Optimize LoRa transmission window for battery conservation',
    taskStatus: 'In Progress'
  });
  console.log('2. Update Task Status:', taskRes.status, 'Message:', taskRes.body?.message);

  // 3. Test Student Submission Review Validation: REQUEST REVISION requires comment
  const revFail = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/submissions/SUB-2026-01/review',
    method: 'POST',
    headers: authHeaders
  }, {
    action: 'REQUEST REVISION',
    comment: ''
  });
  console.log('3. Revision without comment status:', revFail.status, '(Expected 400)', 'Error:', revFail.body?.message);

  // 4. Test Student Submission Review Success: REQUEST REVISION with comment
  const revSuccess = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/submissions/SUB-2026-01/review',
    method: 'POST',
    headers: authHeaders
  }, {
    action: 'REQUEST REVISION',
    comment: 'Sensor calibration report requires additional pressure accuracy measurements under dynamic load.'
  });
  console.log('4. Revision with comment status:', revSuccess.status, 'Message:', revSuccess.body?.message);

  // 5. Test Send Industry Collaboration Request
  const reqRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/industry/requests',
    method: 'POST',
    headers: authHeaders
  }, {
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    industry: 'Tata Steel Utilities & Infrastructure (TSUISL)',
    requiredSupport: 'Direct Pilot Deployment Access in Bistupur Ward 4',
    technicalRequirements: 'High-pressure test loop access and municipal junction installation',
    expectedDuration: '6 Months',
    fundingRequirement: '₹ 1,50,000 for field pilot hardware'
  });
  console.log('5. Collaboration Request Status:', reqRes.status, 'Request ID:', reqRes.body?.data?.id);

  // 6. Test Create Mentor Report
  const repRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/reports',
    method: 'POST',
    headers: authHeaders
  }, {
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    projectId: 'PRJ-CH-2026-089',
    team: 'Smart Water Guild',
    reportType: 'Testing Reports',
    reportingPeriod: 'Sprint 3 (September 2026)',
    progressSummary: 'Field calibration and acoustic sensor bench evaluation completed successfully.',
    technicalProgress: 'Reduced detection latency to 1.15 seconds with 94.2% accuracy.',
    teamPerformance: 'All multidisciplinary deliverables met.',
    milestoneProgress: 'MLS-01, MLS-02 100%, MLS-03 80%.',
    challengesRisks: 'Weatherproofing addressed with IP68 enclosure.',
    nextSteps: 'Complete field pilot deployment in Ward 4.'
  });
  console.log('6. Create Report Status:', repRes.status, 'Report ID:', repRes.body?.data?.id);

  // 7. Test Notifications
  const notifRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/notifications',
    method: 'GET',
    headers: authHeaders
  });
  console.log('7. Notifications Status:', notifRes.status, 'Count:', notifRes.body?.data?.notifications?.length, 'Unread:', notifRes.body?.data?.unreadCount);
}

run().catch(console.error);
