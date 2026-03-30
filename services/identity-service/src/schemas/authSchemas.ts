import { z } from "zod";

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export const updateAddressSchema = createAddressSchema;

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
