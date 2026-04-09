// frontend/src/pages/employer/CandidateRecommendations.tsx
import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getMyJobs, type Job } from "../../api/jobsApi";
import { getCandidateRecommendationsForJob, type CandidateRecommendation } from "../../api/recommendationsApi";

export default function EmployerCandidateRecommendations() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecommendation[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Load employer's jobs on mount for the dropdown
  useEffect(() => {
    getMyJobs()
      .then(setJobs)
      .catch(() => setJobsError("Failed to load your job postings."))
      .finally(() => setJobsLoading(false));
  }, []);

  // Fetch candidates whenever selected job changes
  useEffect(() => {
    if (!selectedJobId) return;

    setCandidatesLoading(true);
    setCandidatesError(null);
    setHasFetched(true);

    getCandidateRecommendationsForJob(selectedJobId)
      .then(setCandidates)
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setCandidatesError("Job not found.");
        } else {
          setCandidatesError("Failed to load recommendations. Please try again.");
        }
        setCandidates([]);
      })
      .finally(() => setCandidatesLoading(false));
  }, [selectedJobId]);

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <>
      <PageMeta title="Candidate Recommendations | Talent Matching" description="Top candidates for your job" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Candidate Recommendations</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a job posting to see your top matching candidates.
        </p>
      </div>

      {/* Job dropdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 mb-6">
        <label
          htmlFor="job-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Job Posting
        </label>

        {jobsLoading && (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your jobs…</p>
        )}

        {jobsError && (
          <p className="text-sm text-red-500">{jobsError}</p>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You have no job postings yet.{" "}
            <a href="/employer/jobs/new" className="text-brand-500 hover:underline">Create one</a>.
          </p>
        )}

        {!jobsLoading && !jobsError && jobs.length > 0 && (
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">— Select a job —</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} · {job.location} · {job.workMode}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results */}
      {candidatesLoading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading candidates…</div>
      )}

      {candidatesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 mb-4">
          {candidatesError}
        </div>
      )}

      {hasFetched && !candidatesLoading && !candidatesError && candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
          No matching candidates found for <strong>{selectedJob?.title}</strong>.
        </div>
      )}

      {!candidatesLoading && candidates.length > 0 && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} matched for{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">{selectedJob?.title}</span>
          </p>
          <div className="flex flex-col gap-4">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate._id} candidate={candidate} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function CandidateCard({ candidate }: { candidate: CandidateRecommendation }) {
  const edu = candidate.education;
  const eduLabel = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ") || "—";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{candidate.fullName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{candidate.phone}</p>
        </div>
        <MatchBadge score={candidate.matchScore} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <Detail label="Experience" value={`${candidate.yearsOfExperience} yr${candidate.yearsOfExperience !== 1 ? "s" : ""}`} />
        <Detail label="Education" value={eduLabel} />
        {edu.institution && <Detail label="Institution" value={edu.institution} />}
        {edu.graduationYear && <Detail label="Graduated" value={String(edu.graduationYear)} />}
      </div>
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round((score / 4) * 100);
  const colour =
    score === 4
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : score >= 2
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colour}`}>
      {pct}% match
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-gray-600 dark:text-gray-300">
      <span className="text-gray-400 dark:text-gray-500">{label}: </span>
      {value}
    </p>
  );
}
