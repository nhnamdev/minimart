import jwt from "jsonwebtoken";

import { config } from "./config.mjs";

const COOKIE_NAME = "minimart_admin";

export function createSession(admin) {
  return jwt.sign(
    { sub: String(admin.id), username: admin.username, role: "admin" },
    config.jwtSecret,
    { algorithm: "HS256", expiresIn: "8h", issuer: "minimart-api" },
  );
}
export function setSessionCookie(response, token) {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(response) {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    path: "/",
  });
}

export function requireAdmin(request, response, next) {
  const token = request.cookies?.[COOKIE_NAME];
  if (!token) return response.status(401).json({ error: "AUTH_REQUIRED" });

  try {
    request.admin = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "minimart-api",
    });
    return next();
  } catch {
    clearSessionCookie(response);
    return response.status(401).json({ error: "AUTH_REQUIRED" });
  }
}
