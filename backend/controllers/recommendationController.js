// backend/controllers/recommendationController.js
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

const TOP_K = 10;

/**
 * scoreJob — pure function, no side effects.
 * Computes a relevance score (0–6) and a human-readable list of matched reasons
 * for a single job against a candidate profile.
 *
 * Scoring criteria (each worth 1 point):
 *   1. Field of study  — candidate's fieldOfStudy appears in job description
 *   2. Education match — job's requiredEducation contains candidate's field or degree
 *   3. Experience      — candidate's yearsOfExperience >= job's yearsOfExperience
 *   4. Skills          — at least one skill overlaps (falls back to fieldOfStudy when no skills)
 *   5. Work mode       — candidate's preferredWorkingMode matches job's workMode
 *   6. Location        — candidate's preferredLocation appears in job's location
 */
function scoreJob(candidate, job) {
  let score = 0;
  const reasons = [];

  const field  = (candidate.education?.fieldOfStudy || "").toLowerCase().trim();
  const degree = (candidate.education?.degree       || "").toLowerCase().trim();
  const years  = candidate.yearsOfExperience ?? 0;

  // Fallback to [fieldOfStudy] when the candidate has no skills on record
  const candidateSkills = (candidate.skills && candidate.skills.length > 0
    ? candidate.skills
    : field ? [field] : []
  ).map((s) => s.toLowerCase().trim()).filter(Boolean);

  const jobDesc   = job.description.toLowerCase();
  const jobEdu    = job.requiredEducation.toLowerCase();
  const jobSkills = job.requiredSkills.map((s) => s.toLowerCase().trim());

  // 1. Field of study
  if (field && jobDesc.includes(field)) {
    score += 1;
    reasons.push("Field of study matched");
  }

  // 2. Education match
  if ((field && jobEdu.includes(field)) || (degree && jobEdu.includes(degree))) {
    score += 1;
    reasons.push("Education level matched");
  }

  // 3. Experience match
  if (years >= job.yearsOfExperience) {
    score += 1;
    reasons.push("Experience requirement met");
  }

  // 4. Skill match
  if (candidateSkills.length > 0) {
    const hasOverlap = candidateSkills.some((cs) =>
      jobSkills.some((js) => js.includes(cs) || cs.includes(js))
    );
    if (hasOverlap) {
      score += 1;
      reasons.push("Skills overlapped");
    }
  }

  // 5. Work mode preference match
  const preferredMode = (candidate.preferredWorkingMode || "").trim();
  if (preferredMode && preferredMode === job.workMode) {
    score += 1;
    reasons.push("Work mode preference matched");
  }

  // 6. Location preference match
  const preferredLoc = (candidate.preferredLocation || "").toLowerCase().trim();
  if (preferredLoc && job.location.toLowerCase().includes(preferredLoc)) {
    score += 1;
    reasons.push("Location preference matched");
  }

  return { score, reasons };
}

/**
 * GET /api/recommendations/candidates/:jobId
 * Returns the top-N candidates most relevant to the given job posting.
 * Membership users get unlimited results; non-members get top 10.
 */
export const recommendCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const [job, candidates, user] = await Promise.all([
      Job.findById(jobId).select("-__v"),
      CandidateProfile.find().select("-__v"),
      User.findById(req.user.id).select("membership"),
    ]);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (candidates.length === 0) {
      return res.status(200).json([]);
    }

    const isMember = user?.membership === true;

    const scored = candidates.map((candidate) => ({
      candidate,
      ...scoreJob(candidate, job),
    }));

    let recommendations = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : new Date(b.candidate.updatedAt) - new Date(a.candidate.updatedAt)
      );

    if (!isMember) {
      recommendations = recommendations.slice(0, TOP_K);
    }

    return res.status(200).json(
      recommendations.map(({ candidate, score, reasons }) => ({
        ...candidate.toObject(),
        matchScore: score,
        matchReasons: reasons,
      }))
    );
  } catch (err) {
    console.error("[recommendationController.recommendCandidatesForJob]", err);
    return res.status(500).json({ error: "An error occurred while generating candidate recommendations" });
  }
};

/**
 * GET /api/recommendations
 * Returns the top-K jobs most relevant to the authenticated candidate.
 * Membership users get unlimited results; non-members get top 10.
 */
export const recommendJobsForCandidate = async (req, res) => {
  try {
    const [candidate, user] = await Promise.all([
      CandidateProfile.findOne({ user: req.user.id }),
      User.findById(req.user.id).select("membership"),
    ]);

    if (!candidate) {
      return res.status(404).json({
        error: "Candidate profile not found. Please create your profile to receive recommendations.",
      });
    }

    const isMember = user?.membership === true;

    const jobs = await Job.find().select("-__v");
    if (jobs.length === 0) {
      return res.status(200).json([]);
    }

    const scored = jobs.map((job) => ({
      job,
      ...scoreJob(candidate, job),
    }));

    let recommendations = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : new Date(b.job.createdAt) - new Date(a.job.createdAt)
      );

    if (!isMember) {
      recommendations = recommendations.slice(0, TOP_K);
    }

    return res.status(200).json(
      recommendations.map(({ job, score, reasons }) => ({
        ...job.toObject(),
        matchScore: score,
        matchReasons: reasons,
      }))
    );
  } catch (err) {
    console.error("[recommendationController.recommendJobsForCandidate]", err);
    return res.status(500).json({ error: "An error occurred while generating recommendations" });
  }
};
