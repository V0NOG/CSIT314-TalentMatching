// backend/controllers/candidatesController.js
import CandidateProfile from "../models/CandidateProfile.js";

/**
 * GET /api/candidates
 * Returns all candidate profiles, sorted by most recently updated.
 * Restricted to employer role (enforced at route level).
 */
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await CandidateProfile.find()
      .sort({ updatedAt: -1 })
      .select("-__v");

    return res.status(200).json(candidates);
  } catch (err) {
    console.error("[candidatesController.getAllCandidates]", err);
    return res.status(500).json({ error: "An error occurred while fetching candidates" });
  }
};
