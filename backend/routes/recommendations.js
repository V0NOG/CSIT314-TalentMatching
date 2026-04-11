import express from "express";
import { verifyToken, verifyCandidate, verifyEmployer } from "../middleware/auth.js";
import { recommendJobsForCandidate, recommendCandidatesForJob } from "../controllers/recommendationController.js";

const router = express.Router();

/**
 * @openapi
 * /api/recommendations:
 *   get:
 *     summary: Get recommended jobs for candidate
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended jobs
 */
router.get("/", verifyToken, verifyCandidate, recommendJobsForCandidate);

/**
 * @openapi
 * /api/recommendations/candidates/{jobId}:
 *   get:
 *     summary: Get recommended candidates for a job
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommended candidates
 */
router.get("/candidates/:jobId", verifyToken, verifyEmployer, recommendCandidatesForJob);

export default router;