import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/errors";
import { logger } from "../logging/logger";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      requestId,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
  }

  logger.error({ err, requestId }, "Unhandled error");

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    requestId,
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected error"
    }
  });
}
