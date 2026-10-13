# CivicConnect — Crowdsourced Civic Issue Reporting & Resolution System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white.svg)](https://socket.io/)

A full-stack, enterprise-grade municipal grievance redressal, multi-stakeholder collaboration, and spatial GIS resolution platform connecting Citizens, Municipal Corporations, Universities (Faculty & Students), Industry/CSR Partners, and Field Workers to resolve community infrastructure challenges.

---

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [AI Architecture & Multimodal Engine](#ai-architecture)
- [Matching & Routing Engine](#matching-engine)
- [Stakeholder Modules](#stakeholder-modules)
  - [Citizen Module](#citizen-module)
  - [University Module (HEIs)](#university-module)
  - [Industry & CSR Module](#industry-module)
  - [Government & Municipal Administration](#government-module)
  - [Field Worker & Verification Engine](#field-worker-module)
- [GIS & Spatial Features](#gis-features)
- [Database Architecture](#database)
- [Installation & Setup](#installation)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Running the Application](#running-the-application)
- [Build & Production](#build)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [Contributors & License](#contributors)

---

## Overview

**CivicConnect** is a technology-enabled Societal Innovation and Municipal Grievance Redressal platform. It bridges the divide between on-ground civic challenges (e.g. road damage, water supply disruptions, waste accumulation, malfunctioning streetlights, urban flooding) and institutional problem-solvers (Municipal Departments, Universities, Research Hubs, and Corporate CSR/Industry partners).

By combining **GeoJSON spatial ward boundaries**, **multimodal AI assessment (Google Gemini + Fallback Classifier)**, **automated SLA lifecycle tracking**, and **real-time WebSocket event streaming**, CivicConnect ensures that every submitted societal issue is verified, assigned, tracked, funded, and conclusively resolved with photographic proof.

---

## Problem Statement

Municipalities and communities encounter thousands of unresolved civic and societal challenges due to:
1. **Lack of Accessible Reporting**: Citizens lack intuitive channels to submit geotagged photographic and audio evidence.
2. **Operational Silos**: Manual routing and disconnected departments cause severe delays and misclassification.
3. **Absence of SLA & Accountability**: Lack of automated deadline enforcement and lack of proof verification when issues are marked "resolved".
4. **Untapped Academic & Industry Potential**: Higher Education Institutions (HEIs) and CSR/Industry partners have significant expertise and funding but lack a structured mechanism to collaborate on real-world community challenges (as envisioned by NEP 2020).

---

## Solution

CivicConnect delivers a unified platform that:
- Captures crowdsourced societal challenges with rich multimedia evidence, GPS coordinates, and voice memos.
- Uses **multimodal AI** to automatically classify thematic domains, assess severity, and detect potential duplicate submissions.
- Executes **2dsphere spatial GIS point-in-polygon queries** to route issues to exact municipal administrative wards.
- Connects validated civic problems to **Higher Education Institutions (HEIs)** for multidisciplinary student-faculty capstone projects and research solutions.
- Engages **Industry & CSR Partners** to sponsor, mentor, fund, and deploy pilot solutions.
- Enforces strict **SLA monitoring engines** with automated escalation and citizen verification before closure.

---

## Key Features

- 📍 **Interactive GIS Mapping**: Real-time Leaflet & OpenStreetMap interface with custom ward polygons, category clustering, and heatmaps.
- 🤖 **Advisory Multimodal AI**: Google Gemini Vision & Audio integration for automated grievance categorization, severity assessment, and verification.
- ⚡ **Real-Time Communication**: Socket.IO-powered bi-directional event bus for live updates, department notifications, and task dispatches.
- ⏱️ **Automated SLA Lifecycle Engine**: Dynamic resolution deadline computation, hourly background checks, overdue alerts, and breach escalations.
- 🔐 **Role-Based Access Control (RBAC)**: Secure multi-role access (Citizen, Super Admin, Municipal Admin, Department Officer, Field Worker, Faculty, Student Lead, CSR Sponsor, Corporate Partner).
- 🎙️ **Voice & Video Evidence**: In-browser voice notes and video recording modal with cryptographic file integrity validation.
- 📊 **Executive Analytics & PDF Reporting**: Visual data dashboards (Recharts) and automated PDF report generation (jsPDF / html2canvas).
- 🌐 **Multilingual Support**: Internationalization (i18n) for English, Hindi (हिंदी), and Gujarati (ગુજરાતી).

---

## System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   CivicConnect Client (SPA)    │
                                  │   React 18 + Vite + Tailwind   │
                                  └───────────────┬────────────────┘
                                                  │ HTTPS / WSS
                                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CivicConnect Backend Engine                              │
│                               Node.js / Express / TypeScript                           │
├──────────────────────┬───────────────────────────┬─────────────────────────────────────┤
│  Security & Auth     │     Core Controllers      │          Specialized Engines        │
│  - JWT & Refresh     │  - Auth & Roles           │  - 2dsphere GIS Spatial Routing     │
│  - Helmet & CORS     │  - Grievance Lifecycle    │  - SLA Background Monitor Worker    │
│  - Mongo-Sanitize    │  - University & Faculty   │  - Socket.IO Real-time Broadcaster  │
│  - Rate Limiting     │  - Industry & CSR         │  - Gemini Multimodal Vision API     │
│                      │  - Municipal Ops & Admin  │  - Deterministic Fallback Classifier│
└──────────────────────┴─────────────┬─────────────┴─────────────────────────────────────┘
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐
│       MongoDB Database       │            │        Media Storage         │
│  - Geospatial 2dsphere Wards │            │  - Local File System         │
│  - Multi-stakeholder Models  │            │  - Cloudinary Cloud Storage  │
└──────────────────────────────┘            └──────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.3 (TypeScript)
- **Bundler & Tooling**: Vite 6.1, TypeScript 5.7
- **Styling**: Tailwind CSS 4.0, Lucide React Icons
- **GIS & Mapping**: Leaflet 1.9, React-Leaflet 4.2
- **State & Data**: TanStack React Query 5.66, React Hook Form, Zod
- **Real-time Client**: Socket.IO Client 4.8
- **Charts & Reports**: Recharts 2.15, jsPDF 4.2, html2canvas
- **Internationalization**: i18next, react-i18next

### Backend
- **Runtime & Framework**: Node.js, Express 4.21 (TypeScript)
- **Database Driver**: Mongoose 8.10 (MongoDB Atlas / Local)
- **Real-time Server**: Socket.IO 4.8
- **Security**: JWT (jsonwebtoken), bcryptjs, Helmet 8.0, express-rate-limit, express-mongo-sanitize
- **File Uploads**: Multer 1.4, Cloudinary SDK 2.10
- **AI SDK**: `@google/generative-ai` (Gemini 1.5/2.0 multimodal)

---

## AI Architecture

CivicConnect employs a dual-tier AI architecture designed for resilience, low latency, and high accuracy:

1. **Multimodal Gemini Vision Provider**:
   - Ingests uploaded photographs or live webcam captures.
   - Identifies civic damage patterns (asphalt distress, overflowing waste, structural cracks, water main leaks).
   - Generates confidence scores, severity rating (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and suggested municipal category.
   - Evaluates pre- and post-resolution photos to verify genuine completion.

2. **Deterministic Rule-Based Fallback Engine**:
   - Activates automatically if the Gemini API key is omitted, offline, or rate-limited.
   - Uses keyword heuristics, text entropy, and metadata validators to ensure 100% service uptime without external API dependencies.

---

## Matching & Routing Engine

When a grievance or societal challenge is logged:
1. **Spatial Ward Detection**: The engine queries MongoDB with `$geoIntersects` against GeoJSON multi-polygons defining municipal wards.
2. **Priority Computation**: Evaluates public hazard risk, location sensitivity (schools, hospitals), and age of report.
3. **Workload Balancing**: Automatically assigns the issue to the active field officer in that ward with the lowest active task count.
4. **Institutional Routing**: Complex societal challenges requiring academic innovation are routed to partnered Universities based on faculty specialization and incubation focus.

---

## Stakeholder Modules

### Citizen Module
- Guided 5-step reporting wizard with GPS map pinning, live camera modal, voice memos, and video evidence.
- Real-time status tracking with unique Tracking IDs (`CC-YYYY-XXXX`).
- Public interactive GIS map with community upvoting and issue subscription.
- Citizen post-resolution confirmation and satisfaction feedback loop.

### University Module (HEIs)
- Dedicated portals for University Administrators, Faculty Mentors, and Student Leads.
- Review community challenge statements and assemble multidisciplinary project teams.
- Milestone tracking, research proposal submission, and automated PDF progress reporting.

### Industry & CSR Module
- CSR Initiative sponsorship and corporate partner collaboration.
- Funding commitment workflows, grant disbursement tracking, and technology transfer pipelines.
- Mentorship matching between corporate technical experts and student project teams.

### Government & Municipal Administration
- Executive Command Center with live KPI counters, department rosters, and SLA health indicators.
- Credential management to generate secure credentials for institutional stakeholders.
- Immutable security audit logs (`AuditLog`) capturing all administrative actions.

### Field Worker Module
- Mobile-friendly task management interface for field inspectors and maintenance crews.
- Step-by-step workflow: *Assigned* → *Start Work (In Progress)* → *Upload Proof Photos* → *Submit Resolution*.

---

## GIS & Spatial Features

- **GeoJSON Ward Polygons**: Precise boundary containment queries.
- **Reverse Geocoding**: Converts map coordinates to street addresses via OpenStreetMap Nominatim.
- **Spatial Clustering**: Groups nearby reports to detect macro-level infrastructure failures.
- **Live Location Tracking**: Browser Geolocation API integration with high accuracy GPS fallback.

---

## Database Architecture

The system uses MongoDB with 18+ normalized schemas:

- `User`: Multi-role user accounts, hashed credentials, department/ward associations.
- `Complaint`: Central grievance entity with spatial coordinates, SLA timestamps, and status history.
- `Department`: Municipal departments (Public Works, Sanitation, Water Supply, Sewerage, etc.).
- `Ward`: Municipal administrative boundaries stored as GeoJSON `Polygon` with `2dsphere` indexes.
- `University` & `Industry`: Academic institutions and corporate partners.
- `CSRInitiative` & `CorporatePartnerCollaboration`: Funding and sponsorship commitments.
- `ComplaintAssignment`: Field officer assignments and workload distribution.
- `ComplaintStatusHistory`: Immutable state machine transition records.
- `EvidenceVerification` & `AIAnalysis`: Cryptographic media hashes and AI assessment results.
- `SLAConfiguration`: Configurable SLA resolution target thresholds per department and priority.
- `Notification` & `AuditLog`: In-app alert records and administrative action audit trails.

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/krishbhingradiya/Civic-Connect-AI.git
cd Civic-Connect-AI
```

### 2. Install Dependencies
Install all root, backend, and frontend packages with npm workspaces:
```bash
npm install
```

---

## Environment Variables

Copy the provided [`.env.example`](.env.example) to `.env` in the root directory:

```bash
cp .env.example .env
```

### Configuration Parameters

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend REST API server port | `5001` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/civicconnect` |
| `JWT_SECRET` | Secret key for signing access JWT tokens | *Required* |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | *Required* |
| `JWT_EXPIRY` | Access token expiration duration | `1h` |
| `JWT_REFRESH_EXPIRY`| Refresh token expiration duration | `7d` |
| `AI_PROVIDER` | AI backend (`gemini` or `fallback`) | `fallback` |
| `AI_MODEL` | Google Gemini model identifier | `gemini-1.5-flash` |
| `GEMINI_API_KEY` | Google Gemini API Key | *(Optional)* |
| `STORAGE_PROVIDER` | Media storage (`local` or `cloudinary`) | `local` |
| `CLOUDINARY_*` | Cloudinary storage credentials | *(Optional)* |
| `SLA_MONITOR_ENABLED` | Enable automated SLA background monitor | `true` |
| `SLA_MONITOR_INTERVAL_MINUTES` | Frequency of SLA checks in minutes | `60` |
| `FRONTEND_URL` | Frontend origin for CORS policy | `http://localhost:5173` |

---

## Local Development

### 1. Seed the Database
Populate municipal departments, wards with GeoJSON polygons, demo users, and sample grievances:
```bash
npm run seed
```

### 2. Run Both Frontend and Backend Concurrently
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5001](http://localhost:5001)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

### Separate Frontend & Backend Setup

#### Backend Setup
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

#### Frontend Setup
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

---

## Demo Credentials

The database seeder initializes the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin / Commissioner** | `superadmin@civicconnect.gov.in` | `Admin@123` |
| **Municipal Admin** | `admin@civicconnect.gov.in` | `Admin@123` |
| **Department Head (PWD)** | `pwd.head@civicconnect.gov.in` | `Admin@123` |
| **Field Officer (PWD)** | `officer.rajesh@civicconnect.gov.in` | `Officer@123` |
| **Field Officer (Sanitation)** | `officer.priya@civicconnect.gov.in` | `Officer@123` |
| **Citizen** | `citizen.rahul@example.com` | `Citizen@123` |

---

## Build & Production

To compile both backend TypeScript code and frontend static assets:

```bash
npm run build
```

This runs:
1. `npm run build:backend` (`tsc` inside `backend/` compiling to `backend/dist/`)
2. `npm run build:frontend` (`tsc -b && vite build` inside `frontend/` compiling to `frontend/dist/`)

---

## Testing

Run the automated test suite:
```bash
npm test
```

---

## Project Structure

```
Civic-Connect-AI/
├── backend/
│   ├── src/
│   │   ├── ai/                      # AI Vision Provider & Fallback Classifier
│   │   ├── config/                  # Database, Socket.IO, and Environment setup
│   │   ├── controllers/             # Express Route Controllers (Auth, Complaints, University, CSR, etc.)
│   │   ├── middleware/              # Auth, RBAC, Upload, and Error handling middleware
│   │   ├── models/                  # Mongoose Data Models (User, Complaint, Ward, SLA, etc.)
│   │   ├── routes/                  # API Route Definitions
│   │   ├── seed/                    # Database Seed Script
│   │   ├── services/                # Business Services (Routing, SLA Monitor, Storage, Ward Service)
│   │   ├── types/                   # TypeScript Type Definitions
│   │   ├── utils/                   # Utilities (Media validators, ID generators)
│   │   ├── app.ts                   # Express Application configuration
│   │   └── index.ts                 # HTTP Server & Socket.IO bootstrap
│   ├── uploads/                     # Local media storage directory
│   ├── package.json                 # Backend dependencies & scripts
│   └── tsconfig.json                # Backend TypeScript configuration
│
├── frontend/
│   ├── public/                      # Static assets & evidence images
│   ├── src/
│   │   ├── api/                     # Axios HTTP Client with JWT interceptors
│   │   ├── components/              # Modular UI Components (Maps, Uploaders, Modals, Badges)
│   │   ├── context/                 # React Context Providers (Auth, Socket, Offline)
│   │   ├── i18n/                    # Localization files (English, Hindi, Gujarati)
│   │   ├── pages/                   # Application Pages organized by Stakeholder Role
│   │   │   ├── admin/               # Municipal & Super Admin Dashboards
│   │   │   ├── auth/                # Authentication & Registration
│   │   │   ├── citizen/             # Citizen Reporting & Tracking
│   │   │   ├── corporatePartner/    # Corporate Partner Interface
│   │   │   ├── csr/                 # CSR Initiatives & Sponsorship
│   │   │   ├── faculty/             # University Faculty Mentor Workspace
│   │   │   ├── fieldWorker/         # Field Officer Resolution Portal
│   │   │   ├── industry/            # Industry Challenge Incubator
│   │   │   ├── municipality/        # Municipality Operations
│   │   │   ├── studentLead/         # Student Team Leadership
│   │   │   └── university/          # University Administration
│   │   ├── types/                   # Frontend TypeScript interfaces
│   │   ├── App.tsx                  # Root Routing & Route Guards
│   │   ├── index.css                # Global CSS & Tailwind Utilities
│   │   └── main.tsx                 # React App Entry Point
│   ├── index.html                   # HTML Entry Template
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tsconfig.json                # Frontend TypeScript configuration
│   └── vite.config.ts               # Vite bundler configuration
│
├── .env.example                     # Environment template (no secrets)
├── .gitignore                       # Git ignore specifications
├── package.json                     # Root npm workspace configuration
├── package-lock.json                # NPM dependency lockfile
├── PROBLEM_STATEMENT.md             # Detailed Problem Statement & Expected Solution
└── README.md                        # Project documentation (This file)
```

---

## Security Notes

- **Secrets Management**: No production credentials or API keys are stored in source code. `.env` is strictly ignored.
- **Input Sanitization**: All MongoDB queries are sanitized with `express-mongo-sanitize` to prevent NoSQL injection attacks.
- **Security Headers**: Standard HTTP security headers applied via `helmet`.
- **Upload Constraints**: Strict MIME-type checking and file size limitations on media uploads.
- **Rate Limiting**: Public API endpoints protected with `express-rate-limit`.

---

## Contributors & License

Developed for the **Smart India Hackathon** Civic Redressal & Innovation Challenge.

Distributed under the **MIT License**.
