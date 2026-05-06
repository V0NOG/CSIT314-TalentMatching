// frontend/src/components/header/GlobalSearch.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchJobs, type Job } from "../../api/jobsApi";
import { searchCandidates, type CandidateProfileData } from "../../api/candidateApi";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { isEmployer } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) { setJobs([]); setCandidates([]); setOpen(false); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [jobRes, candRes] = await Promise.all([
          searchJobs({ keyword: q, fuzzy: true }),
          isEmployer ? searchCandidates({ keyword: q, fuzzy: true }) : Promise.resolve([]),
        ]);
        setJobs(jobRes.slice(0, 5));
        setCandidates(candRes.slice(0, 3));
        setOpen(true);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isEmployer]);

  const go = (path: string) => { navigate(path); setOpen(false); setQuery(""); };

  const hasResults = jobs.length > 0 || candidates.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
          <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Search jobs, candidates… (⌘K)"
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >×</button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 top-full mt-2 w-full xl:w-[430px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl z-[99999] overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Searching…</div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">No results for "{query}"</div>
          )}

          {!loading && jobs.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Jobs</div>
              {jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => go("/jobs")}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.location} · {job.workMode}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 text-xs text-brand-600 dark:text-brand-400 capitalize">{job.status}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div className={jobs.length > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""}>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Candidates</div>
              {candidates.map((c) => (
                <button
                  key={c._id}
                  onClick={() => go("/candidates")}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{c.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {[c.education?.fieldOfStudy, c.education?.degree].filter(Boolean).join(" · ") || "No education listed"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!loading && hasResults && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
              <button onClick={() => go("/jobs")} className="text-xs text-brand-500 hover:text-brand-600">
                View all jobs matching "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
