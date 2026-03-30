import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./db/prisma";
import { connectProducer, disconnectProducer } from "./kafka/producer";
import { connectConsumer, disconnectConsumer } from "./kafka/consumer";

async function main() {
  await connectProducer();
  await connectConsumer();
  logger.info("Kafka producer and consumer ready");

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Order service started");
  });

  const shutdown = async () => {
    logger.info("Shutting down...");
    server.close();
    await disconnectConsumer();
    await disconnectProducer();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start order service");
  process.exit(1);
});
