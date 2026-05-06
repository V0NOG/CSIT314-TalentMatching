// frontend/src/pages/employer/BrowseCandidates.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import {
  getAllCandidates,
  searchCandidates,
  type CandidateProfileData,
  type CandidateSearchParams,
} from "../../api/candidateApi";

const WORK_MODES = ["Remote", "On-site", "Hybrid"] as const;

function hasActiveFilters(params: CandidateSearchParams) {
  return !!(params.keyword || params.preferredWorkingMode || params.preferredLocation);
}

export default function BrowseCandidates() {
  const [candidates, setCandidates] = useState<CandidateProfileData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [searching, setSearching]   = useState(false);

  const [keyword, setKeyword]                     = useState("");
  const [preferredWorkingMode, setWorkMode]        = useState("");
  const [preferredLocation, setPreferredLocation]  = useState("");
  const [fuzzy, setFuzzy]                         = useState(false);

  useEffect(() => {
    getAllCandidates()
      .then((data) => setCandidates(data))
      .catch(() => setError("Failed to load candidates."))
      .finally(() => setLoading(false));
  }, []);

  const runSearch = useCallback((params: CandidateSearchParams) => {
    setSearching(true);
    setError(null);
    const call = hasActiveFilters(params) || params.fuzzy
      ? searchCandidates(params)
      : getAllCandidates();
    call
      .then(setCandidates)
      .catch(() => setError("Search failed. Please try again."))
      .finally(() => setSearching(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch({
      keyword: keyword.trim(),
      preferredWorkingMode,
      preferredLocation: preferredLocation.trim(),
      fuzzy,
    });
  };

  const handleClear = () => {
    setKeyword("");
    setWorkMode("");
    setPreferredLocation("");
    setFuzzy(false);
    setSearching(true);
    getAllCandidates()
      .then(setCandidates)
      .catch(() => setError("Failed to load candidates."))
      .finally(() => setSearching(false));
  };

  const busy = loading || searching;
  const activeFilters = hasActiveFilters({
    keyword: keyword.trim(),
    preferredWorkingMode,
    preferredLocation: preferredLocation.trim(),
  });

  return (
    <>
      <PageMeta title="Browse Candidates | Talent Matching" description="All registered candidates" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Browse Candidates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {busy
            ? "Loading…"
            : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}${activeFilters ? " matched your search" : " registered"}`}
        </p>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, skill, education, experience…"
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

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={preferredWorkingMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Any work mode preference</option>
            {WORK_MODES.map((m) => (
              <option key={m} value={m}>{m} preferred</option>
            ))}
          </select>

          <input
            type="text"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            placeholder="Preferred location…"
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
          />

          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fuzzy}
              onChange={(e) => setFuzzy(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-brand-500 focus:ring-brand-500"
            />
            Fuzzy search
          </label>

          {(activeFilters || fuzzy) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {fuzzy && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Fuzzy search is on — approximate matches and typos are handled automatically.
          </p>
        )}
      </form>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading candidates…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!busy && !error && candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {activeFilters ? "No candidates matched your search." : "No candidates have created profiles yet."}
          </p>
          {activeFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-3 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {!busy && !error && candidates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate._id} candidate={candidate} />
          ))}
        </div>
      )}
    </>
  );
}

function CandidateCard({ candidate }: { candidate: CandidateProfileData }) {
  const edu = candidate.education;
  const eduLine = [edu?.degree, edu?.fieldOfStudy].filter(Boolean).join(" in ") || null;
  const skills = candidate.skills || [];
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 700);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl border bg-white p-5 dark:bg-gray-900 flex flex-col gap-3 cursor-pointer transition-all duration-300 ${
        clicked
          ? "border-brand-400 dark:border-brand-500 ring-2 ring-brand-300 dark:ring-brand-700 shadow-md"
          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 truncate">{candidate.fullName}</h2>
          {edu?.institution && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.institution}</p>
          )}
        </div>
        {candidate.preferredWorkingMode && (
          <span className="shrink-0 rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            {candidate.preferredWorkingMode}
          </span>
        )}
      </div>

      <div className="text-sm space-y-1">
        {eduLine && (
          <p className="text-gray-600 dark:text-gray-300">
            <span className="text-gray-400 dark:text-gray-500">Education: </span>
            {eduLine}
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-300">
          <span className="text-gray-400 dark:text-gray-500">Experience: </span>
          {candidate.yearsOfExperience} yr{candidate.yearsOfExperience !== 1 ? "s" : ""}
        </p>
        {candidate.preferredLocation && (
          <p className="text-gray-600 dark:text-gray-300">
            <span className="text-gray-400 dark:text-gray-500">Prefers: </span>
            {candidate.preferredLocation}
          </p>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}

      <Link
        to="/employer/recommendations"
        className="mt-auto text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
      >
        Find matched jobs for this profile →
      </Link>
    </div>
  );
}
