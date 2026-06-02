"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Shield, CheckCircle, Laptop, Shirt, Home as HomeIcon, ChevronRight, Star, Quote, Zap, Users, Award } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import { motion } from "framer-motion";

const categoryIcons: Record<string, React.ElementType> = {
  Electronics: Laptop,
  Fashion: Shirt,
  "Home & Office": HomeIcon,
  Accessories: Package,
  default: Package,
};

const categoryImages: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  Fashion: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "Home & Office": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  Accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified Buyer",
    avatar: "SJ",
    rating: 5,
    text: "Absolutely love the quality. The packaging was premium and delivery was faster than expected.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Verified Buyer",
    avatar: "MC",
    rating: 5,
    text: "Best online shopping experience. The product quality exceeded my expectations.",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Verified Buyer",
    avatar: "ED",
    rating: 5,
    text: "The attention to detail is remarkable. From browsing to checkout, everything felt seamless.",
  },
];

export default function HomePage() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({ limit: 4 }),
          productsAPI.getCategories(),
        ]);

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
      {/* Hero */}
      <Hero />

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-white" aria-labelledby="categories-heading">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-500">
                <Package className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-violet-600">Browse Collections</span>
            </div>
            <h2 id="categories-heading" className="text-h2 text-zinc-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-body text-zinc-500">
              Explore our curated collections
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full skeleton" />
                  <div className="w-20 h-4 mt-4 rounded skeleton" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4"
            >
              {categories.map((category) => {
                const Icon = categoryIcons[category] || categoryIcons.default;
                const image = categoryImages[category] || categoryImages.default;
                return (
                  <motion.div key={category} variants={fadeInScale}>
                    <Link
                      href={`/products?category=${encodeURIComponent(category)}`}
                      className="group flex flex-col items-center text-center"
                    >
                      {/* Circular Image */}
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-indigo-300 transition-all shadow-md group-hover:shadow-xl group-hover:shadow-indigo-500/10">
                        <img
                          src={image}
                          alt={category}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">{category}</h3>
                      <div className="flex items-center mt-1 text-xs font-medium text-zinc-400 group-hover:text-indigo-600 transition-colors">
                        <span>Shop Now</span>
                        <ChevronRight className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <EmptyState type="products" title="No categories available" />
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-zinc-50/50 to-white" aria-labelledby="recent-heading">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="flex flex-col items-start justify-between gap-4 mb-12 sm:flex-row sm:items-end"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-label text-purple-600">Just Arrived</span>
              </div>
              <h2 id="recent-heading" className="text-h2 text-zinc-900">
                New Arrivals
              </h2>
              <p className="mt-2 text-body text-zinc-500">
                Check out our latest products
              </p>
            </div>
            <Link href="/products" className="hidden group sm:flex">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all text-purple-600 hover:text-purple-700 hover:gap-2">
                Browse All
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : recentProducts.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {recentProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeInScale}>
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState type="products" />
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50" aria-labelledby="testimonials-heading">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500">
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-label text-indigo-600">Customer Reviews</span>
            </div>
            <h2 id="testimonials-heading" className="text-h2 text-zinc-900">
              What Our Customers Say
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={fadeInUp}
                className="p-6 transition-all border rounded-xl bg-white border-zinc-200/60 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <Quote className="w-8 h-8 mb-4 text-indigo-200" />
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-zinc-600">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-center w-9 h-9 text-xs font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-violet-500">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{testimonial.name}</p>
                    <p className="text-xs text-zinc-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-zinc-50" aria-labelledby="why-heading">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-teal-600">Why Choose Us</span>
            </div>
            <h2 id="why-heading" className="text-h2 text-zinc-900">
              The Premium Experience
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Package, title: "Premium Quality", desc: "Every product is carefully curated", gradient: "from-indigo-500 to-violet-500" },
              { icon: Zap, title: "Fast Delivery", desc: "2-3 business days", gradient: "from-violet-500 to-purple-500" },
              { icon: Shield, title: "Secure Payments", desc: "SSL encrypted transactions", gradient: "from-purple-500 to-pink-500" },
              { icon: Users, title: "Expert Support", desc: "24/7 dedicated help", gradient: "from-pink-500 to-rose-500" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="p-6 text-center transition-all border rounded-xl bg-white border-zinc-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
