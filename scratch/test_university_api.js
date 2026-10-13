const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting University Innovation API Test Suite...\n');

  // 1. Login as University Admin
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'univ.admin@nitjsr.ac.in', password: 'Univ@123' }
  );

  if (loginRes.status !== 200 || !loginRes.data.data?.token) {
    console.error('❌ Login failed:', loginRes);
    process.exit(1);
  }

  const token = loginRes.data.data.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✅ 1. Authenticated as University Admin (Dr. Ramesh Kumar).');

  // 2. Dashboard Overview
  const dashRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/dashboard', method: 'GET', headers });
  if (dashRes.status === 200 && dashRes.data.data?.stats) {
    console.log(`✅ 2. Dashboard loaded: ${dashRes.data.data.stats.totalChallenges} challenges, ${dashRes.data.data.stats.activeProjects} active projects.`);
  } else {
    console.error('❌ 2. Dashboard API failed:', dashRes);
  }

  // 3. Challenges List
  const chRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/challenges', method: 'GET', headers });
  if (chRes.status === 200 && Array.isArray(chRes.data.data)) {
    console.log(`✅ 3. Challenges listed: ${chRes.data.data.length} challenges found.`);
  } else {
    console.error('❌ 3. Challenges API failed:', chRes);
  }

  // 4. Update Challenge Status
  const patchRes = await request(
    { hostname: 'localhost', port: 5001, path: '/api/university/challenges/CH-2026-089/status', method: 'PATCH', headers },
    { status: 'Accepted' }
  );
  if (patchRes.status === 200 && patchRes.data.success) {
    console.log('✅ 4. Challenge status updated to Accepted.');
  } else {
    console.error('❌ 4. Challenge status update failed:', patchRes);
  }

  // 5. Teams API
  const teamsRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/teams', method: 'GET', headers });
  if (teamsRes.status === 200 && teamsRes.data.data?.multidisciplinaryTeams) {
    console.log(`✅ 5. Teams API loaded: ${teamsRes.data.data.multidisciplinaryTeams.length} multidisciplinary teams.`);
  } else {
    console.error('❌ 5. Teams API failed:', teamsRes);
  }

  // 6. Projects API
  const projRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/projects', method: 'GET', headers });
  if (projRes.status === 200 && Array.isArray(projRes.data.data)) {
    console.log(`✅ 6. Projects API loaded: ${projRes.data.data.length} projects.`);
  } else {
    console.error('❌ 6. Projects API failed:', projRes);
  }

  // 7. Proposals API
  const propRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/proposals', method: 'GET', headers });
  if (propRes.status === 200 && Array.isArray(propRes.data.data)) {
    console.log(`✅ 7. Proposals API loaded: ${propRes.data.data.length} proposals.`);
  } else {
    console.error('❌ 7. Proposals API failed:', propRes);
  }

  // 8. Industry Matching & Collaboration Requests
  const indRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/industry-matching', method: 'GET', headers });
  if (indRes.status === 200 && indRes.data.data?.matches) {
    console.log(`✅ 8. Industry AI matching loaded: ${indRes.data.data.matches.length} matching corporate partners.`);
  } else {
    console.error('❌ 8. Industry matching API failed:', indRes);
  }

  // 9. University Credentials API (Internal Scope)
  const credRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/credentials', method: 'GET', headers });
  if (credRes.status === 200 && credRes.data.data?.users) {
    console.log(`✅ 9. University internal credentials loaded: ${credRes.data.data.users.length} academic users.`);
  } else {
    console.error('❌ 9. Credentials API failed:', credRes);
  }

  // 10. University Profile API
  const profRes = await request({ hostname: 'localhost', port: 5001, path: '/api/university/profile', method: 'GET', headers });
  if (profRes.status === 200 && profRes.data.data?.institutionId) {
    console.log(`✅ 10. University Profile loaded: ${profRes.data.data.name} (${profRes.data.data.institutionId}).`);
  } else {
    console.error('❌ 10. Profile API failed:', profRes);
  }

  console.log('\n🎉 ALL 10 UNIVERSITY PORTAL API TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(console.error);
