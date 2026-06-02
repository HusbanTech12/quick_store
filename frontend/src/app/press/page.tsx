"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const articles = [
  { title: "Shop.pk Launches New Premium Collection", date: "May 2026", desc: "We're excited to announce our latest curated collection featuring top-tier brands." },
  { title: "Expanding Global Reach", date: "April 2026", desc: "Shop.pk now ships to over 50 countries with improved logistics and tracking." },
  { title: "Sustainability Initiative", date: "March 2026", desc: "Our commitment to eco-friendly packaging and carbon-neutral shipping." },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Press</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Press Room</h1>
            <p className="text-lg text-zinc-500 max-w-lg">Latest news, announcements, and media resources from Shop.pk.</p>
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
            className="space-y-6"
          >
            {articles.map((article) => (
              <motion.div key={article.title} variants={fadeInUp} className="p-6 border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                <p className="text-xs font-medium text-indigo-600 mb-1.5">{article.date}</p>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{article.title}</h3>
                <p className="text-sm text-zinc-500">{article.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-10 text-center">
            <p className="text-sm text-zinc-500 mb-4">For press inquiries, please contact our team.</p>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                Contact Press Team <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
