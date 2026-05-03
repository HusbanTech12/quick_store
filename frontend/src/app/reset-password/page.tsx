"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import AuthFormInput from "@/components/auth/AuthFormInput";
import PasswordVisibilityToggle from "@/components/auth/PasswordVisibilityToggle";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      showError("Invalid Link", "No reset token provided");
      setIsVerifying(false);
      return;
    }

    setToken(tokenParam);
    verifyToken(tokenParam);
  }, [searchParams]);

  const verifyToken = async (resetToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-token`, null, {
        params: { token: resetToken }
      });
      setIsValidToken(true);
      setUserEmail(response.data.email);
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Invalid or expired reset token";
      showError("Invalid Token", message);
      setIsValidToken(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const validate = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: password
      });

      setIsSuccess(true);
      success("Password Reset!", "Your password has been reset successfully");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to reset password. Please try again.";
      showError("Reset Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <AuthPageLayout title="Verifying..." subtitle="Please wait while we verify your reset link">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AuthPageLayout>
    );
  }

  if (!isValidToken) {
    return (
      <AuthPageLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-muted-foreground mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/forgot-password"
              className="inline-block py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Request New Link
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </AuthPageLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthPageLayout title="Success!" subtitle="Your password has been reset">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Password Reset Complete</h3>
          <p className="text-muted-foreground mb-6">
            Your password has been successfully reset. Redirecting you to login...
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Go to Login
          </Link>
        </motion.div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Reset Password"
      subtitle={userEmail ? `Reset password for ${userEmail}` : "Create a new password for your account"}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* New Password */}
        <div className="space-y-3">
          <AuthFormInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            icon={<Lock className="w-4 h-4" />}
            error={fieldErrors.password}
            autoComplete="new-password"
            disabled={isLoading}
            rightElement={
              <PasswordVisibilityToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            }
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <AuthFormInput
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
          icon={<Lock className="w-4 h-4" />}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={isLoading}
          rightElement={
            <div className="flex items-center gap-1">
              {password && confirmPassword && password === confirmPassword && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </motion.div>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </motion.div>
              )}
              <PasswordVisibilityToggle
                isVisible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
          }
        />

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className="relative w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300"
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </AuthPageLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthPageLayout title="Loading..." subtitle="Please wait">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AuthPageLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
