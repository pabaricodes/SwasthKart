import pino from "pino";
import { env } from "../config/env";

function hasPinoPretty(): boolean {
  try { require.resolve("pino-pretty"); return true; } catch { return false; }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development" && hasPinoPretty()
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
