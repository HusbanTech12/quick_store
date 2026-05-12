"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detect initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: isDark ? "#818cf8" : "#4f46e5",
            colorBackground: isDark ? "#0f172a" : "#ffffff",
            colorText: isDark ? "#f1f5f9" : "#1a1a1a",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
            fontSizeBase: "16px",
          },
          rules: {
            ".Input": {
              backgroundColor: isDark ? "#1e293b" : "#f8fafc",
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: "none",
            },
            ".Input:focus": {
              border: isDark ? "2px solid #818cf8" : "2px solid #4f46e5",
              boxShadow: isDark ? "0 0 0 3px rgba(129, 140, 248, 0.1)" : "0 0 0 3px rgba(79, 70, 229, 0.1)",
            },
            ".Label": {
              color: isDark ? "#cbd5e1" : "#475569",
              fontWeight: "600",
            },
            ".Tab": {
              backgroundColor: isDark ? "#1e293b" : "#f8fafc",
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            },
            ".Tab--selected": {
              backgroundColor: isDark ? "#312e81" : "#eef2ff",
              border: isDark ? "2px solid #818cf8" : "2px solid #4f46e5",
            },
          },
        },
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
