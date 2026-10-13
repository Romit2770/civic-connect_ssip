# CivicConnect — Complete Project Audit

## One-Line Project Description
CivicConnect is currently a full-stack crowdsourced municipal civic grievance and field operations system (SIH-195/CHA-195) that has not yet been transitioned or extended into the required SIH Societal Innovation Collaboration Portal connecting citizens, universities, and industries for research, prototyping, and social impact.

## Technology Stack
- **Frontend**: React 18.3.1, TypeScript 5.7.3, Vite 6.1.0, Tailwind CSS v4.0.6, React Router DOM 6.29.0, TanStack React Query 5.66.0, React Hook Form 7.54.2, Zod 3.24.2, Lucide React 0.475.0, Leaflet 1.9.4 & React-Leaflet 4.2.1, Recharts 2.15.1, i18next 24.2.2 & react-i18next 15.4.0, Axios 1.7.9, Socket.IO Client 4.8.1, idb 8.0.2.
- **Backend**: Node.js v22+ runtime, Express 4.21.2, TypeScript 5.7.3, tsx 4.19.3 (watcher), Mongoose 8.10.1 (MongoDB ODM), Socket.IO 4.8.1, Multer 1.4.5-lts.1, Cloudinary 2.10.0, Bcryptjs 2.4.3, JsonWebToken 9.0.2, Helmet 8.0.0, Express-Rate-Limit 7.5.0, Express-Mongo-Sanitize 2.2.0, Zod 3.24.2, Dotenv 16.4.7, UUID 11.1.0.
- **AI & Forensics**: Google Generative AI SDK (`@google/generative-ai` 0.24.1) using Gemini Vision (`gemini-3.6-flash` / `gemini-1.5-flash`), custom 64-bit Perceptual Difference Hashing (dHash), heuristic EXIF metadata extraction, rule-based keyword fallback classifier.
- **Database**: MongoDB 8.0+ with 2dsphere GeoJSON spatial indexing (`location`, `boundary`, `centerPoint`), compound indexing for triage and SLA management.
- **DevOps & Testing**: Concurrently 9.1.2, Jest 29.7.0, Ts-Jest 29.2.5, Supertest 7.2.2.

## Current Architecture
The current system operates on a client-server monorepo (npm workspaces for `backend` and `frontend`) backed by MongoDB and Google Gemini API:
$$\text{Citizen Browser (React)} \xrightarrow{\text{REST + JWT / WebSocket}} \text{Express Backend} \xrightarrow{\text{Mongoose ODM}} \text{MongoDB (GeoJSON 2dsphere)}$$
$$\text{Express Backend} \xrightarrow{\text{Base64 / InlineData}} \text{Google Gemini Vision API} \xrightarrow{\text{JSON Schema}} \text{Automated Classification \& Evidence Verification}$$
$$\text{Express Backend} \xrightarrow{\text{Events}} \text{Socket.IO Server} \xrightarrow{\text{Rooms: user, role, department}} \text{Real-time UI Updates}$$

## Overall Implementation Status
The existing repository is a **working, highly polished functional prototype of a Municipal Civic Grievance Management System (CHA-195)**, with fully functional citizen complaint reporting, spatial ward detection, field officer mobile task execution, SLA escalation workers, real-time WebSocket alerts, and forensic evidence analysis. 

However, **relative to the Smart India Hackathon baseline requirement for a University & Industry Innovation Collaboration Portal**, the project has a **critical domain divergence**:
- **Municipal Grievance Redressal**: ~75% Complete and functional.
- **University / HEI Matching Engine**: 0% Implemented (No models, algorithms, or APIs exist).
- **Faculty & Student Team Formation**: 0% Implemented.
- **Industry / Startup / CSR Collaboration**: 0% Implemented.
- **Project Lifecycle Management (Milestones, Prototypes, Pilots, IP/Patents)**: 0% Implemented.
- **State/District-level Societal Innovation Analytics**: 0% Implemented.

## Major Working Features
1. **Multi-Step Citizen Reporting Wizard**: Photo drag-and-drop, webcam capture modal, Leaflet OpenStreetMap reverse-geocoding, audio voice note recording, and category selection.
2. **Advisory Multimodal AI & Fallback**: Dual-mode classification with Google Gemini Vision API and an internal keyword-based fallback classifier (`fallbackClassifier.ts`).
3. **Multi-Signal Photographic Evidence Verification**: 64-bit dHash perceptual fingerprinting, Hamming distance duplicate image check, EXIF metadata extraction, and Gemini forensic synthetic image evaluation (`imageVerificationService.ts`).
4. **Spatial Ward Detection Engine**: MongoDB `$geoIntersects` point-in-polygon querying matching complaint coordinates against GeoJSON polygon ward boundaries (`wardService.ts`).
5. **Workload-Balanced Auto-Routing**: Dynamic routing mapping issue categories to municipal department codes and assigning the field officer with the lowest active workload (`routingService.ts`).
6. **Configurable Dynamic SLA Engine**: SLA calculation from database configuration with automated background worker (`slaMonitorService.ts`) triggering warnings, breaches, and Level-2 escalations.
7. **Field Officer Task Workflow**: Dedicated mobile-first dashboard (`FieldOfficerDashboard.tsx`) with start-task, completion photo upload, and resolution submission.
8. **Real-time WebSockets**: Socket.IO room-based push notifications for department queues, individual user alerts, and city-wide feeds (`socket.ts`).
9. **Full Audit Logging**: Cryptographic tracking of administrative actions, status overrides, and evidence verifications (`AuditLog.ts`).

## Major Problems
1. **Critical Privilege Escalation Security Vulnerability**: In `backend/src/controllers/authController.ts` (line 45), `const assignedRole = role === 'citizen' || !role ? 'citizen' : role;` allows any unauthenticated user to register directly as `super_admin` or `municipal_admin` via public `POST /api/auth/register`.
2. **AI Assessment Gate Bypass in Wizard**: In `frontend/src/pages/citizen/ReportPage.tsx` (lines 113–118), the pre-submission call to `/api/ai/classify-complaint` only sends text strings (`description`, `category`), omitting uploaded image files. Consequently, the AI gate token is issued without evaluating photo relevance, allowing submission before deep image verification occurs in the backend.
3. **Optimistic Fallback Masking Invalid Evidence**: In `backend/src/services/imageVerificationService.ts` (lines 343–347), if Gemini Vision times out or fails, the service falls back to marking the image as `LIKELY_REAL` with a 92% visual realism score and 90% civic relevance confidence, permitting fabricated or irrelevant images to pass.
4. **Hardcoded Admin Dashboard & Analytics Fallbacks**: `DashboardPage.tsx` uses hardcoded fallback numbers (`'1,248'`, `'42'`, `'1,164'`, `'8'`) when data is loading or missing. `AnalyticsPage.tsx` falls back to static hardcoded arrays with mismatched chart property keys (`date` vs `_id`, `submitted` vs `reported`).
5. **Hardcoded Fallback JWT Secrets**: In `backend/src/config/env.ts` (lines 13–14), hardcoded fallback strings are used if `.env` variables are omitted, presenting a credential compromise risk.

## Major Missing Features
1. **University / HEI Profile & Management Module**: Missing collections and interfaces for Universities, Campuses, Departments, Faculty Researchers, Research Labs, Incubation Centres, and Innovation Hubs.
2. **Multi-Factor University Matching Engine**: Intended 7-factor weighted algorithm (Domain 20%, Research Area 20%, Technical Skills 15%, Technology 15%, Faculty Expertise 15%, Labs/Facilities 10%, Previous Projects 5%) is completely missing.
3. **Student & Faculty Team Formation**: No functionality for faculty mentors, student roles, cross-disciplinary teaming, or university challenge acceptance/rejection.
4. **Industry / Startup / CSR Sponsorship & Co-Development**: No registration, sponsorship bidding, CSR grant commitment, mentoring, or co-development portals.
5. **Project Lifecycle & Milestone Tracker**: No tracking for proposals, milestones, deliverables, prototype demonstrations, field pilots, technology transfers, or IP/patents.
6. **Societal Innovation Taxonomy**: Platform only supports 11 municipal breakdown categories (potholes, garbage, streetlights) rather than broad societal challenges (education, agriculture, water harvesting, maternal health, rural livelihoods).

## Most Important Next Steps
1. **Patch Security Flaws Immediately**: Fix the registration role-escalation vulnerability in `authController.ts` and require strict `.env` secret validation.
2. **Redesign Schemas for Societal Innovation**: Create new MongoDB collections: `Challenge` (generalizing `Complaint`), `University`, `Faculty`, `Student`, `IndustryPartner`, `Project`, `Milestone`, `Proposal`, and `InnovationMetric`.
3. **Implement 7-Factor University Matching Engine**: Build `backend/src/services/universityMatchingService.ts` implementing the exact weighted formula against real university research profiles.
4. **Build University & Faculty Portals**: Implement challenge evaluation, faculty mentor assignment, student team builder, and proposal submission workflows.
5. **Build Industry / CSR Collaboration Hub**: Implement funding commitments, mentor engagement, and prototype co-development interfaces.
6. **Build Project Lifecycle State Machine**: Track projects from proposal through prototyping, pilot testing, technology transfer, and patent filing.
7. **Transition Analytics to Innovation KPIs**: Replace municipal charts with district-level societal challenge heatmaps, university participation rosters, patent counts, and community impact indicators.

---

# 1. Project Context
- **Project Name**: CivicConnect
- **Original Codebase Purpose**: Crowdsourced municipal civic grievance redressal and operations platform for Urban Local Bodies (ULBs) and Municipal Corporations (SIH-195 / CHA-195).
- **Intended Target Baseline**: Smart India Hackathon Societal Innovation Collaboration Portal connecting Citizens, Higher Education Institutions (HEIs), Faculty, Students, and Industry/Startups across Jharkhand and India to transform real-world societal problems into deployable innovations, startups, and patents.

---

# 2. SIH Problem Statement Baseline (43 Capabilities)

The platform must satisfy 43 baseline capabilities defined in the official problem statement:
1. Citizen/community challenge submission
2. Multimedia evidence upload
3. Photograph, video, and document storage
4. Geographic location capture and GIS mapping
5. AI-based challenge categorization
6. AI-based prioritization
7. Duplicate challenge detection
8. Problem validation workflow
9. University / HEI matching engine
10. Matching using expertise, research areas, and institutional capabilities
11. University challenge evaluation and screening
12. Faculty mentor assignment
13. Student team formation
14. Multidisciplinary collaboration
15. Solution proposal submission
16. Industry, startup, MSME, and CSR participation
17. Industry mentoring
18. Project funding and CSR sponsorship
19. Co-development of solutions
20. Prototyping lifecycle
21. Testing and evaluation
22. Pilot implementation in local communities
23. Technology transfer
24. Project lifecycle management
25. Milestones tracking
26. Deliverables submission and approval
27. Formal stage-gate approvals
28. Documentation repository
29. Testing outcomes verification
30. Intellectual property (IP) and patent tracking
31. Implementation status tracking
32. Automated notifications and alerts
33. Multi-stakeholder communication and messaging
34. Government administrative dashboards
35. District-wise challenge analytics
36. Sector / domain analytics
37. University participation analytics
38. Industry engagement analytics
39. Project progress analytics
40. Innovation outcomes measurement
41. Patent filings tracking
42. Startups created tracking
43. Community social impact measurement

---

# 3. Current Tech Stack Verification

| Technology | Status | Where Used / Files | Actual Functionality | Missing / Broken Integrations |
| :--- | :---: | :--- | :--- | :--- |
| **React 18** | ✅ REAL | `frontend/package.json` (`react: ^18.3.1`) | Full virtual DOM rendering across citizen & admin layouts | None |
| **Vite** | ✅ REAL | `frontend/vite.config.ts`, `frontend/package.json` (`vite: ^6.1.0`) | Client build tool and dev server (`http://localhost:5173`) | None |
| **TypeScript** | ✅ REAL | `backend/tsconfig.json`, `frontend/tsconfig.json` | Static type checking in both workspaces | Several implicit `any` types in controller handlers |
| **Tailwind CSS v4** | ✅ REAL | `frontend/src/index.css`, `@tailwindcss/vite: ^4.0.6` | Custom government design system tokens and styling | None |
| **Leaflet / GIS** | ✅ REAL | `frontend/src/components/common/LocationPicker.tsx`, `ComplaintMap.tsx` | Interactive OpenStreetMap tile rendering, pin placement, ward boundary GeoJSON overlays | Layer styling requires manual reload on filter toggles |
| **Recharts** | ✅ REAL | `frontend/src/pages/admin/AnalyticsPage.tsx` (`recharts: ^2.15.1`) | Renders Bar, Area, and Pie charts | Data property key mismatch with backend API response |
| **Node.js / Express**| ✅ REAL | `backend/src/app.ts`, `index.ts` (`express: ^4.21.2`) | RESTful API server with modular routing on port 5001 | None |
| **Socket.IO** | ✅ REAL | `backend/src/config/socket.ts`, `frontend/src/context/SocketContext.tsx` | Real-time WebSocket event emission (`user:*`, `role:*`, `department:*`) | Reconnect logic does not re-authenticate expired tokens |
| **Zod** | ✅ REAL | `backend/src/ai/types.ts`, `frontend/src/pages/citizen/ReportPage.tsx` | Runtime validation for schemas and form inputs | Not universally applied to all backend controller inputs |
| **Multer** | ✅ REAL | `backend/src/middleware/upload.ts`, `routes/complaints.ts` | Memory storage parsing for multipart file buffers (photos, audio, videos) | Does not enforce file type magic-number validation (extension check only) |
| **MongoDB / Mongoose**| ✅ REAL | `backend/src/models/*`, `Mongoose 8.10.1` | NoSQL persistence with 2dsphere spatial indexing | Missing all University, Innovation, and Project collections |
| **Gemini Multimodal AI**| ✅ REAL | `backend/src/ai/GeminiVisionProvider.ts` (`@google/generative-ai: ^0.24.1`) | Multimodal analysis using `gemini-3.6-flash` / `gemini-1.5-flash` | Photo buffer omitted in frontend pre-submission call |
| **Dynamic SLA** | ✅ REAL | `backend/src/services/slaMonitorService.ts`, `models/SLAConfiguration.ts` | Background timer scanning database for overdue complaints | Only tailored for municipal categories; lacks innovation project SLAs |
| **University Matching**| ❌ NONE | Does not exist in any file | **NOT IMPLEMENTED** | Entire algorithm, models, and endpoints are absent |
| **AI Verification** | ✅ REAL | `backend/src/services/imageVerificationService.ts` | dHash perceptual hashing, EXIF search, Gemini authenticity prompt | Fallback masks invalid/manipulated images as authentic |
| **Notifications** | ✅ REAL | `backend/src/models/Notification.ts`, `services/notificationService.ts` | Database in-app notifications and real-time Socket.IO alerts | No live SMS, WhatsApp, or SMTP email delivery |
| **Role Dashboards** | 🟡 PARTIAL | `frontend/src/pages/admin/DashboardPage.tsx`, `FieldOfficerDashboard.tsx` | Municipal admin, department officer, and field officer views | Missing University, Faculty, Student, Industry, and CSR dashboards |

---

# 4. Full Project Structure Audit

```
e:\SIH_FINAL\SIH_FINAL
├── .env                              # Active environment file
├── .env.example                      # Template configuration
├── package.json                      # Root workspace definition (backend, frontend)
├── README.md                         # Comprehensive documentation for CHA-195
├── IMAGE_SOURCES.md                  # Attribution for local municipal UI images
├── ai-service/                       # Abandoned Python service (Empty .venv and __pycache__)
├── backend/
│   ├── package.json                  # Backend dependencies and tsx scripts
│   ├── tsconfig.json                 # TypeScript compiler configuration
│   └── src/
│       ├── app.ts                    # Express application setup, security middleware, routes
│       ├── index.ts                  # HTTP & Socket.IO server initialization, DB connect
│       ├── ai/                       # AI providers and classification
│       │   ├── GeminiVisionProvider.ts # Google Generative AI vision implementation
│       │   ├── aiService.ts          # AI orchestration with fallback
│       │   ├── fallbackClassifier.ts # Rule-based municipal keyword classifier
│       │   └── types.ts              # Zod schemas and TypeScript interfaces for AI
│       ├── config/                   # Configuration files
│       │   ├── database.ts           # Mongoose MongoDB connection pooling
│       │   ├── env.ts                # Environment variable parsing with defaults
│       │   └── socket.ts             # Socket.IO room setup and emitters
│       ├── controllers/              # REST API endpoint handlers
│       │   ├── adminController.ts    # KPI aggregation, analytics, SLA config, audit logs
│       │   ├── aiController.ts       # AI classification, voice transcription, translation
│       │   ├── authController.ts     # User registration, login, profile fetch
│       │   ├── complaintController.ts# Full complaint lifecycle and assignment
│       │   ├── departmentController.ts# Department CRUD and worker management
│       │   ├── evidenceController.ts # Forensic evidence analysis & human override
│       │   ├── mapController.ts      # GeoJSON complaint and ward boundary streaming
│       │   ├── notificationController.ts # In-app notification read/unread handlers
│       │   └── officerController.ts  # Field officer task list, start, and resolve
│       ├── middleware/               # Express interceptors
│       │   ├── audit.ts              # AuditLog writer
│       │   ├── auth.ts               # JWT verification and user hydration
│       │   ├── errorHandler.ts       # Global exception formatter
│       │   ├── roles.ts              # Role-based access control guards
│       │   └── upload.ts             # Multer memory storage and file size filters
│       ├── models/                   # Mongoose database models
│       │   ├── AIAnalysis.ts         # Structured AI prediction records
│       │   ├── AuditLog.ts           # System-wide action audit trail
│       │   ├── CitizenVerification.ts# Citizen post-resolution satisfaction feedback
│       │   ├── Complaint.ts          # Core grievance/complaint record (alias: Issue)
│       │   ├── ComplaintAssignment.ts# Officer assignment records
│       │   ├── ComplaintComment.ts   # Case communication thread
│       │   ├── ComplaintStatusHistory.ts # Immutable state transition logs
│       │   ├── Department.ts         # Municipal departments and codes
│       │   ├── DuplicateGroup.ts     # Clustered duplicate complaints
│       │   ├── EvidenceVerification.ts# Forensic visual and metadata analysis records
│       │   ├── Issue.ts              # Compatibility re-export of Complaint
│       │   ├── Notification.ts       # In-app notifications
│       │   ├── SLAConfiguration.ts   # Category and priority deadline configs
│       │   ├── User.ts               # Users and credentials
│       │   ├── Ward.ts               # Municipal ward boundaries with GeoJSON Polygons
│       │   └── index.ts              # Model barrel exports
│       ├── routes/                   # Express router mounts
│       │   ├── admin.ts
│       │   ├── ai.ts
│       │   ├── auth.ts
│       │   ├── complaints.ts
│       │   ├── departments.ts
│       │   ├── evidence.ts
│       │   ├── issues.ts
│       │   ├── map.ts
│       │   ├── notifications.ts
│       │   └── officers.ts
│       ├── seed/                     # Database seeder
│       │   └── seed.ts               # Seeds 8 departments, 10 wards, demo users, complaints
│       ├── services/                 # Core domain services
│       │   ├── duplicateService.ts   # Spatial proximity duplicate detection
│       │   ├── imageVerificationService.ts # dHash, EXIF, and Gemini authenticity
│       │   ├── notificationService.ts# DB notification writer and socket dispatcher
│       │   ├── priorityEngine.ts     # Explainable priority calculation
│       │   ├── routingService.ts     # Ward GIS and workload officer routing
│       │   ├── slaMonitorService.ts  # Background interval SLA breach worker
│       │   ├── wardService.ts        # MongoDB $geoIntersects polygon ward lookup
│       │   └── storage/              # Multimedia storage drivers
│       │       ├── CloudinaryStorageProvider.ts
│       │       ├── LocalStorageProvider.ts
│       │       └── storageService.ts
│       ├── types/                    # Common backend TypeScript interfaces
│       └── utils/                    # Utility functions (SLA, ID generation)
└── frontend/
    ├── package.json                  # Frontend dependencies
    ├── vite.config.ts                # Vite config with Tailwind CSS plugin
    └── src/
        ├── App.tsx                   # Route definitions and protected route wrappers
        ├── main.tsx                  # React DOM bootstrap
        ├── index.css                 # Tailwind CSS v4 design system
        ├── api/
        │   └── client.ts             # Axios client with JWT interceptor
        ├── components/
        │   ├── common/               # Shared reusable UI widgets
        │   │   ├── CameraCaptureModal.tsx # Webcam capture dialog
        │   │   ├── ComplaintCard.tsx # Grievance display card
        │   │   ├── ComplaintMap.tsx  # Leaflet OpenStreetMap wrapper
        │   │   ├── ComplaintTimeline.tsx # Status progress stepper
        │   │   ├── EvidenceUploader.tsx # Drag & drop file uploader
        │   │   ├── EvidenceVerificationBadge.tsx # Risk chip (PASS/REVIEW/HIGH_RISK)
        │   │   ├── EvidenceVerificationPanel.tsx # Detailed forensic modal
        │   │   ├── GovernmentCaptcha.tsx # Visual security captcha
        │   │   ├── GovernmentHeader.tsx # Official national header bar
        │   │   ├── GovernmentFooter.tsx # Official government footer
        │   │   ├── LocationPicker.tsx# Interactive coordinate picker with reverse geocoding
        │   │   ├── NotificationDropdown.tsx # Real-time notification menu
        │   │   ├── PriorityBadge.tsx # Priority status chip
        │   │   ├── SLAIndicator.tsx  # SLA countdown chip
        │   │   ├── StatusBadge.tsx   # Complaint lifecycle badge
        │   │   └── VoiceRecorder.tsx # MediaRecorder audio capture
        │   ├── dashboard/
        │   │   └── FieldOfficerDashboard.tsx # Dedicated field worker task management
        │   └── layout/
        │       ├── AdminLayout.tsx   # Operations center layout with navigation drawer
        │       └── CitizenLayout.tsx # Public portal header and footer wrapper
        ├── context/
        │   ├── AuthContext.tsx       # JWT session state
        │   ├── OfflineContext.tsx    # IndexedDB offline draft storage
        │   └── SocketContext.tsx     # WebSocket connection provider
        ├── i18n/                     # Multilingual localization
        │   └── locales/ (en, hi, gu) # English, Hindi, Gujarati translation strings
        ├── pages/
        │   ├── admin/                # Operations Center Pages
        │   │   ├── AnalyticsPage.tsx # Recharts grievance & SLA charts
        │   │   ├── DashboardPage.tsx # Master command overview
        │   │   ├── DepartmentsPage.tsx # Municipal department & worker CRUD
        │   │   ├── IssueDetailAdminPage.tsx # Detailed case management & reassignment
        │   │   ├── IssuesPage.tsx    # Master grievance registry table with filters
        │   │   ├── LiveMapPage.tsx   # GIS surveillance map with layers
        │   │   └── OfficersPage.tsx  # Field inspector roster
        │   ├── auth/
        │   │   ├── LoginPage.tsx     # Authentication form with 1-click demo logins
        │   │   └── RegisterPage.tsx  # Citizen registration form
        │   └── citizen/              # Public Citizen Pages
        │       ├── HomePage.tsx      # Landing page with banner, ticker, categories
        │       ├── IssueDetailPage.tsx # Citizen tracking case file with feedback
        │       ├── MapPage.tsx       # Public GIS transparency map
        │       ├── MyReportsPage.tsx # Citizen personal case history
        │       ├── ProfilePage.tsx   # User profile management
        │       ├── ReportPage.tsx    # 5-step citizen grievance reporting wizard
        │       └── TrackReportPage.tsx # Quick search by complaint tracking code
        └── types/                    # Frontend TypeScript interfaces
```

---

# 5. User Roles Audit

The codebase currently implements **5 municipal roles** defined in `backend/src/models/User.ts` (line 70). The SIH required innovation roles are completely absent.

| Role | Implemented? | Can Login? | Can Register? | Dashboard Route | Submit Challenge? | Form Team? | Match University? | Participate in Project? | Manage Users? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Citizen** | ✅ YES | ✅ YES | ✅ YES | `/my-reports` | ✅ YES (Municipal) | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Field Officer** | ✅ YES | ✅ YES | ❌ NO (Seeded) | `/admin` (`FieldOfficerDashboard`) | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Department Officer** | ✅ YES | ✅ YES | ❌ NO (Seeded) | `/admin` | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Municipal Admin** | ✅ YES | ✅ YES | ❌ NO (Seeded) | `/admin` | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ✅ YES |
| **Super Admin** | ✅ YES | ✅ YES | ❌ NO (Seeded) | `/admin` | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ✅ YES |
| **Community Organization** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Government Dept (State)** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Panchayati Raj Inst.** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Urban Local Body (ULB)** | 🟡 ALIAS | Municipal Admin serves this function | | | | | | | |
| **University Admin** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Faculty / Mentor** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Student** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Industry / Startup** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **MSME / CSR Partner** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| **Research / Incubation Hub** | ❌ NO | ❌ NO | ❌ NO | None | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |

### Role Protection Audit
- **Frontend Route Protection**: Implemented in `frontend/src/App.tsx` (lines 31–51). Non-admin roles accessing `/admin` are redirected to `/`.
- **Backend Route Protection**: Implemented via middleware `requireStaff`, `requireAdmin`, and `requireRole` in `backend/src/middleware/roles.ts`.
- **Role Display Discrepancy**: On `frontend/src/pages/admin/DashboardPage.tsx`, if a `field_officer` logs in, line 33 correctly swaps the UI to render `FieldOfficerDashboard.tsx`. However, the sidebar links (`AdminLayout.tsx`) still display "Departments" and "Officers" to field officers even though attempting to edit triggers a backend 403.

---

# 6. Authentication & Authorization Audit

### Technical Implementation
- **Registration**: `POST /api/auth/register` in `authController.ts` accepts `name`, `email`, `password`, `phone`, `role`.
- **Password Hashing**: Bcryptjs with salt rounds = 10 (`User.ts` pre-save hook).
- **Authentication Token**: Signed JSON Web Token (`jsonwebtoken`) storing `userId`, `role`, and optional `departmentId`.
- **Token Expiration**: Configurable (`1h` default).
- **Refresh Tokens**: Defined in `User.ts` (`refreshToken` field) and `env.ts` (`JWT_REFRESH_SECRET`), but **refresh endpoint is not implemented** in `authController.ts` or `routes/auth.ts`.
- **OTP / MFA**: Simulated in UI (`GovernmentCaptcha.tsx`); no actual SMS OTP or email verification gateway is integrated.
- **Backend Enforcement**: Genuine backend enforcement exists on endpoints via `authenticate` and `requireRole`.

### Critical Security Findings
1. **Critical Privilege Escalation in User Registration**:
   - **File**: `backend/src/controllers/authController.ts` (Line 45)
   - **Flaw**:
     ```typescript
     const assignedRole = role === 'citizen' || !role ? 'citizen' : role;
     ```
   - **Impact**: Any external user can register as `super_admin` or `municipal_admin` by sending `{"role": "super_admin"}` in the JSON body.
2. **Hardcoded Fallback JWT Secrets**:
   - **File**: `backend/src/config/env.ts` (Lines 13–14)
   - **Flaw**: `process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026'`
   - **Impact**: If `.env` is unreadable, predictable secrets are used in production.

---

# 7. Citizen Challenge Submission Audit

### Complete Flow Trace
$$\text{ReportPage.tsx (5 Steps)} \longrightarrow \text{POST /api/ai/classify-complaint} \longrightarrow \text{POST /api/complaints (multipart)} \longrightarrow \text{MongoDB (Complaint)}$$

1. **Step 1: Category Selection**: User selects 1 of 11 municipal categories (pothole, garbage, streetlight, water, drainage, road_damage, public_property, fallen_tree, illegal_dumping, traffic, other).
2. **Step 2: Photographic Evidence**: User uploads up to 5 photos or captures live via webcam (`CameraCaptureModal.tsx`).
3. **Step 3: Geolocation**: Coordinates selected via Leaflet map or browser HTML5 Geolocation (`LocationPicker.tsx`).
4. **Step 4: Description & Voice Note**: Multi-line text and optional audio recording via `MediaRecorder` (`VoiceRecorder.tsx`).
5. **Step 5: Review & AI Assessment Gate**: Calls `POST /api/ai/classify-complaint` to generate an `aiAssessmentToken`.

### Data Reaching MongoDB
- **Saved**: `title`, `description`, `category`, `subcategory`, `location` (GeoJSON Point), `wardId`, `departmentId`, `assignedOfficerId`, `photos` (URLs), `photoAssets`, `mediaAssets`, `voiceAudioUrl`, `voiceTranscript`, `priority`, `priorityScore`, `slaDeadline`, `aiAssessment`.
- **File Storage**: Multer memory storage buffers uploaded to local `/uploads` or Cloudinary (`storageService.ts`).
- **Fake / Invalid Data Vulnerability**: If a user enters arbitrary coordinates outside municipal boundaries, the system defaults to ward-less routing without blocking submission. If an invalid image is uploaded, it still passes because Step 5 does not send files to the classifier.

---

# 8. AI Analysis Audit

### Implemented AI Features

| Feature | Input | Prompt / Method | Model | Output | Storage | Real or Dummy? |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **A. Categorization** | Description, Voice Transcript, User Category | Prompts Gemini as Senior Municipal Civil Engineer | `gemini-3.6-flash` | Category, subcategory, confidence | `AIAnalysis.category`, `Complaint.category` | ✅ REAL (w/ Rule Fallback) |
| **B. Prioritization** | Severity, Duplicates, Aging, Safety Risk | Algorithmic weighted formula (`priorityEngine.ts`) | Rule Engine | Score (0–100), Priority level, explanations | `Complaint.priorityScore`, `priorityExplanation` | ✅ REAL |
| **C. Problem Validation** | Description & Category | Evaluates plausibility in Gemini prompt | `gemini-3.6-flash` | `evidenceValidation.allowSubmission` | JWT Gate Token | 🟡 PARTIAL (Text only in pre-call) |
| **D. Description Quality** | Text string | Assessed in Gemini analysis | `gemini-3.6-flash` | Summary & Reasoning | `AIAnalysis.summary` | ✅ REAL |
| **E. Evidence Verification** | First image buffer | Chief Forensic Evidence prompt (`imageVerificationService.ts`) | `gemini-3.6-flash` | Realism score, artifacts, synthetic risk | `EvidenceVerification` collection | ✅ REAL (w/ Fallback Flaw) |
| **F. Synthetic Image Detection**| Binary image buffer | Evaluates AI generation artifacts in prompt | `gemini-3.6-flash` | `syntheticProbability`, `authenticityStatus` | `EvidenceVerification.aiVisual` | 🟡 ADVISORY (Prompt-based) |
| **G. Object Detection** | Image buffer | Identifies municipal defect elements | `gemini-3.6-flash` | Array of strings (`detectedObjects`) | `AIAnalysis.detectedObjects` | ✅ REAL |
| **H. Duplicate Detection** | GPS coordinates & category | MongoDB `$near` 100m spatial query | MongoDB 2dsphere | Duplicate flag, master complaint ID | `DuplicateGroup` collection | ✅ REAL (Spatial only) |
| **I. Severity Estimation** | Description & photos | Rated 1–10 in Gemini prompt | `gemini-3.6-flash` | Integer (1–10) | `AIAnalysis.severity` | ✅ REAL |
| **J. Recommended Department**| Predicted category | Maps category to controlled department code | Deterministic Map | `departmentCode`, `departmentSlug` | `Complaint.department` | ✅ REAL |
| **K. University Matching** | None | None | None | None | None | ❌ NOT IMPLEMENTED |

### Critical Flaw in AI Handling of Weak/Fake Input
- **Irrelevant / Anime / Fake Images**: In `GeminiVisionProvider.ts` (lines 45–48), the prompt instructs Gemini to reject non-civic images. However, in `imageVerificationService.ts` (line 343), if the Gemini call times out or fails (e.g. rate limit, network drop), the `catch` block defaults to:
  ```typescript
  aiVisualResult = {
    authenticityStatus: 'LIKELY_REAL',
    syntheticProbability: 0.05,
    visualRealismScore: 92,
    ...
  }
  ```
  This falsely marks the image as valid and authentic!

---

# 9. Image / Evidence Verification Audit

1. **Image Upload**: Supported via Multer (`upload.any()`, `upload.array('photos', 5)`).
2. **Image Storage**: Pluggable storage architecture (`LocalStorageProvider.ts` for `/uploads`, `CloudinaryStorageProvider.ts`).
3. **Image Accessibility**: Served statically via Express `/uploads` route or direct Cloudinary HTTPS CDN URLs.
4. **Perceptual Fingerprinting (dHash)**: Implemented in pure Node.js in `imageVerificationService.ts` (lines 76–103). Computes a 64-bit difference hash from luminance gradients across the buffer.
5. **Hamming Distance Comparison**: Implemented in `calculateHammingDistance` (lines 108–122). Compares new image hashes against the last 100 verifications; distance $\le 5$ triggers a duplicate warning.
6. **EXIF Metadata Parsing**: Custom buffer scanner (`extractMetadata`, lines 127–188) searching for camera makes (Apple, Samsung, Xiaomi), editing software tags (Photoshop, Midjourney, Canva), and `DateTimeOriginal` timestamps.
7. **Synthetic Image Detection**: **PROMPT ONLY — NOT A DEDICATED MODEL**. Evaluated via textual prompt to Gemini Vision; no dedicated neural model (e.g. ResNet, EfficientNet) or C2PA cryptographic provenance parser is integrated.

---

# 10. Duplicate Detection Audit

- **Exact Duplicate**: Not checked via file hash (only via 64-bit dHash in evidence service).
- **Spatial Radius Proximity**: Implemented in `duplicateService.ts` using MongoDB `$near` query within a default 100-meter radius for matching categories in active statuses (`submitted` to `reopened`).
- **Clustering**: When a nearby match is found, creates or links to a `DuplicateGroup` record and increments `reportCount`.
- **Semantic Text Duplicate**: ❌ **NOT IMPLEMENTED**. No vector embeddings, cosine similarity, or NLP matching is performed on challenge descriptions.
- **Image Similarity**: ✅ **IMPLEMENTED** via dHash Hamming distance ($\le 5 / 64$ bits).

---

# 11. Validation Workflow Audit

### Actual Status Enum
Defined in `backend/src/models/Complaint.ts` (lines 142–146):
```typescript
enum: [
  'submitted', 'acknowledged', 'routed', 'assigned', 'in_progress',
  'resolution_submitted', 'verification_pending', 'resolved',
  'reopened', 'closed', 'rejected', 'needs_manual_classification'
]
```

### Current Status Flow
$$\text{Submitted} \xrightarrow{\text{Auto Routing}} \text{Routed} \xrightarrow{\text{Officer Found}} \text{Assigned} \xrightarrow{\text{Field Officer Starts}} \text{In Progress}$$
$$\text{In Progress} \xrightarrow{\text{Officer Uploads Proof}} \text{Resolution Submitted} \xrightarrow{\text{Citizen Verifies}} \text{Resolved} \text{ (or Reopened)}$$

### Missing Innovation Transitions
The current status machine is strictly tailored for physical repairs. It lacks all SIH innovation lifecycle states:
- `Under Evaluation`
- `Matching University`
- `Assigned to University`
- `Team Formed`
- `Proposal Submitted`
- `Industry Matched`
- `Prototyping`
- `Pilot Testing`
- `Technology Transfer`
- `Patent Filed`

---

# 12. University Matching Engine Audit

### Critical Finding: COMPLETELY UNIMPLEMENTED
The intended multi-factor matching engine with the specified weights:
- Domain = 20%
- Research Area = 20%
- Technical Skills = 15%
- Technology = 15%
- Faculty Expertise = 15%
- Labs/Facilities = 10%
- Previous Relevant Projects = 5%

**DOES NOT EXIST IN THE CODEBASE.**
- There is no `matchingService.ts` or `calculateUniversityMatch()` function.
- There are no database models for Universities, Research Areas, or Faculty.
- The reason "No suitable university match found" would occur in any simulation is that **the entire matching subsystem has not been written**.
- The existing routing engine (`routingService.ts`) only routes civic complaints to municipal departments (`PUBLIC_WORKS`, `SANITATION`, etc.) and field officers.

---

# 13. University Module Audit
- **University Registration**: ❌ NOT IMPLEMENTED
- **University Profiles**: ❌ NOT IMPLEMENTED
- **Department & Faculty Directory**: ❌ NOT IMPLEMENTED
- **Research Areas & Labs**: ❌ NOT IMPLEMENTED
- **Incubation & Innovation Centres**: ❌ NOT IMPLEMENTED
- **Challenge Assignment**: ❌ NOT IMPLEMENTED
- **Proposal Submission**: ❌ NOT IMPLEMENTED

---

# 14. Student & Faculty Team Management Audit
- **Team Builder**: ❌ NOT IMPLEMENTED
- **Faculty Mentor Assignment**: ❌ NOT IMPLEMENTED
- **Student Roster**: ❌ NOT IMPLEMENTED
- **Cross-Disciplinary Team Allocation**: ❌ NOT IMPLEMENTED
- **Team Progress Tracking**: ❌ NOT IMPLEMENTED

---

# 15. Industry / Startup / CSR Module Audit
- **Industry Registration**: ❌ NOT IMPLEMENTED
- **CSR Funding & Sponsorship**: ❌ NOT IMPLEMENTED
- **Industry Mentorship**: ❌ NOT IMPLEMENTED
- **Prototype Co-Development**: ❌ NOT IMPLEMENTED
- **Pilot Implementation Support**: ❌ NOT IMPLEMENTED

---

# 16. Project Lifecycle Management Audit
- **Milestone Tracking**: ❌ NOT IMPLEMENTED
- **Deliverables Upload & Review**: ❌ NOT IMPLEMENTED
- **Stage-Gate Approvals**: ❌ NOT IMPLEMENTED
- **Prototype Testing Logs**: ❌ NOT IMPLEMENTED
- **Intellectual Property / Patent Tracking**: ❌ NOT IMPLEMENTED
- **Startup Spin-off Tracking**: ❌ NOT IMPLEMENTED

---

# 17. Notification & Communication Audit

| Feature | Status | Implementation Details | Evidence |
| :--- | :---: | :--- | :--- |
| **Socket.IO Real-Time** | ✅ WORKING | Emits to user, role, and department rooms | `backend/src/config/socket.ts` |
| **In-App Notification Bell** | ✅ WORKING | Unread count badge, mark as read, links to case | `NotificationDropdown.tsx`, `/api/notifications` |
| **Case Discussion Thread** | ✅ WORKING | Citizens and staff can post comments on issues | `ComplaintComment.ts`, `complaints.ts:46` |
| **Email Delivery (SMTP)** | ❌ DUMMY | Boolean flags in `Department.notificationSettings`, no SMTP transporter | `seed.ts`, `Department.ts` |
| **SMS / WhatsApp Gateway** | ❌ NOT IMPLEMENTED | No external provider (Twilio, MSG91) integrated | README line 49 |

---

# 18. Dashboard & Analytics Audit

| Dashboard / Chart | File | Data Source | Real vs Dummy |
| :--- | :--- | :--- | :---: |
| **Admin Overview KPI Cards** | `DashboardPage.tsx` | `/api/admin/overview` | 🟡 REAL DB WITH DUMMY FALLBACKS (`1,248`, `42`) |
| **Critical Grievance Queue** | `DashboardPage.tsx` | `overview.criticalGrievancesList` | ✅ REAL DATABASE DATA |
| **Department Workload** | `DashboardPage.tsx` | `overview.departmentStats` | ✅ REAL DATABASE DATA |
| **Field Officer Task View** | `FieldOfficerDashboard.tsx`| `/api/officers/tasks` | ✅ REAL DATABASE DATA |
| **Category Distribution Chart** | `AnalyticsPage.tsx` | `/api/admin/analytics/categories` | 🔴 BROKEN KEYS / DUMMY FALLBACK |
| **Department Efficiency Chart**| `AnalyticsPage.tsx` | `/api/admin/analytics/departments` | 🔴 BROKEN KEYS / DUMMY FALLBACK |
| **Ward Density Chart** | `AnalyticsPage.tsx` | `/api/admin/analytics/wards` | 🔴 BROKEN KEYS / DUMMY FALLBACK |
| **Inflow Trend Chart** | `AnalyticsPage.tsx` | `/api/admin/analytics/trends` | 🔴 BROKEN KEYS / DUMMY FALLBACK |
| **District-Wise Analytics** | Missing | None | ❌ NOT IMPLEMENTED |
| **University Participation** | Missing | None | ❌ NOT IMPLEMENTED |
| **Patents & Startups Count** | Missing | None | ❌ NOT IMPLEMENTED |

---

# 19. SLA & Prioritization Audit

### Priority Score Formula
Implemented in `backend/src/services/priorityEngine.ts`:
$$\text{Priority Score (0–100)} = (\text{Severity} \times 10 \times 0.40) + (\min(100, \text{Volume} \times 20) \times 0.25) + (\min(100, \text{Days} \times 15) \times 0.15) + (\text{Category Risk} \times 0.10) + (\text{Transit Multiplier} \times 0.10)$$
- **Score $\ge 75$ or Severity $\ge 9$**: `critical`
- **Score $\ge 55$**: `high`
- **Score $\ge 35$**: `medium`
- **Score $< 35$**: `low`

### SLA Timing Matrix
Configured in `backend/src/utils/sla.ts` and `SLAConfiguration.ts`:
- **Critical Issues**: 4–12 hours resolution deadline.
- **High Priority**: 12–24 hours resolution deadline.
- **Medium Priority**: 24–48 hours resolution deadline.
- **Low Priority**: 48–96 hours resolution deadline.
- **Background Worker**: `slaMonitorService.ts` checks hourly, flags `due_soon` at 6 hours remaining, marks `breached` upon expiration, and triggers Level-2 escalation after 24 hours overdue.

---

# 20. Database Audit

### Existing Collections (14 Models)
1. **User** (`User.ts`): User authentication, roles (`citizen`, `field_officer`, `department_officer`, `municipal_admin`, `super_admin`), department/ward references.
2. **Complaint / Issue** (`Complaint.ts`): Primary grievance entity, GeoJSON 2dsphere coordinates, photos, voice notes, priority score, SLA deadlines, AI references.
3. **Department** (`Department.ts`): Municipal departments with controlled codes (`PUBLIC_WORKS`, `SANITATION`, etc.), categories, notification settings.
4. **Ward** (`Ward.ts`): Municipal wards with 2dsphere GeoJSON Polygon boundaries, center points, zones, and population.
5. **AIAnalysis** (`AIAnalysis.ts`): Structured predictions from Gemini / fallback (category, severity, hazards, detected objects, confidence).
6. **EvidenceVerification** (`EvidenceVerification.ts`): Forensic evidence records, 64-bit dHash, EXIF metadata, synthetic risk scores, human review overrides.
7. **DuplicateGroup** (`DuplicateGroup.ts`): Clustered complaints grouped by 2dsphere proximity within 100m.
8. **SLAConfiguration** (`SLAConfiguration.ts`): SLA response and resolution time rules per category and priority.
9. **ComplaintAssignment** (`ComplaintAssignment.ts`): Officer assignment logs.
10. **ComplaintComment** (`ComplaintComment.ts`): Discussion threads on cases.
11. **ComplaintStatusHistory** (`ComplaintStatusHistory.ts`): State transition audit trail.
12. **CitizenVerification** (`CitizenVerification.ts`): Citizen satisfaction ratings (1–5) and resolution confirmation.
13. **Notification** (`Notification.ts`): In-app notification items.
14. **AuditLog** (`AuditLog.ts`): Immutable system audit entries.

### Missing Collections Required for SIH Problem Statement
- `University` (Name, AISHE code, address, district, state, incubationCentre, labs)
- `Faculty` (Name, universityId, department, researchAreas, technicalSkills, activeProjects)
- `Student` (Name, universityId, degree, skills, teamId)
- `IndustryPartner` (Name, sector, csrBudget, techExpertise, mentorProfiles)
- `Team` (challengeId, facultyMentorId, studentMembers, multidisciplinaryTags)
- `Proposal` (challengeId, teamId, abstract, methodology, budget, timeline)
- `Project` (challengeId, proposalId, status, milestones, prototypeDetails, pilotLocation)
- `Milestone` (projectId, title, deadline, deliverableFiles, approvalStatus)
- `InnovationMetric` (patentsFiled, startupsFormed, commercialized, beneficiariesCount)

---

# 21. API Audit

| Method | Endpoint | Auth Required | Allowed Role | Actual Status | Used by Frontend? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `POST` | `/api/auth/register` | ❌ No | Public | ✅ Working (Flawed) | ✅ `RegisterPage.tsx` |
| `POST` | `/api/auth/login` | ❌ No | Public | ✅ Working | ✅ `LoginPage.tsx` |
| `GET` | `/api/auth/me` | ✅ Yes | Any | ✅ Working | ✅ `AuthContext.tsx` |
| `POST` | `/api/complaints` | ✅ Yes | Citizen | ✅ Working | ✅ `ReportPage.tsx` |
| `GET` | `/api/complaints` | 🟡 Optional | Public / Any | ✅ Working | ✅ `IssuesPage.tsx` |
| `GET` | `/api/complaints/:id` | 🟡 Optional | Public / Any | ✅ Working | ✅ `IssueDetailPage.tsx` |
| `POST` | `/api/complaints/:id/status` | ✅ Yes | Staff / Admin | ✅ Working | ✅ `IssueDetailAdminPage.tsx` |
| `POST` | `/api/complaints/:id/assign` | ✅ Yes | Staff / Admin | ✅ Working | ✅ `IssueDetailAdminPage.tsx` |
| `POST` | `/api/complaints/:id/verify` | ✅ Yes | Citizen | ✅ Working | ✅ `IssueDetailPage.tsx` |
| `POST` | `/api/ai/classify-complaint` | 🟡 Optional | Public / Any | ✅ Working | ✅ `ReportPage.tsx` |
| `POST` | `/api/ai/transcribe-audio` | ❌ No | Public | ✅ Working | ✅ `VoiceRecorder.tsx` |
| `POST` | `/api/evidence/verify` | 🟡 Optional | Public / Any | ✅ Working | ❌ Unused by Wizard |
| `POST` | `/api/evidence/:id/human-review`| ✅ Yes | Staff / Admin | ✅ Working | ✅ `EvidenceVerificationPanel.tsx` |
| `GET` | `/api/admin/overview` | ✅ Yes | Staff / Admin | ✅ Working | ✅ `DashboardPage.tsx` |
| `GET` | `/api/admin/analytics/categories` | ✅ Yes | Staff / Admin | 🟡 Key Mismatch | ✅ `AnalyticsPage.tsx` |
| `GET` | `/api/admin/analytics/trends` | ✅ Yes | Staff / Admin | 🟡 Key Mismatch | ✅ `AnalyticsPage.tsx` |
| `GET` | `/api/officers/tasks` | ✅ Yes | Field Officer | ✅ Working | ✅ `FieldOfficerDashboard.tsx` |
| `POST` | `/api/officers/tasks/:id/resolve`| ✅ Yes | Field Officer | ✅ Working | ✅ `FieldOfficerDashboard.tsx` |
| `GET` | `/api/map/complaints` | ❌ No | Public | ✅ Working | ✅ `MapPage.tsx`, `HomePage.tsx` |
| `GET` | `/api/map/wards` | ❌ No | Public | ✅ Working | ✅ `LiveMapPage.tsx` |

---

# 22. Frontend Audit

| Page | Route | Role | Purpose | Database Data | AI Data | Real vs Dummy |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **Home Page** | `/` | Public | Portal landing, quick search, GIS map | ✅ Complaints Map | ❌ Static text | ✅ REAL DB MAP |
| **Citizen Report** | `/report` | Citizen | 5-Step grievance reporting wizard | ✅ Saves to DB | ✅ Gemini Advice | ✅ REAL |
| **Track Report** | `/track` | Public | Lookup complaint by tracking code | ✅ Fetches case | ✅ AI reasoning | ✅ REAL |
| **Issue Detail (Citizen)**| `/issues/:id` | Citizen | Tracking timeline, comments, rating | ✅ Full case data | ✅ Verification | ✅ REAL |
| **My Reports** | `/my-reports` | Citizen | User case history list | ✅ User cases | ❌ None | ✅ REAL |
| **Public GIS Map** | `/map` | Public | Interactive city-wide complaint map | ✅ GeoJSON | ❌ None | ✅ REAL |
| **Admin Dashboard** | `/admin` | Staff / Admin | Executive command center | ✅ Real stats | ❌ None | 🟡 REAL w/ DUMMY FALLBACK |
| **Master Grievance Table**| `/admin/issues` | Staff / Admin | Filterable, paginated registry | ✅ Filtered query| ❌ None | ✅ REAL |
| **Case Management (Admin)**| `/admin/issues/:id`| Staff / Admin | Reassignment, status override, evidence | ✅ Full case data | ✅ Forensic panel | ✅ REAL |
| **GIS Live Surveillance**| `/admin/map` | Staff / Admin | Live map with ward & hotspot layers | ✅ GeoJSON layers| ❌ None | ✅ REAL |
| **Departments Manager** | `/admin/departments`| Admin | Department & worker CRUD | ✅ Real DB CRUD | ❌ None | ✅ REAL |
| **Officers Roster** | `/admin/officers` | Staff / Admin | Field staff directory | ✅ Real officers | ❌ None | ✅ REAL |
| **Analytics Page** | `/admin/analytics` | Staff / Admin | Recharts charts | 🟡 Real DB API | ❌ None | 🔴 KEY MISMATCH / DUMMY FALLBACK |

---

# 23. Dummy / Mock Data Detection

| Feature | File | Dummy / Hardcoded Data | Should Be Dynamic? | Replacement Needed |
| :--- | :--- | :--- | :--- | :--- |
| **Admin KPI Cards** | `frontend/src/pages/admin/DashboardPage.tsx:86-107` | `'1,248'`, `'42'`, `'1,164'`, `'8'` fallback strings | Yes | Render empty state skeleton (`-` or spinner) instead of fake numbers |
| **Weekly Trend Chart** | `frontend/src/pages/admin/AnalyticsPage.tsx:69-77` | Mon–Sun hardcoded array (`submitted: 18, resolved: 15`) | Yes | Fix API mapping key from `_id` to `date` and `reported` to `submitted` |
| **Category Breakdown** | `frontend/src/pages/admin/AnalyticsPage.tsx:49-55` | Static fallback: Pothole: 42, Garbage: 35 | Yes | Fix API mapping key from `_id` to `category` |
| **Ward Density Chart** | `frontend/src/pages/admin/AnalyticsPage.tsx:63-68` | Static fallback: Navrangpura: 28, Paldi: 22 | Yes | Use actual database ward aggregation result |
| **Department Share Chart**| `frontend/src/pages/admin/AnalyticsPage.tsx:56-61` | Static fallback: Public Works: 18, Sanitation: 12 | Yes | Use real department workload aggregation |
| **1-Click Demo Logins**| `frontend/src/pages/auth/LoginPage.tsx:331-356` | Hardcoded demo accounts for hackathon evaluators | Yes (Demo only) | Keep for presentation or replace with dynamic demo account selector |
| **AI Evidence Fallback**| `backend/src/services/imageVerificationService.ts:344` | Fallback sets realism = 92%, status = LIKELY_REAL | Yes | Mark as `UNVERIFIED` / `REVIEW_REQUIRED` on AI failure |
| **Base Coordinates** | `backend/src/seed/seed.ts:16-17` | Ahmedabad coordinates (72.5714, 23.0225) | Yes | Update to Jharkhand municipal coordinates (Ranchi: 85.3096, 23.3441) |

---

# 24. Broken / Error Audit

1. **Analytics Chart Property Key Mismatches**:
   - In `backend/src/controllers/adminController.ts` (lines 225–235), `getTrendsAnalytics` returns `{ _id: 'YYYY-MM-DD', reported: 5, resolved: 3 }`. In `frontend/src/pages/admin/AnalyticsPage.tsx` (lines 125, 130), the chart expects `date` and `submitted`. Because keys do not match, the chart renders empty or falls back to static dummy data.
   - `getCategoryAnalytics` returns `_id` as category name, while `AnalyticsPage.tsx` line 159 expects `category`.
2. **AI Gate Pre-Submission Photo Bypass**:
   - `ReportPage.tsx` (line 113) calls `/api/ai/classify-complaint` with JSON text only, failing to send uploaded photos. The backend generates a valid `assessmentToken` without ever checking the images.
3. **Empty Python Service**:
   - The root directory contains `ai-service/` with only an empty `.venv` and empty `__pycache__` folders. It is completely decoupled from the Node.js backend and contributes no functionality.
4. **Missing JWT Refresh Endpoint**:
   - Refresh secrets and user schema fields exist, but no `POST /api/auth/refresh` route exists, causing silent session termination after 1 hour.

---

# 25. Security Audit

1. **Critical Privilege Escalation Vulnerability**:
   - **Location**: `backend/src/controllers/authController.ts` (line 45)
   - **Issue**: Public registration accepts arbitrary `role` parameter. Any user can register as `super_admin`.
2. **Hardcoded Fallback JWT Secrets**:
   - **Location**: `backend/src/config/env.ts` (lines 13–14)
   - **Issue**: Default secret string `civicconnect-super-secret-jwt-key-2026` is committed in plaintext.
3. **MIME-Type Validation Without Magic-Byte Verification**:
   - **Location**: `backend/src/middleware/upload.ts`
   - **Issue**: Upload filter checks `file.mimetype` and file extensions, which can be spoofed. Malicious executables masked as `.jpg` can be uploaded.
4. **CORS Permissive Origins**:
   - **Location**: `backend/src/app.ts` (line 36)
   - **Issue**: Allows `http://localhost:5173` and `http://localhost:3000` without environment gating in production mode.

---

# 26. SIH Requirement Traceability Matrix

| # | SIH Requirement | Current Implementation | Status | Evidence / File | Gap | Priority |
| :-: | :--- | :--- | :---: | :--- | :--- | :-: |
| 1 | Challenge submission | 5-step reporting wizard | IMPLEMENTED | `ReportPage.tsx`, `Complaint.ts` | Municipal categories only | HIGH |
| 2 | Multimedia evidence | Photos, audio notes, video | IMPLEMENTED | `EvidenceUploader.tsx`, `storageService.ts`| Documents (.pdf, .docx) not supported | MEDIUM |
| 3 | Photo/video/document upload | Photos and videos supported | PARTIALLY IMPLEMENTED | `complaintController.ts:108` | Document upload missing | MEDIUM |
| 4 | Geographic location | Leaflet GIS & HTML5 GPS | IMPLEMENTED | `LocationPicker.tsx`, `Ward.ts` | Limited to municipal city grid | HIGH |
| 5 | AI problem categorization | Gemini Vision + keyword fallback | IMPLEMENTED | `GeminiVisionProvider.ts`, `aiService.ts` | Needs societal innovation categories | HIGH |
| 6 | AI prioritization | 5-factor explainable formula | IMPLEMENTED | `priorityEngine.ts` | Needs social impact weighting | HIGH |
| 7 | Duplicate detection | 100m spatial proximity check | PARTIALLY IMPLEMENTED | `duplicateService.ts` | Semantic text duplicate check missing | MEDIUM |
| 8 | Problem validation | AI validation gate & human override| PARTIALLY IMPLEMENTED | `evidenceController.ts` | University screening workflow missing | CRITICAL |
| 9 | University/HEI matching | None | NOT IMPLEMENTED | None | **Entire matching subsystem missing** | CRITICAL |
| 10 | Matching using institutional capabilities| None | NOT IMPLEMENTED | None | Matching engine missing | CRITICAL |
| 11 | University challenge evaluation | None | NOT IMPLEMENTED | None | Evaluation portal missing | CRITICAL |
| 12 | Faculty mentor assignment | None | NOT IMPLEMENTED | None | Faculty assignment missing | CRITICAL |
| 13 | Student team formation | None | NOT IMPLEMENTED | None | Student team builder missing | CRITICAL |
| 14 | Multidisciplinary collaboration | None | NOT IMPLEMENTED | None | Cross-department teaming missing | HIGH |
| 15 | Solution proposal submission | None | NOT IMPLEMENTED | None | Proposal workflow missing | CRITICAL |
| 16 | Industry/startup/CSR participation | None | NOT IMPLEMENTED | None | Industry portal missing | CRITICAL |
| 17 | Industry mentoring | None | NOT IMPLEMENTED | None | Mentor scheduling missing | HIGH |
| 18 | Funding & CSR sponsorship | None | NOT IMPLEMENTED | None | Grant commitment missing | CRITICAL |
| 19 | Co-development | None | NOT IMPLEMENTED | None | Shared workspace missing | HIGH |
| 20 | Prototyping | None | NOT IMPLEMENTED | None | Prototype tracker missing | CRITICAL |
| 21 | Testing | None | NOT IMPLEMENTED | None | Test evaluation logs missing | HIGH |
| 22 | Pilot implementation | None | NOT IMPLEMENTED | None | Field pilot tracking missing | CRITICAL |
| 23 | Technology transfer | None | NOT IMPLEMENTED | None | Tech transfer workflow missing | MEDIUM |
| 24 | Project lifecycle management | Municipal repair lifecycle only | BROKEN / MISMATCH | `Complaint.ts` | Innovation stage-gate missing | CRITICAL |
| 25 | Milestones | None | NOT IMPLEMENTED | None | Milestone tracker missing | CRITICAL |
| 26 | Deliverables | Resolution photos only | PARTIALLY IMPLEMENTED | `officerController.ts` | Academic/technical deliverables missing| HIGH |
| 27 | Approvals | Admin status override only | PARTIALLY IMPLEMENTED | `complaintController.ts` | Multi-stakeholder gate approvals missing| HIGH |
| 28 | Documentation | Evidence photo store only | PARTIALLY IMPLEMENTED | `storageService.ts` | Project repository missing | MEDIUM |
| 29 | Testing outcomes | AI before/after repair check | PARTIALLY IMPLEMENTED | `aiController.ts:60` | Prototype testing logs missing | HIGH |
| 30 | Intellectual property tracking | None | NOT IMPLEMENTED | None | Patent tracking missing | CRITICAL |
| 31 | Implementation status | Field officer repair progress | PARTIALLY IMPLEMENTED | `FieldOfficerDashboard.tsx` | Deployment tracker missing | HIGH |
| 32 | Notifications | In-app & Socket.IO real-time | IMPLEMENTED | `notificationService.ts` | SMS/email gateways missing | MEDIUM |
| 33 | Stakeholder communication | Case comment thread | PARTIALLY IMPLEMENTED | `ComplaintComment.ts` | Direct multi-party chat missing | MEDIUM |
| 34 | Government dashboards | Municipal operations command | PARTIALLY IMPLEMENTED | `DashboardPage.tsx` | State innovation dashboard missing | HIGH |
| 35 | District-wise analytics | Ward-wise analytics only | PARTIALLY IMPLEMENTED | `adminController.ts:165` | District aggregation missing | HIGH |
| 36 | Sector/domain analytics | Municipal category analytics only | PARTIALLY IMPLEMENTED | `adminController.ts:86` | Broad societal sectors missing | HIGH |
| 37 | University participation analytics | None | NOT IMPLEMENTED | None | Institutional metrics missing | CRITICAL |
| 38 | Industry engagement analytics | None | NOT IMPLEMENTED | None | CSR/funding metrics missing | CRITICAL |
| 39 | Project progress analytics | None | NOT IMPLEMENTED | None | Innovation velocity missing | CRITICAL |
| 40 | Innovation outcomes | None | NOT IMPLEMENTED | None | Innovation KPIs missing | CRITICAL |
| 41 | Patents | None | NOT IMPLEMENTED | None | Patent filing counter missing | CRITICAL |
| 42 | Startups created | None | NOT IMPLEMENTED | None | Incubation counter missing | CRITICAL |
| 43 | Community impact | Citizen 5-star rating only | PARTIALLY IMPLEMENTED | `CitizenVerification.ts` | Measurable social impact metrics missing| HIGH |

---

# 27. Current System Flow

### Concrete Implemented Architecture Flow
```
[Citizen]
   │
   ├─► 1. Register / Login (receives JWT token)
   │
   ├─► 2. Opens Reporting Wizard (/report)
   │      • Selects Municipal Category (pothole, garbage, water, etc.)
   │      • Uploads Photographic Evidence (Webcam / Drag & Drop)
   │      • Selects GPS Coordinates on Leaflet Map
   │      • Enters Description & Records Audio Voice Note
   │
   ├─► 3. Step 5: Pre-submission Assessment Gate
   │      • Calls POST /api/ai/classify-complaint (sends text description)
   │      • Receives JWT aiAssessmentToken
   │
   └─► 4. Final Submission: POST /api/complaints
          │
          ▼
   [Express Backend: createComplaint]
          │
          ├─► A. Verifies aiAssessmentToken
          ├─► B. Uploads Media to Local Storage / Cloudinary
          ├─► C. Duplicate Check: Proximity check within 100m (duplicateService.ts)
          ├─► D. AI Analysis: GeminiVisionProvider analyzes text & photo buffers
          ├─► E. GeoJSON Ward Detection: MongoDB $geoIntersects polygon query (wardService.ts)
          ├─► F. Auto-Routing: Maps category to Department code (routingService.ts)
          ├─► G. Officer Assignment: Selects field officer with lowest workload
          ├─► H. Priority Calculation: 5-factor formula (priorityEngine.ts)
          ├─► I. SLA Computation: Sets responseTimeDeadline & slaDeadline (sla.ts)
          ├─► J. Saves Complaint & AIAnalysis to MongoDB
          ├─► K. Forensic Evidence Analysis: dHash, EXIF, and Gemini authenticity check
          ├─► L. Audit Logging: Records USER_SUBMITTED_COMPLAINT in AuditLog
          └─► M. Socket.IO: Emits events to department room and citizen user channel
                  │
                  ▼
   [Municipal Operations Center / Admin Portal]
          │
          ├─► Master Grievance Registry (/admin/issues)
          ├─► GIS Surveillance Map (/admin/map)
          ├─► Status Override & Officer Reassignment (/admin/issues/:id)
          └─► Automated Background Worker (slaMonitorService.ts checks SLAs hourly)
                  │
                  ▼
   [Field Officer Mobile View]
          │
          ├─► Views assigned tasks in personal queue (/api/officers/tasks)
          ├─► Transitions status to 'in_progress'
          └─► Submits resolution with after-repair photographs and remarks
                  │
                  ▼
   [Citizen Resolution Verification]
          │
          ├─► Citizen inspects resolution proof on case tracking page (/issues/:id)
          └─► Submits 1-5 star rating and confirms 'resolved' or disputes/reopens
```

### Missing Sections of the Flow
```
   [Citizen Societal Challenge Submission]
                  │
                  ▼
   [AI Categorization & District Triage]
                  │
                  ▼
   [Government / Nodal Agency Validation]
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: 7-Factor University Matching Engine ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: University Challenge Evaluation     ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Faculty Mentor & Student Teaming    ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Solution Proposal Submission        ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Industry / CSR Sponsorship & Match  ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Prototyping & Milestone Approvals   ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Field Pilot & Community Testing     ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Technology Transfer, IP & Startups  ║
   ╚═══════════════════════════════════════════════╝
                  │
                  ▼
   ╔═══════════════════════════════════════════════╗
   ║  MISSING: Measurable Social Impact Analytics  ║
   ╚═══════════════════════════════════════════════╝
```

---

# 28. What Is Already Completed

### A. Fully Working
- User Authentication with JWT and password encryption (`bcryptjs`).
- 5-step Citizen Grievance Reporting Wizard with category picker, Leaflet map coordinates, photo drag & drop, and webcam capture.
- Multer file ingestion with local storage and Cloudinary integration.
- Voice note audio recording in browser with Gemini transcription endpoint.
- 64-bit dHash perceptual image fingerprinting and Hamming distance comparison.
- MongoDB 2dsphere spatial indexing with GeoJSON point containment ward routing.
- Explainable priority calculation engine (40% severity, 25% volume, 15% time, 10% safety, 10% transit).
- Automated background SLA monitoring worker detecting breaches and Level-2 escalations.
- Field officer task view with resolution proof photo upload and state updates.
- Real-time Socket.IO dispatching across user, role, and department channels.
- Citizen satisfaction feedback and resolution confirmation rating (1–5 stars).
- Full audit log recording actor, IP, timestamp, action, and state diffs.

### B. Mostly Working
- Advisory Multimodal AI: Gemini Vision analyzes photos and text; rule-based keyword classifier provides robust fallback, but fallback masks manipulated evidence as authentic.
- Admin Operations Command Center: KPIs, critical queue, and department roster work, but top KPI cards contain static fallback strings.

### C. Partially Working
- EXIF Metadata Extraction: Parses camera make, software tags, and timestamps via string regex on buffer slice, but does not parse binary TIFF/Exif tags.
- Duplicate Detection: Robust spatial radius matching, but lacks semantic NLP text comparison.
- Municipal Analytics: Backend calculates category and ward totals, but property key mismatches (`date` vs `_id`) break frontend rendering.

### D. UI-Only
- Security Captcha: Client-side visual character generator; no backend session validation.
- Email/SMS Alert Toggles: UI displays toggles in department settings, but no SMTP or SMS services exist.

### E. Backend-Only
- Evidence Verification Direct Endpoint (`POST /api/evidence/verify`): Exists and works in backend, but is not called directly by the citizen wizard.
- Idempotency Key Handling: Handled in backend `createComplaint`, but frontend wizard does not submit unique idempotency headers.

### F. Dummy / Mock
- Top 4 KPI numbers on `DashboardPage.tsx` fallback to `'1,248'`, `'42'`, `'1,164'`, `'8'`.
- All Recharts datasets on `AnalyticsPage.tsx` fallback to static JSON arrays.
- Seeder coordinates base city in Ahmedabad rather than Jharkhand.

---

# 29. What Needs Correction

### Correction Item 1: Privilege Escalation Security Flaw
- **Problem**: Any user can self-assign `super_admin` or `municipal_admin` during registration.
- **Current Behavior**: `authController.ts` accepts `role` directly from request body.
- **Expected Behavior**: Public registration must force `role = 'citizen'`. Administrative roles must only be created by an authenticated `super_admin`.
- **Root Cause**: Missing role sanitation in `backend/src/controllers/authController.ts` (line 45).
- **Files**: `backend/src/controllers/authController.ts`
- **What Should Change**: Enforce `const assignedRole = 'citizen';` for public registration.
- **Priority**: **CRITICAL**

### Correction Item 2: AI Assessment Gate Image Bypass
- **Problem**: Step 5 AI gate token is issued without evaluating uploaded photos.
- **Current Behavior**: `ReportPage.tsx` only sends text fields to `/api/ai/classify-complaint`.
- **Expected Behavior**: Step 5 must send uploaded image files (or their base64 buffers) to be evaluated by the multimodal model before issuing the gate token.
- **Root Cause**: `ReportPage.tsx` lines 113–118 post JSON instead of `FormData` containing files.
- **Files**: `frontend/src/pages/citizen/ReportPage.tsx`, `backend/src/controllers/aiController.ts`
- **What Should Change**: Update endpoint to accept `multipart/form-data` and forward image buffers to `GeminiVisionProvider.ts`.
- **Priority**: **HIGH**

### Correction Item 3: False Authenticity in AI Evidence Fallback
- **Problem**: Failed AI verification claims manipulated photos are authentic.
- **Current Behavior**: Catch block in `imageVerificationService.ts` defaults to `LIKELY_REAL`, realism = 92%.
- **Expected Behavior**: If AI analysis fails or times out, status must be `UNVERIFIED` / `NEEDS_REVIEW` with realism = `0` and a warning flag.
- **Root Cause**: Overly optimistic fallback object in `backend/src/services/imageVerificationService.ts` (lines 343–347).
- **Files**: `backend/src/services/imageVerificationService.ts`
- **What Should Change**: Set `authenticityStatus: 'NEEDS_REVIEW'`, `visualRealismScore: 0`, and `recommendedAction: 'REVIEW'`.
- **Priority**: **HIGH**

### Correction Item 4: Analytics Chart Property Key Mismatches
- **Problem**: Admin analytics charts fail to render live data and display dummy fallbacks.
- **Current Behavior**: Backend returns `_id` and `reported`; frontend charts expect `date` and `submitted`.
- **Expected Behavior**: Chart components receive data matching their configured `dataKey` props.
- **Root Cause**: Schema mismatch between MongoDB aggregation `$group` output in `adminController.ts` and Recharts keys in `AnalyticsPage.tsx`.
- **Files**: `backend/src/controllers/adminController.ts`, `frontend/src/pages/admin/AnalyticsPage.tsx`
- **What Should Change**: Align keys in `adminController.ts` projections: rename `_id` to `date` and `category`, rename `reported` to `submitted`.
- **Priority**: **HIGH**

### Correction Item 5: Hardcoded Admin Dashboard Fallback Numbers
- **Problem**: Admin overview displays misleading static counts when API data is missing.
- **Current Behavior**: Fallback values `'1,248'`, `'42'`, `'1,164'`, `'8'` are rendered.
- **Expected Behavior**: Display `0` or loading skeleton indicators.
- **Root Cause**: Nullish coalescing to static strings in `frontend/src/pages/admin/DashboardPage.tsx` (lines 86–107).
- **Files**: `frontend/src/pages/admin/DashboardPage.tsx`
- **What Should Change**: Replace string literals with `overview?.total ?? 0`.
- **Priority**: **MEDIUM**

---

# 30. What Is Still Missing

### CRITICAL Priority (Platform Foundation & SIH Compliance)
1. **University / HEI Data Model & Directory**: Collections for Institutions, Campuses, Facilities, Research Labs, and Incubation Centres.
2. **Faculty & Student Profiles**: Research areas, publication tags, technical capabilities, student pools, and mentor availability.
3. **Multi-Factor University Matching Engine**: Implementation of the 7-factor weighted matching algorithm.
4. **Student & Faculty Team Builder**: Workflows for faculty mentor assignment, student invitation, and multidisciplinary teaming.
5. **Industry / Startup / CSR Entity Models**: Corporate partner profiles, CSR focus domains, tech expertise, and capital allocation.
6. **Solution Proposal Submission & Evaluation**: Proposal drafting, budget breakdown, methodology upload, and university/industry review.
7. **Project Lifecycle State Machine**: Tracking projects through Proposals, Approvals, Prototyping, Testing, and Pilot Deployment.
8. **Intellectual Property & Patent Registry**: Tracking provisional patents, filings, inventors, and technology transfers.

### HIGH Priority (Governance, Analytics & Workflow)
1. **Societal Innovation Taxonomy Expansion**: Replacing municipal defect categories with Societal Domains (Agriculture, Healthcare, Clean Water, Rural Education, Renewable Energy, Sanitation, Livelihoods).
2. **State & District Administrative Dashboards**: High-level dashboards for State Innovation Councils, District Collectors, and Higher Education Departments.
3. **Grant Funding & CSR Sponsorship Ledger**: Financial commitment tracking, milestone-linked fund disbursements, and escrow status.
4. **Pilot Implementation & Field Testing Tracker**: Geotagged community pilot tracking with beneficiary impact metrics.
5. **Semantic Text Duplicate Detection**: Vector embeddings (e.g. Gemini text embeddings) and cosine similarity for challenge clustering.

### MEDIUM Priority (Communication & User Experience)
1. **Multi-Stakeholder Direct Messaging**: Real-time chat between faculty mentors, student teams, industry mentors, and community submitters.
2. **Document Repository & Versioning**: Support for uploading and previewing `.pdf`, `.docx`, and CAD/design files.
3. **Live SMS & Email Notifications**: SMTP and SMS gateway integrations for rural citizens without active internet connections.
4. **Automated Stage-Gate Approvals**: Formal sign-off workflow for project milestone reviews and pilot clearances.

### LOW Priority (Enhancements)
1. **Offline Sync Client with SQLite**: Full offline challenge drafting with automatic synchronization.
2. **Native Mobile App Builds**: Android and iOS client wrappers.
3. **Public Innovation Showcase**: Public transparency portal displaying commercialized technologies and community impact stories.

---

# 31. Recommended Implementation Order

### Phase 1: Security Hardening & Bug Fixes (Immediate)
- Fix public registration role-escalation vulnerability in `backend/src/controllers/authController.ts`.
- Enforce mandatory `.env` variable presence for `JWT_SECRET` and `GEMINI_API_KEY` in `backend/src/config/env.ts`.
- Correct property key mismatches in `adminController.ts` and remove static fallback numbers in `AnalyticsPage.tsx` and `DashboardPage.tsx`.
- Update `seed.ts` base coordinates to Jharkhand state (Ranchi / Jamshedpur).

### Phase 2: Domain Taxonomy & Core Models (Week 1)
- Extend `ComplaintCategory` into `ChallengeDomain` (Agriculture, Healthcare, Water, Education, Sanitation, Infrastructure, Rural Livelihoods).
- Create Mongoose schemas: `University.ts`, `Faculty.ts`, `Student.ts`, `IndustryPartner.ts`, `Project.ts`, `Proposal.ts`, `Milestone.ts`, `Patent.ts`.
- Update `User.ts` role enum to support `university_admin`, `faculty_mentor`, `student`, `industry_partner`, and `state_admin`.

### Phase 3: University Matching Engine (Week 2)
- Build `backend/src/services/universityMatchingService.ts` implementing the intended 7-factor weighted algorithm:
  - Domain Alignment: 20%
  - Research Area Match: 20%
  - Technical Skills Compatibility: 15%
  - Technology Stack: 15%
  - Faculty Expertise: 15%
  - Labs / Facilities Availability: 10%
  - Previous Relevant Projects: 5%
- Create REST endpoints: `GET /api/matching/challenges/:id/recommendations` and `POST /api/matching/assign`.
- Build University Challenge Screening and Acceptance portal.

### Phase 4: University Teaming & Proposal Module (Week 3)
- Build Faculty Mentor assignment and Student Team Builder interfaces.
- Create proposal drafting and submission endpoints (`/api/proposals`).
- Implement multidisciplinary tagging and student role assignments.

### Phase 5: Industry, Startup & CSR Collaboration Hub (Week 4)
- Build Industry Partner registration and CSR capability profiles.
- Implement project sponsorship, grant commitment, and mentor assignment workflows.
- Create co-development workspace with milestone-based funding release triggers.

### Phase 6: Project Lifecycle, Prototyping & Pilots (Week 5)
- Implement full project state machine: `Proposed` $\rightarrow$ `Approved` $\rightarrow$ `Team Formed` $\rightarrow$ `Prototyping` $\rightarrow$ `Lab Testing` $\rightarrow$ `Field Pilot` $\rightarrow$ `Tech Transfer` $\rightarrow$ `Patented`.
- Build Milestone and Deliverable submission/review workflow.
- Create Community Pilot verification portal with geotagged photographic progress evidence.

### Phase 7: IP, Patents & Innovation Analytics (Week 6)
- Build Intellectual Property and Patent filing tracking module.
- Implement State and District-level Societal Innovation Dashboards.
- Build analytics for university participation rates, industry capital deployed, patents filed, and startups incubated.

### Phase 8: Communication, Notifications & Polish (Week 7)
- Extend Socket.IO rooms for project teams and industry collaboration channels.
- Integrate SMTP email and SMS notification gateways.
- Conduct end-to-end integration tests and audit validations.

---

# 32. Demo / SIH Readiness Audit

### Current Demo Flow (What Can Be Shown Today)
1. **Citizen Grievance Submission**: Evaluator can register as a citizen, open `/report`, upload a pothole or garbage photo, select coordinates on the map, record a voice note, and submit.
2. **AI Categorization & Evidence Verification**: Evaluator can demonstrate Gemini predicting the municipal category and forensic analysis displaying perceptual hash and visual realism scores.
3. **Automated Ward & Officer Routing**: Evaluator can show the complaint automatically routed to the correct municipal department (e.g. Sanitation) and assigned to a field officer in that ward.
4. **Field Officer Task Execution**: Evaluator can log in as Field Officer (`officer.rajesh@civicconnect.gov.in`), view the assigned task in `FieldOfficerDashboard`, mark "In Progress", upload completion photos, and submit resolution.
5. **Citizen Verification & Satisfaction Feedback**: Citizen opens `/issues/:id`, reviews resolution proof, submits 5-star feedback, and marks the grievance resolved.
6. **Live GIS Map & Command Center**: Evaluator can demonstrate `/admin/map` showing live pins, ward boundaries, and hotspot clusters.

### Demo Blockers (Relative to the SIH Problem Statement)
1. **Cannot demonstrate university matching**: Attempting to match a challenge to a university will fail because no matching engine exists.
2. **Cannot demonstrate faculty/student teaming**: No team formation UI or endpoints exist.
3. **Cannot demonstrate industry sponsorship or CSR**: No corporate partner workflows exist.
4. **Cannot demonstrate prototyping, patents, or technology transfer**: No innovation lifecycle tracking exists.

### Weak / Placeholder Areas
- Top KPI numbers on the Admin Dashboard show hardcoded fallback strings when data is loading.
- Charts on `AnalyticsPage.tsx` fail to map backend aggregation fields and fall back to static arrays.
- Evidence verification falls back to claiming images are 92% real if the Gemini API call times out.
- The pre-submission AI assessment gate does not send photos to the classifier.

### Required Before Final SIH Evaluation
- Rebrand the platform from municipal grievance management (CHA-195) to the Societal Innovation Collaboration Portal.
- Implement the 7-factor University Matching Engine with visible scoring breakdown.
- Seed real Jharkhand Higher Education Institutions (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Ranchi University).
- Build the University Dashboard showing challenge acceptance, faculty mentors, and student teams.
- Build the Industry/CSR Dashboard showing grant funding commitments and prototyping progress.
- Build the Innovation Outcomes Dashboard tracking patents, startups, and community impact.

---

# 33. Problem Transparency Statement

- **Matching Engine**: **DOES NOT EXIST — ENTIRE ALGORITHM AND DATA ARE MISSING**.
- **University Data**: **NO UNIVERSITY, FACULTY, OR RESEARCH DATA EXISTS IN THE DATABASE**.
- **AI Evidence Verification Fallback**: **MOCK ADVISORY — FALLBACK FABRICATES 92% REALISM SCORE UPON API ERROR**.
- **Admin Analytics Charts**: **HARDCODED ANALYTICS FALLBACK USED DUE TO PROPERTY KEY MISMATCHES**.
- **Dashboard Top KPIs**: **HARDCODED METRICS ('1,248', '42', '1,164') USED AS FALLBACKS**.
- **SMS / Email Gateways**: **PLACEHOLDER ONLY — NOT FUNCTIONAL**.
- **Synthetic Image Neural Detection**: **PROMPT ONLY — NO DEDICATED MODEL INSTALLED**.
- **Registration Security**: **CRITICAL FLAW — ARBITRARY ROLE ESCALATION TO SUPER_ADMIN IS UNRESTRICTED**.

---

# 34. Evidence Matrix

| Component | File Path | Class / Function / Model | Actual Code Behavior / Evidence | Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| **Registration Role Assignment** | `backend/src/controllers/authController.ts` | `register()` (Line 45) | `const assignedRole = role === 'citizen' \|\| !role ? 'citizen' : role;` | **CRITICAL SECURITY FLAW**: Allows public users to register as `super_admin`. |
| **Pre-Submission AI Gate** | `frontend/src/pages/citizen/ReportPage.tsx` | `runAiAssessment()` (Lines 113–118) | `apiClient.post('/ai/classify-complaint', { description, category, subcategory, voiceTranscript })` | **GATE BYPASS**: Uploaded image files are omitted from pre-submission assessment. |
| **AI Evidence Fallback** | `backend/src/services/imageVerificationService.ts` | `analyzeEvidence()` (Lines 343–347) | `catch (err) { aiVisualResult.reasoningSummary = 'Standard visual verification completed.'; ... visualRealismScore = 92 }` | **FALSE POSITIVE RISK**: Failed AI evaluations default to claiming photo is authentic. |
| **Perceptual Fingerprinting** | `backend/src/services/imageVerificationService.ts` | `calculatePerceptualHash()` (Lines 76–103) | Samples 64 gradient points across binary buffer; returns 16-char hex dHash | **IMPLEMENTED**: Genuine perceptual hashing algorithm in pure Node.js. |
| **Spatial Duplicate Check** | `backend/src/services/duplicateService.ts` | `checkForDuplicates()` (Lines 22–47) | Queries MongoDB `$near` with `$maxDistance: 100` on active category complaints | **IMPLEMENTED**: Genuine spatial duplicate clustering using GeoJSON 2dsphere. |
| **Spatial Ward Lookup** | `backend/src/services/wardService.ts` | `findWardForCoordinates()` (Lines 7–25) | `Ward.findOne({ boundary: { $geoIntersects: { $geometry: { type: 'Point', coordinates } } } })` | **IMPLEMENTED**: Genuine point-in-polygon GeoJSON ward matching. |
| **Explainable Priority Formula**| `backend/src/services/priorityEngine.ts` | `calculatePriority()` (Lines 18–93) | Score = 40% Severity + 25% Volume + 15% Time + 10% Safety + 10% Transit | **IMPLEMENTED**: Deterministic explainable priority scoring. |
| **University Matching Engine** | Entire Codebase | N/A | Grep for `university`, `calculateUniversityMatch`, `matchingService` returns 0 results in business logic | **NOT IMPLEMENTED**: Entire module is missing. |
| **Analytics Trend Endpoint** | `backend/src/controllers/adminController.ts` | `getTrendsAnalytics()` (Lines 225–235) | Returns `{ _id: '$day', reported: ..., resolved: ... }` | **SCHEMA MISMATCH**: Frontend chart expects `{ date, submitted, resolved }`. |
| **Admin Overview Fallback** | `frontend/src/pages/admin/DashboardPage.tsx` | `DashboardPage()` (Lines 86–107) | `value={overview?.total ?? '1,248'}` | **HARDCODED DATA**: Renders fake numbers if API call is delayed or fails. |
| **Field Officer Roster View** | `frontend/src/pages/admin/OfficersPage.tsx` | `OfficersPage()` (Lines 19–22) | `apiClient.get('/officers')` fetching real MongoDB User documents | **IMPLEMENTED**: Genuine field staff roster from database. |
| **Background SLA Worker** | `backend/src/services/slaMonitorService.ts` | `runSLAMonitorCheck()` (Lines 20–93) | Scans active complaints, updates `slaState` to `breached` or `escalated`, emits socket events | **IMPLEMENTED**: Genuine background SLA monitoring engine. |

---

# 35. Final Audit Summary

This comprehensive audit verifies that **CivicConnect** has a well-engineered, robust backend and frontend architecture for **crowdsourced municipal issue resolution (SIH-195 / CHA-195)**, featuring working spatial GIS routing, dual AI vision and keyword classification, automated SLA breach monitoring, field officer execution, and perceptual image hashing.

However, **it is currently not the Societal Innovation Collaboration Portal described in the baseline SIH problem statement**. The entire Higher Education Institution (HEI) collaboration tier—including the 7-factor university matching engine, faculty mentor assignment, student team formation, industry/CSR co-development, prototype tracking, patent monitoring, and social impact metrics—remains to be built.

By following the 8-phase implementation roadmap detailed in Section 31, the development team can preserve and repurpose the existing GIS, AI verification, and user management foundations while building out the necessary innovation and university matching layers to achieve 100% compliance with the SIH problem statement.
