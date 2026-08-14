import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccessMsg("Reset code sent! Redirecting to password reset screen...");
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Reset Password.
          </h2>
          <p className="mt-2.5 text-sm text-stone-500 dark:text-stone-400">
            Enter your email address and we'll send you an OTP to reset your password.
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
          <div>
            <label
              htmlFor="email-address"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all placeholder-stone-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Request Reset OTP"}
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
