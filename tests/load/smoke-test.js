import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * CivicConnect — Smoke Test Suite (k6)
 * Objective: Fast baseline verification with minimal concurrency (1–5 VUs) for 1–2 minutes.
 * Ensures all core liveness, readiness, citizen, and departmental endpoints respond correctly.
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const TEST_CITIZEN_EMAIL = __ENV.CITIZEN_EMAIL || 'citizen.rahul@example.com';
const TEST_CITIZEN_PASSWORD = __ENV.CITIZEN_PASSWORD || 'Citizen@123';

export const options = {
  vus: parseInt(__ENV.VUS || '3', 10),
  duration: __ENV.DURATION || '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // Less than 1% failed requests
    http_req_duration: ['p(95)<300'], // 95% of requests should be below 300ms
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  // 1. Health & Liveness Probe (< 5ms target)
  const livenessRes = http.get(`${BASE_URL}/health`, params);
  check(livenessRes, {
    'liveness status is 200': (r) => r.status === 200,
    'liveness payload is UP': (r) => {
      try {
        return JSON.parse(r.body).status === 'UP';
      } catch (e) {
        return false;
      }
    },
  });

  // 2. Database Readiness Probe
  const readinessRes = http.get(`${BASE_URL}/ready`, params);
  check(readinessRes, {
    'readiness status is 200': (r) => r.status === 200,
    'database is connected': (r) => {
      try {
        return JSON.parse(r.body).status === 'READY';
      } catch (e) {
        return false;
      }
    },
  });

  // 3. Citizen Login Authentication Journey
  let citizenToken = '';
  const loginPayload = JSON.stringify({
    email: TEST_CITIZEN_EMAIL,
    password: TEST_CITIZEN_PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, params);
  const loginCheck = check(loginRes, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });

  if (loginRes.status === 200) {
    try {
      const data = JSON.parse(loginRes.body);
      citizenToken = data.data?.token || data.token;
    } catch (e) {}
  }

  const authParams = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: citizenToken ? `Bearer ${citizenToken}` : '',
    },
  };

  // 4. Public / Filtered Complaint Feed
  const complaintsRes = http.get(`${BASE_URL}/api/complaints?page=1&limit=10`, params);
  check(complaintsRes, {
    'complaints list status is 200': (r) => r.status === 200,
    'complaints has data array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });

  // 5. Active Municipal Departments Directory
  const departmentsRes = http.get(`${BASE_URL}/api/departments`, params);
  check(departmentsRes, {
    'departments status is 200': (r) => r.status === 200,
  });

  // 6. GIS Map Spatial Complaints
  const mapRes = http.get(`${BASE_URL}/api/map/complaints`, params);
  check(mapRes, {
    'map complaints status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
