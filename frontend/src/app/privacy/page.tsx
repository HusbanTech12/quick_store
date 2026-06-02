"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6">Privacy Policy</h1>
            <p className="text-lg text-zinc-500 mb-4">Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-3xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="prose prose-zinc max-w-none">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Information We Collect</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">We collect information you provide directly to us, including your name, email address, shipping address, and payment information when you make a purchase or create an account.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How We Use Your Information</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">We use your information to process orders, communicate with you about your purchases, improve our services, and send you marketing communications (with your consent).</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Information Sharing</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our website and processing transactions.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Data Security</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">We implement industry-standard security measures to protect your personal information, including SSL encryption and secure payment processing.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Your Rights</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">You have the right to access, correct, or delete your personal data at any time. Contact us at support@store.pk to exercise these rights.</p>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Contact</h2>
            <p className="text-zinc-600 leading-relaxed mb-8">If you have questions about this policy, please contact us at support@store.pk.</p>
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
