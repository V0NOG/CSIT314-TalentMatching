// frontend/src/pages/employer/EmployerJobs.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getMyJobs, type Job } from "../../api/jobsApi";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function EmployerJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load your job postings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta title="My Job Postings | Talent Matching" description="Manage job postings" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Job Postings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? "Loading…" : `${jobs.length} posting${jobs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
        >
          + Post a Job
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading job postings…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-3">You haven't posted any jobs yet.</p>
          <Link
            to="/employer/jobs/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Post Your First Job
          </Link>
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

function JobCard({ job }: { job: Job }) {
  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.draft;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{job.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {job.location} · {job.workMode}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
          {job.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <Chip label={`${job.yearsOfExperience}+ yrs exp`} />
        <Chip label={job.requiredEducation} />
        {job.requiredSkills.slice(0, 4).map((skill) => (
          <Chip key={skill} label={skill} />
        ))}
        {job.requiredSkills.length > 4 && (
          <Chip label={`+${job.requiredSkills.length - 4} more`} muted />
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <Link
          to={`/employer/recommendations?jobId=${job._id}`}
          className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Find matching candidates →
        </Link>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
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
