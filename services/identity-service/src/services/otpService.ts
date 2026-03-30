import bcrypt from "bcrypt";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError, RateLimitError } from "../utils/errors";

const OTP_LENGTH = 6;
const MAX_OTP_REQUESTS_PER_10_MIN = 3;
const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskPhone(phone: string): string {
  return "****" + phone.slice(-6);
}

export async function sendOtp(phone: string): Promise<{ message: string; expires_in: number }> {
  // Rate limit: 3 OTPs per phone per 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await prisma.otpRequest.count({
    where: { phone, createdAt: { gte: tenMinAgo } },
  });

  if (recentCount >= MAX_OTP_REQUESTS_PER_10_MIN) {
    throw new RateLimitError("Too many OTP requests. Try again later.");
  }

  // In development, always use "999999" so testers don't need to read container logs
  const otp = env.nodeEnv === "development" ? "999999" : generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + env.otpExpirySeconds * 1000);

  await prisma.otpRequest.create({
    data: { phone, otpHash, expiresAt },
  });

  // Mock: log OTP to console instead of sending SMS
  logger.info({ phone: maskPhone(phone), otp }, "OTP generated (mock — logged to console)");

  return { message: "OTP sent", expires_in: env.otpExpirySeconds };
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ user_id: string; token: string; is_new_user: boolean }> {
  const otpRequest = await prisma.otpRequest.findFirst({
    where: {
      phone,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRequest) {
    throw new AppError(401, "OTP_EXPIRED", "No valid OTP found. Request a new one.");
  }

  if (otpRequest.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AppError(401, "OTP_MAX_ATTEMPTS", "Too many verification attempts.");
  }

  // Increment attempts
  await prisma.otpRequest.update({
    where: { id: otpRequest.id },
    data: { attempts: { increment: 1 } },
  });

  const isValid = await bcrypt.compare(otp, otpRequest.otpHash);
  if (!isValid) {
    throw new AppError(401, "OTP_INVALID", "Invalid OTP.");
  }

  // Find or create user
  let isNewUser = false;
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: { phone, phoneVerified: true },
    });
  } else if (!user.phoneVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });
  }

  // Generate JWT
  const jwt = await import("jsonwebtoken");
  const token = jwt.default.sign(
    {
      user_id: user.id,
      phone_masked: maskPhone(phone),
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry as import("ms").StringValue }
  );

  return { user_id: user.id, token, is_new_user: isNewUser };
}
