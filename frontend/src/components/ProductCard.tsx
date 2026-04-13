"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, ImageOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "./ToastProvider";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "featured";
}

export default function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    setIsAdding(true);
    addItem(product);
    success("Added to cart", product.title);

    setTimeout(() => setIsAdding(false), 300);
  };

  // Generate a random rating between 4.0 and 5.0 for demo
  const rating = 4.0 + (product.id.charCodeAt(0) % 10) / 10;
  const reviewCount = 50 + (product.id.charCodeAt(0) % 150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-md dark:shadow-xl hover:shadow-2xl dark:hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
            {product.image ? (
              <motion.img
                src={product.image}
                alt={product.title}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
            )}

            {/* Premium Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Shimmer Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
              <div className="w-full h-full animate-shimmer" />
            </div>

            {/* Premium Badge */}
            {product.is_featured && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="absolute top-3 left-3 px-3 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/40 backdrop-blur-sm border border-white/20"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              </motion.div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[4px] flex items-center justify-center">
                <span className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl shadow-xl">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist Button - Premium Style */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              className="absolute top-3 right-3 p-3 bg-white dark:bg-slate-800 backdrop-blur-md rounded-full shadow-lg dark:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-200 dark:border-slate-600"
            >
              <motion.div
                animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isWishlisted
                      ? "fill-rose-500 text-rose-500"
                      : "text-slate-600 dark:text-slate-300 hover:text-rose-400"
                  }`}
                />
              </motion.div>
            </motion.button>

            {/* Quick Add to Cart - Premium Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 backdrop-blur-md text-slate-900 dark:text-white text-sm font-semibold rounded-xl shadow-xl dark:shadow-2xl hover:bg-gradient-to-r hover:from-brand hover:to-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-900 dark:disabled:hover:text-white transition-all duration-300 active:scale-95 border border-slate-200 dark:border-slate-600"
              >
                <motion.div
                  animate={isAdding ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.div>
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3 bg-white dark:bg-slate-800">
            {/* Category */}
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {product.category}
            </span>

            {/* Title */}
            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-base">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Star
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        i < Math.floor(rating)
                          ? "fill-amber-400 dark:fill-amber-300 text-amber-400 dark:text-amber-300 drop-shadow-sm"
                          : "fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                ({reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && product.stock <= 10 && (
                <motion.span 
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1.5 rounded-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔥 Only {product.stock} left
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
