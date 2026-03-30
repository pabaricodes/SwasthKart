import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

/**
 * Correlation id handling:
 * - If gateway/BFF provides x-request-id, we propagate it.
 * - Otherwise we generate one.
 *
 * With Datadog APM, trace_id/span_id become primary correlation fields,
 * but x-request-id is still useful as a business correlation id.
 */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  const headerId = req.header("x-request-id")?.trim();
  const requestId = headerId && headerId.length <= 128 ? headerId : nanoid();
  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
