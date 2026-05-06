// frontend/src/pages/candidate/ResumeBuilder.tsx
import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { getMyResume, upsertResume, type ResumeData, type ResumeEducation, type ResumeWorkExp, type ResumeCertification, type ResumeProject, type ResumeTemplate } from "../../api/resumeApi";
import { getMyCandidateProfile } from "../../api/candidateApi";
import ResumePreview from "../../components/resume/ResumePreview";
import ComboboxInput from "../../components/form/ComboboxInput";

const DEGREES = [
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BSc)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Laws (LLB)",
  "Bachelor of Medicine (MBBS)",
  "Bachelor of Education (BEd)",
  "Bachelor of Nursing (BN)",
  "Bachelor of Computer Science",
  "Bachelor of Information Technology",
  "Master of Arts (MA)",
  "Master of Science (MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Laws (LLM)",
  "Master of Education (MEd)",
  "Master of Public Health (MPH)",
  "Master of Finance",
  "Doctor of Philosophy (PhD)",
  "Doctor of Medicine (MD)",
  "Associate Degree",
  "Diploma",
  "Advanced Diploma",
  "Certificate III",
  "Certificate IV",
  "Graduate Certificate",
  "Graduate Diploma",
  "High School Diploma",
];

const FIELDS_OF_STUDY = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Cybersecurity",
  "Artificial Intelligence",
  "Machine Learning",
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "Economics",
  "Human Resources",
  "Project Management",
  "Psychology",
  "Sociology",
  "Education",
  "Nursing",
  "Medicine",
  "Pharmacy",
  "Law",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Environmental Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Statistics",
  "History",
  "English Literature",
  "Communication",
  "Journalism",
  "Graphic Design",
  "Architecture",
  "Interior Design",
  "Film & Media Studies",
];

const INSTITUTIONS = [
  "University of Sydney",
  "University of Melbourne",
  "Australian National University",
  "University of Queensland",
  "Monash University",
  "UNSW Sydney",
  "University of Western Australia",
  "University of Adelaide",
  "Macquarie University",
  "University of Technology Sydney",
  "Deakin University",
  "RMIT University",
  "Queensland University of Technology",
  "Harvard University",
  "Massachusetts Institute of Technology",
  "Stanford University",
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",
  "University College London",
  "National University of Singapore",
  "University of Toronto",
  "McGill University",
  "University of British Columbia",
  "University of Auckland",
  "Victoria University of Wellington",
];

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
  { id: "classic",  label: "Classic",  desc: "Traditional — navy header, serif font" },
  { id: "modern",   label: "Modern",   desc: "Two-column — sidebar with skills" },
  { id: "minimal",  label: "Minimal",  desc: "Clean monochrome — sans-serif" },
];

type Tab = "personal" | "summary" | "experience" | "education" | "skills" | "certifications" | "projects";
const TABS: { id: Tab; label: string }[] = [
  { id: "personal",       label: "Personal" },
  { id: "summary",        label: "Summary" },
  { id: "experience",     label: "Experience" },
  { id: "education",      label: "Education" },
  { id: "skills",         label: "Skills" },
  { id: "certifications", label: "Certs" },
  { id: "projects",       label: "Projects" },
];

const emptyEdu = (): ResumeEducation => ({ institution: "", degree: "", fieldOfStudy: "", graduationYear: undefined, gpa: "" });
const emptyExp = (): ResumeWorkExp  => ({ jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
const emptyCert = (): ResumeCertification => ({ name: "", issuer: "", year: "" });
const emptyProject = (): ResumeProject => ({ name: "", description: "", url: "" });

const emptyResume = (): ResumeData => ({
  template: "classic",
  personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "" },
  summary: "",
  education: [],
  workExperience: [],
  skills: [],
  certifications: [],
  projects: [],
});

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 h-10";
const textareaCls = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [data, setData]           = useState<ResumeData>(emptyResume());
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resume = await getMyResume();
        setData(resume);
      } catch {
        // No resume yet — try pre-filling from candidate profile
        try {
          const profile = await getMyCandidateProfile();
          setData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: profile.fullName,
              phone: profile.phone,
            },
            education: profile.education && (profile.education.degree || profile.education.fieldOfStudy || profile.education.institution)
              ? [{
                  institution: profile.education.institution || "",
                  degree: profile.education.degree || "",
                  fieldOfStudy: profile.education.fieldOfStudy || "",
                  graduationYear: profile.education.graduationYear,
                  gpa: "",
                }]
              : [],
            workExperience: (profile.workExperience || []).map((w) => ({
              jobTitle: w.jobTitle || "",
              company: w.company || "",
              location: "",
              startDate: w.startDate || "",
              endDate: w.endDate || "",
              current: w.endDate === "Present" || w.endDate === "present",
              description: w.description || "",
            })),
            skills: profile.skills || [],
          }));
        } catch { /* no profile either */ }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Pre-fill email from auth user
  useEffect(() => {
    if (user?.email && !data.personalInfo.email) {
      setData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, email: user.email } }));
    }
  }, [user]);

  const setField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setPersonal = (field: keyof ResumeData["personalInfo"], value: string) =>
    setData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));

  // Work experience
  const addExp   = () => setField("workExperience", [...data.workExperience, emptyExp()]);
  const removeExp = (i: number) => setField("workExperience", data.workExperience.filter((_, j) => j !== i));
  const updateExp = (i: number, field: keyof ResumeWorkExp, value: string | boolean) =>
    setField("workExperience", data.workExperience.map((e, j) => j === i ? { ...e, [field]: value } : e));

  // Education
  const addEdu    = () => setField("education", [...data.education, emptyEdu()]);
  const removeEdu = (i: number) => setField("education", data.education.filter((_, j) => j !== i));
  const updateEdu = (i: number, field: keyof ResumeEducation, value: string | number | undefined) =>
    setField("education", data.education.map((e, j) => j === i ? { ...e, [field]: value } : e));

  // Certifications
  const addCert    = () => setField("certifications", [...data.certifications, emptyCert()]);
  const removeCert = (i: number) => setField("certifications", data.certifications.filter((_, j) => j !== i));
  const updateCert = (i: number, field: keyof ResumeCertification, value: string) =>
    setField("certifications", data.certifications.map((c, j) => j === i ? { ...c, [field]: value } : c));

  // Projects
  const addProject    = () => setField("projects", [...data.projects, emptyProject()]);
  const removeProject = (i: number) => setField("projects", data.projects.filter((_, j) => j !== i));
  const updateProject = (i: number, field: keyof ResumeProject, value: string) =>
    setField("projects", data.projects.map((p, j) => j === i ? { ...p, [field]: value } : p));

  // Skills
  const addSkill = (s: string) => {
    const t = s.trim();
    if (t && !data.skills.includes(t)) setField("skills", [...data.skills, t]);
  };
  const removeSkill = (s: string) => setField("skills", data.skills.filter((x) => x !== s));
  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); setSkillInput(""); }
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    try {
      const saved = await upsertResume(data);
      setData(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const style = document.createElement("style");
    style.id = "__resume-print-style";
    style.innerHTML = `
      @media print {
        body > * { visibility: hidden !important; }
        #__resume-preview-root, #__resume-preview-root * { visibility: visible !important; }
        #__resume-preview-root { position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById("__resume-print-style")?.remove(), 1000);
  };

  if (loading) return <div className="text-center py-16 text-gray-400 dark:text-gray-500">Loading resume builder…</div>;

  return (
    <>
      <PageMeta title="Resume Builder | Talent Matching" description="Build your professional resume" />

      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Resume Builder</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Build your resume and attach it when applying for jobs.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Resume"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>

        {/* ── Editor ── */}
        <div className="flex flex-col gap-5">

          {/* Template picker */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Template</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setField("template", t.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    data.template === t.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <p className={`text-sm font-semibold mb-0.5 ${data.template === t.id ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-200"}`}>{t.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[60px] px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5 space-y-4">

            {/* Personal */}
            {activeTab === "personal" && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(["fullName", "email", "phone", "location", "linkedin", "website"] as const).map((field) => (
                    <div key={field}>
                      <label className={labelCls}>{
                        field === "fullName"  ? "Full Name" :
                        field === "email"     ? "Email Address" :
                        field === "phone"     ? "Phone Number" :
                        field === "location"  ? "Location / City" :
                        field === "linkedin"  ? "LinkedIn URL" :
                        "Website / Portfolio"
                      }</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        value={data.personalInfo[field]}
                        onChange={(e) => setPersonal(field, e.target.value)}
                        placeholder={
                          field === "fullName"  ? "Jane Smith" :
                          field === "email"     ? "jane@example.com" :
                          field === "phone"     ? "+61 412 345 678" :
                          field === "location"  ? "Sydney, NSW" :
                          field === "linkedin"  ? "linkedin.com/in/jane" :
                          "portfolio.com"
                        }
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Summary */}
            {activeTab === "summary" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Professional Summary</h3>
                  <span className="text-xs text-gray-400">{data.summary.length} chars</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">A 2–3 sentence overview of your career, skills, and goals. Appears at the top of the resume.</p>
                <textarea
                  rows={6}
                  value={data.summary}
                  onChange={(e) => setField("summary", e.target.value)}
                  placeholder="Motivated software engineer with 4 years of experience building scalable web applications…"
                  className={textareaCls}
                />
              </>
            )}

            {/* Experience */}
            {activeTab === "experience" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Work Experience</h3>
                  <button type="button" onClick={addExp} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Role</button>
                </div>
                {data.workExperience.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No roles added yet.</p>
                )}
                {data.workExperience.map((exp, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                    <button type="button" onClick={() => removeExp(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Job Title</label>
                        <input value={exp.jobTitle} onChange={(e) => updateExp(i, "jobTitle", e.target.value)} placeholder="Software Engineer" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Company</label>
                        <input value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} placeholder="Acme Corp" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input value={exp.location} onChange={(e) => updateExp(i, "location", e.target.value)} placeholder="Sydney, NSW" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Start Date</label>
                        <input value={exp.startDate} onChange={(e) => updateExp(i, "startDate", e.target.value)} placeholder="Jan 2022" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>End Date</label>
                        <input value={exp.endDate} onChange={(e) => updateExp(i, "endDate", e.target.value)} disabled={exp.current} placeholder="Dec 2024" className={`${inputCls} ${exp.current ? "opacity-40 cursor-not-allowed" : ""}`} />
                      </div>
                      <div className="flex items-center gap-2 self-end pb-1">
                        <input type="checkbox" id={`current-${i}`} checked={exp.current} onChange={(e) => { updateExp(i, "current", e.target.checked); if (e.target.checked) updateExp(i, "endDate", ""); }} className="rounded border-gray-300 dark:border-gray-600 text-brand-500" />
                        <label htmlFor={`current-${i}`} className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">Current role</label>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} value={exp.description} onChange={(e) => updateExp(i, "description", e.target.value)} placeholder="Key responsibilities and achievements…" className={textareaCls} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Education */}
            {activeTab === "education" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Education</h3>
                  <button type="button" onClick={addEdu} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Entry</button>
                </div>
                {data.education.length === 0 && <p className="text-sm text-gray-400 italic">No education added yet.</p>}
                {data.education.map((edu, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                    <button type="button" onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Degree</label>
                        <ComboboxInput value={edu.degree} onChange={(v) => updateEdu(i, "degree", v)} suggestions={DEGREES} placeholder="Bachelor of Science" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Field of Study</label>
                        <ComboboxInput value={edu.fieldOfStudy} onChange={(v) => updateEdu(i, "fieldOfStudy", v)} suggestions={FIELDS_OF_STUDY} placeholder="Computer Science" className={inputCls} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Institution</label>
                        <ComboboxInput value={edu.institution} onChange={(v) => updateEdu(i, "institution", v)} suggestions={INSTITUTIONS} placeholder="University of Sydney" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Graduation Year</label>
                        <input type="number" value={edu.graduationYear || ""} onChange={(e) => updateEdu(i, "graduationYear", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="2023" min={1950} max={new Date().getFullYear() + 5} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>GPA (optional)</label>
                        <input value={edu.gpa} onChange={(e) => updateEdu(i, "gpa", e.target.value)} placeholder="3.8 / 4.0" className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Skills */}
            {activeTab === "skills" && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Skills</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Press Enter or comma to add a skill.</p>
                {data.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="text-brand-400 hover:text-brand-600 leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  onBlur={() => { if (skillInput.trim()) { addSkill(skillInput); setSkillInput(""); }}}
                  placeholder="e.g. React, Python, SQL…"
                  className={inputCls}
                />
              </>
            )}

            {/* Certifications */}
            {activeTab === "certifications" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Certifications</h3>
                  <button type="button" onClick={addCert} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add</button>
                </div>
                {data.certifications.length === 0 && <p className="text-sm text-gray-400 italic">No certifications added yet.</p>}
                {data.certifications.map((c, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                    <button type="button" onClick={() => removeCert(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className={labelCls}>Name</label>
                        <input value={c.name} onChange={(e) => updateCert(i, "name", e.target.value)} placeholder="AWS Solutions Architect" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Issuer</label>
                        <input value={c.issuer} onChange={(e) => updateCert(i, "issuer", e.target.value)} placeholder="Amazon Web Services" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Year</label>
                        <input value={c.year} onChange={(e) => updateCert(i, "year", e.target.value)} placeholder="2024" className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Projects */}
            {activeTab === "projects" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Projects</h3>
                  <button type="button" onClick={addProject} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Project</button>
                </div>
                {data.projects.length === 0 && <p className="text-sm text-gray-400 italic">No projects added yet.</p>}
                {data.projects.map((p, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                    <button type="button" onClick={() => removeProject(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Project Name</label>
                        <input value={p.name} onChange={(e) => updateProject(i, "name", e.target.value)} placeholder="Portfolio Website" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>URL (optional)</label>
                        <input value={p.url} onChange={(e) => updateProject(i, "url", e.target.value)} placeholder="github.com/jane/portfolio" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={2} value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} placeholder="What it does, tech used, impact…" className={textareaCls} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Live Preview</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">A4 format — matches PDF output</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
              <div
                style={{ transform: "scale(0.72)", transformOrigin: "top left", width: "139%", height: 800, overflow: "hidden" }}
              >
                <ResumePreview data={data} forwardRef={previewRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
