import pino from "pino";

function hasPinoPretty(): boolean {
  try { require.resolve("pino-pretty"); return true; } catch { return false; }
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && hasPinoPretty() && {
    transport: { target: "pino-pretty" },
  }),
});
