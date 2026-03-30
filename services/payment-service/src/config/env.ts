import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3005),
  DATABASE_URL: z.string().min(1),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  BFF_BASE_URL: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);
