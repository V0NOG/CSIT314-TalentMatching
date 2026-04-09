// frontend/src/pages/candidate/CandidateProfile.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import {
  getMyCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
  type CandidateProfileData,
  type CandidateProfileInput,
} from "../../api/candidateApi";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

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

const emptyForm = (): CandidateProfileInput => ({
  fullName: "",
  phone: "",
  yearsOfExperience: 0,
  education: { institution: "", degree: "", fieldOfStudy: "", graduationYear: undefined },
});

function profileToForm(data: CandidateProfileData): CandidateProfileInput {
  return {
    fullName: data.fullName,
    phone: data.phone,
    yearsOfExperience: data.yearsOfExperience,
    education: {
      institution: data.education?.institution || "",
      degree: data.education?.degree || "",
      fieldOfStudy: data.education?.fieldOfStudy || "",
      graduationYear: data.education?.graduationYear,
    },
  };
}

export default function CandidateProfile() {
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CandidateProfileInput>(emptyForm());

  useEffect(() => {
    getMyCandidateProfile()
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

  const set = (field: keyof CandidateProfileInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setEdu = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, education: { ...prev.education, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Build clean education object — omit blank strings
    const edu: CandidateProfileInput["education"] = {};
    if (form.education?.degree?.trim())       edu.degree       = form.education.degree.trim();
    if (form.education?.fieldOfStudy?.trim()) edu.fieldOfStudy = form.education.fieldOfStudy.trim();
    if (form.education?.institution?.trim())  edu.institution  = form.education.institution.trim();
    if (form.education?.graduationYear)       edu.graduationYear = Number(form.education.graduationYear);

    const payload: CandidateProfileInput = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      yearsOfExperience: Number(form.yearsOfExperience),
      education: edu,
    };

    try {
      const saved = profile
        ? await updateCandidateProfile(payload)
        : await createCandidateProfile(payload);
      setProfile(saved);
      setSuccess(profile ? "Profile updated successfully." : "Profile created! You can now view your recommended jobs.");
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
      <PageMeta title="My Profile | Talent Matching" description="Candidate profile" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {profile
            ? "Keep your profile up to date to receive better job recommendations."
            : "Create your profile to start receiving personalised job recommendations."}
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading profile…</div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Personal information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name *" htmlFor="fullName">
                <input
                  id="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={inputCls}
                  placeholder="Jane Smith"
                />
              </Field>

              <Field label="Phone Number *" htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls}
                  placeholder="+61 400 000 000"
                />
              </Field>

              <Field
                label="Years of Experience *"
                htmlFor="years"
                hint="Enter 0 if you are a recent graduate."
              >
                <input
                  id="years"
                  type="number"
                  required
                  min={0}
                  value={form.yearsOfExperience}
                  onChange={(e) => set("yearsOfExperience", parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Education
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Used to match you with relevant job postings. Field of study has the strongest impact.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Degree" htmlFor="degree">
                <input
                  id="degree"
                  type="text"
                  value={form.education?.degree || ""}
                  onChange={(e) => setEdu("degree", e.target.value)}
                  className={inputCls}
                  placeholder="Bachelor of Science"
                />
              </Field>

              <Field label="Field of Study" htmlFor="fieldOfStudy">
                <input
                  id="fieldOfStudy"
                  type="text"
                  value={form.education?.fieldOfStudy || ""}
                  onChange={(e) => setEdu("fieldOfStudy", e.target.value)}
                  className={inputCls}
                  placeholder="Computer Science"
                />
              </Field>

              <Field label="Institution" htmlFor="institution">
                <input
                  id="institution"
                  type="text"
                  value={form.education?.institution || ""}
                  onChange={(e) => setEdu("institution", e.target.value)}
                  className={inputCls}
                  placeholder="University of Sydney"
                />
              </Field>

              <Field label="Graduation Year" htmlFor="gradYear">
                <input
                  id="gradYear"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear() + 5}
                  value={form.education?.graduationYear || ""}
                  onChange={(e) =>
                    setEdu("graduationYear", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className={inputCls}
                  placeholder="2023"
                />
              </Field>
            </div>
          </div>

          {/* Feedback messages */}
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

          {/* Actions */}
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
                to="/candidate/recommendations"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                View Recommended Jobs →
              </Link>
            )}
          </div>
        </form>
      )}
    </>
  );
}
