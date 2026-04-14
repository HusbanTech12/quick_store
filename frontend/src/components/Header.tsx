"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 glass" role="banner">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="QuickStore Home"
          >
            QuickStore
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Main navigation">
            <Link
              href="/"
              className="text-foreground hover:text-brand font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-foreground hover:text-brand font-medium transition-colors"
            >
              Products
            </Link>
            {user && (
              <Link
                href="/orders"
                className="text-foreground hover:text-brand font-medium transition-colors"
              >
                Orders
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 px-4 py-2 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-brand-foreground rounded-r-lg hover:bg-brand-hover transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={`Shopping cart with ${isMounted ? cartItemCount : 0} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isMounted && cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in"
                  aria-hidden="true"
                >
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Hi, {user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 animate-scale-in">
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-light transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-brand text-brand-foreground rounded-lg hover:bg-brand-hover transition-colors font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Cart */}
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5" />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-slide-in-down">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-brand-foreground rounded-r-lg hover:bg-brand-hover transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2" aria-label="Mobile navigation">
              <Link
                href="/"
                className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Orders
                </Link>
              )}
              <div className="pt-2 border-t border-border">
                <DarkModeToggle />
              </div>
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-error hover:bg-error-light transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-3 bg-brand text-brand-foreground rounded-lg hover:bg-brand-hover transition-colors font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
