import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  user_id: string;
  phone_masked: string;
  role: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function setAuthCookie(res: import("express").Response, token: string): void {
  res.cookie("sk_token", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN,
    maxAge: 60 * 60 * 1000, // 1 hour
    path: "/",
  });
}

export function clearAuthCookie(res: import("express").Response): void {
  res.clearCookie("sk_token", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN,
    path: "/",
  });
}
