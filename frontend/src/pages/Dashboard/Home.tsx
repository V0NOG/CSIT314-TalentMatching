// frontend/src/pages/Dashboard/Home.tsx
// Root dashboard — delegates to role-specific view
import { useAuth } from "../../context/AuthContext";
import CandidateDashboard from "../candidate/CandidateDashboard";
import EmployerDashboard from "../employer/EmployerDashboard";

export default function Home() {
  const { isCandidate, isEmployer, user } = useAuth();

  if (isCandidate) return <CandidateDashboard />;
  if (isEmployer) return <EmployerDashboard />;

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 dark:text-gray-400">
        {user ? "Unknown role. Please contact support." : "Loading…"}
      </p>
    </div>
  );
}
