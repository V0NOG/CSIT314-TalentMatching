// backend/routes/recommendations.js
import express from "express";
import { verifyToken, verifyCandidate, verifyEmployer } from "../middleware/auth.js";
import { recommendJobsForCandidate, recommendCandidatesForJob } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/",                    verifyToken, verifyCandidate, recommendJobsForCandidate);     // GET /api/recommendations
router.get("/candidates/:jobId",   verifyToken, verifyEmployer,  recommendCandidatesForJob);     // GET /api/recommendations/candidates/:jobId

export default router;
