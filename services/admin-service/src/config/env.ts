import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3010),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  JWT_SECRET: z.string().default("dev-secret-change-me"),

  CATALOG_SERVICE_URL: z.string().default("http://localhost:3002"),
  INVENTORY_SERVICE_URL: z.string().default("http://localhost:3003"),
  ORDER_SERVICE_URL: z.string().default("http://localhost:3006"),
  DELIVERY_SERVICE_URL: z.string().default("http://localhost:3007"),
});

export const env = envSchema.parse(process.env);
