import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const result = await resetPassword(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg("Password changed successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Set New Password.
          </h2>
          <p className="mt-2.5 text-sm text-stone-500 dark:text-stone-400">
            Enter the 6-digit OTP code sent to your email and choose a new secure password.
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                6-Digit Reset Code
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 tracking-[0.4em] text-center font-bold focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all placeholder-stone-300"
                placeholder="000000"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all placeholder-stone-400"
                placeholder="•••••••• (Min 8 chars)"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-stone-750 dark:text-stone-300 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
