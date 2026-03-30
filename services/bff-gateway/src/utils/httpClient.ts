import axios, { AxiosError } from "axios";
import { AppError } from "./errors";
import { logger } from "./logger";

/**
 * Wraps downstream service calls — maps upstream errors to standard envelope.
 */
export async function serviceCall<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  options?: { data?: unknown; headers?: Record<string, string>; params?: Record<string, unknown> },
): Promise<T> {
  try {
    const response = await axios({
      method,
      url,
      data: options?.data,
      headers: options?.headers,
      params: options?.params,
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const { status, data } = err.response;
      const errorData = data?.error || {};
      logger.warn({ url, status, errorCode: errorData.code }, "Downstream service error");
      throw new AppError(
        status,
        errorData.code || "UPSTREAM_ERROR",
        errorData.message || "Upstream service error",
        errorData.details,
      );
    }
    logger.error({ err, url }, "Downstream service unreachable");
    throw new AppError(502, "SERVICE_UNAVAILABLE", "Downstream service unavailable");
  }
}
