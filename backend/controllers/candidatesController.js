// backend/controllers/candidatesController.js
import CandidateProfile from "../models/CandidateProfile.js";

/**
 * Bigram (Sørensen–Dice) similarity between two lowercase strings.
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

function candidateMatchesToken(candidate, token, fuzzy) {
  const text = [
    candidate.fullName,
    ...(candidate.skills || []),
    candidate.education?.fieldOfStudy,
    candidate.education?.degree,
    candidate.education?.institution,
    candidate.preferredWorkingMode,
    candidate.preferredLocation,
    ...(candidate.workExperience || []).flatMap((w) => [w.jobTitle, w.company, w.description]),
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
 * GET /api/candidates
 * Returns all candidate profiles, sorted by most recently updated.
 * Restricted to employer role (enforced at route level).
 */
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await CandidateProfile.find().sort({ updatedAt: -1 }).select("-__v");
    return res.status(200).json(candidates);
  } catch (err) {
    console.error("[candidatesController.getAllCandidates]", err);
    return res.status(500).json({ error: "An error occurred while fetching candidates" });
  }
};

/**
 * GET /api/candidates/search
 * Searches candidate profiles with optional keyword, filters, and fuzzy matching.
 *
 * Query params:
 *   keyword              — terms matched across name, skills, education, preferences
 *   preferredWorkingMode — filter by preferred work mode (Remote | On-site | Hybrid)
 *   preferredLocation    — filter by preferred location (case-insensitive substring)
 *   fuzzy                — "true" to enable typo-tolerant fuzzy matching
 */
export const searchCandidates = async (req, res) => {
  try {
    const { keyword, preferredWorkingMode, preferredLocation } = req.query;
    const fuzzy = req.query.fuzzy === "true" || req.query.fuzzy === "1";

    const mongoQuery = {};

    if (preferredWorkingMode && ["Remote", "On-site", "Hybrid"].includes(preferredWorkingMode)) {
      mongoQuery.preferredWorkingMode = preferredWorkingMode;
    }

    if (preferredLocation?.trim()) {
      const safe = preferredLocation.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      mongoQuery.preferredLocation = { $regex: safe, $options: "i" };
    }

    const queryTokens = keyword?.trim().toLowerCase().split(/\s+/).filter(Boolean) || [];

    if (queryTokens.length > 0 && !fuzzy) {
      mongoQuery.$and = queryTokens.map((token) => {
        const safe = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return {
          $or: [
            { fullName:                    { $regex: safe, $options: "i" } },
            { skills:                      { $regex: safe, $options: "i" } },
            { "education.fieldOfStudy":    { $regex: safe, $options: "i" } },
            { "education.degree":          { $regex: safe, $options: "i" } },
            { "education.institution":     { $regex: safe, $options: "i" } },
            { preferredWorkingMode:        { $regex: safe, $options: "i" } },
            { preferredLocation:           { $regex: safe, $options: "i" } },
            { "workExperience.jobTitle":   { $regex: safe, $options: "i" } },
            { "workExperience.company":    { $regex: safe, $options: "i" } },
          ],
        };
      });
    }

    let candidates = await CandidateProfile.find(mongoQuery).sort({ updatedAt: -1 }).select("-__v");

    if (queryTokens.length > 0 && fuzzy) {
      candidates = candidates.filter((c) =>
        queryTokens.every((token) => candidateMatchesToken(c, token, true))
      );
    }

    return res.status(200).json(candidates);
  } catch (err) {
    console.error("[candidatesController.searchCandidates]", err);
    return res.status(500).json({ error: "An error occurred while searching candidates" });
  }
};
