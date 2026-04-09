// frontend/src/pages/jobs/JobListings.tsx
import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getAllJobs, searchJobs, type Job } from "../../api/jobsApi";

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load job listings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) {
      // Reset to all jobs
      setSearching(true);
      getAllJobs()
        .then(setJobs)
        .catch(() => setError("Failed to load jobs."))
        .finally(() => setSearching(false));
      return;
    }
    setSearching(true);
    setError(null);
    searchJobs(q)
      .then(setJobs)
      .catch(() => setError("Search failed. Please try again."))
      .finally(() => setSearching(false));
  };

  const handleClear = () => {
    setKeyword("");
    setSearching(true);
    getAllJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setSearching(false));
    inputRef.current?.focus();
  };

  const busy = loading || searching;

  return (
    <>
      <PageMeta title="Browse Jobs | Talent Matching" description="All job listings" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Browse Jobs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {busy ? "Loading…" : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by keyword in job description…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {busy && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading jobs…</div>
      )}

      {!busy && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {keyword.trim() ? `No jobs matched "${keyword.trim()}".` : "No job postings available yet."}
          </p>
          {keyword.trim() && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-3 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {!busy && !error && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

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

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Posted {new Date(job.createdAt).toLocaleDateString()}
      </p>
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
