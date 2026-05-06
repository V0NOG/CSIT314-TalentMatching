// frontend/src/pages/employer/CandidateRecommendations.tsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { getMyJobs, type Job } from "../../api/jobsApi";
import { getCandidateRecommendationsForJob, type CandidateRecommendation } from "../../api/recommendationsApi";

const MAX_SCORE = 6;

export default function EmployerCandidateRecommendations() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isMember = user?.membership === true;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [selectedJobId, setSelectedJobId] = useState(() => searchParams.get("jobId") || "");
  const [candidates, setCandidates] = useState<CandidateRecommendation[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    getMyJobs()
      .then(setJobs)
      .catch(() => setJobsError("Failed to load your job postings."))
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setCandidates([]);
      setCandidatesError(null);
      setHasFetched(false);
      return;
    }

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
          Select a job posting to find the top matching candidates.
        </p>
      </div>

      {/* Membership status banner */}
      <div className={`mb-6 rounded-xl border px-5 py-3 flex items-center justify-between gap-4 ${
        isMember
          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40"
      }`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isMember
            ? "Premium member — showing all matching candidates with no limit."
            : "Free plan — showing top 10 matches per job. Upgrade to Premium for unlimited results."}
        </p>
        {!isMember && (
          <Link
            to="/employer/profile"
            className="shrink-0 text-xs font-medium text-brand-500 hover:text-brand-600"
          >
            Upgrade →
          </Link>
        )}
      </div>

      {/* Scoring explanation */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10 px-5 py-4">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">How recommendations work</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Candidates are scored out of {MAX_SCORE} based on how well their profile matches the job across six criteria:
          <span className="font-medium"> field of study</span>,
          <span className="font-medium"> education level</span>,
          <span className="font-medium"> years of experience</span>,
          <span className="font-medium"> skills</span>,
          <span className="font-medium"> work mode preference</span>, and
          <span className="font-medium"> location preference</span>.
          {isMember ? " All matches are returned." : " Top 10 matches are returned, sorted by score."}
        </p>
      </div>

      {/* Job dropdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 mb-6">
        <label
          htmlFor="job-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select Job Posting
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Choosing a job loads the top matching candidates automatically.
        </p>

        {jobsLoading && (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your jobs…</p>
        )}

        {jobsError && (
          <p className="text-sm text-red-500">{jobsError}</p>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You have no job postings yet.{" "}
            <Link to="/employer/jobs/new" className="text-brand-500 hover:underline">
              Create one first
            </Link>
            .
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
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-4">
          {candidatesError}
        </div>
      )}

      {hasFetched && !candidatesLoading && !candidatesError && candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No matching candidates found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            No candidate profiles matched the requirements for{" "}
            <strong className="text-gray-700 dark:text-gray-200">{selectedJob?.title}</strong>.
            More candidates will appear as they complete their profiles.
          </p>
        </div>
      )}

      {!candidatesLoading && candidates.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{candidates.length}</span>{" "}
              candidate{candidates.length !== 1 ? "s" : ""} matched for{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">{selectedJob?.title}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Sorted by best match</p>
          </div>
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
  const skills = candidate.skills || [];
  const workExps = candidate.workExperience || [];

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
        <Detail
          label="Experience"
          value={`${candidate.yearsOfExperience} yr${candidate.yearsOfExperience !== 1 ? "s" : ""}`}
        />
        <Detail label="Education" value={eduLabel} />
        {edu.institution && <Detail label="Institution" value={edu.institution} />}
        {edu.graduationYear && <Detail label="Graduated" value={String(edu.graduationYear)} />}
        {candidate.preferredWorkingMode && (
          <Detail label="Prefers" value={candidate.preferredWorkingMode} />
        )}
        {candidate.preferredLocation && (
          <Detail label="Location pref." value={candidate.preferredLocation} />
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {skill}
            </span>
          ))}
          {skills.length > 6 && (
            <span className="rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              +{skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Work Experience summary */}
      {workExps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Work Experience</p>
          {workExps.slice(0, 2).map((exp, i) => (
            <p key={i} className="text-xs text-gray-600 dark:text-gray-300">
              {[exp.jobTitle, exp.company].filter(Boolean).join(" at ")}
              {(exp.startDate || exp.endDate) && (
                <span className="text-gray-400 dark:text-gray-500 ml-1">
                  ({[exp.startDate, exp.endDate].filter(Boolean).join(" – ")})
                </span>
              )}
            </p>
          ))}
          {workExps.length > 2 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">+{workExps.length - 2} more entries</p>
          )}
        </div>
      )}

      {/* Why this matched */}
      {candidate.matchReasons && candidate.matchReasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Why this matched</p>
          <div className="flex flex-wrap gap-1">
            {candidate.matchReasons.map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round((score / MAX_SCORE) * 100);
  const colour =
    score >= 5
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : score >= 4
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
