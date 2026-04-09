// backend/controllers/recommendationController.js
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";

const TOP_K = 10;

/**
 * scoreJob — pure function, no side effects.
 * Computes a relevance score (0–4) for a single job against a candidate profile.
 *
 * Scoring criteria (each worth 1 point):
 *   1. Major match     — candidate's fieldOfStudy appears in job description (both directions)
 *   2. Education match — partial match in either direction between candidate education
 *                        and job's requiredEducation (both directions)
 *   3. Experience match — candidate's yearsOfExperience >= job's yearsOfExperience
 *   4. Skill match     — at least one of candidate's skills (case-insensitive) matches
 *                        any of the job's requiredSkills (array vs array comparison)
 *
 * All string comparisons are case-insensitive.
 */
function scoreJob(candidate, job) {
  let score = 0;

  const field          = (candidate.education?.fieldOfStudy || "").toLowerCase().trim();
  const degree         = (candidate.education?.degree       || "").toLowerCase().trim();
  const years          = candidate.yearsOfExperience ?? 0;
  // Fallback to [fieldOfStudy] when the candidate has no skills on record
  const candidateSkills = (candidate.skills && candidate.skills.length > 0
    ? candidate.skills
    : field ? [field] : []
  ).map((s) => s.toLowerCase().trim()).filter(Boolean);

  const jobDesc   = job.description.toLowerCase();
  const jobEdu    = job.requiredEducation.toLowerCase();
  const jobSkills = job.requiredSkills.map((s) => s.toLowerCase().trim());

  // 1. Major match — one direction only: job description must contain the field of study
  if (field && jobDesc.includes(field)) {
    score += 1;
  }

  // 2. Education match — one direction only: requiredEducation must contain field or degree
  if ((field && jobEdu.includes(field)) || (degree && jobEdu.includes(degree))) {
    score += 1;
  }

  // 3. Experience match — candidate meets or exceeds required years
  if (years >= job.yearsOfExperience) {
    score += 1;
  }

  // 4. Skill match — array vs array, case-insensitive, partial overlap scores +1
  //    Uses candidate.skills array if available; no point scored if candidate has no skills.
  if (candidateSkills.length > 0) {
    const hasOverlap = candidateSkills.some((cs) =>
      jobSkills.some((js) => js.includes(cs) || cs.includes(js))
    );
    if (hasOverlap) score += 1;
  }

  return score;
}

/**
 * GET /api/recommendations/candidates/:jobId
 * Returns the top-N candidates most relevant to the given job posting.
 * Candidates with a score of 0 are excluded from results.
 * Restricted to employer role (enforced at route level).
 */
export const recommendCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Fetch the job by ID
    const job = await Job.findById(jobId).select("-__v");
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 2. Fetch all candidate profiles
    const candidates = await CandidateProfile.find().select("-__v");
    if (candidates.length === 0) {
      return res.status(200).json([]);
    }

    // 3. Score every candidate against the job using the same scoreJob function
    const scored = candidates.map((candidate) => ({
      candidate,
      score: scoreJob(candidate, job),
    }));

    // 4. Filter out zero-score candidates, sort by score descending.
    //    Most recently updated profile wins the tiebreaker among equal scores.
    const recommendations = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : new Date(b.candidate.updatedAt) - new Date(a.candidate.updatedAt)
      )
      .slice(0, TOP_K)
      .map(({ candidate, score }) => ({
        ...candidate.toObject(),
        matchScore: score,
      }));

    return res.status(200).json(recommendations);
  } catch (err) {
    console.error("[recommendationController.recommendCandidatesForJob]", err);
    return res.status(500).json({ error: "An error occurred while generating candidate recommendations" });
  }
};

/**
 * GET /api/recommendations
 * Returns the top-K jobs most relevant to the authenticated candidate.
 * Jobs with a score of 0 are excluded from results.
 * Requires a candidate profile to exist.
 */
export const recommendJobsForCandidate = async (req, res) => {
  try {
    // 1. Fetch the candidate's profile
    const candidate = await CandidateProfile.findOne({ user: req.user.id });
    if (!candidate) {
      return res.status(404).json({
        error: "Candidate profile not found. Please create your profile to receive recommendations.",
      });
    }

    // 2. Fetch all jobs
    const jobs = await Job.find().select("-__v");
    if (jobs.length === 0) {
      return res.status(200).json([]);
    }

    // 3. Score every job against the candidate profile
    const scored = jobs.map((job) => ({
      job,
      score: scoreJob(candidate, job),
    }));

    // 4. Filter out zero-score jobs, then sort by score descending.
    //    Newest job wins the tiebreaker among equal scores.
    const recommendations = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : new Date(b.job.createdAt) - new Date(a.job.createdAt)
      )
      .slice(0, TOP_K)
      .map(({ job, score }) => ({
        ...job.toObject(),
        matchScore: score,
      }));

    return res.status(200).json(recommendations);
  } catch (err) {
    console.error("[recommendationController.recommendJobsForCandidate]", err);
    return res.status(500).json({ error: "An error occurred while generating recommendations" });
  }
};
