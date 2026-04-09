// backend/routes/auth.js
import express from "express";
import { register, login, refresh, logout, logoutAll } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);
router.post("/logout",   logout);
router.post("/logout-all", verifyToken, logoutAll);

export default router;
