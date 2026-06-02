"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const posts = [
  { title: "5 Tips for a Better Shopping Experience", date: "May 28, 2026", excerpt: "Discover how to make the most of your Shop.pk experience with these expert tips." },
  { title: "Behind the Scenes: How We Curate Products", date: "May 15, 2026", excerpt: "Learn about our rigorous product selection process and what makes the cut." },
  { title: "The Future of E-Commerce", date: "May 1, 2026", excerpt: "Exploring the trends shaping online shopping in 2026 and beyond." },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-zinc-600">Blog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Shop.pk Blog</h1>
            <p className="text-lg text-zinc-500 max-w-lg mx-auto">Insights, stories, and updates from our team.</p>
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <motion.div key={post.title} variants={fadeInUp} className="p-6 border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-lg transition-all group">
                <p className="text-xs text-zinc-400 mb-2">{post.date}</p>
                <h3 className="text-base font-semibold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:gap-1.5 transition-all">
                  Read More <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
