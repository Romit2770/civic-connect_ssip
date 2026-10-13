# CivicConnect — Load, Stress & Endurance Testing Suite

This directory contains the automated performance testing suite for the **CivicConnect** platform. It provides both **k6** scripts for standard CI/CD load testing and a standalone **Node.js test runner** (`runner.js`) for zero-dependency execution.

---

## 1. Test Suite Overview

| Script | Purpose | Concurrency | Target Duration | Success Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **`smoke-test.js`** | Baseline sanity check for core health, readiness, and public endpoints | 3–5 VUs | 60s | Error rate < 1%, p95 < 300ms |
| **`load-test.js`** | Multi-tier gradual load test simulating realistic citizen & staff traffic | 10 &rarr; 25 &rarr; 50 &rarr; 100 VUs | 37m (or 3m in quick mode) | Error rate < 1%, p95 < 500ms |
| **`stress-test.js`** | High-concurrency breaking-point test with circuit breaker | 25 &rarr; 50 &rarr; 100 &rarr; 150 &rarr; 250 VUs | 22m (or 2m in quick mode) | Circuit breaks if error > 5% |
| **`soak-test.js`** | Prolonged endurance test to uncover memory/connection leaks | 20–25 VUs | 44m (or 3m in quick mode) | No creeping latency, stable heap |
| **`runner.js`** | Cross-platform Node.js load testing engine (runs without k6 binary) | Configurable | Configurable | Computes p50, p90, p95, p99 |

---

## 2. Environment Variables

Configure these variables via shell export or in your `.env` file:

```bash
# Target Base URL of CivicConnect backend
BASE_URL="http://localhost:5001"

# Synthetic Test Credentials (Never use production citizen credentials)
CITIZEN_EMAIL="citizen.rahul@example.com"
CITIZEN_PASSWORD="Citizen@123"
STAFF_EMAIL="admin@civicconnect.gov.in"
STAFF_PASSWORD="Admin@123"

# Optional Quick Mode for rapid CI validation (shortened stage durations)
QUICK="true"
```

---

## 3. How to Run the Tests

### Option A: Using k6 (Standard)

```bash
# 1. Run Smoke Test
k6 run tests/load/smoke-test.js

# 2. Run Gradual Load Test (Quick CI Mode)
k6 run -e QUICK=true tests/load/load-test.js

# 3. Run Gradual Load Test (Full Production Stages: 10 -> 25 -> 50 -> 100 VUs)
k6 run tests/load/load-test.js

# 4. Run Stress Test
k6 run tests/load/stress-test.js

# 5. Run Soak Test
k6 run tests/load/soak-test.js
```

### Option B: Using the Node.js Test Runner (Zero-Dependency)

If `k6` is not installed on your system or in lightweight container environments:

```bash
# Smoke test (5 VUs, 15 seconds)
node tests/load/runner.js smoke

# Load test (25 VUs, 30 seconds)
node tests/load/runner.js load

# Stress test (60 VUs, 25 seconds)
node tests/load/runner.js stress

# Soak test (15 VUs, 60 seconds)
node tests/load/runner.js soak
```

---

## 4. Performance Targets & SLA Thresholds

* **Read Requests (`GET /api/complaints`, `/api/map/pins`, `/api/departments`):** p95 latency **< 350 ms**
* **Write Requests (`POST /api/complaints`, `/api/auth/login`):** p95 latency **< 1,000 ms** (excluding external Gemini upload time)
* **Overall HTTP Error Rate:** **< 1.0%**
* **Liveness & Readiness Probes (`/health`, `/ready`):** p95 latency **< 25 ms**
* **Memory Stability:** Node.js process RSS and HeapUsed must stabilize and not continuously grow during the soak test.

---

## 5. Security & Safety Guidelines

1. **Staging Environment Only:** Never run stress or soak tests against production municipal servers (`*.gov.in` or production Render URLs).
2. **Synthetic Data Only:** Tests must only authenticate with seeded synthetic accounts.
3. **No Hardcoded Secrets:** Passwords and tokens must be injected via environment variables.
4. **Third-Party API Protection:** The load test separates internal Express/MongoDB endpoints from Google Gemini calls to avoid consuming commercial API quotas during stress runs.
