"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield } from "lucide-react";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { success } = useToast();
  const total = getTotal();

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const handleClearCart = () => {
    clearCart();
    success("Cart cleared", "All items have been removed");
  };

  if (items.length === 0) {
    return <EmptyState type="cart" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
          Shopping Cart
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl" />

              <div className="relative flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/product/${product.id}`}
                  className="w-28 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.id}`}
                    className="font-bold text-lg text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {product.title}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {product.category}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => {
                    removeItem(product.id);
                    success("Item removed", `${product.title} removed from cart`);
                  }}
                  className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors self-start group/btn"
                  aria-label={`Remove ${product.title} from cart`}
                >
                  <X className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600 dark:group-hover/btn:text-red-400 transition-colors" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (quantity === 1) {
                        removeItem(product.id);
                        success("Item removed", `${product.title} removed from cart`);
                      } else {
                        updateQuantity(product.id, quantity - 1);
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Subtotal</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline py-2 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 sticky top-24">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl" />

            <div className="relative">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Calculated at checkout</span>
                </div>
                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="block text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mt-4 text-sm font-medium transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
