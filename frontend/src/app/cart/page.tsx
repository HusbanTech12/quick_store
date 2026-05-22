"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, Tag, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { success } = useToast();
  const total = getTotal();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleClearCart = () => {
    clearCart();
    success("Cart cleared", "All items have been removed");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto px-6 py-24 max-w-7xl lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto text-center"
        >
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-lg bg-zinc-100">
            <ShoppingBag className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-zinc-900">Your cart is empty</h2>
          <p className="mb-6 text-sm text-zinc-500">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/products">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-md bg-zinc-900 hover:bg-zinc-800">
              Start Shopping
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-8 max-w-7xl lg:px-8 lg:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-1 text-h1 text-zinc-900">
          Shopping Cart
        </h1>
        <p className="text-sm text-zinc-500">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="p-4 transition-all border rounded-lg bg-white border-zinc-200"
            >
              <div className="flex gap-4">
                <Link
                  href={`/product/${product.id}`}
                  className="flex-shrink-0 w-20 h-20 overflow-hidden border rounded-md border-zinc-200"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-zinc-50">
                      <ShoppingBag className="w-5 h-5 text-zinc-300" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.id}`}
                    className="text-sm font-medium transition-colors text-zinc-900 hover:text-zinc-600 line-clamp-1"
                  >
                    {product.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-400">{product.category}</p>
                  <p className="mt-1.5 text-base font-semibold text-zinc-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    removeItem(product.id);
                    success("Item removed", `${product.title} removed from cart`);
                  }}
                  className="flex-shrink-0 p-1.5 transition-colors rounded-md hover:bg-zinc-100"
                  aria-label={`Remove ${product.title}`}
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (quantity === 1) {
                        removeItem(product.id);
                        success("Item removed", `${product.title} removed from cart`);
                      } else {
                        updateQuantity(product.id, quantity - 1);
                      }
                    }}
                    className="flex items-center justify-center w-7 h-7 transition-colors border rounded-md border-zinc-200 hover:bg-zinc-50"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-sm font-medium text-center text-zinc-900">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="flex items-center justify-center w-7 h-7 transition-colors border rounded-md border-zinc-200 hover:bg-zinc-50"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">Subtotal</p>
                  <p className="text-sm font-semibold text-zinc-900">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={handleClearCart}
            className="py-1.5 text-xs font-medium transition-colors text-red-600 hover:text-red-700 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1"
        >
          <div className="p-5 transition-all border rounded-lg bg-white border-zinc-200 lg:sticky lg:top-20">
            <h2 className="mb-5 text-sm font-semibold text-zinc-900">Order Summary</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Tag className="absolute w-3.5 h-3.5 -translate-y-1/2 left-3 top-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="w-full py-2 pl-9 pr-3 text-xs border rounded-md bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300"
                />
              </div>
              <button className="px-3 py-2 text-xs font-medium transition-colors border rounded-md border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                Apply
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="pb-4 mb-4 space-y-2 border-b border-zinc-100">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium text-zinc-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span className="font-medium text-zinc-900">Free</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-zinc-500">Total</span>
              <span className="text-xl font-semibold text-zinc-900">${total.toFixed(2)}</span>
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              className="group relative w-full overflow-hidden font-medium text-white transition-colors rounded-md bg-zinc-900 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-center gap-2 px-5 py-2.5">
                <span className="text-sm">Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <Link href="/products" className="block py-2.5 mt-2 text-xs font-medium text-center transition-colors text-zinc-500 hover:text-zinc-900">
              Continue Shopping
            </Link>

            {/* Trust */}
            <div className="pt-4 mt-4 space-y-2.5 border-t border-zinc-100">
              {[
                { icon: Truck, text: "Free shipping on orders over $50" },
                { icon: Shield, text: "Secure checkout guaranteed" },
                { icon: CheckCircle, text: "30-day money-back guarantee" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-zinc-500">
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
