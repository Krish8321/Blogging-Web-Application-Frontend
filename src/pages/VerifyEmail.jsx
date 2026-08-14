import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60s countdown for resend

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const result = await verifyEmail(email, otp);
    setLoading(false);

    if (result.success) {
      setSuccessMsg("Account verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMsg("");
    setSuccessMsg("");
    setResendLoading(true);

    const result = await resendOtp(email);
    setResendLoading(false);

    if (result.success) {
      setSuccessMsg("A new OTP has been sent to your email.");
      setTimer(60);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Verify Email.
          </h2>
          <p className="mt-2.5 text-sm text-stone-500 dark:text-stone-400">
            We sent a 6-digit verification code to your email. Enter it below to activate your account.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-700 dark:text-red-350 p-4 rounded text-sm transition-all">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-950/20 border-l-2 border-green-500 text-green-700 dark:text-green-300 p-4 rounded text-sm transition-all">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all placeholder-stone-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
              >
                6-Digit Verification Code
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 tracking-[0.6em] text-center text-xl font-bold focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all placeholder-stone-300"
                placeholder="000000"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={handleResend}
            disabled={timer > 0 || resendLoading}
            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resendLoading
              ? "Resending..."
              : timer > 0
              ? `Resend code in ${timer}s`
              : "Resend verification code"}
          </button>
        </div>
      </div>
    </div>
  );
}
