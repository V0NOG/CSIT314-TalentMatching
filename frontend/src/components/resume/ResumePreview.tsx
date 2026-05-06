// frontend/src/components/resume/ResumePreview.tsx
import type { ResumeData } from "../../api/resumeApi";

interface Props {
  data: ResumeData;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

// Shared helpers
const Divider = () => <div style={{ borderBottom: "1.5px solid #e5e7eb", margin: "10px 0" }} />;
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: 6, marginTop: 0 }}>
    {children}
  </p>
);

function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, summary, education, workExperience, skills, certifications, projects } = data;
  return (
    <div style={{ fontFamily: "'Georgia', serif", fontSize: 13, lineHeight: 1.55, color: "#1f2937", background: "#fff", padding: "40px 48px", minHeight: "297mm", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "2px solid #1e3a5f", paddingBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "0.02em", color: "#1e3a5f" }}>{p.fullName || "Your Name"}</h1>
        <div style={{ marginTop: 6, fontSize: 12, color: "#4b5563", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 12px" }}>
          {p.phone && <span>{p.phone}</span>}
          {p.email && <span>{p.email}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Work Experience</SectionTitle>
          {workExperience.map((w, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: 13.5, color: "#111827" }}>{w.jobTitle}</strong>
                <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                  {w.startDate}{(w.startDate || w.endDate) ? " – " : ""}{w.current ? "Present" : w.endDate}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#4b5563" }}>{w.company}{w.location ? ` · ${w.location}` : ""}</div>
              {w.description && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#374151", whiteSpace: "pre-line" }}>{w.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Education</SectionTitle>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: 13, color: "#111827" }}>{[e.degree, e.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}</strong>
                {e.graduationYear && <span style={{ fontSize: 12, color: "#6b7280" }}>{e.graduationYear}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: "#4b5563" }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Skills</SectionTitle>
          <p style={{ margin: 0, fontSize: 12.5, color: "#374151" }}>{skills.join(" · ")}</p>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Certifications</SectionTitle>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "#374151", marginBottom: 4 }}>
              <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Projects</SectionTitle>
          {projects.map((pr, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#111827" }}>{pr.name}</strong>
              {pr.url && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>{pr.url}</span>}
              {pr.description && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#374151" }}>{pr.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, summary, education, workExperience, skills, certifications, projects } = data;
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12.5, lineHeight: 1.6, color: "#1f2937", background: "#fff", display: "flex", minHeight: "297mm", boxSizing: "border-box" }}>
      {/* Sidebar */}
      <div style={{ width: 200, minWidth: 200, background: "#1e3a5f", color: "#e5e7eb", padding: "36px 20px", flexShrink: 0 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{p.fullName || "Your Name"}</h1>
        <Divider />

        <div style={{ fontSize: 11, marginBottom: 16 }}>
          {p.phone && <div style={{ marginBottom: 4 }}>📞 {p.phone}</div>}
          {p.email && <div style={{ marginBottom: 4, wordBreak: "break-all" }}>✉ {p.email}</div>}
          {p.location && <div style={{ marginBottom: 4 }}>📍 {p.location}</div>}
          {p.linkedin && <div style={{ marginBottom: 4, wordBreak: "break-all" }}>🔗 {p.linkedin}</div>}
          {p.website && <div style={{ marginBottom: 4, wordBreak: "break-all" }}>🌐 {p.website}</div>}
        </div>

        {skills.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>Skills</p>
            {skills.map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: "#e5e7eb", marginBottom: 3, paddingLeft: 8, borderLeft: "2px solid #3b82f6" }}>{s}</div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>Education</p>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 11 }}>
                <div style={{ color: "#fff", fontWeight: 600 }}>{[e.degree, e.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}</div>
                <div style={{ color: "#d1d5db" }}>{e.institution}</div>
                {e.graduationYear && <div style={{ color: "#9ca3af" }}>{e.graduationYear}</div>}
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>Certifications</p>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 11, color: "#e5e7eb", marginBottom: 6 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                {c.issuer && <div style={{ color: "#d1d5db" }}>{c.issuer}</div>}
                {c.year && <div style={{ color: "#9ca3af" }}>{c.year}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {summary && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1e3a5f", marginBottom: 6 }}>About</p>
            <p style={{ margin: 0, color: "#374151" }}>{summary}</p>
          </div>
        )}

        {workExperience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1e3a5f", marginBottom: 10 }}>Experience</p>
            {workExperience.map((w, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "#111827" }}>{w.jobTitle}</strong>
                  <span style={{ fontSize: 11.5, color: "#6b7280" }}>{w.startDate}{(w.startDate || w.endDate) ? " – " : ""}{w.current ? "Present" : w.endDate}</span>
                </div>
                <div style={{ color: "#4b5563", fontSize: 12 }}>{w.company}{w.location ? ` · ${w.location}` : ""}</div>
                {w.description && <p style={{ margin: "4px 0 0", color: "#374151", whiteSpace: "pre-line" }}>{w.description}</p>}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1e3a5f", marginBottom: 10 }}>Projects</p>
            {projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong style={{ color: "#111827" }}>{pr.name}</strong>
                {pr.url && <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6 }}>{pr.url}</span>}
                {pr.description && <p style={{ margin: "2px 0 0", color: "#374151" }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, summary, education, workExperience, skills, certifications, projects } = data;
  return (
    <div style={{ fontFamily: "'Arial', sans-serif", fontSize: 13, lineHeight: 1.6, color: "#111827", background: "#fff", padding: "48px 56px", minHeight: "297mm", boxSizing: "border-box" }}>
      <h1 style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.fullName || "Your Name"}</h1>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
        {p.phone && <span>{p.phone}</span>}
        {p.email && <span>{p.email}</span>}
        {p.location && <span>{p.location}</span>}
        {p.linkedin && <span>{p.linkedin}</span>}
        {p.website && <span>{p.website}</span>}
      </div>

      {summary && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 8 }} />
          <p style={{ margin: 0, color: "#374151" }}>{summary}</p>
        </div>
      )}

      {workExperience.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Experience</p>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 12 }} />
          {workExperience.map((w, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{w.jobTitle} — {w.company}</strong>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{w.startDate}{(w.startDate || w.endDate) ? " – " : ""}{w.current ? "Present" : w.endDate}</span>
              </div>
              {w.location && <div style={{ fontSize: 12, color: "#6b7280" }}>{w.location}</div>}
              {w.description && <p style={{ margin: "4px 0 0", color: "#374151", whiteSpace: "pre-line" }}>{w.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Education</p>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 12 }} />
          {education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <strong>{[e.degree, e.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}</strong>
                {e.institution && <div style={{ fontSize: 12.5, color: "#4b5563" }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ""}</div>}
              </div>
              {e.graduationYear && <span style={{ fontSize: 12, color: "#6b7280" }}>{e.graduationYear}</span>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Skills</p>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 10 }} />
          <p style={{ margin: 0, color: "#374151" }}>{skills.join("   ·   ")}</p>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Certifications</p>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 10 }} />
          {certifications.map((c, i) => (
            <div key={i} style={{ marginBottom: 4, color: "#374151" }}>
              <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Projects</p>
          <div style={{ borderBottom: "1px solid #111827", marginBottom: 10 }} />
          {projects.map((pr, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong>{pr.name}</strong>
              {pr.url && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{pr.url}</span>}
              {pr.description && <p style={{ margin: "2px 0 0", color: "#374151" }}>{pr.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumePreview({ data, forwardRef }: Props) {
  return (
    <div ref={forwardRef} id="__resume-preview-root" style={{ background: "#fff", width: "100%" }}>
      {data.template === "modern"  && <ModernTemplate data={data} />}
      {data.template === "minimal" && <MinimalTemplate data={data} />}
      {(data.template === "classic" || !data.template) && <ClassicTemplate data={data} />}
    </div>
  );
}
