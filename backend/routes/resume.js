import express from "express";
import { verifyToken, verifyCandidate } from "../middleware/auth.js";
import { getMyResume, upsertResume } from "../controllers/resumeController.js";

const router = express.Router();

router.get("/", verifyToken, verifyCandidate, getMyResume);
router.put("/", verifyToken, verifyCandidate, upsertResume);

export default router;
