// backend/controllers/resumeController.js
import Resume from "../models/Resume.js";

const ALLOWED_FIELDS = ["template", "personalInfo", "summary", "education", "workExperience", "skills", "certifications", "projects"];

/** GET /api/resume — get the authenticated candidate's resume */
export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id }).select("-__v");
    if (!resume) return res.status(404).json({ error: "No resume found" });
    return res.status(200).json(resume);
  } catch (err) {
    console.error("[resumeController.getMyResume]", err);
    return res.status(500).json({ error: "An error occurred while fetching the resume" });
  }
};

/** PUT /api/resume — create or replace the authenticated candidate's resume */
export const upsertResume = async (req, res) => {
  try {
    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }

    const resume = await Resume.findOneAndUpdate(
      { user: req.user.id },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).select("-__v");

    return res.status(200).json(resume);
  } catch (err) {
    console.error("[resumeController.upsertResume]", err);
    return res.status(500).json({ error: "An error occurred while saving the resume" });
  }
};
