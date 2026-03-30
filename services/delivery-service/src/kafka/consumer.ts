import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { createDeliveryFromOrder } from "../services/deliveryService";

const kafka = new Kafka({
  clientId: "delivery-service",
  brokers: env.KAFKA_BROKERS.split(","),
});

let consumer: Consumer;

export async function connectConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: "order.placed", fromBeginning: false });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, message } = payload;
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        logger.info({ topic, event_id: event.event_id }, "Received event");

        if (topic === "order.placed") {
          await createDeliveryFromOrder(event);
        }
      } catch (err) {
        logger.error({ err, topic }, "Failed to process message");
      }
    },
  });

  logger.info("Kafka consumer connected and subscribed to order.placed");
}

export async function disconnectConsumer(): Promise<void> {
  if (consumer) await consumer.disconnect();
}
