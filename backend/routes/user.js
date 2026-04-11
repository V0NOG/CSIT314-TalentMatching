import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 */
router.get("/me", verifyToken, getMe);

export default router;