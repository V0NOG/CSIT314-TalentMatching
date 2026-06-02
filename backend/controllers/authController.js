// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_TTL,
  REFRESH_TTL,
  ensureSecrets,
  COOKIE_OPTS,
} from "../config/jwt.js";

// ---------- Validation schemas ----------
const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  email:     z.string().email("Invalid email"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
  role:      z.enum(["candidate", "employer"], {
    errorMap: () => ({ message: "Role must be candidate or employer" }),
  }),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ---------- JWT helpers ----------
const signAccess  = (payload) => jwt.sign(payload, ACCESS_SECRET(),  { expiresIn: ACCESS_TTL });
const signRefresh = (payload) => jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_TTL });

const setAuthCookies = (res, accessToken, refreshToken) => {
  const base = COOKIE_OPTS();
  res.cookie("accessToken",  accessToken,  { ...base, maxAge: 1000 * 60 * 55 });
  res.cookie("refreshToken", refreshToken, { ...base, maxAge: 1000 * 60 * 60 * 24 * 7 });
};

const clearAuthCookies = (res) => {
  const base = COOKIE_OPTS();
  res.clearCookie("accessToken",  base);
  res.clearCookie("refreshToken", base);
};

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken:  signAccess(payload),
    refreshToken: signRefresh({ ...payload, ver: user.tokenVersion }),
  };
}

function safeUser(user) {
  return {
    id:         user._id,
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    role:       user.role,
    membership: user.membership ?? false,
    membershipExpiresAt: user.membershipExpiresAt || null,
    createdAt:  user.createdAt,
  };
}

// ---------- Controllers ----------

export const register = async (req, res) => {
  try {
    ensureSecrets();

    const data = RegisterSchema.parse(req.body);
    const email = data.email.toLowerCase();

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({ ...data, email, password: hashedPassword });

    const { accessToken, refreshToken } = issueTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: "Account created successfully",
      token: accessToken,
      user: safeUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(", ") });
    }
    if (err?.code === "NO_JWT_SECRET") {
      return res.status(500).json({ error: err.message });
    }
    console.error("[register] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    ensureSecrets();

    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid email or password" });

    const { accessToken, refreshToken } = issueTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      message: "Logged in successfully",
      token: accessToken,
      user: safeUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(", ") });
    }
    if (err?.code === "NO_JWT_SECRET") {
      return res.status(500).json({ error: err.message });
    }
    console.error("[login] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    ensureSecrets();

    const token = req.cookies?.refreshToken ||
      (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) return res.status(401).json({ error: "No refresh token" });

    const payload = jwt.verify(token, REFRESH_SECRET());
    const user = await User.findById(payload.sub).select("_id role tokenVersion");
    if (!user) return res.status(401).json({ error: "User not found" });

    if (payload.ver !== user.tokenVersion) {
      return res.status(401).json({ error: "Refresh token has been invalidated" });
    }

    const { accessToken, refreshToken } = issueTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({ message: "Token refreshed", token: accessToken });
  } catch (err) {
    console.warn("[refresh] error:", err?.message);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = (_req, res) => {
  clearAuthCookies(res);
  return res.json({ message: "Logged out" });
};

export const logoutAll = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true }
  ).select("_id");

  if (!user) return res.status(404).json({ error: "User not found" });

  clearAuthCookies(res);
  return res.json({ message: "Logged out of all devices" });
};
