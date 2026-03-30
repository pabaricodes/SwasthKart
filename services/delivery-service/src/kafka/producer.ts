import { Kafka, Producer } from "kafkajs";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const kafka = new Kafka({
  clientId: "delivery-service",
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

export async function publishOrderHandedOff(payload: {
  event_id: string;
  order_id: string;
  delivery_id: string;
  delivered_at: string;
  occurred_at: string;
}): Promise<void> {
  await producer.send({
    topic: "order.handed-off",
    messages: [
      {
        key: payload.order_id,
        value: JSON.stringify(payload),
      },
    ],
  });
  logger.info({ order_id: payload.order_id, delivery_id: payload.delivery_id }, "Published OrderHandedOff event");
}
