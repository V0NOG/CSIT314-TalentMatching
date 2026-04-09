// frontend/src/pages/employer/CreateJob.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import client from "../../api/client";

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

interface JobForm {
  title: string;
  description: string;
  location: string;
  workMode: "Remote" | "On-site" | "Hybrid";
  requiredEducation: string;
  requiredSkillsRaw: string;
  yearsOfExperience: number;
  status: "draft" | "active" | "closed";
}

const defaultForm = (): JobForm => ({
  title: "",
  description: "",
  location: "",
  workMode: "On-site",
  requiredEducation: "",
  requiredSkillsRaw: "",
  yearsOfExperience: 0,
  status: "active",
});

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState<JobForm>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof JobForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Parse skills from comma-separated string
    const requiredSkills = form.requiredSkillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (requiredSkills.length === 0) {
      setError("Please enter at least one required skill.");
      return;
    }

    setSaving(true);

    try {
      await client.post("/api/jobs", {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        requiredEducation: form.requiredEducation.trim(),
        requiredSkills,
        yearsOfExperience: Number(form.yearsOfExperience),
        status: form.status,
      });
      navigate("/employer/jobs");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create job posting. Do you have a company profile set up?";
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Post a Job | Talent Matching" description="Create job posting" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Post a Job</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Create a new listing to attract matching candidates. All fields marked * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Basic details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Job Details
          </h2>

          <Field label="Job Title *" htmlFor="title">
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="Senior Software Engineer"
            />
          </Field>

          <Field
            label="Description *"
            htmlFor="description"
            hint="Mention required technologies and responsibilities. This text is used for candidate matching."
          >
            <textarea
              id="description"
              rows={5}
              required
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaCls}
              placeholder="We are looking for a software engineer with experience in…"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Location *" htmlFor="location">
              <input
                id="location"
                type="text"
                required
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className={inputCls}
                placeholder="Sydney, NSW"
              />
            </Field>

            <Field label="Work Mode *" htmlFor="workMode">
              <select
                id="workMode"
                value={form.workMode}
                onChange={(e) => set("workMode", e.target.value as JobForm["workMode"])}
                className={inputCls}
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </Field>

            <Field label="Status" htmlFor="status">
              <select
                id="status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as JobForm["status"])}
                className={inputCls}
              >
                <option value="active">Active — visible to candidates</option>
                <option value="draft">Draft — hidden from candidates</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Requirements
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Required Education *" htmlFor="requiredEducation">
              <input
                id="requiredEducation"
                type="text"
                required
                value={form.requiredEducation}
                onChange={(e) => set("requiredEducation", e.target.value)}
                className={inputCls}
                placeholder="Bachelor of Computer Science"
              />
            </Field>

            <Field label="Years of Experience Required *" htmlFor="yearsExp">
              <input
                id="yearsExp"
                type="number"
                required
                min={0}
                value={form.yearsOfExperience}
                onChange={(e) => set("yearsOfExperience", parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label="Required Skills *"
            htmlFor="skills"
            hint="Enter skills separated by commas, e.g. JavaScript, React, Node.js"
          >
            <input
              id="skills"
              type="text"
              required
              value={form.requiredSkillsRaw}
              onChange={(e) => set("requiredSkillsRaw", e.target.value)}
              className={inputCls}
              placeholder="JavaScript, React, Node.js, SQL"
            />
          </Field>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Posting…" : "Post Job"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/employer/jobs")}
            className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
