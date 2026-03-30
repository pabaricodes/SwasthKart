import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3004),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CATALOG_SERVICE_URL: z.string().url(),
  INVENTORY_GRPC_HOST: z.string().default("localhost"),
  INVENTORY_GRPC_PORT: z.coerce.number().default(50051),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGINS: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  SERVICE_NAME: z.string().default("cart-service"),
  DOWNSTREAM_TIMEOUT_MS: z.coerce.number().default(5000),
  DOWNSTREAM_RETRY_COUNT: z.coerce.number().default(3),
  DOWNSTREAM_RETRY_BACKOFF_MS: z.coerce.number().default(200),
  INVENTORY_SERVICE_URL: z.string().default("http://localhost:3003"),
  CART_TTL_DAYS: z.coerce.number().default(7),
  MAX_LINE_ITEMS: z.coerce.number().default(50),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);
