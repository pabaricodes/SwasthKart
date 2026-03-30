import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import crypto from "node:crypto";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Minimal HMAC-SHA256 JWT verification (avoids extra dependency).
 * Only supports HS256 tokens — sufficient for inter-service auth.
 */
function verifyJwt(token: string, secret: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new UnauthorizedError("Malformed token");

  const [headerB64, payloadB64, signatureB64] = parts;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  if (expectedSig !== signatureB64) {
    throw new UnauthorizedError("Invalid token signature");
  }

  const payload = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf-8"),
  ) as JwtPayload;

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new UnauthorizedError("Token expired");
  }

  return payload;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: verifies JWT and ensures the caller has an "admin" role.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid Authorization header");
    }

    const token = header.slice(7);
    const payload = verifyJwt(token, env.JWT_SECRET);

    if (payload.role !== "admin") {
      throw new ForbiddenError("Admin role required");
    }

    req.user = payload;
    next();
  } catch (err) {
    logger.warn({ err }, "Auth failed");
    next(err);
  }
}
