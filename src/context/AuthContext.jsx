import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../hooks/useApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on load / refresh page
  const checkAuth = async () => {
    try {
      const response = await api.get("/users/me");
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      // It's fine to fail on startup if no cookie / token is set yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check local storage for accessToken first. If not present, check if we can refresh
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await checkAuth();
      } else {
        // Try to trigger silent refresh by calling /users/me which will fire interceptor if refresh token is in cookie
        try {
          const response = await api.post("/auth/refresh-token", {});
          if (response.data?.success && response.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
            await checkAuth();
          } else {
            setUser(null);
            setLoading(false);
          }
        } catch (err) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen to token expired events from axios interceptors
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem("accessToken");
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data?.success && response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        // Fetch full profile immediately
        const profileResponse = await api.get("/users/me");
        setUser(profileResponse.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data?.message || "Login failed" };
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid email or password";
      return { success: false, message: typeof msg === "object" ? Object.values(msg).join(", ") : msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, username, displayName) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        username,
        displayName,
      });
      return { success: true, message: response.data?.message || "Verification email sent" };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Registration failed";
      return { success: false, message: typeof msg === "object" ? Object.values(msg).join(", ") : msg };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify", { email, otp });
      return { success: true, message: response.data?.message || "Verified successfully" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Verification failed" };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return { success: true, message: response.data?.message || "OTP resent" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Resend failed" };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout request failed on server", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, message: response.data?.message || "Reset OTP sent" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Request failed" };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return { success: true, message: response.data?.message || "Password reset successfully" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Reset failed" };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch("/users/me", profileData);
      if (response.data?.success) {
        // Refetch user profile to update state
        const profileResponse = await api.get("/users/me");
        setUser(profileResponse.data.user);
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: "Failed to update profile" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Update failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        refreshProfile: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
