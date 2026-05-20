"use client";

import { FC, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const total = getTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md bg-[#0F172A] border-l border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Your Cart</h2>
                  <p className="text-xs text-slate-500">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-white/5">
                    <ShoppingBag className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">Your cart is empty</h3>
                  <p className="mb-6 text-sm text-slate-500">
                    Add some products to get started!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-white transition-all rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 transition-all border rounded-xl border-white/5 bg-white/[0.02]"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-16 h-16 overflow-hidden border rounded-lg border-white/5 bg-white/[0.02]">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <ShoppingBag className="w-5 h-5 text-slate-700" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate text-slate-200">
                              {item.product.title}
                            </h4>
                            <p className="mt-1 text-sm font-medium text-white">
                              ${item.product.price.toFixed(2)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    item.quantity === 1
                                      ? removeItem(item.product.id)
                                      : updateQuantity(item.product.id, item.quantity - 1)
                                  }
                                  className="flex items-center justify-center w-6 h-6 transition-colors rounded-md hover:bg-white/5"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-xs font-medium text-center text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="flex items-center justify-center w-6 h-6 transition-colors rounded-md hover:bg-white/5"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="p-1.5 transition-colors rounded-md hover:bg-red-500/10 group"
                                aria-label={`Remove ${item.product.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 transition-colors text-slate-600 group-hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {items.length > 1 && (
                    <button
                      onClick={clearCart}
                      className="w-full py-2 text-xs font-medium transition-colors text-red-400 hover:text-red-300 hover:underline"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-white/5">
                {/* Price Breakdown */}
                <div className="pb-4 mb-4 space-y-2 border-b border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-emerald-400">Free</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Total</span>
                  <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={onClose}>
                  <button className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95">
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <button
                  onClick={onClose}
                  className="w-full py-3 mt-2 text-xs font-medium transition-colors text-slate-500 hover:text-slate-300"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
