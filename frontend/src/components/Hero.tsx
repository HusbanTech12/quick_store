"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Play, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-white" />
      
      {/* Decorative Grid */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Floating Gradient Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="mx-auto px-6 max-w-7xl lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left - Text Content */}
            <div className="max-w-xl">
              {/* Announcement Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-zinc-600">New arrivals just dropped</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05] mb-6"
              >
                Shop the
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  future of style
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg leading-relaxed text-zinc-500 mb-8 max-w-md"
              >
                Curated collections of premium products. Quality craftsmanship meets modern design in every piece.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Link href="/products">
                  <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:shadow-zinc-900/25 hover:-translate-y-0.5 w-full sm:w-auto">
                    Shop Collection
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 w-full sm:w-auto">
                  <Play className="w-4 h-4 fill-zinc-700" />
                  Watch Lookbook
                </button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-4 pt-6 border-t border-zinc-100"
              >
                <div className="flex -space-x-2">
                  {[
                    "from-indigo-400 to-violet-400",
                    "from-purple-400 to-pink-400",
                    "from-cyan-400 to-blue-400",
                    "from-amber-400 to-orange-400",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-white flex items-center justify-center`}
                    >
                      <span className="text-[10px] font-bold text-white">
                        {["S", "M", "E", "J"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">4.9/5</span> from 2,000+ reviews
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Image Container */}
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-2xl opacity-60" />
                
                {/* Main Image */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-900/10">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Premium Fashion Collection"
                    className="w-full h-[580px] object-cover"
                  />
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
                </div>

                {/* Floating Card - Top Right */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-4 -right-4 px-4 py-3 rounded-xl bg-white border border-zinc-200 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">Premium Quality</p>
                      <p className="text-[10px] text-zinc-500">Handcrafted materials</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card - Bottom Left */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-white border border-zinc-200 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-zinc-900">10K+</p>
                      <p className="text-[10px] text-zinc-500">Happy customers</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-zinc-900">500+</p>
                      <p className="text-[10px] text-zinc-500">Products</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
