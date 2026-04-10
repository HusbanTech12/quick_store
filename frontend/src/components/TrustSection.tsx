"use client";

import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CreditCard,
  Award,
} from "lucide-react";

const trustFeatures = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary shipping on all orders over $50. Fast and reliable delivery worldwide.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Your transactions are protected with enterprise-grade encryption and security.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Not satisfied? Return any item within 30 days for a full refund, no questions asked.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is here around the clock to assist you with any inquiries.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Pay with confidence using multiple payment methods including installment options.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "Every product is carefully vetted and tested to meet our premium quality standards.",
    gradient: "from-rose-500 to-red-600",
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built on Trust
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We go above and beyond to ensure your shopping experience is exceptional
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-8 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-500"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
