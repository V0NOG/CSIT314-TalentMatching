// backend/routes/user.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);

export default router;
