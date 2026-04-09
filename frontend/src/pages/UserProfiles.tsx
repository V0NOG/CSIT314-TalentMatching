// frontend/src/pages/UserProfiles.tsx
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";

export default function UserProfiles() {
  const { user } = useAuth();
  return (
    <>
      <PageMeta title="Profile | Talent Matching" description="User profile settings" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">Account Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">First Name</p>
              <p className="text-gray-800 dark:text-white/90 font-medium">{user?.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Last Name</p>
              <p className="text-gray-800 dark:text-white/90 font-medium">{user?.lastName}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-gray-800 dark:text-white/90 font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Role</p>
            <span className="inline-block capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
