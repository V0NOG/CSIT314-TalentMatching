// frontend/src/pages/employer/JobApplications.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getMyJobs, type Job } from "../../api/jobsApi";
import {
  getApplicationsForJob,
  updateApplicationStatus,
  type JobApplicationEntry,
  type ApplicationStatus,
} from "../../api/applicationsApi";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  reviewing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function JobApplications() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState<JobApplicationEntry[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getMyJobs().then(setJobs).catch(() => {}).finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setApplications([]); setHasFetched(false); return; }
    setAppsLoading(true); setAppsError(null); setHasFetched(true);
    getApplicationsForJob(selectedJobId)
      .then(setApplications)
      .catch(() => setAppsError("Failed to load applications."))
      .finally(() => setAppsLoading(false));
  }, [selectedJobId]);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, status);
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
    } catch { /* silent */ }
    finally { setUpdatingId(null); }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <>
      <PageMeta title="Applications | Talent Matching" description="Review job applications" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Applications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Select a job posting to review applicants.</p>
      </div>

      {/* Job selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 mb-6">
        <label htmlFor="job-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Job Posting</label>
        {jobsLoading && <p className="text-sm text-gray-400">Loading jobs…</p>}
        {!jobsLoading && jobs.length === 0 && (
          <p className="text-sm text-gray-400">No jobs yet. <Link to="/employer/jobs/new" className="text-brand-500 hover:underline">Post one</Link>.</p>
        )}
        {!jobsLoading && jobs.length > 0 && (
          <select id="job-select" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">— Select a job —</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title} · {j.location}</option>)}
          </select>
        )}
      </div>

      {appsLoading && <div className="text-center py-12 text-gray-400">Loading applications…</div>}
      {appsError && <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/20 px-4 py-3 text-sm text-red-500">{appsError}</div>}

      {hasFetched && !appsLoading && !appsError && applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No applications received for <strong>{selectedJob?.title}</strong> yet.</p>
        </div>
      )}

      {!appsLoading && applications.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{applications.length}</span> application{applications.length !== 1 ? "s" : ""} for <span className="font-medium text-gray-700 dark:text-gray-200">{selectedJob?.title}</span>
          </div>
          <div className="flex flex-col gap-4">
            {applications.map((app) => {
              const profile = app.candidateProfile;
              const eduLine = [profile?.education?.degree, profile?.education?.fieldOfStudy].filter(Boolean).join(" in ") || "—";
              const skills = profile?.skills || [];
              return (
                <div key={app._id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{profile?.fullName || "Unknown Applicant"}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {profile?.yearsOfExperience != null && `${profile.yearsOfExperience} yrs exp · `}{eduLine}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded-md bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 text-xs text-brand-600 dark:text-brand-400">{s}</span>
                      ))}
                    </div>
                  )}

                  {app.hasResume && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Resume attached
                      </span>
                    </div>
                  )}

                  {app.coverLetter && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 italic line-clamp-3">"{app.coverLetter}"</p>
                  )}

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {(["reviewing", "accepted", "rejected"] as ApplicationStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(app._id, s)}
                        disabled={app.status === s || updatingId === app._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          app.status === s
                            ? STATUS_STYLES[s]
                            : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {s === "reviewing" ? "Mark Reviewing" : s === "accepted" ? "Accept" : "Reject"}
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
