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
