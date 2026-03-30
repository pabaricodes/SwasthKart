import { Kafka, Producer } from "kafkajs";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: env.KAFKA_BROKERS.split(","),
});

let producer: Producer;

export async function connectProducer(): Promise<void> {
  producer = kafka.producer();
  await producer.connect();
  logger.info("Kafka producer connected");
}

export async function disconnectProducer(): Promise<void> {
  if (producer) await producer.disconnect();
}

export async function publishPaymentSucceeded(payload: {
  event_id: string;
  payment_id: string;
  user_id: string;
  cart_id: string;
  address_id: string;
  amount_paise: number;
  currency: string;
  provider_ref: string;
  occurred_at: string;
}): Promise<void> {
  await producer.send({
    topic: "payment.succeeded",
    messages: [
      {
        key: payload.payment_id,
        value: JSON.stringify(payload),
      },
    ],
  });
  logger.info({ payment_id: payload.payment_id }, "Published PaymentSucceeded event");
}
