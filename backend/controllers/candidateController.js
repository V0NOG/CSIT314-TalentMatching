// backend/controllers/candidateController.js
import CandidateProfile from "../models/CandidateProfile.js";

/**
 * POST /api/candidate/profile
 * Creates a new candidate profile for the authenticated user.
 * Returns 400 if required fields are missing.
 * Returns 409 if a profile already exists.
 * Returns 201 on success.
 */
export const createProfile = async (req, res) => {
  try {
    const { fullName, phone, yearsOfExperience } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: "fullName is required" });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    if (yearsOfExperience === undefined || yearsOfExperience === null) {
      return res.status(400).json({ error: "yearsOfExperience is required" });
    }

    const existing = await CandidateProfile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(409).json({ error: "A profile already exists for this account. Use PUT to update it." });
    }

    const profile = await CandidateProfile.create({
      ...req.body,
      user: req.user.id,
    });

    return res.status(201).json(profile);
  } catch (err) {
    console.error("[candidateController.createProfile]", err);
    return res.status(500).json({ error: "An error occurred while creating the profile" });
  }
};

/**
 * GET /api/candidate/profile
 * Returns the authenticated candidate's profile.
 * Returns 404 if no profile has been created yet.
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id }).select("-__v");

    if (!profile) {
      return res.status(404).json({ error: "No profile found for this account. Use POST to create one." });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("[candidateController.getMyProfile]", err);
    return res.status(500).json({ error: "An error occurred while fetching the profile" });
  }
};

/**
 * PUT /api/candidate/profile
 * Updates the authenticated candidate's existing profile.
 * Only whitelisted fields are applied — user, _id, and any unknown fields are ignored.
 * Returns 400 if the request body is empty.
 * Returns 404 if no profile exists yet.
 * Returns 200 on success.
 */
export const updateProfile = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No fields provided. Please include at least one field to update." });
    }

    const ALLOWED_FIELDS = ["fullName", "phone", "education", "yearsOfExperience"];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided. Allowed fields: fullName, phone, education, yearsOfExperience." });
    }

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!profile) {
      return res.status(404).json({ error: "No profile found for this account. Use POST to create one first." });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("[candidateController.updateProfile]", err);
    return res.status(500).json({ error: "An error occurred while updating the profile" });
  }
};
