// frontend/src/api/userApi.ts
import client from "./client";
import type { AuthUser } from "./authApi";

export const getMe = (): Promise<AuthUser> =>
  client.get<AuthUser>("/api/user/me").then((res) => res.data);

export const updateMembership = (membership: boolean): Promise<AuthUser> =>
  client.put<AuthUser>("/api/user/membership", { membership }).then((res) => res.data);
