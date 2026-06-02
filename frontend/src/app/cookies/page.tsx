"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cookie, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <Cookie className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-medium text-zinc-600">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6">Cookie Policy</h1>
            <p className="text-lg text-zinc-500 mb-4">Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-3xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What Are Cookies</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">Cookies are small text files stored on your device when you visit a website. They help us provide a better browsing experience by remembering your preferences.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How We Use Cookies</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">We use cookies for essential site functions, analytics, personalization, and marketing. This includes session cookies, persistent cookies, and third-party cookies from services like Stripe and Clerk.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Types of Cookies We Use</h2>
            <ul className="space-y-3 mb-6">
              {[
                "Essential: Required for site navigation and secure checkout",
                "Analytics: Help us understand how visitors interact with our site",
                "Functional: Remember your preferences and settings",
                "Marketing: Deliver relevant advertisements (with consent)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Managing Cookies</h2>
            <p className="text-zinc-600 leading-relaxed mb-8">You can control cookies through your browser settings. Disabling certain cookies may affect site functionality.</p>
          </motion.div>

          <div className="mt-8 pt-8 border-t border-zinc-200">
            <Link href="/privacy">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                View Privacy Policy <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
