// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API = "http://localhost:5050";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "candidate" | "employer";
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isCandidate: boolean;
  isEmployer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.warn("Auth /me failed", err?.response?.status);
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      });
  }, [token]);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser || null);
  };

  const logout = () => {
    axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isCandidate: user?.role === "candidate",
        isEmployer:  user?.role === "employer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
