"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Package,
  LogOut,
  ChevronDown,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Logo from "./Logo";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || isSearchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen, isSearchOpen]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === adminEmail;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/orders", label: "Orders" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    ...(isAdmin ? [{ href: "/admin", label: "Dashboard" }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass" : "bg-white/80"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="w-8 h-8" />
              <span className="text-base font-bold tracking-tight text-zinc-900">
                Shop.pk
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="items-center hidden gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm font-medium transition-colors text-zinc-500 hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <div className="relative hidden sm:block">
                <AnimatePresence>
                  {isSearchOpen ? (
                    <motion.form
                      initial={{ opacity: 0, width: 36 }}
                      animate={{ opacity: 1, width: 240 }}
                      exit={{ opacity: 0, width: 36 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={handleSearch}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        <Search className="absolute w-3.5 h-3.5 -translate-y-1/2 left-3 top-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          autoFocus
                          className="w-full py-1.5 pl-9 pr-8 text-sm border rounded-md bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300"
                        />
                        <button
                          type="button"
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                          className="absolute p-0.5 -translate-y-1/2 right-2 top-1/2 rounded hover:bg-zinc-200"
                        >
                          <X className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 transition-colors rounded-md hover:bg-zinc-100"
                    >
                      <Search className="w-4 h-4 text-zinc-500" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 transition-colors rounded-md hover:bg-zinc-100"
              >
                <ShoppingCart className="w-4 h-4 text-zinc-500" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute flex items-center justify-center -top-0.5 -right-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-medium rounded-full min-w-[16px] h-4 px-0.5"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative hidden sm:block">
                {isLoaded ? (
                  user ? (
                    <>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-1.5 p-1.5 pr-2 transition-colors rounded-md hover:bg-zinc-100"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 overflow-hidden">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span className="text-xs font-medium truncate max-w-[60px] text-zinc-600">
                          {user.firstName || user.emailAddresses[0]?.emailAddress}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isProfileOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 w-52 mt-1 overflow-hidden bg-white border rounded-lg shadow-lg border-zinc-200 z-50"
                            >
                              <div className="p-1">
                                <div className="px-3 py-2 border-b border-zinc-100">
                                  <p className="text-xs font-medium text-zinc-900">{user.fullName}</p>
                                  <p className="text-[11px] truncate text-zinc-500">{user.emailAddresses[0]?.emailAddress}</p>
                                </div>
                                <Link
                                  href="/orders"
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors rounded-md text-zinc-600 hover:bg-zinc-50"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <Package className="w-3.5 h-3.5" />
                                  My Orders
                                </Link>
                                <Link
                                  href="/profile"
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors rounded-md text-zinc-600 hover:bg-zinc-50"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  Profile
                                </Link>
                                <SignOutButton>
                                  <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium transition-colors rounded-md text-red-600 hover:bg-red-50">
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                  </button>
                                </SignOutButton>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-md text-zinc-600 hover:bg-zinc-100"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )
                ) : null}
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 transition-colors rounded-md md:hidden hover:bg-zinc-100"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-4 h-4 text-zinc-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4 text-zinc-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="border-t md:hidden bg-white border-zinc-200"
            >
              <div className="px-6 py-4 space-y-1">
                <form onSubmit={handleSearch} className="relative mb-3">
                  <Search className="absolute w-3.5 h-3.5 -translate-y-1/2 left-3 top-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full py-2 pl-9 pr-4 text-sm border rounded-md bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </form>

                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href + link.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-sm font-medium transition-colors rounded-md text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-3 mt-3 border-t border-zinc-100">
                  {isLoaded && user ? (
                    <SignOutButton>
                      <button
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-md text-red-600 hover:bg-red-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Out
                      </button>
                    </SignOutButton>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-md bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="h-16" />
    </>
  );
}
