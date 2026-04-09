// frontend/src/pages/candidate/CandidateDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import { getMyCandidateProfile } from "../../api/candidateApi";
import { getAllJobs } from "../../api/jobsApi";
import { getCandidateRecommendations } from "../../api/recommendationsApi";

export default function CandidateDashboard() {
  const { user } = useAuth();

  // null = loading, string = ready
  const [recCount,    setRecCount]    = useState<string | null>(null);
  const [jobCount,    setJobCount]    = useState<string | null>(null);
  const [profileStat, setProfileStat] = useState<string | null>(null);

  useEffect(() => {
    // Available jobs — always fetchable
    getAllJobs()
      .then((jobs) => setJobCount(String(jobs.length)))
      .catch(() => setJobCount("—"));

    // Profile completeness
    getMyCandidateProfile()
      .then((p) => {
        const filled = [p.fullName, p.phone, p.education?.fieldOfStudy, p.education?.degree].filter(Boolean).length;
        setProfileStat(filled >= 3 ? "Complete" : "Incomplete");
      })
      .catch((err) => {
        setProfileStat(err?.response?.status === 404 ? "Not set up" : "—");
      });

    // Recommendation count — fails with 404 if no profile, that's fine
    getCandidateRecommendations()
      .then((recs) => setRecCount(recs.length > 0 ? String(recs.length) : "0"))
      .catch((err) => {
        setRecCount(err?.response?.status === 404 ? "—" : "0");
      });
  }, []);

  return (
    <>
      <PageMeta title="Dashboard | Talent Matching" description="Candidate Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s a snapshot of your job search activity.
        </p>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard
          title="Recommended Jobs"
          value={recCount}
          hint="Matched to your profile"
          href="/candidate/recommendations"
        />
        <StatCard
          title="Profile Status"
          value={profileStat}
          hint="Keep your profile up to date for better matches"
          href="/candidate/profile"
        />
        <StatCard
          title="Available Jobs"
          value={jobCount}
          hint="Browse all open positions"
          href="/jobs"
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            title="My Profile"
            description="Add your education, field of study, and experience to improve your match score."
            href="/candidate/profile"
            cta="Edit Profile"
          />
          <QuickAction
            title="Recommended Jobs"
            description="View your top 10 job matches, ranked by how well they fit your profile."
            href="/candidate/recommendations"
            cta="View Recommendations"
          />
          <QuickAction
            title="Browse All Jobs"
            description="Search and filter all available job postings by keyword."
            href="/jobs"
            cta="Browse Jobs"
          />
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  hint,
  href,
}: {
  title: string;
  value: string | null;
  hint: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 hover:shadow-md transition-shadow"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">
        {value === null ? <span className="text-gray-300 dark:text-gray-700">…</span> : value}
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
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
