"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Button from "./Button";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      onError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-light rounded-lg">
            <CreditCard className="w-5 h-5 text-brand" />
          </div>
          <h3 className="text-lg font-bold">Payment Details</h3>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "us_bank_account"],
          }}
        />

        {errorMessage && (
          <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!stripe || isProcessing}
        loading={isProcessing}
        leftIcon={isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  );
}
