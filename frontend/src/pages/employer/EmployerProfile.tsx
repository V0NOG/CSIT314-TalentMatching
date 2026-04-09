// frontend/src/pages/employer/EmployerProfile.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import {
  getMyEmployerProfile,
  createEmployerProfile,
  updateEmployerProfile,
  type EmployerProfileData,
  type EmployerProfileInput,
} from "../../api/employerApi";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

const textareaCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

const emptyForm = (): EmployerProfileInput => ({
  companyName: "",
  industry: "",
  location: "",
  description: "",
});

function profileToForm(data: EmployerProfileData): EmployerProfileInput {
  return {
    companyName: data.companyName,
    industry: data.industry || "",
    location: data.location || "",
    description: data.description || "",
  };
}

export default function EmployerProfile() {
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EmployerProfileInput>(emptyForm());

  useEffect(() => {
    getMyEmployerProfile()
      .then((data) => {
        setProfile(data);
        setForm(profileToForm(data));
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          setError("Failed to load profile. Please refresh the page.");
        }
        // 404 = no profile yet, show blank create form
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof EmployerProfileInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: EmployerProfileInput = {
      companyName: form.companyName.trim(),
      industry: form.industry?.trim() || undefined,
      location: form.location?.trim() || undefined,
      description: form.description?.trim() || undefined,
    };

    try {
      const saved = profile
        ? await updateEmployerProfile(payload)
        : await createEmployerProfile(payload);
      setProfile(saved);
      setSuccess(
        profile
          ? "Company profile updated successfully."
          : "Company profile created. You can now post jobs."
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Company Profile | Talent Matching" description="Employer profile" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Company Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {profile
            ? "Keep your company information current to attract better candidates."
            : "Create a company profile before posting jobs."}
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading profile…</div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Company Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Company Name *" htmlFor="companyName">
                <input
                  id="companyName"
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={inputCls}
                  placeholder="Acme Corp"
                />
              </Field>

              <Field label="Industry" htmlFor="industry">
                <input
                  id="industry"
                  type="text"
                  value={form.industry || ""}
                  onChange={(e) => set("industry", e.target.value)}
                  className={inputCls}
                  placeholder="Technology"
                />
              </Field>

              <Field label="Location" htmlFor="location">
                <input
                  id="location"
                  type="text"
                  value={form.location || ""}
                  onChange={(e) => set("location", e.target.value)}
                  className={inputCls}
                  placeholder="Sydney, NSW"
                />
              </Field>
            </div>

            <Field
              label="Company Description"
              htmlFor="description"
              hint="A brief description helps candidates understand who you are."
            >
              <textarea
                id="description"
                rows={4}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                className={textareaCls}
                placeholder="Tell candidates about your company, culture, and what makes you a great place to work…"
              />
            </Field>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : profile ? "Save Changes" : "Create Profile"}
            </button>

            {profile && (
              <Link
                to="/employer/jobs/new"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Post a Job →
              </Link>
            )}
          </div>
        </form>
      )}
    </>
  );
}
