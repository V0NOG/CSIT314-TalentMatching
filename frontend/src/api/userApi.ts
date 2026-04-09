// frontend/src/api/userApi.ts
import client from "./client";
import type { AuthUser } from "./authApi";

export const getMe = (): Promise<AuthUser> =>
  client.get<AuthUser>("/api/user/me").then((res) => res.data);

// PATCH /api/user/me — endpoint will be wired in Phase 2
export const updateMe = (data: Record<string, unknown>) =>
  client.patch("/api/user/me", data).then((res) => res.data);
