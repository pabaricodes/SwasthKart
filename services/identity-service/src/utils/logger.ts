import pino from "pino";
import { env } from "../config/env";

function hasPinoPretty(): boolean {
  try { require.resolve("pino-pretty"); return true; } catch { return false; }
}

export const logger = pino({
  level: env.logLevel,
  transport:
    env.nodeEnv === "development" && hasPinoPretty()
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
