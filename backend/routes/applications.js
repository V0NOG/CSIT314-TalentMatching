import express from "express";
import { verifyToken, verifyCandidate, verifyEmployer } from "../middleware/auth.js";
import {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationCounts,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/",                     verifyToken, verifyCandidate, applyForJob);
router.get("/mine",                  verifyToken, verifyCandidate, getMyApplications);
router.get("/counts",                verifyToken, verifyEmployer,  getApplicationCounts);
router.get("/job/:jobId",            verifyToken, verifyEmployer,  getApplicationsForJob);
router.put("/:id/status",            verifyToken, verifyEmployer,  updateApplicationStatus);

export default router;
