"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Headphones, Shirt, Home as HomeIcon, Laptop, ChevronRight } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";

const categoryIcons = {
  Electronics: Laptop,
  Fashion: Shirt,
  "Home & Office": HomeIcon,
  Accessories: Package,
  default: Package,
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [featuredRes, productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({ featured_only: true, limit: 4 }),
          productsAPI.getAll({ limit: 4 }),
          productsAPI.getCategories(),
        ]);

        setFeaturedProducts(featuredRes.data);
        setRecentProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setError(null);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch homepage data:", err);
        }
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <section className="relative container mx-auto px-4 py-16 lg:py-24" aria-labelledby="featured-heading">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-pattern-grid opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 id="featured-heading" className="text-3xl lg:text-4xl font-black text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-lg">
                Hand-picked premium products just for you
              </p>
            </div>
            <Link href="/products?featured=true" className="hidden sm:flex">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} className="border-brand/50 text-brand hover:bg-brand/10 hover:border-brand">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              type="products"
              title="Unable to load products"
              description={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
          ) : (
            <EmptyState type="products" />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products?featured=true">
              <Button variant="premium" rightIcon={<ArrowRight className="w-4 h-4" />} fullWidth>
                View All Featured
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Divider */}
      <div className="section-divider-premium max-w-4xl mx-auto" />

      {/* Categories Section */}
      <section className="relative bg-gradient-to-br from-muted via-muted/50 to-muted py-16 lg:py-24" aria-labelledby="categories-heading">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="categories-heading" className="text-3xl lg:text-4xl font-black text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Browse our curated collections
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((category) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
                return (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-xl hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 card-interactive border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center hover:-translate-y-2 hover:border-blue-500 dark:hover:border-blue-400/50"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category}
                    </h3>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <span>Shop Now</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState type="products" title="No categories available" />
          )}
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="relative container mx-auto px-4 py-16 lg:py-24" aria-labelledby="recent-heading">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-pattern-grid opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 id="recent-heading" className="text-3xl lg:text-4xl font-black text-foreground mb-2">
                New Arrivals
              </h2>
              <p className="text-muted-foreground text-lg">
                Check out our latest products
              </p>
            </div>
            <Link href="/products" className="hidden sm:flex">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} className="!border-brand/50 !text-brand hover:!bg-brand/10 hover:!border-brand">
                Browse All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState type="products" />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products">
              <Button variant="premium" rightIcon={<ArrowRight className="w-4 h-4" />} fullWidth>
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative bg-gradient-to-br from-muted via-muted/50 to-muted py-16 lg:py-24" aria-labelledby="cta-heading">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 id="cta-heading" className="text-4xl lg:text-5xl font-black text-foreground mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg lg:text-xl mb-10 text-muted-foreground leading-relaxed">
              Explore our complete collection of premium products
            </p>
            <Link href="/products">
              <Button variant="premium" size="xl" className="shadow-2xl hover:shadow-purple-500/60 group">
                <span className="flex items-center gap-3 font-bold">
                  Explore Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
