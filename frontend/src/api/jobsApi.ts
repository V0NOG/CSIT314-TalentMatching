// frontend/src/api/jobsApi.ts
import client from "./client";

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  workMode: "Remote" | "On-site" | "Hybrid";
  requiredEducation: string;
  requiredSkills: string[];
  yearsOfExperience: number;
  status: string;
  employer: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  workMode?: string;
  status?: string;
  fuzzy?: boolean;
}

/** GET /api/jobs — all job postings, newest first */
export const getAllJobs = (): Promise<Job[]> =>
  client.get<Job[]>("/api/jobs").then((res) => res.data);

/** GET /api/jobs/mine — jobs posted by the authenticated employer */
export const getMyJobs = (): Promise<Job[]> =>
  client.get<Job[]>("/api/jobs/mine").then((res) => res.data);

/**
 * GET /api/jobs/search — search and filter jobs.
 * All params are optional; omitting all returns all jobs.
 */
export const searchJobs = (params: JobSearchParams): Promise<Job[]> => {
  const q = new URLSearchParams();
  if (params.keyword)  q.set("keyword",  params.keyword);
  if (params.location) q.set("location", params.location);
  if (params.workMode) q.set("workMode", params.workMode);
  if (params.status)   q.set("status",   params.status);
  if (params.fuzzy)    q.set("fuzzy",    "true");
  const qs = q.toString();
  return client.get<Job[]>(`/api/jobs/search${qs ? `?${qs}` : ""}`).then((res) => res.data);
};
