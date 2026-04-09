// backend/controllers/employerController.js
import EmployerProfile from "../models/EmployerProfile.js";

const ALLOWED_FIELDS = ["companyName", "industry", "location", "description"];

/**
 * POST /api/employer/profile
 * Creates a new employer profile for the authenticated user.
 * Returns 400 if companyName is missing.
 * Returns 409 if a profile already exists.
 * Returns 201 on success.
 */
export const createEmployerProfile = async (req, res) => {
  try {
    const companyName = req.body.companyName?.trim();

    if (!companyName) {
      return res.status(400).json({ error: "companyName is required" });
    }

    const existing = await EmployerProfile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(409).json({ error: "An employer profile already exists for this account. Only one profile is allowed per employer. Use PUT to update your existing profile." });
    }

    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }
    data.companyName = companyName; // use the already-trimmed value

    const profile = await EmployerProfile.create({
      ...data,
      user: req.user.id,
    });

    return res.status(201).json(profile);
  } catch (err) {
    console.error("[employerController.createEmployerProfile]", err);
    return res.status(500).json({ error: "An error occurred while creating the employer profile" });
  }
};

/**
 * PUT /api/employer/profile
 * Updates the authenticated employer's existing profile.
 * Only whitelisted fields are applied.
 * Returns 400 if no valid fields provided.
 * Returns 404 if no profile exists yet.
 * Returns 200 on success.
 */
export const updateEmployerProfile = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No fields provided. Please include at least one field to update." });
    }

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided. Allowed fields: companyName, industry, location, description." });
    }

    if (updates.companyName !== undefined) {
      updates.companyName = String(updates.companyName).trim();
      if (!updates.companyName) {
        return res.status(400).json({ error: "companyName cannot be empty" });
      }
    }

    const profile = await EmployerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!profile) {
      return res.status(404).json({ error: "No profile found for this account. Use POST to create one first." });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("[employerController.updateEmployerProfile]", err);
    return res.status(500).json({ error: "An error occurred while updating the employer profile" });
  }
};

/**
 * GET /api/employer/profile
 * Returns the authenticated employer's profile.
 * Returns 404 if no profile has been created yet.
 */
export const getMyEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ user: req.user.id }).select("-__v");

    if (!profile) {
      return res.status(404).json({ error: "No profile found for this account. Use POST to create one." });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("[employerController.getMyEmployerProfile]", err);
    return res.status(500).json({ error: "An error occurred while fetching the employer profile" });
  }
};
