import { z } from "zod";

export const listOrdersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminListOrdersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"]),
});
