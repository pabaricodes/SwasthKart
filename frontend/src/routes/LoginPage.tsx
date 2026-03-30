import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    sendOtp.mutate(phone, {
      onSuccess: () => setOtpSent(true),
    });
  };

  const handleVerify = () => {
    verifyOtp.mutate({ phone, otp });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Login to SwasthKart</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your phone number to continue</p>

          {!otpSent ? (
            <div className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                error={sendOtp.isError ? "Failed to send OTP. Try again." : undefined}
              />
              <Button
                className="w-full"
                disabled={phone.length !== 10}
                loading={sendOtp.isPending}
                onClick={handleSendOtp}
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                OTP sent to <span className="font-medium">{phone}</span>
                <button
                  className="text-primary-600 ml-2 text-sm hover:underline"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                >
                  Change
                </button>
              </p>
              <Input
                label="Enter OTP"
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                error={verifyOtp.isError ? "Invalid OTP. Please try again." : undefined}
              />
              <Button
                className="w-full"
                disabled={otp.length !== 6}
                loading={verifyOtp.isPending}
                onClick={handleVerify}
              >
                Verify & Login
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Check your console for the OTP (mock SMS)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
