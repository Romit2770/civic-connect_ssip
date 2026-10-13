#!/usr/bin/env node

/**
 * CivicConnect — Automated Load Test Runner (Node.js Engine)
 * Runs smoke, load, stress, and soak workloads against the CivicConnect backend.
 * Measures throughput (req/s), latency percentiles (p50, p90, p95, p99), error rates,
 * and memory metrics, outputting clean formatted telemetry.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
const TEST_MODE = process.argv[2] || 'smoke'; // 'smoke' | 'load' | 'stress' | 'soak'

const PROFILES = {
  smoke: {
    name: 'Smoke Test Baseline',
    concurrency: 5,
    durationSec: 15,
    requestDelayMs: 200,
  },
  load: {
    name: 'Gradual Multi-Tier Load Test',
    concurrency: 25,
    durationSec: 30,
    requestDelayMs: 100,
  },
  stress: {
    name: 'High-Concurrency Stress Test',
    concurrency: 60,
    durationSec: 25,
    requestDelayMs: 50,
  },
  soak: {
    name: 'Endurance Soak Test',
    concurrency: 15,
    durationSec: 60,
    requestDelayMs: 150,
  },
};

const profile = PROFILES[TEST_MODE] || PROFILES.smoke;

const ENDPOINTS = [
  { path: '/health', method: 'GET', weight: 20 },
  { path: '/ready', method: 'GET', weight: 15 },
  { path: '/api/complaints?page=1&limit=10', method: 'GET', weight: 35 },
  { path: '/api/departments', method: 'GET', weight: 15 },
  { path: '/api/map/complaints', method: 'GET', weight: 15 },
];

function pickEndpoint() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const ep of ENDPOINTS) {
    cumulative += ep.weight;
    if (rand <= cumulative) return ep;
  }
  return ENDPOINTS[0];
}

const stats = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  latencies: [],
  statusCodes: {},
  startTime: 0,
  endTime: 0,
};

function executeRequest(url, method = 'GET') {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;

    const req = transport.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CivicConnect-LoadTestRunner/1.0',
        },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const duration = Date.now() - start;
          resolve({ statusCode: res.statusCode, duration, success: res.statusCode >= 200 && res.statusCode < 400 });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ statusCode: 504, duration: Date.now() - start, success: false, timeout: true });
    });

    req.on('error', (err) => {
      resolve({ statusCode: 0, duration: Date.now() - start, success: false, error: err.message });
    });

    req.end();
  });
}

async function worker(workerId, stopTime) {
  while (Date.now() < stopTime) {
    const ep = pickEndpoint();
    const url = `${BASE_URL}${ep.path}`;
    const result = await executeRequest(url, ep.method);

    stats.totalRequests++;
    stats.latencies.push(result.duration);
    stats.statusCodes[result.statusCode] = (stats.statusCodes[result.statusCode] || 0) + 1;

    if (result.success) {
      stats.successRequests++;
    } else {
      stats.failedRequests++;
    }

    if (profile.requestDelayMs > 0) {
      await new Promise((r) => setTimeout(r, profile.requestDelayMs + Math.random() * 50));
    }
  }
}

function calculatePercentiles(samples) {
  if (samples.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = Math.round((sum / sorted.length) * 10) / 10;
  const getP = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];

  return {
    p50: getP(50),
    p90: getP(90),
    p95: getP(95),
    p99: getP(99),
    avg,
  };
}

async function run() {
  console.log(`\n===============================================================`);
  console.log(`🚀 CivicConnect Performance Test Runner`);
  console.log(`===============================================================`);
  console.log(`Profile:     ${profile.name} (${TEST_MODE})`);
  console.log(`Target URL:  ${BASE_URL}`);
  console.log(`Concurrency: ${profile.concurrency} Virtual Users`);
  console.log(`Duration:    ${profile.durationSec} seconds`);
  console.log(`===============================================================\n`);

  stats.startTime = Date.now();
  const stopTime = stats.startTime + profile.durationSec * 1000;

  const workers = [];
  for (let i = 0; i < profile.concurrency; i++) {
    workers.push(worker(i, stopTime));
  }

  await Promise.all(workers);
  stats.endTime = Date.now();

  const totalTimeSec = (stats.endTime - stats.startTime) / 1000;
  const rps = Math.round((stats.totalRequests / totalTimeSec) * 100) / 100;
  const pct = calculatePercentiles(stats.latencies);
  const errorRate = Math.round((stats.failedRequests / stats.totalRequests) * 10000) / 100;

  console.log(`---------------------------------------------------------------`);
  console.log(`📊 PERFORMANCE TEST RESULTS`);
  console.log(`---------------------------------------------------------------`);
  console.log(`Total Requests:      ${stats.totalRequests}`);
  console.log(`Successful (2xx):    ${stats.successRequests}`);
  console.log(`Failed / Errors:     ${stats.failedRequests} (${errorRate}%)`);
  console.log(`Throughput:          ${rps} req/sec`);
  console.log(`Status Codes:        ${JSON.stringify(stats.statusCodes)}`);
  console.log(`\nLatency Percentiles (ms):`);
  console.log(`  p50 (Median):      ${pct.p50} ms`);
  console.log(`  p90:               ${pct.p90} ms`);
  console.log(`  p95:               ${pct.p95} ms`);
  console.log(`  p99:               ${pct.p99} ms`);
  console.log(`  Average:           ${pct.avg} ms`);
  console.log(`---------------------------------------------------------------`);

  const passed = errorRate < 1.0 && pct.p95 < 500;
  console.log(`Status:              ${passed ? '✅ PASSED (Within SLA Thresholds)' : '⚠️ ATTENTION NEEDED'}\n`);
}

run().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
