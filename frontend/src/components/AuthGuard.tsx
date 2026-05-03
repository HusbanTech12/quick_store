"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "./LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires authentication
  requireAdmin?: boolean; // If true, requires admin role
  redirectTo?: string; // Where to redirect if not authenticated
}

/**
 * AuthGuard protects routes based on authentication status.
 *
 * Usage:
 * - Wrap protected pages with <AuthGuard requireAuth>
 * - For admin pages: <AuthGuard requireAuth requireAdmin>
 * - For guest-only pages (login/register): <AuthGuard requireAuth={false}>
 */
export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for auth state to be initialized
    if (!isInitialized) return;

    // If auth is required but user is not logged in
    if (requireAuth && !user) {
      const currentPath = window.location.pathname;
      const redirect = redirectTo || `/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirect);
      return;
    }

    // If admin is required but user is not admin
    if (requireAdmin && user && !user.is_admin) {
      router.push("/");
      return;
    }

    // If this is a guest-only page (like login) but user is already logged in
    if (requireAuth === false && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "/";
      router.push(redirect);
      return;
    }
  }, [user, isInitialized, requireAuth, requireAdmin, router, redirectTo]);

  // Show loading spinner while initializing or during auth check
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If auth is required but user is not logged in, show nothing (redirect is happening)
  if (requireAuth && !user) {
    return null;
  }

  // If admin is required but user is not admin, show nothing (redirect is happening)
  if (requireAdmin && user && !user.is_admin) {
    return null;
  }

  // If this is a guest-only page but user is logged in, show nothing (redirect is happening)
  if (requireAuth === false && user) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
}
