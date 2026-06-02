// frontend/src/api/candidateApi.ts
import client from "./client";

export interface WorkExperienceEntry {
  jobTitle?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CandidateProfileData {
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
}

export interface CandidateProfileInput {
  fullName: string;
  phone: string;
  yearsOfExperience: number;
  education?: {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
  };
  skills?: string[];
  workExperience?: WorkExperienceEntry[];
  preferredWorkingMode?: "Remote" | "On-site" | "Hybrid" | "";
  preferredLocation?: string;
}

export interface CandidateSearchParams {
  keyword?: string;
  preferredWorkingMode?: string;
  preferredLocation?: string;
  fuzzy?: boolean;
}

export const getMyCandidateProfile = (): Promise<CandidateProfileData> =>
  client.get<CandidateProfileData>("/api/candidate/profile").then((res) => res.data);

export const createCandidateProfile = (data: CandidateProfileInput): Promise<CandidateProfileData> =>
  client.post<CandidateProfileData>("/api/candidate/profile", data).then((res) => res.data);

export const updateCandidateProfile = (data: Partial<CandidateProfileInput>): Promise<CandidateProfileData> =>
  client.put<CandidateProfileData>("/api/candidate/profile", data).then((res) => res.data);

/** GET /api/candidates — all candidate profiles (employer only) */
export const getAllCandidates = (): Promise<CandidateProfileData[]> =>
  client.get<CandidateProfileData[]>("/api/candidates").then((res) => res.data);

/** GET /api/candidates/search — search candidates with keyword + filters (employer only) */
export const searchCandidates = (params: CandidateSearchParams): Promise<CandidateProfileData[]> => {
  const q = new URLSearchParams();
  if (params.keyword)              q.set("keyword",              params.keyword);
  if (params.preferredWorkingMode) q.set("preferredWorkingMode", params.preferredWorkingMode);
  if (params.preferredLocation)    q.set("preferredLocation",    params.preferredLocation);
  if (params.fuzzy)                q.set("fuzzy",                "true");
  const qs = q.toString();
  return client.get<CandidateProfileData[]>(`/api/candidates/search${qs ? `?${qs}` : ""}`).then((res) => res.data);
};
