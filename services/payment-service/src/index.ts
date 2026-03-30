import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./db/prisma";
import { connectProducer, disconnectProducer } from "./kafka/producer";

async function main() {
  await connectProducer();
  logger.info("Kafka producer ready");

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Payment service started");
  });

  const shutdown = async () => {
    logger.info("Shutting down...");
    server.close();
    await disconnectProducer();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start payment service");
  process.exit(1);
});
