// backend/controllers/jobController.js
import Job from "../models/Job.js";
import EmployerProfile from "../models/EmployerProfile.js";

const REQUIRED_FIELDS = ["title", "description", "requiredEducation", "requiredSkills", "yearsOfExperience", "workMode", "location"];
const STRING_FIELDS   = ["title", "description", "requiredEducation", "workMode", "location"];
const ALLOWED_FIELDS  = ["title", "description", "requiredEducation", "requiredSkills", "yearsOfExperience", "workMode", "location", "status"];

/**
 * Bigram (Sørensen–Dice) similarity between two lowercase strings.
 * Returns 0–1 where 1 is identical.
 */
function bigramSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a[0] === b[0] ? 0.4 : 0;

  const bigrams = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }

  let intersect = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    if (bigrams.has(bg) && bigrams.get(bg) > 0) {
      intersect++;
      bigrams.set(bg, bigrams.get(bg) - 1);
    }
  }

  return (2 * intersect) / (a.length + b.length - 2);
}

const FUZZY_THRESHOLD = 0.6;

function jobMatchesToken(job, token, fuzzy) {
  const text = [
    job.title,
    job.description,
    job.location,
    job.workMode,
    job.requiredEducation,
    ...(job.requiredSkills || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes(token)) return true;
  if (!fuzzy) return false;

  const words = text.split(/\s+/);
  return words.some((w) => bigramSimilarity(w, token) >= FUZZY_THRESHOLD);
}

/**
 * POST /api/jobs
 * Creates a new job posting for the authenticated employer.
 */
export const createJob = async (req, res) => {
  try {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) {
      return res.status(403).json({ error: "You must create an employer profile before posting jobs." });
    }

    for (const field of REQUIRED_FIELDS) {
      const value = req.body[field];
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { requiredSkills } = req.body;
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: "requiredSkills must be a non-empty array" });
    }

    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        data[field] = STRING_FIELDS.includes(field)
          ? String(req.body[field]).trim()
          : req.body[field];
      }
    }
    data.requiredSkills = requiredSkills.map((s) => String(s).trim()).filter(Boolean);

    const job = await Job.create({ ...data, employer: req.user.id });
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
    const jobs = await Job.find().sort({ createdAt: -1 }).select("-__v");
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
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 }).select("-__v");
    return res.status(200).json(jobs);
  } catch (err) {
    console.error("[jobController.getMyJobs]", err);
    return res.status(500).json({ error: "An error occurred while fetching your job postings" });
  }
};

/**
 * GET /api/jobs/search
 * Searches job postings with optional keyword, filters, and fuzzy matching.
 *
 * Query params:
 *   keyword  — one or more terms matched across title, description, skills, location, etc.
 *   location — filter by job location (case-insensitive substring)
 *   workMode — filter by work mode (Remote | On-site | Hybrid)
 *   status   — filter by status (active | draft | closed)
 *   fuzzy    — "true" to enable typo-tolerant fuzzy matching
 */
export const searchJobs = async (req, res) => {
  try {
    const { keyword, location, workMode, status } = req.query;
    const fuzzy = req.query.fuzzy === "true" || req.query.fuzzy === "1";

    // Build MongoDB filter for structured filters
    const mongoQuery = {};

    if (location?.trim()) {
      const safe = location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      mongoQuery.location = { $regex: safe, $options: "i" };
    }

    if (workMode && ["Remote", "On-site", "Hybrid"].includes(workMode)) {
      mongoQuery.workMode = workMode;
    }

    if (status && ["active", "draft", "closed"].includes(status)) {
      mongoQuery.status = status;
    }

    const queryTokens = keyword?.trim().toLowerCase().split(/\s+/).filter(Boolean) || [];

    // Non-fuzzy keyword search via MongoDB regex across multiple fields
    if (queryTokens.length > 0 && !fuzzy) {
      mongoQuery.$and = queryTokens.map((token) => {
        const safe = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return {
          $or: [
            { title:              { $regex: safe, $options: "i" } },
            { description:        { $regex: safe, $options: "i" } },
            { location:           { $regex: safe, $options: "i" } },
            { requiredEducation:  { $regex: safe, $options: "i" } },
            { requiredSkills:     { $regex: safe, $options: "i" } },
            { workMode:           { $regex: safe, $options: "i" } },
          ],
        };
      });
    }

    let jobs = await Job.find(mongoQuery).sort({ createdAt: -1 }).select("-__v");

    // Fuzzy in-memory filter — handles typos via bigram similarity
    if (queryTokens.length > 0 && fuzzy) {
      jobs = jobs.filter((job) =>
        queryTokens.every((token) => jobMatchesToken(job, token, true))
      );
    }

    return res.status(200).json(jobs);
  } catch (err) {
    console.error("[jobController.searchJobs]", err);
    return res.status(500).json({ error: "An error occurred while searching job postings" });
  }
};
