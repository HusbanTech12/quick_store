"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Twitter,
  Instagram,
  Github,
  Linkedin,
  Facebook,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Featured", href: "/products?featured=true" },
    { label: "New Arrivals", href: "/products?new=true" },
    { label: "Best Sellers", href: "/products?best=true" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      {/* Newsletter */}
      <div className="px-6 py-12 mx-auto max-w-7xl lg:px-8">
        <div className="relative p-8 overflow-hidden border rounded-xl bg-zinc-900 border-zinc-800 sm:p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="mb-1 text-lg font-semibold text-white">
                Stay in the Loop
              </h3>
              <p className="text-sm text-white/80">
                Subscribe for exclusive deals, new arrivals, and insider updates.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 sm:flex-row lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm border rounded-lg bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 lg:w-64"
              />
              <button className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-indigo-500 hover:bg-indigo-600 whitespace-nowrap shadow-lg hover:-translate-y-0.5">
                Subscribe
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-6 py-12 mx-auto max-w-7xl lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">
                Store.pk
              </span>
            </Link>
            <p className="mb-5 text-sm leading-relaxed text-zinc-500">
              Premium products, exceptional service, and a shopping experience you&apos;ll love.
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 transition-all rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                  aria-label={social.label}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide uppercase text-indigo-600">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors text-zinc-400 hover:text-indigo-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide uppercase text-violet-600">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors text-zinc-400 hover:text-violet-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide uppercase text-purple-600">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors text-zinc-400 hover:text-purple-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide uppercase text-pink-600">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors text-zinc-400 hover:text-pink-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 gap-5 pt-8 mt-8 border-t border-zinc-200 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50">
              <Mail className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-zinc-400">Email</p>
              <p className="text-sm font-medium text-zinc-600">support@store.pk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50">
              <Phone className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-zinc-400">Phone</p>
              <p className="text-sm font-medium text-zinc-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-zinc-400">Address</p>
              <p className="text-sm font-medium text-zinc-600">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-zinc-200 bg-zinc-50/50">
        <div className="flex flex-col items-center justify-between gap-3 px-6 py-5 mx-auto max-w-7xl sm:flex-row lg:px-8">
          <p className="text-xs text-zinc-400">
            &copy; {currentYear} Store.pk. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400">
            Crafted with precision for premium shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
