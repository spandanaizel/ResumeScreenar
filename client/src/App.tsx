import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute, RoleProtectedRoute } from './components/layout/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/candidate/DashboardPage';
import AnalyzeResumePage from './pages/candidate/AnalyzeResumePage';
import AnalysisHistoryPage from './pages/candidate/AnalysisHistoryPage';
import AnalysisDetailsPage from './pages/candidate/AnalysisDetailsPage';
import RoadmapsListPage from './pages/candidate/RoadmapsListPage';
import RoadmapDetailsPage from './pages/candidate/RoadmapDetailsPage';
import SkillGapPage from './pages/candidate/SkillGapPage';
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import JobsListPage from './pages/recruiter/JobsListPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import JobDetailsPage from './pages/recruiter/JobDetailsPage';
import UploadResumesPage from './pages/recruiter/UploadResumesPage';
import RecruiterAnalysisDetailsPage from './pages/recruiter/AnalysisDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <PublicLayout />
              </PublicOnlyRoute>
            }
          >
            <Route index element={<RegisterPage />} />
          </Route>

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <PublicLayout />
              </PublicOnlyRoute>
            }
          >
            <Route index element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/candidate"
              element={
                <RoleProtectedRoute allowedRoles={['candidate']}>
                  <Outlet />
                </RoleProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analyze" element={<AnalyzeResumePage />} />
              <Route path="history" element={<AnalysisHistoryPage />} />
              <Route path="analysis/:id" element={<AnalysisDetailsPage />} />
              <Route path="roadmaps" element={<RoadmapsListPage />} />
              <Route path="roadmap/:id" element={<RoadmapDetailsPage />} />
              <Route path="skills" element={<SkillGapPage />} />
            </Route>

            <Route
              path="/recruiter"
              element={
                <RoleProtectedRoute allowedRoles={['recruiter']}>
                  <Outlet />
                </RoleProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecruiterDashboardPage />} />
              <Route path="jobs" element={<JobsListPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:id" element={<JobDetailsPage />} />
              <Route path="jobs/:id/edit" element={<CreateJobPage />} />
              <Route path="jobs/:id/upload-resumes" element={<UploadResumesPage />} />
              <Route path="analysis/:id" element={<RecruiterAnalysisDetailsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
