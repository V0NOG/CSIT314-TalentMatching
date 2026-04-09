// backend/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * verifyToken — extracts and validates the access JWT.
 * Accepts token from:
 *   - Authorization: Bearer <token>
 *   - cookies.accessToken (httpOnly cookie)
 * Sets req.user = { id, role, raw }
 */
export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  let token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "").trim();
  if (!ACCESS_SECRET) {
    console.error("[auth] Missing JWT_ACCESS_SECRET");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = {
      id:   payload.sub || payload.id,
      role: payload.role,
      raw:  payload,
    };
    if (!req.user.id) {
      return res.status(403).json({ message: "Invalid token payload." });
    }
    return next();
  } catch (error) {
    console.warn("[auth] verify failed:", error?.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

/**
 * verifyRole(...roles) — middleware factory.
 * Usage: router.get("/path", verifyToken, verifyRole("employer"), handler)
 */
export const verifyRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  return res.status(403).json({ message: `Access restricted to: ${roles.join(", ")}` });
};

// Convenience shorthands
export const verifyCandidate = verifyRole("candidate");
export const verifyEmployer  = verifyRole("employer");
