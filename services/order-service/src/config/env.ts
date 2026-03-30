import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3006),
  DATABASE_URL: z.string(),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_GROUP_ID: z.string().default("order-service"),
  INVENTORY_SERVICE_URL: z.string().default("http://localhost:3003"),
  CART_SERVICE_URL: z.string().default("http://localhost:3004"),
  IDENTITY_SERVICE_URL: z.string().default("http://localhost:3001"),
});

export const env = envSchema.parse(process.env);
