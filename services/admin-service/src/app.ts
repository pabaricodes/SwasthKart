import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";
import { router } from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(router);
app.use(errorHandler);

export { app };
