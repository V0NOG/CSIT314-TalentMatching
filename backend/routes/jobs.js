import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { createJob, getAllJobs, getMyJobs, searchJobs } from "../controllers/jobController.js";

const router = express.Router();

/**
 * @openapi
 * /api/jobs/search:
 *   get:
 *     summary: Search jobs by keyword
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", verifyToken, searchJobs);

/**
 * @openapi
 * /api/jobs/mine:
 *   get:
 *     summary: Get jobs created by current employer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer job listings
 */
router.get("/mine", verifyToken, verifyEmployer, getMyJobs);

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/", verifyToken, getAllJobs);

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Create a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Job created
 */
router.post("/", verifyToken, verifyEmployer, createJob);

export default router;