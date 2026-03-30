import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { publishPaymentSucceeded } from "../kafka/producer";
import { env } from "../config/env";
import { AppError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export async function initiatePayment(input: {
  user_id: string;
  cart_id: string;
  address_id: string;
  amount_paise: number;
}): Promise<{ payment_id: string; redirect_url: string }> {
  const payment = await prisma.payment.create({
    data: {
      userId: input.user_id,
      cartId: input.cart_id,
      addressId: input.address_id,
      amountPaise: input.amount_paise,
      currency: "INR",
      status: "INITIATED",
    },
  });

  const redirectUrl = `${env.BFF_BASE_URL}/mock-payment/${payment.id}`;

  logger.info({ payment_id: payment.id, cart_id: input.cart_id }, "Payment initiated");

  return { payment_id: payment.id, redirect_url: redirectUrl };
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new NotFoundError("Payment", paymentId);
  return {
    payment_id: payment.id,
    status: payment.status,
    amount_paise: payment.amountPaise,
    currency: payment.currency,
    provider_ref: payment.providerRef,
    created_at: payment.createdAt.toISOString(),
  };
}

export async function handleWebhook(input: {
  payment_id: string;
  status: "SUCCESS" | "FAILED";
  provider_ref: string;
  timestamp: string;
}): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: input.payment_id } });
  if (!payment) throw new NotFoundError("Payment", input.payment_id);

  if (payment.status !== "INITIATED") {
    throw new AppError(409, "PAYMENT_ALREADY_PROCESSED", "Payment has already been processed");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: input.payment_id },
      data: {
        status: input.status,
        providerRef: input.provider_ref,
        webhookReceivedAt: new Date(input.timestamp),
      },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: input.payment_id,
        eventType: `WEBHOOK_${input.status}`,
        payload: input as unknown as Prisma.InputJsonValue,
      },
    });
  });

  logger.info({ payment_id: input.payment_id, status: input.status }, "Webhook processed");

  if (input.status === "SUCCESS") {
    await publishPaymentSucceeded({
      event_id: randomUUID(),
      payment_id: payment.id,
      user_id: payment.userId,
      cart_id: payment.cartId,
      address_id: payment.addressId,
      amount_paise: payment.amountPaise,
      currency: payment.currency,
      provider_ref: input.provider_ref,
      occurred_at: input.timestamp,
    });
  }
}
