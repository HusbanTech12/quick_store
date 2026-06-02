"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LifeBuoy, ArrowRight, MessageCircle, Mail, BookOpen } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const sections = [
  {
    icon: MessageCircle,
    title: "Frequently Asked Questions",
    items: [
      { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account's Orders page." },
      { q: "How do I return an item?", a: "Visit our Returns page to initiate a return. Items must be unused and in original packaging within 30 days of delivery." },
      { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, and PayPal. All payments are processed securely through Stripe." },
    ],
  },
  {
    icon: BookOpen,
    title: "Guides",
    items: [
      { q: "How to create an account", a: "Click 'Sign In' in the top right corner and select 'Create Account'. Fill in your details to get started." },
      { q: "How to reset your password", a: "Go to the Forgot Password page, enter your email, and follow the instructions sent to your inbox." },
    ],
  },
];

const contactOptions = [
  { label: "Email Support", desc: "support@store.pk", time: "Reply within 24 hours", href: "mailto:support@store.pk" },
  { label: "Live Chat", desc: "Chat with our team", time: "Available 24/7", href: "#" },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Support</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Help Center</h1>
            <p className="text-lg text-zinc-500 max-w-lg mx-auto">Find answers to common questions and learn how to get the most out of Shop.pk.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto px-6 max-w-4xl lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <motion.div key={section.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.q} className="p-4 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors">
                      <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{item.q}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-12">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 text-center">Still Need Help?</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {contactOptions.map((opt) => (
                <a key={opt.label} href={opt.href} className="p-4 text-center border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                  <p className="text-sm font-semibold text-zinc-900">{opt.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{opt.time}</p>
                </a>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 text-center">
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                Contact Support <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
