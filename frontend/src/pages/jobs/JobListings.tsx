// frontend/src/pages/jobs/JobListings.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getAllJobs, searchJobs, type Job, type JobSearchParams } from "../../api/jobsApi";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../api/applicationsApi";
import ApplyModal from "../../components/jobs/ApplyModal";

const WORK_MODES = ["Remote", "On-site", "Hybrid"] as const;
const STATUSES   = ["active", "draft", "closed"] as const;

function hasActiveFilters(params: JobSearchParams) {
  return !!(params.keyword || params.location || params.workMode || params.status);
}

export default function JobListings() {
  const { isCandidate } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [keyword, setKeyword]   = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [status, setStatus]     = useState("");

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load job listings."))
      .finally(() => setLoading(false));

    if (isCandidate) {
      getMyApplications()
        .then((apps) => setAppliedIds(new Set(apps.map((a) => a.job._id))))
        .catch(() => {});
    }
  }, [isCandidate]);

  const runSearch = useCallback(
    (params: JobSearchParams) => {
      setSearching(true);
      setError(null);
      const call = hasActiveFilters(params)
        ? searchJobs({ ...params, fuzzy: true })
        : getAllJobs();
      call
        .then(setJobs)
        .catch(() => setError("Search failed. Please try again."))
        .finally(() => setSearching(false));
    },
    []
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch({ keyword: keyword.trim(), location: location.trim(), workMode, status });
  };

  const handleClear = () => {
    setKeyword("");
    setLocation("");
    setWorkMode("");
    setStatus("");
    setSearching(true);
    getAllJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setSearching(false));
    inputRef.current?.focus();
  };

  const activeFilters = hasActiveFilters({ keyword: keyword.trim(), location: location.trim(), workMode, status });
  const busy = loading || searching;

  const applyJob = jobs.find((j) => j._id === applyJobId);

  return (
    <>
      <PageMeta title="Browse Jobs | Talent Matching" description="All job listings" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Browse Jobs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {busy ? "Loading…" : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="mb-6 space-y-3">
        {/* Keyword row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search jobs by keyword…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
                aria-label="Clear keyword"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 shrink-0"
          >
            Search
          </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location…"
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
          />

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All work modes</option>
            {WORK_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>

          {activeFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Clear all
            </button>
          )}
        </div>
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
            {activeFilters
              ? "No jobs matched your search and filters."
              : "No job postings available yet."}
          </p>
          {activeFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-3 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!busy && !error && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isCandidate={isCandidate}
              isApplied={appliedIds.has(job._id)}
              isHighlighted={highlightedId === job._id}
              onApply={() => {
                setHighlightedId(job._id);
                setApplyJobId(job._id);
                setTimeout(() => setHighlightedId(null), 900);
              }}
            />
          ))}
        </div>
      )}

      {applyJobId && applyJob && (
        <ApplyModal
          jobId={applyJobId}
          jobTitle={applyJob.title}
          jobLocation={applyJob.location}
          jobWorkMode={applyJob.workMode}
          onClose={() => setApplyJobId(null)}
          onSuccess={(jobId) => {
            setAppliedIds((prev) => new Set([...prev, jobId]));
            setApplyJobId(null);
          }}
        />
      )}
    </>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function JobCard({
  job,
  isCandidate,
  isApplied,
  isHighlighted,
  onApply,
}: {
  job: Job;
  isCandidate: boolean;
  isApplied: boolean;
  isHighlighted: boolean;
  onApply: () => void;
}) {
  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.draft;

  return (
    <div className={`rounded-2xl border bg-white p-5 dark:bg-gray-900 transition-all duration-300 ${
      isHighlighted
        ? "border-brand-400 dark:border-brand-500 ring-2 ring-brand-300 dark:ring-brand-700 shadow-md scale-[1.005]"
        : "border-gray-200 dark:border-gray-800"
    }`}>
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

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </p>
        {isCandidate && (
          isApplied ? (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full px-3 py-1">
              Applied
            </span>
          ) : (
            <button
              onClick={onApply}
              className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-1.5"
            >
              Apply
            </button>
          )
        )}
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
