import { createServer } from "http";
import { env } from "./config/env";
import { buildApp } from "./app";
import { logger } from "./logging/logger";
import { installGracefulShutdown } from "./utils/shutdown";
import { prisma } from "./db/prisma";

async function main() {
  await prisma.$queryRaw`SELECT 1`;

  const app = buildApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "Cart service started");
  });

  installGracefulShutdown(server);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
