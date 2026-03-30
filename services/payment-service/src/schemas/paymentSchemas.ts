import { z } from "zod";

export const initiatePaymentSchema = z.object({
  cart_id: z.string().uuid(),
  address_id: z.string().uuid(),
  amount_paise: z.number().int().positive(),
});

export const webhookSchema = z.object({
  payment_id: z.string().uuid(),
  status: z.enum(["SUCCESS", "FAILED"]),
  provider_ref: z.string(),
  timestamp: z.string(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
