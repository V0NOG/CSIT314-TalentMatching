// backend/routes/user.js
import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/user/me
 * Returns current authenticated user (safe fields only).
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -tokenVersion");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
