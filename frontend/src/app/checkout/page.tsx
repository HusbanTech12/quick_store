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
<<<<<<< HEAD
import { Check, CreditCard, MapPin, Package, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
=======
import StripeProvider from "@/components/StripeProvider";
import PaymentForm from "@/components/PaymentForm";
import { Check, MapPin, CreditCard, Package } from "lucide-react";
>>>>>>> daea38e (Stripe Integration Successfully)

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
<<<<<<< HEAD
  // Stripe state
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentMethod, setStripePaymentMethod] = useState<any>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  // Stripe instance and elements state
  const [stripe, setStripe] = useState<any>(null);
  const [stripeElements, setStripeElements] = useState<any>(null);
=======
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
>>>>>>> daea38e (Stripe Integration Successfully)
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

  // Initialize Stripe PaymentIntent when entering Payment step
  useEffect(() => {
    if (currentStep === 2) {
      setIsStripeLoading(true);
      setStripeError(null);
      setStripeClientSecret(null);
      setStripePaymentMethod(null);

      // Create PaymentIntent on backend
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }) // Convert to cents
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setStripeClientSecret(data.client_secret);
        })
        .catch(err => {
          console.error('Stripe init error:', err);
          setStripeError('Failed to initialize payment. Please try again.');
        })
        .finally(() => setIsStripeLoading(false));
    }
  }, [currentStep, total]);

  // Load Stripe library and mount card element when client secret is ready
  useEffect(() => {
    if (!stripeClientSecret) return;
    // Load Stripe instance
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!).then((stripeInstance) => {
      if (!stripeInstance) {
        setStripeError('Unable to load Stripe');
        return;
      }
      const elements = stripeInstance.elements();
      const card = elements.create('card');
      card.mount('#card-element');
      setStripe(stripeInstance);
      setStripeElements({ elements, card });
    });
  }, [stripeClientSecret]);

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
      // Create payment intent when moving from step 1 to step 2
      await createPaymentIntent();
    } else if (currentStep === 2) {
      // Payment is handled by PaymentForm component
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

      console.log('Creating payment intent with order data:', orderData);
      const response = await stripeAPI.createPaymentIntent(orderData);
      console.log('Payment intent response:', response.data);

      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.orderId);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Payment intent error:', err);
      console.error('Error response:', err?.response?.data);
      const message = err?.response?.data?.detail || "Failed to initialize payment";
      showError("Payment initialization failed", message);
      // Stay on step 1 if payment intent creation fails
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

<<<<<<< HEAD
            {/* Stripe Payment Integration */}
            {currentStep === 2 && (
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-light rounded-lg">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                {/* Stripe Elements Container */}
                <div className="space-y-4">
                  {/* Loading State */}
                  {isStripeLoading && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading payment form...</span>
                    </div>
                  )}

                  {/* Error Display */}
                  {stripeError && (
                    <div className="text-sm text-error bg-error/10 border border-error rounded p-3">
                      {stripeError}
                    </div>
                  )}

                  {/* Stripe Card Element */}
                  <div id="card-element" className="border border-border rounded p-4 bg-background" />

                  {/* Pay Button */}
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!stripeClientSecret || isStripeLoading}
                    onClick={async () => {
                      if (!stripeClientSecret) return;
                      const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
                      if (!stripeInstance) {
                        setStripeError('Unable to load Stripe');
                        return;
                      }
                      try {
                        const { error } = await stripeInstance.confirmCardPayment(
                          stripeClientSecret,
                          {
                            payment_method: {
                              card: (document.querySelector('#card-element') as any),
                            },
                          }
                        );
                        if (error) throw error;
                        setStripePaymentMethod({
                          payment_method: { type: 'card' },
                          payment_status: 'succeeded'
                        });
                        setCurrentStep(3);
                      } catch (err: any) {
                        setStripeError(err.message || 'Payment failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Pay ${total.toFixed(2)}
                  </Button>
                </div>

                {/* Error Message */}
                {stripeError && (
                  <div className="text-sm text-error bg-error/10 border border-error rounded p-3">
                    {stripeError}
                  </div>
                )}
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

                {/* Payment Details */}
                {stripePaymentMethod && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Credit Card (ending in •••• •••• •••• {stripePaymentMethod.card?.last4 || '1234'})</p>
                      <p className="text-success">✓ Payment Successful</p>
                    </div>
                  </div>
                )}

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
=======
              <div className="space-y-5">
>>>>>>> daea38e (Stripe Integration Successfully)
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
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
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
    </div>
  );
}
