import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * CivicConnect — Gradual Load Test Suite (k6)
 * Objective: Measure throughput, latency percentiles (p50, p95, p99), and error rates
 * across multi-tier concurrency stages (10 -> 25 -> 50 -> 100 VUs).
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const TEST_CITIZEN_EMAIL = __ENV.CITIZEN_EMAIL || 'citizen.rahul@example.com';
const TEST_CITIZEN_PASSWORD = __ENV.CITIZEN_PASSWORD || 'Citizen@123';
const TEST_STAFF_EMAIL = __ENV.STAFF_EMAIL || 'admin@civicconnect.gov.in';
const TEST_STAFF_PASSWORD = __ENV.STAFF_PASSWORD || 'Admin@123';

// Quick mode environment override for rapid CI/CD runs (e.g. QUICK=true)
const isQuick = __ENV.QUICK === 'true';

export const options = {
  stages: isQuick
    ? [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ]
    : [
        { duration: '5m', target: 10 },  // Stage 1: 10 VUs
        { duration: '10m', target: 25 }, // Stage 2: 25 VUs
        { duration: '10m', target: 50 }, // Stage 3: 50 VUs
        { duration: '10m', target: 100 },// Stage 4: 100 VUs
        { duration: '2m', target: 0 },   // Cool-down
      ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // < 1% error rate
    http_req_duration: ['p(95)<500'],  // p95 < 500ms
    'http_req_duration{type:read}': ['p(95)<350'],
    'http_req_duration{type:write}': ['p(95)<1000'],
  },
};

export default function () {
  const commonHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Group 1: Public Health & Liveness
  group('Liveness & Core Infrastructure', function () {
    const res = http.get(`${BASE_URL}/health`, {
      headers: commonHeaders,
      tags: { type: 'read' },
    });
    check(res, {
      'liveness is 200': (r) => r.status === 200,
    });
  });

  // Group 2: Citizen User Journey
  group('Citizen Exploration & Feed Querying', function () {
    // 1. Fetch paginated complaint list
    const page = Math.floor(Math.random() * 3) + 1;
    const complaintsRes = http.get(
      `${BASE_URL}/api/complaints?page=${page}&limit=15&priority=high`,
      {
        headers: commonHeaders,
        tags: { type: 'read' },
      }
    );
    check(complaintsRes, {
      'complaints list status is 200': (r) => r.status === 200,
      'complaints payload valid': (r) => {
        try {
          return JSON.parse(r.body).success === true;
        } catch (e) {
          return false;
        }
      },
    });

    // 2. Search complaints by keyword
    const searchTerms = ['water', 'pothole', 'drain', 'light', 'garbage'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchRes = http.get(`${BASE_URL}/api/complaints?search=${term}&limit=10`, {
      headers: commonHeaders,
      tags: { type: 'read' },
    });
    check(searchRes, {
      'search query status is 200': (r) => r.status === 200,
    });

    // 3. GIS Map Complaints
    const mapRes = http.get(`${BASE_URL}/api/map/complaints`, {
      headers: commonHeaders,
      tags: { type: 'read' },
    });
    check(mapRes, {
      'map complaints status is 200': (r) => r.status === 200,
    });
  });

  // Group 3: Authenticated Citizen Interaction
  group('Authenticated Citizen Actions', function () {
    const loginPayload = JSON.stringify({
      email: TEST_CITIZEN_EMAIL,
      password: TEST_CITIZEN_PASSWORD,
    });

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
      headers: commonHeaders,
      tags: { type: 'write' },
    });

    let citizenToken = '';
    if (loginRes.status === 200) {
      try {
        const body = JSON.parse(loginRes.body);
        citizenToken = body.data?.token || body.token;
      } catch (e) {}
    }

    if (citizenToken) {
      const authHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      };

      // Query authenticated user profile
      const meRes = http.get(`${BASE_URL}/api/auth/me`, {
        headers: authHeaders,
        tags: { type: 'read' },
      });
      check(meRes, {
        'user me is 200': (r) => r.status === 200,
      });

      // Query citizen's own complaints
      const myComplaintsRes = http.get(`${BASE_URL}/api/complaints?my=true&limit=10`, {
        headers: authHeaders,
        tags: { type: 'read' },
      });
      check(myComplaintsRes, {
        'my complaints is 200': (r) => r.status === 200,
      });

      // AI Pre-Classification Validation Assessment
      const aiPayload = JSON.stringify({
        description: 'Road cave-in and broken drainage pipe near central bus station',
        category: 'drainage',
        latitude: 22.5645,
        longitude: 72.9285,
        address: 'Station Road, Ward 4',
      });
      const aiRes = http.post(`${BASE_URL}/api/ai/classify-complaint`, aiPayload, {
        headers: authHeaders,
        tags: { type: 'write' },
      });
      check(aiRes, {
        'ai classify status is 200 or 400': (r) => r.status === 200 || r.status === 400,
      });
    }
  });

  // Group 4: Administrative Dashboard Queries
  group('Municipal Administrative Queries', function () {
    const adminLoginPayload = JSON.stringify({
      email: TEST_STAFF_EMAIL,
      password: TEST_STAFF_PASSWORD,
    });

    const adminLoginRes = http.post(`${BASE_URL}/api/auth/login`, adminLoginPayload, {
      headers: commonHeaders,
      tags: { type: 'write' },
    });

    let adminToken = '';
    if (adminLoginRes.status === 200) {
      try {
        const body = JSON.parse(adminLoginRes.body);
        adminToken = body.data?.token || body.token;
      } catch (e) {}
    }

    if (adminToken) {
      const staffHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${adminToken}`,
      };

      // Admin Overview (uses 15s cache)
      const overviewRes = http.get(`${BASE_URL}/api/admin/overview`, {
        headers: staffHeaders,
        tags: { type: 'read' },
      });
      check(overviewRes, {
        'admin overview is 200': (r) => r.status === 200,
      });

      // Analytics categories
      const analyticsRes = http.get(`${BASE_URL}/api/admin/analytics/categories`, {
        headers: staffHeaders,
        tags: { type: 'read' },
      });
      check(analyticsRes, {
        'categories analytics is 200': (r) => r.status === 200,
      });
    }
  });

  sleep(Math.random() * 2 + 1); // Think time: 1–3 seconds
}
