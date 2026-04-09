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

/** GET /api/jobs — all job postings, newest first */
export const getAllJobs = (): Promise<Job[]> =>
  client.get<Job[]>("/api/jobs").then((res) => res.data);

/** GET /api/jobs/mine — jobs posted by the authenticated employer */
export const getMyJobs = (): Promise<Job[]> =>
  client.get<Job[]>("/api/jobs/mine").then((res) => res.data);
