"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import AuthFormInput from "@/components/auth/AuthFormInput";
import PasswordVisibilityToggle from "@/components/auth/PasswordVisibilityToggle";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import AuthPageLayout from "@/components/auth/AuthPageLayout";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const passwordsMatch = confirmPassword === password && confirmPassword.length > 0;
  const passwordsMismatch = confirmPassword.length > 0 && !passwordsMatch;

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Full name is required";
    else if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";

    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";

    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";

    if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!validate()) return;
    const success = await register({ email, name, password });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <AuthPageLayout
      title="Create account"
      subtitle="Join thousands of shoppers with a premium experience"
    >
      {/* Success State */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl"
            role="status"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Account created successfully! Redirecting you...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error */}
      <AnimatePresence>
        {error && !isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Full Name */}
        <AuthFormInput
          label="Full Name"
          type="text"
          id="register-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          error={touched.name ? fieldErrors.name : undefined}
          autoComplete="name"
          disabled={isLoading || isSuccess}
        />

        {/* Email */}
        <AuthFormInput
          label="Email Address"
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={touched.email ? fieldErrors.email : undefined}
          autoComplete="email"
          disabled={isLoading || isSuccess}
        />

        {/* Password */}
        <div className="space-y-3">
          <AuthFormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder="Create a strong password"
            icon={<Lock className="w-4 h-4" />}
            error={touched.password ? fieldErrors.password : undefined}
            autoComplete="new-password"
            disabled={isLoading || isSuccess}
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
          id="register-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          placeholder="Re-enter your password"
          icon={<Lock className="w-4 h-4" />}
          error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
          autoComplete="new-password"
          disabled={isLoading || isSuccess}
          rightElement={
            <div className="flex items-center gap-1">
              {passwordsMatch && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </motion.div>
              )}
              {passwordsMismatch && (
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

        {/* Terms */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || isSuccess}
          whileHover={{ scale: isLoading || isSuccess ? 1 : 1.01 }}
          whileTap={{ scale: isLoading || isSuccess ? 1 : 0.99 }}
          className="relative w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          <span className={`flex items-center justify-center gap-2 ${isLoading || isSuccess ? "opacity-0" : ""}`}>
            Create Account
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          {(isLoading || isSuccess) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500">
            or sign up with
          </span>
        </div>
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isLoading || isSuccess}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          disabled={isLoading || isSuccess}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </button>
      </div>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Sign in instead
        </Link>
      </p>
    </AuthPageLayout>
  );
}
