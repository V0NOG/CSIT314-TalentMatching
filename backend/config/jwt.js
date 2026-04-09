// backend/config/jwt.js
// Single source of truth for all JWT and cookie configuration.
import "dotenv/config";

export const ACCESS_SECRET  = () => (process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET || "").trim();
export const REFRESH_SECRET = () => (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "").trim();
export const ACCESS_TTL     = process.env.ACCESS_TOKEN_TTL  || "55m";
export const REFRESH_TTL    = process.env.REFRESH_TOKEN_TTL || "7d";

export function ensureSecrets() {
  if (!ACCESS_SECRET() || !REFRESH_SECRET()) {
    throw Object.assign(
      new Error("Server misconfiguration: JWT secret(s) missing"),
      { code: "NO_JWT_SECRET" }
    );
  }
}

/**
 * Cookie options for auth tokens.
 * domain is only set when COOKIE_DOMAIN is explicitly configured
 * and is not "localhost" — browsers reject explicit localhost domains.
 */
export const COOKIE_OPTS = () => {
  const opts = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
  };
  const domain = (process.env.COOKIE_DOMAIN || "").trim();
  if (domain && domain !== "localhost") {
    opts.domain = domain;
  }
  return opts;
};
