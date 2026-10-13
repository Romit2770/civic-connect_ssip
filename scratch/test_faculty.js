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
  console.log('Testing Faculty Mentor Authentication & Scoped Endpoints...');
  
  // 1. Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'faculty.mentor@bitmesra.ac.in', password: 'Faculty@123' });

  console.log('1. Login status:', loginRes.status, 'Role:', loginRes.body?.data?.user?.role, 'User:', loginRes.body?.data?.user?.name);
  const token = loginRes.body?.data?.token;
  if (!token) {
    console.error('Failed to get token');
    return;
  }

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // 2. Dashboard
  const dashRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/dashboard',
    method: 'GET',
    headers: authHeader
  });
  console.log('2. Dashboard status:', dashRes.status, 'Stats:', dashRes.body?.data?.stats);

  // 3. Challenges
  const chalRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/challenges',
    method: 'GET',
    headers: authHeader
  });
  console.log('3. Challenges status:', chalRes.status, 'Count:', chalRes.body?.data?.length, 'First:', chalRes.body?.data?.[0]?.id);

  // 4. Teams
  const teamsRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/teams',
    method: 'GET',
    headers: authHeader
  });
  console.log('4. Teams status:', teamsRes.status, 'Count:', teamsRes.body?.data?.length, 'Team:', teamsRes.body?.data?.[0]?.name);

  // 5. Projects
  const projRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/projects',
    method: 'GET',
    headers: authHeader
  });
  console.log('5. Projects status:', projRes.status, 'Count:', projRes.body?.data?.length, 'Stage:', projRes.body?.data?.[0]?.currentStage);

  // 6. Milestones
  const mlsRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/milestones',
    method: 'GET',
    headers: authHeader
  });
  console.log('6. Milestones status:', mlsRes.status, 'Count:', mlsRes.body?.data?.length);

  // 7. Industry
  const indRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/industry',
    method: 'GET',
    headers: authHeader
  });
  console.log('7. Industry status:', indRes.status, 'Partners:', indRes.body?.data?.recommendedPartners?.length, 'Requests:', indRes.body?.data?.collaborationRequests?.length);

  // 8. Profile
  const profRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/faculty/profile',
    method: 'GET',
    headers: authHeader
  });
  console.log('8. Profile status:', profRes.status, 'Name:', profRes.body?.data?.facultyName, 'Dept:', profRes.body?.data?.department);

  // 9. RBAC Test on /api/university/credentials
  const rbacRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/university/credentials',
    method: 'GET',
    headers: authHeader
  });
  console.log('9. RBAC Test on /api/university/credentials - Status code:', rbacRes.status, '(Expected 403 Forbidden)');
}

run().catch(console.error);
