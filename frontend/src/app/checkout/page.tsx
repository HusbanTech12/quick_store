"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { ordersAPI } from "@/lib/api";
import CheckoutStepper from "@/components/CheckoutStepper";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Check, CreditCard, MapPin, Package } from "lucide-react";

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
  const [formData, setFormData] = useState({
    shipping_name: user?.name || "",
    shipping_email: user?.email || "",
    shipping_address: "",
    shipping_city: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, router]);

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

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep(Math.min(currentStep + 1, 3));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return;

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
      const response = await ordersAPI.create(orderData);
      clearCart();
      success("Order placed successfully!", "You will be redirected to your orders");
      setTimeout(() => {
        router.push(`/orders/${response.data.id}`);
      }, 1000);
    } catch (err: any) {
      showError("Order failed", err.response?.data?.detail || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (items.length === 0) {
    return <EmptyState type="cart" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Checkout
        </h1>
        <p className="text-muted-foreground">
          Complete your order in a few simple steps
        </p>
      </div>

      {/* Stepper */}
      <CheckoutStepper
        steps={checkoutSteps}
        currentStep={currentStep}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
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
                      aria-describedby={formErrors.shipping_name ? "shipping_name-error" : undefined}
                    />
                    {formErrors.shipping_name && (
                      <p id="shipping_name-error" className="text-sm text-error mt-1">
                        {formErrors.shipping_name}
                      </p>
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
                      aria-describedby={formErrors.shipping_email ? "shipping_email-error" : undefined}
                    />
                    {formErrors.shipping_email && (
                      <p id="shipping_email-error" className="text-sm text-error mt-1">
                        {formErrors.shipping_email}
                      </p>
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
                      aria-describedby={formErrors.shipping_address ? "shipping_address-error" : undefined}
                    />
                    {formErrors.shipping_address && (
                      <p id="shipping_address-error" className="text-sm text-error mt-1">
                        {formErrors.shipping_address}
                      </p>
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
                      aria-describedby={formErrors.shipping_city ? "shipping_city-error" : undefined}
                    />
                    {formErrors.shipping_city && (
                      <p id="shipping_city-error" className="text-sm text-error mt-1">
                        {formErrors.shipping_city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment (Placeholder) */}
            {currentStep === 2 && (
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-light rounded-lg">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payment Integration Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    For now, you can place your order and pay on delivery
                  </p>
                  <div className="bg-muted rounded-lg p-4 inline-block">
                    <p className="text-sm font-medium">✓ Cash on Delivery</p>
                    <p className="text-sm font-medium">✓ Bank Transfer</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-success-light rounded-lg">
                    <Package className="w-6 h-6 text-success" />
                  </div>
                  <h2 className="text-xl font-bold">Review Your Order</h2>
                </div>

                {/* Shipping Details */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{formData.shipping_name}</p>
                    <p>{formData.shipping_email}</p>
                    <p>{formData.shipping_address}</p>
                    <p>{formData.shipping_city}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="flex-1">
                          <span className="font-medium">{product.title}</span>
                          <span className="text-muted-foreground ml-2">x {quantity}</span>
                        </span>
                        <span className="font-semibold">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  fullWidth
                >
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  fullWidth
                  rightIcon={<Check className="w-4 h-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  leftIcon={<Check className="w-5 h-5" />}
                >
                  Place Order - ${total.toFixed(2)}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
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
      </form>
    </div>
  );
}
