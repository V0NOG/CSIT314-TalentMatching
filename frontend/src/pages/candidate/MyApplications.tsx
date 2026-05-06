// frontend/src/pages/candidate/MyApplications.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getMyApplications, type MyApplication, type ApplicationStatus } from "../../api/applicationsApi";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  reviewing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending Review", reviewing: "Under Review", accepted: "Accepted!", rejected: "Not Selected",
};

export default function MyApplications() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);
  const counts: Record<ApplicationStatus | "all", number> = { all: applications.length, pending: 0, reviewing: 0, accepted: 0, rejected: 0 };
  applications.forEach((a) => { counts[a.status]++; });

  return (
    <>
      <PageMeta title="My Applications | Talent Matching" description="Track your job applications" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">My Applications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {loading ? "Loading…" : `${applications.length} application${applications.length !== 1 ? "s" : ""} submitted`}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "reviewing", "accepted", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-brand-500 text-white"
                : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} {counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading applications…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            {filter === "all" ? "You haven't applied for any jobs yet." : `No ${filter} applications.`}
          </p>
          {filter === "all" && (
            <Link to="/candidate/recommendations" className="text-sm font-medium text-brand-500 hover:text-brand-600">
              Browse recommended jobs →
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((app) => (
            <div key={app._id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 truncate">{app.job.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{app.job.location} · {app.job.workMode}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[app.status]}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </div>
              {app.coverLetter && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">"{app.coverLetter}"</p>
              )}
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                Applied {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
