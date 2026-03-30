import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./db/prisma";

async function main() {
  const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, "Identity service started");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down...");
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start identity service");
  process.exit(1);
});
