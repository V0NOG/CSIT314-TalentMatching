// frontend/src/api/authApi.ts
import client from "./client";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "candidate" | "employer";
  membership: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const loginRequest = (email: string, password: string) =>
  client.post<AuthResponse>("/api/auth/login", { email, password });

export const registerRequest = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "candidate" | "employer";
}) => client.post<AuthResponse>("/api/auth/register", data);

export const logoutRequest = () =>
  client.post("/api/auth/logout");

export const refreshRequest = () =>
  client.post<{ message: string; token: string }>("/api/auth/refresh");
