// backend/controllers/userController.js
import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -tokenVersion");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("[userController.getMe]", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const updateMembership = async (req, res) => {
  try {
    const { membership } = req.body;
    if (typeof membership !== "boolean") {
      return res.status(400).json({ error: "membership must be a boolean" });
    }
    const updates = { membership };
    if (membership) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      updates.membershipExpiresAt = expiresAt;
    } else {
      updates.membershipExpiresAt = null;
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true })
      .select("-password -tokenVersion");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.error("[userController.updateMembership]", err);
    return res.status(500).json({ error: "An error occurred while updating membership" });
  }
};
