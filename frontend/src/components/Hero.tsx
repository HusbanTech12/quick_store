"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Hero slider images from Unsplash
const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
    title: "Discover Premium",
    subtitle: "Products Today",
    badge: "✨ New Premium Collection 2026",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
    title: "Explore Fashion",
    subtitle: "Trending Styles",
    badge: "🔥 Summer Collection 2026",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
    title: "Shop Electronics",
    subtitle: "Latest Technology",
    badge: "💡 New Arrivals",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
    title: "Home & Living",
    subtitle: "Transform Your Space",
    badge: "🏠 Premium Home Decor",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center overflow-hidden" aria-label="Welcome section">
      {/* Hero Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${heroSlides[currentSlide].image}')`
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Overlay (60%) */}
        <div className="absolute inset-0 bg-gray-950/60" />

        {/* Subtle Animated Blobs */}
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-brand/15 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* Subtle Floating Particles */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.4, 0.7, 0.4],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-white/30 rounded-full"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3 w-2 h-2 bg-brand/50 rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            opacity: [0.5, 0.8, 0.5],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
        />

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* Slider Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Slider Dot Indicators */}
      <div className="absolute bottom-24 lg:bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-10 h-3 bg-white shadow-lg shadow-white/50"
                : "w-3 h-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={currentSlide}
      >
        <div className="max-w-5xl mx-auto text-center text-white">
          {/* Premium Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/30 shadow-lg"
            variants={itemVariants}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">{heroSlides[currentSlide].badge}</span>
          </motion.div>

          {/* Main Heading with Premium Styling */}
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight"
            variants={itemVariants}
          >
            {heroSlides[currentSlide].title}
            <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/90">
                {heroSlides[currentSlide].subtitle}
              </span>
              {/* Underline Effect */}
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl mb-14 max-w-2xl mx-auto opacity-95 leading-relaxed"
            variants={itemVariants}
          >
            Explore our curated collection of high-quality items designed for the modern lifestyle.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
            variants={itemVariants}
          >
            <Link href="/products">
              <Button 
                variant="premium" 
                size="xl" 
                className="shadow-2xl hover:shadow-purple-500/60 group"
              >
                <span className="flex items-center gap-3 font-bold">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            <Link href="/products?featured=true">
              <Button 
                variant="ghost" 
                size="xl" 
                className="!border-white/40 !text-white hover:!bg-white/20 hover:!border-white/60 backdrop-blur-md"
              >
                <span className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  View Featured
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 8, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="w-7 h-12 border-2 border-white/20 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-white/5">
          <motion.div 
            className="w-1.5 h-3 bg-white/60 rounded-full"
            animate={{
              y: [0, 12, 0],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
