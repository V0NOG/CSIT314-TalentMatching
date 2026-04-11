import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { getAllCandidates } from "../controllers/candidatesController.js";

const router = express.Router();

/**
 * @openapi
 * /api/candidates:
 *   get:
 *     summary: Get all candidates (employer only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates
 */
router.get("/", verifyToken, verifyEmployer, getAllCandidates);

export default router;