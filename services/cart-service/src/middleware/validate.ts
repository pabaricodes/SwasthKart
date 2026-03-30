import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/errors";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    });

    if (!parsed.success) {
      return next(new BadRequestError("Validation failed", parsed.error.flatten()));
    }

    (req as any).validated = parsed.data;
    next();
  };
}
