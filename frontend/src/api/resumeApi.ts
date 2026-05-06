// frontend/src/api/resumeApi.ts
import client from "./client";

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number | undefined;
  gpa: string;
}

export interface ResumeWorkExp {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  url: string;
}

export type ResumeTemplate = "classic" | "modern" | "minimal";

export interface ResumeData {
  _id?: string;
  user?: string;
  template: ResumeTemplate;
  personalInfo: ResumePersonalInfo;
  summary: string;
  education: ResumeEducation[];
  workExperience: ResumeWorkExp[];
  skills: string[];
  certifications: ResumeCertification[];
  projects: ResumeProject[];
  updatedAt?: string;
}

export const getMyResume = (): Promise<ResumeData> =>
  client.get<ResumeData>("/api/resume").then((r) => r.data);

export const upsertResume = (data: Omit<ResumeData, "_id" | "user" | "updatedAt">): Promise<ResumeData> =>
  client.put<ResumeData>("/api/resume", data).then((r) => r.data);
