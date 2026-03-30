import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

function main() {
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Admin service started");
  });

  const shutdown = () => {
    logger.info("Shutting down...");
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
