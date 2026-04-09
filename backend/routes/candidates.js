// backend/routes/candidates.js
import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { getAllCandidates } from "../controllers/candidatesController.js";

const router = express.Router();

router.get("/", verifyToken, verifyEmployer, getAllCandidates); // GET /api/candidates

export default router;
