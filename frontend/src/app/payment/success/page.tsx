"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ToastProvider";
import { stripeAPI } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCartStore();
  const { success, error: showError } = useToast();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No payment session found");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await stripeAPI.getSessionStatus(sessionId);

        if (response.data.payment_status === "paid") {
          setStatus("success");
          setMessage("Payment successful! Your order has been confirmed.");
          clearCart();
          success("Payment successful!", "Your order has been placed");
        } else {
          setStatus("error");
          setMessage("Payment verification failed. Please contact support.");
          showError("Payment failed", "Unable to verify payment");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.detail || "Failed to verify payment");
        showError("Verification failed", "Could not verify payment status");
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, success, showError]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-brand animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
        <p className="text-muted-foreground">Please wait while we confirm your payment</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-success/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            {message}
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <ul className="text-left space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span>Track your order status in your orders page</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span>Your items will be shipped within 2-3 business days</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/orders")}
            >
              View My Orders
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-error/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-16 h-16 text-error" />
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Payment Verification Failed
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          {message}
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            If you believe this is an error or if you were charged, please contact our support team with your session ID:
          </p>
          <code className="bg-muted px-4 py-2 rounded text-sm break-all">
            {sessionId}
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/checkout")}
          >
            Try Again
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-brand animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
