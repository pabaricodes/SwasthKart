import { api } from "./client";

export function sendOtp(phone: string) {
  return api.post<{ message: string }>("/auth/otp/send", { phone });
}

export function verifyOtp(phone: string, otp: string) {
  return api.post<{ user: { id: string; phone_masked: string; name: string | null; role: string } }>(
    "/auth/otp/verify",
    { phone, otp },
  );
}

export function logout() {
  return api.post<{ message: string }>("/auth/logout");
}
