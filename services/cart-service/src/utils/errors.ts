import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(StatusCodes.BAD_REQUEST, "BAD_REQUEST", message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super(StatusCodes.NOT_FOUND, "NOT_FOUND", message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(StatusCodes.CONFLICT, "CONFLICT", message, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", details?: unknown) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, "UNPROCESSABLE_ENTITY", message, details);
  }
}

export class DownstreamError extends AppError {
  constructor(message = "Downstream service error", details?: unknown) {
    super(StatusCodes.BAD_GATEWAY, "DOWNSTREAM_ERROR", message, details);
  }
}

export class TooManyItemsError extends AppError {
  constructor(message = "Too many line items", details?: unknown) {
    super(StatusCodes.BAD_REQUEST, "TOO_MANY_ITEMS", message, details);
  }
}
