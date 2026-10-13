import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * CivicConnect — Stress & Breaking-Point Test Suite (k6)
 * Objective: Gradually increase concurrency beyond normal operating limits
 * (25 -> 50 -> 100 -> 150 -> 250 VUs) to detect pool exhaustion, event-loop lag,
 * and memory exhaustion. Stops gracefully if error thresholds are exceeded.
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const TEST_CITIZEN_EMAIL = __ENV.CITIZEN_EMAIL || 'citizen.rahul@example.com';
const TEST_CITIZEN_PASSWORD = __ENV.CITIZEN_PASSWORD || 'Citizen@123';

const isQuick = __ENV.QUICK === 'true';

export const options = {
  stages: isQuick
    ? [
        { duration: '30s', target: 20 },
        { duration: '45s', target: 50 },
        { duration: '45s', target: 100 },
        { duration: '20s', target: 0 },
      ]
    : [
        { duration: '2m', target: 25 },
        { duration: '3m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '5m', target: 150 },
        { duration: '5m', target: 250 },
        { duration: '2m', target: 0 },
      ],
  thresholds: {
    // Stress circuit breaker: Fail if errors exceed 5% or p95 exceeds 2000ms
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  // 1. Core Health Probe (must stay responsive under load)
  const healthRes = http.get(`${BASE_URL}/health`, params);
  check(healthRes, {
    'liveness probe healthy': (r) => r.status === 200,
  });

  // 2. High-Frequency Complaint Query
  const limit = Math.floor(Math.random() * 20) + 5;
  const page = Math.floor(Math.random() * 5) + 1;
  const complaintsRes = http.get(
    `${BASE_URL}/api/complaints?page=${page}&limit=${limit}`,
    params
  );
  check(complaintsRes, {
    'complaints query responsive': (r) => r.status === 200,
  });

  // 3. Departments Directory
  const deptRes = http.get(`${BASE_URL}/api/departments`, params);
  check(deptRes, {
    'departments query responsive': (r) => r.status === 200,
  });

  // 4. Spatial Map Complaints
  const pinsRes = http.get(`${BASE_URL}/api/map/complaints`, params);
  check(pinsRes, {
    'map complaints query responsive': (r) => r.status === 200,
  });

  // 5. Readiness verification to ensure DB pool is not deadlocked
  if (Math.random() < 0.1) {
    const readyRes = http.get(`${BASE_URL}/ready`, params);
    check(readyRes, {
      'database pool responsive': (r) => r.status === 200,
    });
  }

  sleep(Math.random() * 1.5 + 0.5);
}
