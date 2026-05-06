// frontend/src/api/recommendationsApi.ts
import client from "./client";
import type { WorkExperienceEntry } from "./candidateApi";

export interface JobRecommendation {
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
  matchScore: number;
  matchReasons: string[];
}

export interface CandidateRecommendation {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  education: {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
  };
  yearsOfExperience: number;
  skills: string[];
  workExperience: WorkExperienceEntry[];
  preferredWorkingMode: "Remote" | "On-site" | "Hybrid" | "";
  preferredLocation: string;
  createdAt: string;
  updatedAt: string;
  matchScore: number;
  matchReasons: string[];
}

/**
 * GET /api/recommendations
 * Returns jobs ranked by relevance to the authenticated candidate.
 * Members get unlimited results; non-members get top 10.
 */
export const getCandidateRecommendations = (): Promise<JobRecommendation[]> =>
  client.get<JobRecommendation[]>("/api/recommendations").then((res) => res.data);

/**
 * GET /api/recommendations/candidates/:jobId
 * Returns candidates ranked by relevance to the given job.
 * Members get unlimited results; non-members get top 10.
 */
export const getCandidateRecommendationsForJob = (jobId: string): Promise<CandidateRecommendation[]> =>
  client
    .get<CandidateRecommendation[]>(`/api/recommendations/candidates/${jobId}`)
    .then((res) => res.data);
