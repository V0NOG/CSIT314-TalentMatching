// frontend/src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  /** If provided, only users with this role can access. Others are redirected. */
  role?: "candidate" | "employer";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/signin" replace />;

  // If a specific role is required and the user's role doesn't match, redirect to home
  if (role && user && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
