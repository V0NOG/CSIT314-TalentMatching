// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

// Dashboard (role-aware)
import Home from "./pages/Dashboard/Home";

// Candidate pages
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateRecommendations from "./pages/candidate/CandidateRecommendations";
import MyApplications from "./pages/candidate/MyApplications";
import ResumeBuilder from "./pages/candidate/ResumeBuilder";

// Shared pages
import JobListings from "./pages/jobs/JobListings";

// Employer pages
import EmployerProfile from "./pages/employer/EmployerProfile";
import EmployerJobs from "./pages/employer/EmployerJobs";
import CreateJob from "./pages/employer/CreateJob";
import BrowseCandidates from "./pages/employer/BrowseCandidates";
import EmployerCandidateRecommendations from "./pages/employer/CandidateRecommendations";
import JobApplications from "./pages/employer/JobApplications";

// User profile (generic)
import UserProfiles from "./pages/UserProfiles";

// Membership
import MembershipPage from "./pages/membership/MembershipPage";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* Public auth routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes inside main layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Role-aware home dashboard */}
          <Route index element={<Home />} />

          {/* Generic user profile */}
          <Route path="/profile" element={<UserProfiles />} />

          {/* Candidate routes */}
          <Route path="/candidate/profile" element={
            <ProtectedRoute role="candidate"><CandidateProfile /></ProtectedRoute>
          } />
          <Route path="/candidate/recommendations" element={
            <ProtectedRoute role="candidate"><CandidateRecommendations /></ProtectedRoute>
          } />
          <Route path="/candidate/applications" element={
            <ProtectedRoute role="candidate"><MyApplications /></ProtectedRoute>
          } />
          <Route path="/candidate/resume" element={
            <ProtectedRoute role="candidate"><ResumeBuilder /></ProtectedRoute>
          } />

          {/* Jobs — visible to both roles */}
          <Route path="/jobs" element={<JobListings />} />

          {/* Employer routes */}
          <Route path="/employer/profile" element={
            <ProtectedRoute role="employer"><EmployerProfile /></ProtectedRoute>
          } />
          <Route path="/employer/jobs" element={
            <ProtectedRoute role="employer"><EmployerJobs /></ProtectedRoute>
          } />
          <Route path="/employer/jobs/new" element={
            <ProtectedRoute role="employer"><CreateJob /></ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute role="employer"><BrowseCandidates /></ProtectedRoute>
          } />
          <Route path="/employer/recommendations" element={
            <ProtectedRoute role="employer"><EmployerCandidateRecommendations /></ProtectedRoute>
          } />
          <Route path="/employer/applications" element={
            <ProtectedRoute role="employer"><JobApplications /></ProtectedRoute>
          } />

          {/* Membership — both roles */}
          <Route path="/membership" element={<MembershipPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
