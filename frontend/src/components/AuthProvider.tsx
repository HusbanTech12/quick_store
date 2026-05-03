"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthProvider initializes authentication state on app load.
 * This ensures the auth state is rehydrated from localStorage
 * and validated before any protected routes check authentication.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Initialize auth state on mount
    initialize();
  }, [initialize]);

  // Render children immediately - individual routes will handle loading states
  return <>{children}</>;
}
