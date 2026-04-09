// frontend/src/pages/candidate/CandidateRecommendations.tsx
import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getCandidateRecommendations, type JobRecommendation } from "../../api/recommendationsApi";

export default function CandidateRecommendations() {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCandidateRecommendations()
      .then(setJobs)
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setError("No candidate profile found. Please complete your profile to receive recommendations.");
        } else if (status === 403) {
          setError("Access denied.");
        } else {
          setError("Failed to load recommendations. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta title="Recommended Jobs | Talent Matching" description="Top job recommendations" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Recommended Jobs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your top {jobs.length > 0 ? jobs.length : "10"} job matches based on your profile.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading recommendations…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
          No matching jobs found. Complete your profile to improve recommendations.
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

function JobCard({ job }: { job: JobRecommendation }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 truncate">{job.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {job.location} · {job.workMode}
          </p>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip label={`${job.yearsOfExperience}+ yrs exp`} />
        <Chip label={job.requiredEducation} />
        {job.requiredSkills.slice(0, 4).map((skill) => (
          <Chip key={skill} label={skill} />
        ))}
        {job.requiredSkills.length > 4 && (
          <Chip label={`+${job.requiredSkills.length - 4} more`} muted />
        )}
      </div>
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round((score / 4) * 100);
  const colour =
    score === 4 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : score >= 2 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colour}`}>
      {pct}% match
    </span>
  );
}

function Chip({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      muted
        ? "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        : "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
    }`}>
      {label}
    </span>
  );
}
