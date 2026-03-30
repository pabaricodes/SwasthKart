import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { healthRoutes } from "./routes/healthRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { mockPaymentRouter } from "./mock-provider/mockPaymentPage";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/health", healthRoutes);
app.use("/v1", paymentRoutes);
app.use("/mock-payment", mockPaymentRouter);

app.use(errorHandler);

export { app };
