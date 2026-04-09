// frontend/src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  /** If provided, only users with this role can access. Others are redirected to home. */
  role?: "candidate" | "employer";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, user, isLoading } = useAuth();

  // Block rendering until the initial /me verification completes.
  // Without this, role guards are skipped while user is null during page load.
  if (isLoading) return null;

  if (!token) return <Navigate to="/signin" replace />;

  if (role && user && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
