import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * CivicConnect — Soak & Endurance Test Suite (k6)
 * Objective: Run a constant moderate workload (20–30 VUs) for an extended duration (30–60 minutes)
 * to uncover memory leaks, unclosed database cursor leaks, heap bloat, and creeping latency.
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const TEST_CITIZEN_EMAIL = __ENV.CITIZEN_EMAIL || 'citizen.rahul@example.com';
const TEST_CITIZEN_PASSWORD = __ENV.CITIZEN_PASSWORD || 'Citizen@123';

const isQuick = __ENV.QUICK === 'true';

export const options = {
  stages: isQuick
    ? [
        { duration: '30s', target: 20 },
        { duration: '2m', target: 20 },
        { duration: '30s', target: 0 },
      ]
    : [
        { duration: '2m', target: 25 },  // Ramp-up
        { duration: '40m', target: 25 }, // Steady endurance soak
        { duration: '2m', target: 0 },   // Ramp-down
      ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Error rate must remain under 1% throughout
    http_req_duration: ['p(95)<450'],  // p95 latency must not degrade beyond 450ms
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  // 1. Periodic liveness & readiness check
  const healthRes = http.get(`${BASE_URL}/health`, params);
  check(healthRes, { 'health check ok': (r) => r.status === 200 });

  // 2. Fetch complaint list with rotating pages
  const page = (Math.floor(Math.random() * 5)) + 1;
  const listRes = http.get(`${BASE_URL}/api/complaints?page=${page}&limit=10`, params);
  check(listRes, { 'complaint list ok': (r) => r.status === 200 });

  // 3. Departments directory
  const deptRes = http.get(`${BASE_URL}/api/departments`, params);
  check(deptRes, { 'departments ok': (r) => r.status === 200 });

  // 4. Map complaints
  const mapRes = http.get(`${BASE_URL}/api/map/complaints`, params);
  check(mapRes, { 'map complaints ok': (r) => r.status === 200 });

  // 5. Periodic telemetry check to monitor heap memory stability
  if (Math.random() < 0.05) {
    const metricsRes = http.get(`${BASE_URL}/api/metrics`, params);
    check(metricsRes, {
      'metrics ok': (r) => r.status === 200,
    });
  }

  sleep(Math.random() * 2 + 1);
}
