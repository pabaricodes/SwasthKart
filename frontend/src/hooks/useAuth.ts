import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  const addToast = useUiStore((s) => s.addToast);
  const navigate = useNavigate();

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authApi.verifyOtp(phone, otp),
    onSuccess: (data) => {
      setUser(data.user);
      addToast("Welcome to SwasthKart!", "success");
      navigate("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUser();
      navigate("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    sendOtp: sendOtpMutation,
    verifyOtp: verifyOtpMutation,
    logout: logoutMutation,
  };
}
