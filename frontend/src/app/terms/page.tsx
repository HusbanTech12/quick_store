"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <Scale className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-medium text-zinc-600">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6">Terms of Service</h1>
            <p className="text-lg text-zinc-500 mb-4">Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-3xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Acceptance of Terms</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">By accessing and using Shop.pk, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Account Registration</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Orders and Payments</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">All orders are subject to availability and acceptance. We reserve the right to cancel any order. Prices are subject to change without notice.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Shipping and Delivery</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">Estimated delivery times are provided for reference. We are not liable for delays caused by shipping carriers or circumstances beyond our control.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Returns and Refunds</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">Our 30-day return policy applies to unused items in original condition. Refunds are processed within 5-7 business days after we receive the returned item.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Limitation of Liability</h2>
            <p className="text-zinc-600 leading-relaxed mb-8">Shop.pk shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
          </motion.div>

          <div className="mt-8 pt-8 border-t border-zinc-200">
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                Contact Us <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
