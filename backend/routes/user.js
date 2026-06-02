import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMe, updateMembership } from "../controllers/userController.js";

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

/**
 * @openapi
 * /api/user/membership:
 *   put:
 *     summary: Update membership status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Membership updated
 */
router.put("/membership", verifyToken, updateMembership);

export default router;
