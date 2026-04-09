// frontend/src/pages/candidate/CandidateProfile.tsx
// Placeholder — will be fully implemented in Phase 3
import PageMeta from "../../components/common/PageMeta";

export default function CandidateProfile() {
  return (
    <>
      <PageMeta title="My Profile | Talent Matching" description="Candidate profile" />
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Build your profile so employers can find you — coming in Phase 3.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
        Profile form coming soon
      </div>
    </>
  );
}
