import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3007),
  DATABASE_URL: z.string(),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_GROUP_ID: z.string().default("delivery-service"),
});

export const env = envSchema.parse(process.env);
