import express from "express";
import { verifyToken, verifyCandidate } from "../middleware/auth.js";
import { createProfile, getMyProfile, updateProfile } from "../controllers/candidateController.js";

const router = express.Router();

/**
 * @openapi
 * /api/candidate/profile:
 *   post:
 *     summary: Create candidate profile
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Profile created
 */
router.post("/profile", verifyToken, verifyCandidate, createProfile);

/**
 * @openapi
 * /api/candidate/profile:
 *   get:
 *     summary: Get current candidate profile
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidate profile retrieved
 */
router.get("/profile", verifyToken, verifyCandidate, getMyProfile);

/**
 * @openapi
 * /api/candidate/profile:
 *   put:
 *     summary: Update candidate profile
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", verifyToken, verifyCandidate, updateProfile);

export default router;