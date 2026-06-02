import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { getAllCandidates, searchCandidates } from "../controllers/candidatesController.js";

const router = express.Router();

/**
 * @openapi
 * /api/candidates/search:
 *   get:
 *     summary: Search candidates (employer only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: preferredWorkingMode
 *         schema:
 *           type: string
 *           enum: [Remote, On-site, Hybrid]
 *       - in: query
 *         name: preferredLocation
 *         schema:
 *           type: string
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Matching candidates
 */
router.get("/search", verifyToken, verifyEmployer, searchCandidates);

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
