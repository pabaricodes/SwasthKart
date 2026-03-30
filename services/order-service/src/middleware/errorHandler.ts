import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details || {} },
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid request data", details: { issues: err.issues } },
    });
    return;
  }
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error", details: {} } });
}
