// frontend/src/api/applicationsApi.ts
import client from "./client";
import type { Job } from "./jobsApi";
import type { CandidateProfileData } from "./candidateApi";

export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

export interface MyApplication {
  _id: string;
  job: Job;
  applicant: string;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationEntry {
  _id: string;
  job: string;
  applicant: string;
  candidateProfile: CandidateProfileData | null;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export const applyForJob = (jobId: string, coverLetter?: string): Promise<MyApplication> =>
  client.post<MyApplication>("/api/applications", { jobId, coverLetter }).then((r) => r.data);

export const getMyApplications = (): Promise<MyApplication[]> =>
  client.get<MyApplication[]>("/api/applications/mine").then((r) => r.data);

export const getApplicationsForJob = (jobId: string): Promise<JobApplicationEntry[]> =>
  client.get<JobApplicationEntry[]>(`/api/applications/job/${jobId}`).then((r) => r.data);

export const getApplicationCounts = (): Promise<Record<string, number>> =>
  client.get<Record<string, number>>("/api/applications/counts").then((r) => r.data);

export const updateApplicationStatus = (id: string, status: ApplicationStatus): Promise<JobApplicationEntry> =>
  client.put<JobApplicationEntry>(`/api/applications/${id}/status`, { status }).then((r) => r.data);
