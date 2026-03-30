import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string().default("1h"),
  IDENTITY_SERVICE_URL: z.string().default("http://localhost:3001"),
  CATALOG_SERVICE_URL: z.string().default("http://localhost:3002"),
  INVENTORY_SERVICE_URL: z.string().default("http://localhost:3003"),
  CART_SERVICE_URL: z.string().default("http://localhost:3004"),
  PAYMENT_SERVICE_URL: z.string().default("http://localhost:3005"),
  ORDER_SERVICE_URL: z.string().default("http://localhost:3006"),
  DELIVERY_SERVICE_URL: z.string().default("http://localhost:3007"),
  ADMIN_SERVICE_URL: z.string().default("http://localhost:3008"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
