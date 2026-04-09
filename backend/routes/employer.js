// backend/routes/employer.js
import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { createEmployerProfile, getMyEmployerProfile } from "../controllers/employerController.js";

const router = express.Router();

// All routes require a valid token + employer role
router.post("/profile",   verifyToken, verifyEmployer, createEmployerProfile);
router.get("/profile",    verifyToken, verifyEmployer, getMyEmployerProfile);

export default router;
