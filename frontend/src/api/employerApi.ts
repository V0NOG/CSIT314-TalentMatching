// frontend/src/api/employerApi.ts
import client from "./client";

export interface EmployerProfileData {
  _id: string;
  user: string;
  companyName: string;
  industry?: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerProfileInput {
  companyName: string;
  industry?: string;
  location?: string;
  description?: string;
}

export const getMyEmployerProfile = (): Promise<EmployerProfileData> =>
  client.get<EmployerProfileData>("/api/employer/profile").then((res) => res.data);

export const createEmployerProfile = (data: EmployerProfileInput): Promise<EmployerProfileData> =>
  client.post<EmployerProfileData>("/api/employer/profile", data).then((res) => res.data);

export const updateEmployerProfile = (data: Partial<EmployerProfileInput>): Promise<EmployerProfileData> =>
  client.put<EmployerProfileData>("/api/employer/profile", data).then((res) => res.data);
