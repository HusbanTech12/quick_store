"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw } from "lucide-react";
import Button from "./Button";

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden" aria-label="Welcome section">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-hover to-accent">
        {/* Animated Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-slide-in-down">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">New Collection 2026</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-in-up leading-tight">
            Discover Premium
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
              Products Today
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
            Explore our curated collection of high-quality items designed for the modern lifestyle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: "0.4s" }}>
            <Link href="/products">
              <Button variant="primary" size="xl" className="bg-white text-brand hover:bg-gray-100 shadow-xl hover:shadow-2xl">
                <span className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>
            <Link href="/products?featured=true">
              <Button variant="ghost" size="xl" className="border-white text-white hover:bg-white/20 hover:border-white">
                View Featured
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-sm">Free Shipping</p>
              <p className="text-xs opacity-80">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-sm">Secure Checkout</p>
              <p className="text-xs opacity-80">SSL encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-sm">Easy Returns</p>
              <p className="text-xs opacity-80">30-day policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
