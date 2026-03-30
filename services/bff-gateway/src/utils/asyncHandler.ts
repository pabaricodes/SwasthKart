import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so that rejected promises
 * are forwarded to Express error-handling middleware via next(err)
 * instead of becoming unhandled rejections that crash the process.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
