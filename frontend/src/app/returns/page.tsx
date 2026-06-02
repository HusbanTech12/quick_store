"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, ArrowRight, CheckCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const steps = [
  { title: "Initiate Return", desc: "Log into your account and select the order you wish to return. Fill out the return request form." },
  { title: "Pack Your Item", desc: "Pack the item securely in its original packaging with all tags and accessories included." },
  { title: "Ship It Back", desc: "Print the prepaid return label and drop off the package at any authorized shipping location." },
  { title: "Get Refunded", desc: "Once we receive and inspect your return, we'll process your refund within 5-7 business days." },
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Support</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Returns & Refunds</h1>
            <p className="text-lg text-zinc-500 max-w-lg">Hassle-free returns within 30 days of delivery. We make it easy.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-4xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Return Policy</h2>
            <div className="p-6 border border-zinc-200 rounded-xl bg-zinc-50">
              <ul className="space-y-3">
                {[
                  "30-day return window from delivery date",
                  "Items must be unused and in original packaging",
                  "Free returns on defective or incorrect items",
                  "Refunds processed within 5-7 business days",
                  "Original shipping costs are non-refundable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">How to Return</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div key={step.title} variants={fadeInUp} className="p-5 border border-zinc-200 rounded-xl hover:border-indigo-200 transition-all">
                  <div className="flex items-center justify-center w-8 h-8 mb-3 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 text-center">
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                Need Help? Contact Us <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
