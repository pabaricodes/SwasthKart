import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import healthRoutes from "./routes/healthRoutes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use("/health", healthRoutes);
app.use("/v1", authRoutes);
app.use("/v1/users", profileRoutes);

// Error handling
app.use(errorHandler);

export default app;
