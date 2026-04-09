// frontend/src/pages/employer/EmployerDashboard.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";

export default function EmployerDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageMeta title="Dashboard | Talent Matching" description="Employer Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your job postings and discover top candidates.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard title="Active Job Postings" value="—" hint="Your currently published jobs" href="/employer/jobs" />
        <StatCard title="Total Candidates" value="—" hint="Candidates in the platform" href="/candidates" />
        <StatCard title="Company Profile" value="—" hint="Keep your company info up to date" href="/employer/profile" />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            title="Post a New Job"
            description="Create a new job listing to attract matching candidates."
            href="/employer/jobs/new"
            cta="Create Job Posting"
          />
          <QuickAction
            title="Manage Job Postings"
            description="View, edit, or delete your existing job listings."
            href="/employer/jobs"
            cta="View Postings"
          />
          <QuickAction
            title="Browse Candidates"
            description="Search and filter the candidate pool by skill, education, or experience."
            href="/candidates"
            cta="Browse Candidates"
          />
          <QuickAction
            title="Update Company Profile"
            description="Keep your company information current to attract better candidates."
            href="/employer/profile"
            cta="Edit Profile"
          />
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, hint, href }: { title: string; value: string; hint: string; href: string }) {
  return (
    <Link
      to={href}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 hover:shadow-md transition-shadow"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">{value}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
    </Link>
  );
}

function QuickAction({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <h3 className="font-medium text-gray-800 dark:text-white/90 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      <Link
        to={href}
        className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
      >
        {cta} →
      </Link>
    </div>
  );
}
