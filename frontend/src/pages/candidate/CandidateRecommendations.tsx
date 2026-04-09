// frontend/src/pages/candidate/CandidateRecommendations.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getCandidateRecommendations, type JobRecommendation } from "../../api/recommendationsApi";

export default function CandidateRecommendations() {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    getCandidateRecommendations()
      .then(setJobs)
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setNoProfile(true);
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
          {!loading && !noProfile && jobs.length > 0
            ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} matched your profile — sorted by best fit.`
            : "Your top 10 job matches, ranked by how well they fit your profile."}
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10 px-5 py-4">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">How recommendations work</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Each job is scored out of 4 based on how closely it matches your profile across four criteria:
          <span className="font-medium"> field of study</span>,
          <span className="font-medium"> education level</span>,
          <span className="font-medium"> years of experience</span>, and
          <span className="font-medium"> skills</span>.
          Jobs with higher scores appear first. Keep your profile complete for better matches.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading recommendations…</div>
      )}

      {noProfile && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">No profile found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Create your candidate profile to start receiving personalised job recommendations.
          </p>
          <Link
            to="/candidate/profile"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Create My Profile
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !noProfile && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">No matching jobs found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Try completing more of your profile — add your field of study and education details for the best results.
          </p>
          <Link
            to="/candidate/profile"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Update My Profile
          </Link>
        </div>
      )}

      {!loading && !error && !noProfile && jobs.length > 0 && (
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

      {/* Why this matched */}
      {job.matchReasons && job.matchReasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Why this matched</p>
          <div className="flex flex-wrap gap-1">
            {job.matchReasons.map((reason) => (
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
  const pct = Math.round((score / 4) * 100);
  const colour =
    score >= 3
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

function Chip({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        muted
          ? "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          : "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
      }`}
    >
      {label}
    </span>
  );
}
