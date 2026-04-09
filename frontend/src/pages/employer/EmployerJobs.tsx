// frontend/src/pages/employer/EmployerJobs.tsx
// Placeholder — will be fully implemented in Phase 4
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function EmployerJobs() {
  return (
    <>
      <PageMeta title="My Job Postings | Talent Matching" description="Manage job postings" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Job Postings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your job listings — coming in Phase 4.</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
        >
          + Post a Job
        </Link>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
        Job listing management coming soon
      </div>
    </>
  );
}
