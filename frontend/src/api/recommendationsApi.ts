// frontend/src/api/recommendationsApi.ts
import client from "./client";

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
  createdAt: string;
  updatedAt: string;
  matchScore: number;
  matchReasons: string[];
}

/**
 * GET /api/recommendations
 * Returns top-K jobs ranked by relevance to the authenticated candidate.
 * Requires candidate role.
 */
export const getCandidateRecommendations = (): Promise<JobRecommendation[]> =>
  client.get<JobRecommendation[]>("/api/recommendations").then((res) => res.data);

/**
 * GET /api/recommendations/candidates/:jobId
 * Returns top-N candidates ranked by relevance to the given job.
 * Requires employer role.
 */
export const getCandidateRecommendationsForJob = (jobId: string): Promise<CandidateRecommendation[]> =>
  client
    .get<CandidateRecommendation[]>(`/api/recommendations/candidates/${jobId}`)
    .then((res) => res.data);
