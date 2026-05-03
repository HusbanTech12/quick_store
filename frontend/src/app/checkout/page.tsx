"use client";

import { useEffect, useState } from "react";
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
import { Check, MapPin, CreditCard, Package } from "lucide-react";

const checkoutSteps = [
  { number: 1, title: "Shipping", description: "Delivery details" },
  { number: 2, title: "Payment", description: "Payment method" },
  { number: 3, title: "Review", description: "Confirm order" },
];

export default function CheckoutPage() {
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

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, router]);

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
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Checkout
        </h1>
        <p className="text-muted-foreground">
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
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-light rounded-lg">
                  <MapPin className="w-6 h-6 text-brand" />
                </div>
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="shipping_name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    id="shipping_name"
                    type="text"
                    name="shipping_name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                      formErrors.shipping_name ? "border-error" : "border-border"
                    }`}
                    aria-invalid={!!formErrors.shipping_name}
                  />
                  {formErrors.shipping_name && (
                    <p className="text-sm text-error mt-1">{formErrors.shipping_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="shipping_email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    id="shipping_email"
                    type="email"
                    name="shipping_email"
                    value={formData.shipping_email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                      formErrors.shipping_email ? "border-error" : "border-border"
                    }`}
                    aria-invalid={!!formErrors.shipping_email}
                  />
                  {formErrors.shipping_email && (
                    <p className="text-sm text-error mt-1">{formErrors.shipping_email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="shipping_address" className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    id="shipping_address"
                    type="text"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                      formErrors.shipping_address ? "border-error" : "border-border"
                    }`}
                    aria-invalid={!!formErrors.shipping_address}
                  />
                  {formErrors.shipping_address && (
                    <p className="text-sm text-error mt-1">{formErrors.shipping_address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="shipping_city" className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    id="shipping_city"
                    type="text"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                      formErrors.shipping_city ? "border-error" : "border-border"
                    }`}
                    aria-invalid={!!formErrors.shipping_city}
                  />
                  {formErrors.shipping_city && (
                    <p className="text-sm text-error mt-1">{formErrors.shipping_city}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  fullWidth
                  rightIcon={<Check className="w-4 h-4" />}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in">
              {clientSecret ? (
                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Initializing payment...</p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  fullWidth
                >
                  Back to Shipping
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
