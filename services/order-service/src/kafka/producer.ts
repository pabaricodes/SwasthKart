import { Kafka, Producer } from "kafkajs";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const kafka = new Kafka({
  clientId: "order-service",
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

export async function publishOrderPlaced(payload: {
  event_id: string;
  order_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price_paise: number;
  }>;
  shipping_address: Record<string, unknown>;
  total_paise: number;
  occurred_at: string;
}): Promise<void> {
  await producer.send({
    topic: "order.placed",
    messages: [
      {
        key: payload.order_id,
        value: JSON.stringify(payload),
      },
    ],
  });
  logger.info({ order_id: payload.order_id }, "Published OrderPlaced event");
}
