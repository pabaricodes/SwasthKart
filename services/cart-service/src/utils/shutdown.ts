import { Server } from "http";
import { logger } from "../logging/logger";
import { prisma } from "../db/prisma";

export function installGracefulShutdown(server: Server) {
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");

    server.close(async (err) => {
      if (err) logger.error({ err }, "Error closing server");
      try {
        await prisma.$disconnect();
      } catch (e) {
        logger.error({ err: e }, "Error disconnecting Prisma");
      } finally {
        process.exit(err ? 1 : 0);
      }
    });

    setTimeout(() => {
      logger.error("Force exiting after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
