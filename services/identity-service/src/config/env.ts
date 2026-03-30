import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
  jwtExpiry: process.env.JWT_EXPIRY || "1h",
  otpExpirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS || "300", 10),
  logLevel: process.env.LOG_LEVEL || "info",
} as const;
