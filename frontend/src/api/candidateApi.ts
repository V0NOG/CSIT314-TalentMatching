// frontend/src/api/candidateApi.ts
import client from "./client";

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
