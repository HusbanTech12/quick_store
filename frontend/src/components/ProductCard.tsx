"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, ImageOff, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "./ToastProvider";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "featured";
}

export default function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    setIsAdding(true);
    addItem(product);
    success("Added to cart", product.title);

    setTimeout(() => {
      setIsAdding(false);
      router.push("/cart");
    }, 400);
  };

  const rating = 4.0 + (product.id.charCodeAt(0) % 10) / 10;
  const reviewCount = 50 + (product.id.charCodeAt(0) % 150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden transition-all duration-300 border rounded-xl bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-zinc-50 to-indigo-50/30">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            {product.image ? (
              <motion.img
                src={product.image}
                alt={product.title}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageOff className="w-8 h-8 text-zinc-300" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute flex flex-col gap-1 top-3 left-3">
              {product.is_featured && (
                <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md">
                  Featured
                </span>
              )}
              {product.stock === 0 && (
                <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-zinc-100 text-zinc-500">
                  Sold Out
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute flex flex-col gap-1.5 transition-all duration-200 opacity-0 top-3 right-3 group-hover:opacity-100">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="p-2 transition-all rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : "text-zinc-500"
                  }`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/product/${product.id}`);
                }}
                className="p-2 transition-all rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4 text-zinc-500" />
              </motion.button>
            </div>

            {/* Add to Cart */}
            <motion.div
              className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <ShoppingCart className={`w-4 h-4 ${isAdding ? "animate-spin" : ""}`} />
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            <span className="text-[10px] font-semibold tracking-wide uppercase text-indigo-600">
              {product.category}
            </span>

            <h3 className="mt-1.5 text-sm font-medium leading-snug line-clamp-2 text-zinc-900">
              {product.title}
            </h3>

            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-zinc-400">({reviewCount})</span>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100">
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-orange-50 text-orange-600">
                  {product.stock} left
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
