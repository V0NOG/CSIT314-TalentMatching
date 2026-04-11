import express from "express";
import { verifyToken, verifyEmployer } from "../middleware/auth.js";
import { createEmployerProfile, getMyEmployerProfile, updateEmployerProfile } from "../controllers/employerController.js";

const router = express.Router();

/**
 * @openapi
 * /api/employer/profile:
 *   post:
 *     summary: Create employer profile
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Employer profile created
 */
router.post("/profile", verifyToken, verifyEmployer, createEmployerProfile);

/**
 * @openapi
 * /api/employer/profile:
 *   get:
 *     summary: Get employer profile
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer profile retrieved
 */
router.get("/profile", verifyToken, verifyEmployer, getMyEmployerProfile);

/**
 * @openapi
 * /api/employer/profile:
 *   put:
 *     summary: Update employer profile
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer profile updated
 */
router.put("/profile", verifyToken, verifyEmployer, updateEmployerProfile);

export default router;