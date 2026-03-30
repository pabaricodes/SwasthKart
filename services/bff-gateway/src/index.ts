import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

// ── Process-level safety nets ────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "BFF Gateway started");
});

const shutdown = () => {
  logger.info("Shutting down...");
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
