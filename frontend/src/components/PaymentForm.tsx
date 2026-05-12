"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Button from "./Button";
import { CreditCard, Loader2, Shield, Lock, CheckCircle2, AlertCircle } from "lucide-react";

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
      {/* Premium Payment Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Payment Details
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Secure checkout powered by Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">SSL Secured</span>
            </div>
          </div>

          {/* Payment Element with premium styling */}
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-inner border border-slate-200 dark:border-slate-800">
            <PaymentElement
              options={{
                layout: "tabs",
                paymentMethodOrder: ["card", "us_bank_account"],
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl animate-scale-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">Payment Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">256-bit SSL</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Encryption</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mb-2">
                  <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">PCI Compliant</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Secure</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Verified</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Submit Button */}
      <div className="space-y-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center justify-center gap-3">
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Pay ${amount.toFixed(2)}</span>
                <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>
        </button>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-center">
          <Lock className="w-4 h-4 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Payment Logos */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Powered by</div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">stripe</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
