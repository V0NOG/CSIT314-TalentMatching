// frontend/src/pages/employer/BrowseCandidates.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getAllCandidates, type CandidateProfileData } from "../../api/candidateApi";

export default function BrowseCandidates() {
  const [candidates, setCandidates] = useState<CandidateProfileData[]>([]);
  const [filtered,   setFiltered]   = useState<CandidateProfileData[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [query,      setQuery]      = useState("");

  useEffect(() => {
    getAllCandidates()
      .then((data) => {
        setCandidates(data);
        setFiltered(data);
      })
      .catch(() => setError("Failed to load candidates."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) {
      setFiltered(candidates);
      return;
    }
    const lower = q.toLowerCase();
    setFiltered(
      candidates.filter((c) =>
        c.fullName.toLowerCase().includes(lower) ||
        c.education?.fieldOfStudy?.toLowerCase().includes(lower) ||
        c.education?.degree?.toLowerCase().includes(lower) ||
        c.education?.institution?.toLowerCase().includes(lower)
      )
    );
  };

  return (
    <>
      <PageMeta title="Browse Candidates | Talent Matching" description="All registered candidates" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Browse Candidates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {loading
            ? "Loading…"
            : `${filtered.length} candidate${filtered.length !== 1 ? "s" : ""}${query ? " matched your search" : " registered"}`}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Filter by name, field of study, degree, or institution…"
          className="w-full max-w-md rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading candidates…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {query ? `No candidates matched "${query}".` : "No candidates have created profiles yet."}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setFiltered(candidates); }}
              className="mt-3 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((candidate) => (
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{candidate.fullName}</h2>
        {edu?.institution && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.institution}</p>
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
        {edu?.graduationYear && (
          <p className="text-gray-600 dark:text-gray-300">
            <span className="text-gray-400 dark:text-gray-500">Graduated: </span>
            {edu.graduationYear}
          </p>
        )}
      </div>

      <Link
        to={`/employer/recommendations`}
        className="mt-auto text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
      >
        Find matched jobs for this profile →
      </Link>
    </div>
  );
}
