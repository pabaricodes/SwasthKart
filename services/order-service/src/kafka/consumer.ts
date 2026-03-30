import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { createOrderFromPayment } from "../services/orderService";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: env.KAFKA_BROKERS.split(","),
});

let consumer: Consumer;

export async function connectConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: "payment.succeeded", fromBeginning: false });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, message } = payload;
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        logger.info({ topic, event_id: event.event_id }, "Received event");

        if (topic === "payment.succeeded") {
          await createOrderFromPayment(event);
        }
      } catch (err) {
        logger.error({ err, topic }, "Failed to process message");
      }
    },
  });

  logger.info("Kafka consumer connected and subscribed to payment.succeeded");
}

export async function disconnectConsumer(): Promise<void> {
  if (consumer) await consumer.disconnect();
}
