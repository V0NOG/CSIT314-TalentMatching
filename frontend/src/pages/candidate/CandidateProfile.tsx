// frontend/src/pages/candidate/CandidateProfile.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { updateMembership } from "../../api/userApi";
import {
  getMyCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
  type CandidateProfileData,
  type CandidateProfileInput,
  type WorkExperienceEntry,
} from "../../api/candidateApi";
import PhoneInput from "../../components/form/PhoneInput";
import ComboboxInput from "../../components/form/ComboboxInput";
import DatePickerInput from "../../components/form/DatePickerInput";

const DEGREES = [
  "Bachelor of Arts (BA)", "Bachelor of Science (BSc)", "Bachelor of Engineering (BE)",
  "Bachelor of Commerce (BCom)", "Bachelor of Business Administration (BBA)",
  "Bachelor of Laws (LLB)", "Bachelor of Medicine (MBBS)", "Bachelor of Education (BEd)",
  "Bachelor of Nursing (BN)", "Bachelor of Computer Science", "Bachelor of Information Technology",
  "Master of Arts (MA)", "Master of Science (MSc)", "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)", "Master of Laws (LLM)", "Master of Education (MEd)",
  "Master of Public Health (MPH)", "Master of Finance", "Doctor of Philosophy (PhD)",
  "Doctor of Medicine (MD)", "Associate Degree", "Diploma", "Advanced Diploma",
  "Graduate Certificate", "Graduate Diploma", "High School Diploma",
];

const FIELDS_OF_STUDY = [
  "Computer Science", "Information Technology", "Software Engineering", "Data Science",
  "Cybersecurity", "Artificial Intelligence", "Business Administration", "Marketing",
  "Finance", "Accounting", "Economics", "Human Resources", "Psychology", "Education",
  "Nursing", "Medicine", "Law", "Civil Engineering", "Mechanical Engineering",
  "Electrical Engineering", "Chemical Engineering", "Biology", "Chemistry",
  "Physics", "Mathematics", "Statistics", "History", "English Literature",
  "Communication", "Graphic Design", "Architecture",
];

const INSTITUTIONS = [
  "University of Wollongong",
  "University of Sydney", "University of Melbourne", "Australian National University",
  "University of Queensland", "Monash University", "UNSW Sydney",
  "University of Western Australia", "University of Adelaide", "Macquarie University",
  "University of Technology Sydney", "Deakin University", "RMIT University",
  "Queensland University of Technology", "Harvard University",
  "Massachusetts Institute of Technology", "Stanford University",
  "University of Oxford", "University of Cambridge", "Imperial College London",
  "National University of Singapore", "University of Toronto", "University of Auckland",
];

const SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "Django", "FastAPI", "Spring Boot",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Git", "Linux",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis", "Tableau", "Power BI",
  "Figma", "Photoshop", "UI/UX Design", "Agile", "Scrum", "Project Management",
  "Communication", "Leadership", "Problem Solving", "Team Collaboration",
  "Microsoft Excel", "Microsoft Word", "PowerPoint", "Salesforce", "SAP",
];

const JOB_TITLES = [
  "Software Engineer", "Senior Software Engineer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "Mobile Developer", "DevOps Engineer", "Data Engineer", "Data Scientist",
  "Machine Learning Engineer", "Product Manager", "Project Manager", "Business Analyst",
  "UX Designer", "UI Designer", "Graphic Designer", "Marketing Manager", "Sales Manager",
  "Account Manager", "Operations Manager", "HR Manager", "Finance Manager", "Accountant",
  "Nurse", "Teacher", "Consultant", "Legal Counsel", "Research Analyst",
  "Customer Success Manager", "Technical Lead", "Engineering Manager",
];

const LOCATIONS = [
  "Remote", "Sydney NSW", "Melbourne VIC", "Brisbane QLD", "Perth WA", "Adelaide SA",
  "Canberra ACT", "Gold Coast QLD", "Newcastle NSW", "Wollongong NSW",
  "Sunshine Coast QLD", "Hobart TAS", "Darwin NT", "Geelong VIC",
  "New York, USA", "San Francisco, USA", "London, UK", "Singapore",
  "Toronto, Canada", "Auckland, New Zealand",
];

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 h-10";

const selectCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 h-10";

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
  skills: [],
  workExperience: [],
  preferredWorkingMode: "",
  preferredLocation: "",
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
    skills: data.skills || [],
    workExperience: data.workExperience || [],
    preferredWorkingMode: data.preferredWorkingMode || "",
    preferredLocation: data.preferredLocation || "",
  };
}

const emptyWorkExp = (): WorkExperienceEntry => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

export default function CandidateProfile() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CandidateProfileInput>(emptyForm());

  const [skillInput, setSkillInput] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [membershipMsg, setMembershipMsg] = useState<string | null>(null);

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
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof CandidateProfileInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setEdu = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, education: { ...prev.education, [field]: value } }));

  // Skills helpers
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !(form.skills || []).includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...(prev.skills || []), trimmed] }));
    }
  };

  const removeSkill = (skill: string) =>
    setForm((prev) => ({ ...prev, skills: (prev.skills || []).filter((s) => s !== skill) }));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  const handleSkillBlur = () => {
    if (skillInput.trim()) {
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  // Work Experience helpers
  const addWorkExp = () =>
    setForm((prev) => ({ ...prev, workExperience: [...(prev.workExperience || []), emptyWorkExp()] }));

  const removeWorkExp = (index: number) =>
    setForm((prev) => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter((_, i) => i !== index),
    }));

  const updateWorkExp = (index: number, field: keyof WorkExperienceEntry, value: string) =>
    setForm((prev) => ({
      ...prev,
      workExperience: (prev.workExperience || []).map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));

  // Membership
  const handleCancelMembership = async () => {
    if (!user) return;
    if (!window.confirm("Cancel your Premium membership? You'll lose unlimited recommendations at the end of this billing period.")) return;
    setCancelLoading(true);
    setMembershipMsg(null);
    try {
      await updateMembership(false);
      await refreshUser();
      setMembershipMsg("Membership cancelled. You've been moved to the Free plan.");
    } catch {
      setMembershipMsg("Failed to cancel membership. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

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
      skills: (form.skills || []).filter((s) => s.trim()),
      workExperience: (form.workExperience || [])
        .map((exp) => ({
          jobTitle:    exp.jobTitle?.trim()    || "",
          company:     exp.company?.trim()     || "",
          startDate:   exp.startDate?.trim()   || "",
          endDate:     exp.endDate?.trim()     || "",
          description: exp.description?.trim() || "",
        }))
        .filter((exp) => exp.jobTitle || exp.company),
      preferredWorkingMode: (form.preferredWorkingMode as CandidateProfileInput["preferredWorkingMode"]) || "",
      preferredLocation: form.preferredLocation?.trim() || "",
    };

    try {
      const saved = profile
        ? await updateCandidateProfile(payload)
        : await createCandidateProfile(payload);
      setProfile(saved);
      setForm(profileToForm(saved));
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
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Row 1: Personal Information + Education */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Personal Information */}
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
                  <PhoneInput
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                  />
                </Field>

                <Field label="Years of Experience *" htmlFor="years" hint="Enter 0 if you are a recent graduate.">
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
                  <ComboboxInput
                    id="degree"
                    value={form.education?.degree || ""}
                    onChange={(v) => setEdu("degree", v)}
                    suggestions={DEGREES}
                    placeholder="Bachelor of Science"
                    className={inputCls}
                  />
                </Field>

                <Field label="Field of Study" htmlFor="fieldOfStudy">
                  <ComboboxInput
                    id="fieldOfStudy"
                    value={form.education?.fieldOfStudy || ""}
                    onChange={(v) => setEdu("fieldOfStudy", v)}
                    suggestions={FIELDS_OF_STUDY}
                    placeholder="Computer Science"
                    className={inputCls}
                  />
                </Field>

                <Field label="Institution" htmlFor="institution">
                  <ComboboxInput
                    id="institution"
                    value={form.education?.institution || ""}
                    onChange={(v) => setEdu("institution", v)}
                    suggestions={INSTITUTIONS}
                    placeholder="University of Wollongong"
                    className={inputCls}
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
          </div>

          {/* Row 2: Skills + Job Preferences */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Skills */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Skills
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add your technical and professional skills. Used directly in job matching.
                </p>
              </div>

              {(form.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 leading-none"
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <Field label="Add Skill" htmlFor="skillInput" hint="Select from list, or type and press Enter.">
                <ComboboxInput
                  id="skillInput"
                  value={skillInput}
                  onChange={(v) => setSkillInput(v)}
                  onSelect={(v) => { addSkill(v); setSkillInput(""); }}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={handleSkillBlur}
                  suggestions={SKILLS}
                  placeholder="e.g. Python, React, Project Management"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Job Preferences */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Job Preferences
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Used in job matching and to help employers find candidates who suit their role.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Preferred Working Mode" htmlFor="preferredWorkingMode">
                  <select
                    id="preferredWorkingMode"
                    value={form.preferredWorkingMode || ""}
                    onChange={(e) => set("preferredWorkingMode", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">No preference</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </Field>

                <Field label="Preferred Location" htmlFor="preferredLocation">
                  <ComboboxInput
                    id="preferredLocation"
                    value={form.preferredLocation || ""}
                    onChange={(v) => set("preferredLocation", v)}
                    suggestions={LOCATIONS}
                    placeholder="Sydney NSW"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Work Experience — full width */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Work Experience
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  List your relevant work history. Shown to employers in recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={addWorkExp}
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 shrink-0"
              >
                + Add Entry
              </button>
            </div>

            {(form.workExperience || []).length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No work experience added yet.</p>
            )}

            {(form.workExperience || []).map((exp, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3"
              >
                <button
                  type="button"
                  onClick={() => removeWorkExp(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                  aria-label="Remove entry"
                >
                  ×
                </button>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Job Title" htmlFor={`jobTitle-${index}`}>
                    <ComboboxInput
                      id={`jobTitle-${index}`}
                      value={exp.jobTitle || ""}
                      onChange={(v) => updateWorkExp(index, "jobTitle", v)}
                      suggestions={JOB_TITLES}
                      placeholder="Software Engineer"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Company" htmlFor={`company-${index}`}>
                    <input
                      id={`company-${index}`}
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => updateWorkExp(index, "company", e.target.value)}
                      className={inputCls}
                      placeholder="Acme Corp"
                    />
                  </Field>

                  <Field label="Start Date" htmlFor={`startDate-${index}`}>
                    <DatePickerInput
                      id={`startDate-${index}`}
                      value={exp.startDate || ""}
                      onChange={(v) => updateWorkExp(index, "startDate", v)}
                      placeholder="Jan 2022"
                    />
                  </Field>

                  <Field label="End Date" htmlFor={`endDate-${index}`} hint='Use "Present" if current role.'>
                    <DatePickerInput
                      id={`endDate-${index}`}
                      value={exp.endDate || ""}
                      onChange={(v) => updateWorkExp(index, "endDate", v)}
                      placeholder="Present"
                    />
                  </Field>
                </div>

                <Field label="Description" htmlFor={`desc-${index}`}>
                  <textarea
                    id={`desc-${index}`}
                    rows={2}
                    value={exp.description || ""}
                    onChange={(e) => updateWorkExp(index, "description", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Brief description of responsibilities and achievements…"
                  />
                </Field>
              </div>
            ))}
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

          {/* Save actions */}
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

      {/* Membership — outside the form, full width */}
      {!loading && (
        <div className="mt-6">
          {user?.membership ? (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Membership</h2>
                  <p className="text-base font-semibold text-gray-800 dark:text-white/90 mt-1">Premium Member</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    You receive unlimited job recommendations sorted by best fit.
                  </p>
                </div>
                <span className="shrink-0 ml-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700">
                  Premium
                </span>
              </div>
              {membershipMsg && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{membershipMsg}</p>
              )}
              <button
                type="button"
                onClick={handleCancelMembership}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? "Cancelling…" : "Cancel Membership"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Membership</h2>
                  <p className="text-base font-semibold text-gray-800 dark:text-white/90 mt-1">Free Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
                    Free accounts receive up to 10 job recommendations. Upgrade to Premium for unlimited results,
                    increased visibility, and full match breakdowns.
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {["Unlimited job recommendations", "Full match score breakdowns", "Priority profile visibility"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/membership"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600"
                  >
                    Upgrade to Premium — $9.99/mo
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
