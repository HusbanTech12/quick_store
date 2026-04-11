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

const categoryIcons = {
  Electronics: Laptop,
  Fashion: Shirt,
  "Home & Office": HomeIcon,
  Accessories: Package,
  default: Package,
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
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
        console.error("Failed to fetch homepage data:", err);
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
      <section className="container mx-auto px-4 py-16 lg:py-24" aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 id="featured-heading" className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Hand-picked premium products just for you
            </p>
          </div>
          <Link href="/products?featured=true" className="hidden sm:flex">
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
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
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} fullWidth>
              View All Featured
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted py-16 lg:py-24" aria-labelledby="categories-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="categories-heading" className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="text-muted-foreground">
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
                    className="group bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 card-interactive border border-border flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-brand-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 group-hover:text-brand transition-colors">
                      {category}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
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
      <section className="container mx-auto px-4 py-16 lg:py-24" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 id="recent-heading" className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              New Arrivals
            </h2>
            <p className="text-muted-foreground">
              Check out our latest products
            </p>
          </div>
          <Link href="/products" className="hidden sm:flex">
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
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
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} fullWidth>
              Browse All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative bg-gradient-to-r from-brand to-accent py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg lg:text-xl mb-8 opacity-90">
              Explore our complete collection of premium products
            </p>
            <Link href="/products">
              <Button variant="primary" size="xl" className="bg-white text-brand hover:bg-gray-100 shadow-xl">
                <span className="flex items-center gap-2">
                  Explore Products
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
