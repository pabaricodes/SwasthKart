import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { logger } from "../logging/logger";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});

prisma.$on("error" as any, (e: any) => {
  logger.error({ err: e }, "Prisma error");
});
