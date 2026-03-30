import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../utils/errors";

export interface JwtPayload {
  user_id: string;
  phone_masked: string;
  role: "CUSTOMER" | "ADMIN";
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  // Internal service-to-service calls pass x-user-id header (trusted, from BFF)
  const internalUserId = req.headers["x-user-id"] as string | undefined;
  if (internalUserId) {
    req.user = {
      user_id: internalUserId,
      phone_masked: "",
      role: (req.headers["x-user-role"] as "CUSTOMER" | "ADMIN") || "CUSTOMER",
      iat: 0,
      exp: 0,
    };
    return next();
  }

  // External calls use Bearer JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new UnauthorizedError("Admin access required");
  }
  next();
}
