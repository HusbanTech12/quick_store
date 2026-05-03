"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import AuthFormInput from "@/components/auth/AuthFormInput";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const validate = (): boolean => {
    if (!email.trim()) {
      setFieldError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Enter a valid email address");
      return false;
    }
    setFieldError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/request-password-reset`, { email });
      setIsSuccess(true);
      success(
        "Email Sent!",
        "If an account exists with this email, you'll receive a password reset link."
      );
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to send reset email. Please try again.";
      showError("Request Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Check Your Email</h3>
          <p className="text-muted-foreground mb-6">
            If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail("");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <AuthFormInput
              label="Email Address"
              type="email"
              id="forgot-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={fieldError}
              autoComplete="email"
              disabled={isLoading}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="relative w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </>
      )}
    </AuthPageLayout>
  );
}
