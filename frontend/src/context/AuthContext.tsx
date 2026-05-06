// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logoutRequest } from "../api/authApi";
import { getMe } from "../api/userApi";
import type { AuthUser } from "../api/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isCandidate: boolean;
  isEmployer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string>(() => localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((data) => setUser(data))
      .catch((err) => {
        console.warn("Auth /me failed", err?.response?.status);
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser || null);
    setIsLoading(false);
  };

  const logout = () => {
    logoutRequest().catch(() => {});
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    const data = await getMe();
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
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

export type { AuthUser };
