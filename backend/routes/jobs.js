// backend/routes/jobs.js
import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { createJob, getAllJobs, getMyJobs, searchJobs } from "../controllers/jobController.js";

const router = express.Router();

// Static routes must come before /:id to avoid route conflicts
router.get("/search",   verifyToken, searchJobs);                      // GET /api/jobs/search?keyword=
router.get("/mine",     verifyToken, verifyEmployer, getMyJobs);       // GET /api/jobs/mine
router.get("/",         verifyToken, getAllJobs);                       // GET /api/jobs
router.post("/",        verifyToken, verifyEmployer, createJob); // POST /api/jobs

export default router;
