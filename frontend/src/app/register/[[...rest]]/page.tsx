"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:shadow-md transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 right-6 z-10"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="w-9 h-9" />
          <span className="text-lg font-bold text-zinc-900">Shop.pk</span>
        </Link>
      </motion.div>

      {/* Sign Up Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white border border-zinc-200 shadow-xl shadow-zinc-900/5 rounded-xl p-0",
              headerTitle: "text-xl font-bold text-zinc-900",
              headerSubtitle: "text-sm text-zinc-500",
              socialButtonsBlockButton: "border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg",
              socialButtonsBlockButtonText: "text-sm font-medium",
              dividerLine: "bg-zinc-200",
              dividerText: "text-xs text-zinc-400",
              formFieldLabel: "text-sm font-medium text-zinc-700",
              formFieldInput: "border-zinc-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500/20",
              formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold rounded-lg shadow-lg shadow-zinc-900/20",
              footerActionLink: "text-indigo-600 hover:text-indigo-700 font-semibold",
            },
          }}
          forceRedirectUrl={redirectUrl}
          signInUrl="/login"
        />
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex items-center gap-2 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
