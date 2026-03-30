import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"]),
  notes: z.string().optional(),
});
