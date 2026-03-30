import { Request, Response } from "express";
import { initiatePaymentSchema, webhookSchema } from "../schemas/paymentSchemas";
import * as paymentService from "../services/paymentService";

export async function initiatePayment(req: Request, res: Response): Promise<void> {
  const input = initiatePaymentSchema.parse(req.body);
  const userId = req.headers["x-user-id"] as string;

  const result = await paymentService.initiatePayment({
    user_id: userId,
    cart_id: input.cart_id,
    address_id: input.address_id,
    amount_paise: input.amount_paise,
  });

  res.status(201).json(result);
}

export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  const { paymentId } = req.params;
  const result = await paymentService.getPaymentStatus(paymentId);
  res.json(result);
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const input = webhookSchema.parse(req.body);
  await paymentService.handleWebhook(input);
  res.json({ status: "ok" });
}
