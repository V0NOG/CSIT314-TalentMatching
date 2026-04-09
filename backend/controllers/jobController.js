// backend/controllers/jobController.js
import Job from "../models/Job.js";
import EmployerProfile from "../models/EmployerProfile.js";

const REQUIRED_FIELDS = ["title", "description", "requiredEducation", "requiredSkills", "yearsOfExperience", "workMode", "location"];
const STRING_FIELDS   = ["title", "description", "requiredEducation", "workMode", "location"];
const ALLOWED_FIELDS  = ["title", "description", "requiredEducation", "requiredSkills", "yearsOfExperience", "workMode", "location", "status"];

/**
 * POST /api/jobs
 * Creates a new job posting for the authenticated employer.
 * Returns 403 if the user has no EmployerProfile.
 * Returns 400 if any required field is missing or invalid.
 * Returns 201 on success.
 */
export const createJob = async (req, res) => {
  try {
    // Only employers with a profile can post jobs
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) {
      return res.status(403).json({ error: "You must create an employer profile before posting jobs." });
    }

    // Validate required fields
    for (const field of REQUIRED_FIELDS) {
      const value = req.body[field];
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate requiredSkills is a non-empty array
    const { requiredSkills } = req.body;
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: "requiredSkills must be a non-empty array" });
    }

    // Build whitelisted data object, trimming all string fields
    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        data[field] = STRING_FIELDS.includes(field)
          ? String(req.body[field]).trim()
          : req.body[field];
      }
    }
    // Trim each skill string in the array
    data.requiredSkills = requiredSkills.map((s) => String(s).trim()).filter(Boolean);

    const job = await Job.create({
      ...data,
      employer: req.user.id,
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error("[jobController.createJob]", err);
    return res.status(500).json({ error: "An error occurred while creating the job posting" });
  }
};

/**
 * GET /api/jobs
 * Returns all job postings, sorted by newest first.
 */
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json(jobs);
  } catch (err) {
    console.error("[jobController.getAllJobs]", err);
    return res.status(500).json({ error: "An error occurred while fetching job postings" });
  }
};

/**
 * GET /api/jobs/mine
 * Returns all job postings created by the authenticated employer, sorted by newest first.
 */
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json(jobs);
  } catch (err) {
    console.error("[jobController.getMyJobs]", err);
    return res.status(500).json({ error: "An error occurred while fetching your job postings" });
  }
};

/**
 * GET /api/jobs/search?keyword=<term>
 * Searches job postings by keyword match on description (case-insensitive).
 * Returns 400 if no keyword is provided.
 * Returns matching jobs sorted by newest first.
 */
export const searchJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();

    if (!keyword) {
      return res.status(400).json({ error: "keyword query parameter is required" });
    }

    // Escape special regex characters to prevent injection attacks.
    // e.g. a keyword of ".*" would otherwise match every document.
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const jobs = await Job.find({
      description: { $regex: safeKeyword, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json(jobs);
  } catch (err) {
    console.error("[jobController.searchJobs]", err);
    return res.status(500).json({ error: "An error occurred while searching job postings" });
  }
};
