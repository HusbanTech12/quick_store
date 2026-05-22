"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ToastProvider";
import { stripeAPI } from "@/lib/api";
import CheckoutStepper from "@/components/CheckoutStepper";
import EmptyState from "@/components/EmptyState";
import StripeProvider from "@/components/StripeProvider";
import PaymentForm from "@/components/PaymentForm";
import { useUser } from "@clerk/nextjs";
import { Check, MapPin, CreditCard, Package, Shield, Truck, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

const checkoutSteps = [
  { number: 1, title: "Shipping", description: "Delivery details" },
  { number: 2, title: "Payment", description: "Payment method" },
  { number: 3, title: "Review", description: "Confirm order" },
];

function CheckoutContent() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isLoaded } = useUser();
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login?redirect_url=" + encodeURIComponent("/checkout"));
    }
  }, [isLoaded, user, router]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    shipping_name: user?.fullName || "",
    shipping_email: user?.emailAddresses[0]?.emailAddress || "",
    shipping_address: "",
    shipping_city: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  if (!isLoaded) return null;
  if (!user) return null;
  if (items.length === 0) {
    return <EmptyState type="cart" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </button>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 max-w-7xl lg:px-8 py-8 lg:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-1">Checkout</h1>
          <p className="text-sm text-zinc-500">Complete your order in a few simple steps</p>
        </div>

        {/* Stepper */}
        <CheckoutStepper steps={checkoutSteps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white border border-zinc-200 rounded-xl shadow-sm"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">Shipping Information</h2>
                      <p className="text-xs text-zinc-500">Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="shipping_name" className="block text-sm font-medium mb-1.5 text-zinc-700">
                        Full Name *
                      </label>
                      <input
                        id="shipping_name"
                        type="text"
                        name="shipping_name"
                        value={formData.shipping_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                          formErrors.shipping_name ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                        }`}
                        placeholder="John Doe"
                      />
                      {formErrors.shipping_name && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.shipping_name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="shipping_email" className="block text-sm font-medium mb-1.5 text-zinc-700">
                        Email Address *
                      </label>
                      <input
                        id="shipping_email"
                        type="email"
                        name="shipping_email"
                        value={formData.shipping_email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                          formErrors.shipping_email ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                        }`}
                        placeholder="john@example.com"
                      />
                      {formErrors.shipping_email && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.shipping_email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="shipping_address" className="block text-sm font-medium mb-1.5 text-zinc-700">
                        Street Address *
                      </label>
                      <input
                        id="shipping_address"
                        type="text"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                          formErrors.shipping_address ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                        }`}
                        placeholder="123 Main Street"
                      />
                      {formErrors.shipping_address && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.shipping_address}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="shipping_city" className="block text-sm font-medium mb-1.5 text-zinc-700">
                        City *
                      </label>
                      <input
                        id="shipping_city"
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                          formErrors.shipping_city ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                        }`}
                        placeholder="New York"
                      />
                      {formErrors.shipping_city && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.shipping_city}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Payment</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {clientSecret ? (
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      amount={total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-12">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900 mb-1">Initializing secure payment...</p>
                      <p className="text-xs text-zinc-500">Please wait while we set up your checkout</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Shipping
                </button>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 p-2 rounded-lg bg-zinc-50">
                    <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden border border-zinc-200 bg-white">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1 text-zinc-900">{product.title}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Qty: {quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-zinc-900">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium text-zinc-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Tax</span>
                  <span className="text-zinc-400">Calculated at checkout</span>
                </div>
                <div className="border-t border-zinc-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-900">Total</span>
                    <span className="text-xl font-bold text-zinc-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-zinc-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Shield className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Truck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>30-day money-back guarantee</span>
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
  return <CheckoutContent />;
}
