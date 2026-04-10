"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CategoriesSectionProps {
  categories: string[];
}

// Premium gradient backgrounds for each category
const categoryGradients = [
  "from-indigo-500 via-indigo-600 to-purple-700",
  "from-purple-500 via-purple-600 to-pink-700",
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-rose-500 via-pink-600 to-purple-700",
  "from-amber-500 via-orange-600 to-red-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
];

// Icon representations using emoji for visual appeal
const categoryIcons: Record<string, string> = {
  Electronics: "⚡",
  Clothing: "👕",
  Books: "📚",
  Home: "🏠",
  Sports: "⚽",
  Beauty: "✨",
  Toys: "🎮",
  Food: "🍕",
  default: "🛍️",
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="relative py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Browse by
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shop Categories
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find exactly what you&apos;re looking for in our curated collections
          </p>
        </motion.div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category, index) => {
              const gradient = categoryGradients[index % categoryGradients.length];
              const icon = categoryIcons[category] || categoryIcons.default;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="group relative block overflow-hidden rounded-2xl aspect-[16/10]"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                      <motion.span
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.2 }}
                        className="text-5xl mb-4"
                      >
                        {icon}
                      </motion.span>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                        {category}
                      </h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Explore Collection
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">
              No categories available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
