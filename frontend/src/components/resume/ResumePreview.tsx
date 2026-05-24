// frontend/src/components/resume/ResumePreview.tsx
import type { ResumeData } from "../../api/resumeApi";

interface Props {
  data: ResumeData;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

const Divider = () => <div style={{ borderBottom: "1.5px solid #e5e7eb", margin: "10px 0" }} />;

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

export default function ResumePreview({ data, forwardRef }: Props) {
  return (
    <div ref={forwardRef} id="__resume-preview-root" style={{ background: "#fff", width: "100%" }}>
      <ModernTemplate data={data} />
    </div>
  );
}
