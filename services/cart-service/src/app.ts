import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./logging/logger";
import { requestContext } from "./middleware/requestContext";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { healthRoutes } from "./routes/healthRoutes";
import { cartRoutes } from "./routes/cartRoutes";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));

  app.use(
    cors({
      origin: env.CORS_ORIGINS === "*" ? true : env.CORS_ORIGINS.split(",").map((s: string) => s.trim()),
      credentials: false
    })
  );

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use(
    pinoHttp({
      logger,
      customLogLevel: (res, err) => {
        if (err || (res.statusCode ?? 0) >= 500) return "error";
        if ((res.statusCode ?? 0) >= 400) return "warn";
        return "info";
      }
    })
  );

  app.use(requestContext);

  app.use("/health", healthRoutes());
  app.use("/v1/carts", cartRoutes());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
