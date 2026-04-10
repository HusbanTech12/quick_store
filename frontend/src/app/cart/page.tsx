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
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Shopping Cart
        </h1>
        <p className="text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/product/${product.id}`}
                  className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.id}`}
                    className="font-bold text-foreground hover:text-brand transition-colors line-clamp-1"
                  >
                    {product.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.category}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => {
                    removeItem(product.id);
                    success("Item removed", `${product.title} removed from cart`);
                  }}
                  className="p-2 hover:bg-error-light rounded-lg transition-colors self-start"
                  aria-label={`Remove ${product.title} from cart`}
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-error" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
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
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-xl font-bold text-foreground">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <button
            onClick={handleClearCart}
            className="text-sm text-error hover:underline py-2"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Proceed to Checkout
            </Button>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="block text-center text-muted-foreground hover:text-foreground mt-4 text-sm transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
