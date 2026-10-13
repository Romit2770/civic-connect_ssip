import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CitizenLayout from './components/layout/CitizenLayout';
import AdminLayout from './components/layout/AdminLayout';

// Citizen Pages
import HomePage from './pages/citizen/HomePage';
import ReportPage from './pages/citizen/ReportPage';
import TrackReportPage from './pages/citizen/TrackReportPage';
import MyReportsPage from './pages/citizen/MyReportsPage';
import IssueDetailPage from './pages/citizen/IssueDetailPage';
import MapPage from './pages/citizen/MapPage';
import ProfilePage from './pages/citizen/ProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import IssuesPage from './pages/admin/IssuesPage';
import IssueDetailAdminPage from './pages/admin/IssueDetailAdminPage';
import LiveMapPage from './pages/admin/LiveMapPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import OfficersPage from './pages/admin/OfficersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import CredentialManagementPage from './pages/admin/CredentialManagementPage';

// Municipality Admin Portal Layout & Pages
import MunicipalityAdminLayout from './components/layout/MunicipalityAdminLayout';
import MunicipalityDashboardPage from './pages/municipality/MunicipalityDashboardPage';
import MunicipalityChallengesPage from './pages/municipality/MunicipalityChallengesPage';
import MunicipalityMapPage from './pages/municipality/MunicipalityMapPage';
import MunicipalityProjectsPage from './pages/municipality/MunicipalityProjectsPage';
import MunicipalityAnalyticsPage from './pages/municipality/MunicipalityAnalyticsPage';
import MunicipalityReportsPage from './pages/municipality/MunicipalityReportsPage';
import MunicipalityProfilePage from './pages/municipality/MunicipalityProfilePage';

// Government Field Worker Portal Layout & Pages
import FieldWorkerLayout from './components/layout/FieldWorkerLayout';
import FieldWorkerDashboardPage from './pages/fieldWorker/FieldWorkerDashboardPage';
import FieldWorkerChallengesPage from './pages/fieldWorker/FieldWorkerChallengesPage';
import FieldWorkerChallengeDetailPage from './pages/fieldWorker/FieldWorkerChallengeDetailPage';
import FieldWorkerVerificationPage from './pages/fieldWorker/FieldWorkerVerificationPage';
import FieldWorkerBeforeAfterPage from './pages/fieldWorker/FieldWorkerBeforeAfterPage';
import FieldWorkerProjectsPage from './pages/fieldWorker/FieldWorkerProjectsPage';
import FieldWorkerProjectDetailPage from './pages/fieldWorker/FieldWorkerProjectDetailPage';
import FieldWorkerMapPage from './pages/fieldWorker/FieldWorkerMapPage';
import FieldWorkerReportsPage from './pages/fieldWorker/FieldWorkerReportsPage';
import FieldWorkerActivityPage from './pages/fieldWorker/FieldWorkerActivityPage';
import FieldWorkerProfilePage from './pages/fieldWorker/FieldWorkerProfilePage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Citizen & Public Portal Routes */}
      <Route element={<CitizenLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/track" element={<TrackReportPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/map" element={<MapPage />} />
        
        {/* Protected Citizen Routes */}
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Municipal Operations Center (Staff / Admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              'field_officer',
              'department_officer',
              'municipal_admin',
              'super_admin',
            ]}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="issues/:id" element={<IssueDetailAdminPage />} />
        <Route path="map" element={<LiveMapPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="officers" element={<OfficersPage />} />
        <Route path="credentials" element={<CredentialManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Government Super Admin Alias Route */}
      <Route path="/government/credentials" element={<Navigate to="/admin/credentials" replace />} />

      {/* Disabled / Deprecated University & Industry Portals -> Redirect to Public Portal */}
      <Route path="/university/*" element={<Navigate to="/" replace />} />
      <Route path="/university" element={<Navigate to="/" replace />} />
      <Route path="/faculty/*" element={<Navigate to="/" replace />} />
      <Route path="/faculty" element={<Navigate to="/" replace />} />
      <Route path="/industry-admin/*" element={<Navigate to="/" replace />} />
      <Route path="/industry-admin" element={<Navigate to="/" replace />} />
      <Route path="/industry/*" element={<Navigate to="/" replace />} />
      <Route path="/industry" element={<Navigate to="/" replace />} />
      <Route path="/student-lead/*" element={<Navigate to="/" replace />} />
      <Route path="/student-lead" element={<Navigate to="/" replace />} />
      <Route path="/csr/*" element={<Navigate to="/" replace />} />
      <Route path="/csr" element={<Navigate to="/" replace />} />
      <Route path="/corporate-partner/*" element={<Navigate to="/" replace />} />
      <Route path="/corporate-partner" element={<Navigate to="/" replace />} />

      {/* Municipality Admin Portal (Strictly Municipal Admin & Super Admin) */}
      <Route
        path="/municipality-admin"
        element={
          <ProtectedRoute allowedRoles={['municipal_admin', 'super_admin']}>
            <MunicipalityAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MunicipalityDashboardPage />} />
        <Route path="challenges" element={<MunicipalityChallengesPage />} />
        <Route path="map" element={<MunicipalityMapPage />} />
        <Route path="universities" element={<Navigate to="/municipality-admin/dashboard" replace />} />
        <Route path="industry" element={<Navigate to="/municipality-admin/dashboard" replace />} />
        <Route path="projects" element={<MunicipalityProjectsPage />} />
        <Route path="analytics" element={<MunicipalityAnalyticsPage />} />
        <Route path="reports" element={<MunicipalityReportsPage />} />
        <Route path="profile" element={<MunicipalityProfilePage />} />
      </Route>

      {/* Government Field Worker Portal (Strictly Field Worker, Field Officer & Super Admin) */}
      <Route
        path="/field-worker"
        element={
          <ProtectedRoute allowedRoles={['field_worker', 'field_officer', 'super_admin']}>
            <FieldWorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FieldWorkerDashboardPage />} />
        <Route path="challenges" element={<FieldWorkerChallengesPage />} />
        <Route path="challenges/:id" element={<FieldWorkerChallengeDetailPage />} />
        <Route path="verification" element={<FieldWorkerVerificationPage />} />
        <Route path="verification/:id" element={<FieldWorkerVerificationPage />} />
        <Route path="before-after" element={<FieldWorkerBeforeAfterPage />} />
        <Route path="projects" element={<FieldWorkerProjectsPage />} />
        <Route path="projects/:id" element={<FieldWorkerProjectDetailPage />} />
        <Route path="map" element={<FieldWorkerMapPage />} />
        <Route path="reports" element={<FieldWorkerReportsPage />} />
        <Route path="reports/:id" element={<FieldWorkerReportsPage />} />
        <Route path="activity" element={<FieldWorkerActivityPage />} />
        <Route path="profile" element={<FieldWorkerProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
