"use client";

<<<<<<< HEAD
import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, ImageOff } from "lucide-react";
=======
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "./ToastProvider";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
<<<<<<< HEAD
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
=======
  variant?: "default" | "featured" | "compact";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
<<<<<<< HEAD
=======
    
    if (product.stock === 0) return;
    
    setIsAdding(true);
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
    addItem(product);
    success("Added to cart", product.title);
    
    setTimeout(() => setIsAdding(false), 300);
  };

<<<<<<< HEAD
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
        <div className="relative bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/30 transition-all duration-500 hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-750 overflow-hidden">
            {product.image ? (
              <motion.img
                src={product.image}
                alt={product.title}
                animate={{ scale: isHovered ? 1.08 : 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badge */}
            {product.is_featured && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-amber-500/25"
              >
                Featured
              </motion.div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-xl">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              className="absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:scale-110 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              />
            </motion.button>

            {/* Quick Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-900 dark:text-white text-sm font-medium rounded-xl shadow-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:hover:text-slate-900 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Category */}
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              {product.category}
            </span>

            {/* Title */}
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  Only {product.stock} left
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
=======
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Featured variant
  if (variant === "featured") {
    return (
      <Link
        href={`/product/${product.id}`}
        className="group bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col card-interactive border border-border"
      >
        {/* Image */}
        <div className="relative h-64 bg-muted flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-brand-light to-accent-light dark:from-brand-light/20 dark:to-accent-light/20">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="bg-gradient-to-r from-brand to-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                ⭐ Featured
              </span>
            )}
            {isLowStock && (
              <span className="bg-warning text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse-slow">
                🔥 Low Stock
              </span>
            )}
          </div>
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-error text-white text-sm font-bold px-4 py-2 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <p className="text-xs font-medium text-brand mb-2 uppercase tracking-wide">
            {product.category}
          </p>
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-brand transition-colors">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>
          )}
          
          {/* Rating Placeholder */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-warning text-warning" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <div>
              <span className="text-2xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  isOutOfStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : isAdding
                    ? "bg-success text-white scale-105"
                    : "bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-md active:scale-95"
                }
              `}
              aria-label={`Add ${product.title} to cart`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? "Sold Out" : isAdding ? "Added!" : "Add"}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Link
        href={`/product/${product.id}`}
        className="group bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex items-center border border-border"
      >
        <div className="relative w-24 h-24 flex-shrink-0 bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-brand transition-colors">
            {product.title}
          </h3>
          <p className="text-lg font-bold text-foreground mt-1">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="m-4 p-2 bg-brand text-brand-foreground rounded-lg hover:bg-brand-hover transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          aria-label={`Add ${product.title} to cart`}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col card-interactive border border-border"
    >
      {/* Image */}
      <div className="relative h-56 bg-muted flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-brand-light to-accent-light dark:from-brand-light/20 dark:to-accent-light/20">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-gradient-to-r from-brand to-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              ⭐ Featured
            </span>
          )}
          {isLowStock && (
            <span className="bg-warning text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse-slow">
              🔥 Low Stock
            </span>
          )}
        </div>
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-error text-white text-sm font-bold px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-xs font-medium text-brand mb-2 uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}
        
        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-warning text-warning" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="text-xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : isAdding
                  ? "bg-success text-white scale-105"
                  : "bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-md active:scale-95"
              }
            `}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? "Sold Out" : isAdding ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </Link>
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
  );
}
