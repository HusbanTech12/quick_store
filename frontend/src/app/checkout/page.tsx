"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { stripeAPI } from "@/lib/api";
import CheckoutStepper from "@/components/CheckoutStepper";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import StripeProvider from "@/components/StripeProvider";
import PaymentForm from "@/components/PaymentForm";
import AuthGuard from "@/components/AuthGuard";
import { Check, MapPin, CreditCard, Package } from "lucide-react";

const checkoutSteps = [
  { number: 1, title: "Shipping", description: "Delivery details" },
  { number: 2, title: "Payment", description: "Payment method" },
  { number: 3, title: "Review", description: "Confirm order" },
];

function CheckoutContent() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    shipping_name: user?.name || "",
    shipping_email: user?.email || "",
    shipping_address: "",
    shipping_city: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Compute total upfront so it can be used in effects and rendering
  const total = getTotal();

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.shipping_name.trim()) errors.shipping_name = "Name is required";
    if (!formData.shipping_email.trim()) errors.shipping_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shipping_email))
      errors.shipping_email = "Invalid email format";
    if (!formData.shipping_address.trim()) errors.shipping_address = "Address is required";
    if (!formData.shipping_city.trim()) errors.shipping_city = "City is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      await createPaymentIntent();
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const response = await stripeAPI.createPaymentIntent(orderData);
      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.orderId);
      setCurrentStep(2);
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to initialize payment";
      showError("Payment initialization failed", message);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await stripeAPI.confirmPayment(paymentIntentId);

      if (response.data.status === "success") {
        clearCart();
        success("Payment successful!", "Your order has been placed");
        router.push(`/orders/${response.data.orderId}?payment=success`);
      } else {
        showError("Payment failed", response.data.message);
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to confirm payment";
      showError("Payment confirmation failed", message);
    }
  };

  const handlePaymentError = (error: string) => {
    showError("Payment failed", error);
  };

  if (!user) return null;
  if (items.length === 0) {
    return <EmptyState type="cart" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
          Secure Checkout
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Complete your order in a few simple steps
        </p>
      </div>

      <CheckoutStepper
        steps={checkoutSteps}
        currentStep={currentStep}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl animate-scale-in">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/25">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Shipping Information
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="space-y-5 bg-white dark:bg-slate-950 rounded-xl p-6 shadow-inner border border-slate-200 dark:border-slate-800">
                  <div>
                    <label htmlFor="shipping_name" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      id="shipping_name"
                      type="text"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        formErrors.shipping_name ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                      aria-invalid={!!formErrors.shipping_name}
                      placeholder="John Doe"
                    />
                    {formErrors.shipping_name && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <span>⚠</span> {formErrors.shipping_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shipping_email" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Email Address *
                    </label>
                    <input
                      id="shipping_email"
                      type="email"
                      name="shipping_email"
                      value={formData.shipping_email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        formErrors.shipping_email ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                      aria-invalid={!!formErrors.shipping_email}
                      placeholder="john@example.com"
                    />
                    {formErrors.shipping_email && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <span>⚠</span> {formErrors.shipping_email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shipping_address" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Street Address *
                    </label>
                    <input
                      id="shipping_address"
                      type="text"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        formErrors.shipping_address ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                      aria-invalid={!!formErrors.shipping_address}
                      placeholder="123 Main Street"
                    />
                    {formErrors.shipping_address && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <span>⚠</span> {formErrors.shipping_address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shipping_city" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      City *
                    </label>
                    <input
                      id="shipping_city"
                      type="text"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        formErrors.shipping_city ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                      aria-invalid={!!formErrors.shipping_city}
                      placeholder="New York"
                    />
                    {formErrors.shipping_city && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <span>⚠</span> {formErrors.shipping_city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Payment</span>
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-scale-in space-y-4">
              {clientSecret ? (
                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-12">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Initializing secure payment...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we set up your checkout</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleBack}
                className="w-full px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                ← Back to Shipping
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 sticky top-24">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl" />

            <div className="relative">
              <h2 className="text-lg font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1 text-slate-900 dark:text-slate-100">{product.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 space-y-3">
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
                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard requireAuth>
      <CheckoutContent />
    </AuthGuard>
  );
}
