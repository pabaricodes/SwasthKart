import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { logger } from "../logging/logger";

export function makeHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: env.DOWNSTREAM_TIMEOUT_MS,
    headers: { "content-type": "application/json" }
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const config = error.config as (AxiosRequestConfig & { __retryCount?: number }) | undefined;
      if (!config) throw error;

      const status = error.response?.status as number | undefined;
      const shouldRetry =
        error.code === "ECONNABORTED" ||
        error.code === "ENOTFOUND" ||
        error.code === "ECONNRESET" ||
        (status !== undefined && status >= 500);

      config.__retryCount = config.__retryCount ?? 0;

      if (shouldRetry && config.__retryCount < env.DOWNSTREAM_RETRY_COUNT) {
        config.__retryCount += 1;
        const backoff = env.DOWNSTREAM_RETRY_BACKOFF_MS * config.__retryCount;
        logger.warn(
          { baseURL, path: config.url, status, retry: config.__retryCount, backoff },
          "Retrying downstream request"
        );
        await new Promise((r) => setTimeout(r, backoff));
        return client.request(config);
      }

      throw error;
    }
  );

  return client;
}
