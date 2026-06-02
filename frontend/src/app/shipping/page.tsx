"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, ArrowRight, CheckCircle, Package, Clock, Shield } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const policies = [
  { icon: Package, title: "Free Shipping", desc: "On all orders over $50. No minimum required for express orders." },
  { icon: Clock, title: "Delivery Times", desc: "Standard: 3-5 business days. Express: 1-2 business days. International: 7-14 business days." },
  { icon: Shield, title: "Tracking", desc: "Real-time tracking included with every order. Get updates via email and SMS." },
  { icon: Truck, title: "Shipping Carriers", desc: "We partner with FedEx, UPS, USPS, and DHL for reliable worldwide delivery." },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Support</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Shipping Information</h1>
            <p className="text-lg text-zinc-500 max-w-lg">We make sure your orders arrive safely and on time, every time.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-4xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {policies.map((policy) => (
              <motion.div key={policy.title} variants={fadeInUp} className="p-6 border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md">
                  <policy.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">{policy.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{policy.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-12 p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Shipping Rates</h2>
            <div className="space-y-3">
              {[
                "Standard Shipping (3-5 days): $4.99 or FREE on orders $50+",
                "Express Shipping (1-2 days): $12.99",
                "International Shipping (7-14 days): $19.99",
                "Overnight Shipping: $24.99",
              ].map((rate) => (
                <div key={rate} className="flex items-start gap-2 text-sm text-zinc-600">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  {rate}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
