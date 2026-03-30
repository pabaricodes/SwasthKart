import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../auth/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.sk_token;
  if (!token) throw new UnauthorizedError();

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.sk_token;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }
  next();
}
