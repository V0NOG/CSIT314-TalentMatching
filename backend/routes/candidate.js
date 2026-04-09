// backend/routes/candidate.js
import express from "express";
import { verifyToken, verifyCandidate } from "../middleware/auth.js";
import { createProfile, getMyProfile, updateProfile } from "../controllers/candidateController.js";

const router = express.Router();

// All routes require a valid token + candidate role
router.post("/profile",   verifyToken, verifyCandidate, createProfile);
router.get("/profile",    verifyToken, verifyCandidate, getMyProfile);
router.put("/profile",    verifyToken, verifyCandidate, updateProfile);

export default router;
