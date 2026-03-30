import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { env } from "./config/env";
import { healthRoutes } from "./routes/healthRoutes";
import { authRoutes } from "./routes/authRoutes";
import { uiRoutes } from "./routes/uiRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Health
app.use("/health", healthRoutes);

// Auth (no JWT required)
app.use("/api/v1/auth", authRoutes);

// UI endpoints (mix of public + authenticated)
app.use("/api/v1/ui", uiRoutes);

// Admin endpoints (all require admin role)
app.use("/api/v1/admin", adminRoutes);

app.use(errorHandler);

export { app };
