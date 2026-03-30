import { Request, Response } from "express";
import { sendOtpSchema, verifyOtpSchema } from "../schemas/authSchemas";
import * as otpService from "../services/otpService";
import { asyncHandler } from "../utils/asyncHandler";

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = sendOtpSchema.parse(req.body);
  const result = await otpService.sendOtp(phone);
  res.json(result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = verifyOtpSchema.parse(req.body);
  const result = await otpService.verifyOtp(phone, otp);
  res.json(result);
});
