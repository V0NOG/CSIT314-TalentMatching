// frontend/src/pages/candidate/CandidateRecommendations.tsx
// Placeholder — will be fully implemented in Phase 3 + 5
import PageMeta from "../../components/common/PageMeta";

export default function CandidateRecommendations() {
  return (
    <>
      <PageMeta title="Recommended Jobs | Talent Matching" description="Top job recommendations" />
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Recommended Jobs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your top 10 job matches based on your profile — coming in Phase 3 & 5.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
        Recommendation engine coming soon
      </div>
    </>
  );
}
