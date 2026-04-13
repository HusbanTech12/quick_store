"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import { Filter, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sort_order") as "asc" | "desc") || "desc"
  );
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured_only") === "true");
  
  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        skip: number;
        limit: number;
        sort_by: string;
        sort_order: "asc" | "desc";
        category?: string;
        search?: string;
        min_price?: number;
        max_price?: number;
        featured_only?: boolean;
      } = {
        skip: (page - 1) * limit,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      if (featuredOnly) params.featured_only = true;

      const response = await productsAPI.getAll(params);
      setProducts(response.data);
      const totalCount = response.headers["x-total-count"];
      if (totalCount) {
        setTotal(parseInt(totalCount, 10));
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch products:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, search, minPrice, maxPrice, sortBy, sortOrder, featuredOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch categories:", error);
        }
      }
    }
    fetchCategories();
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (sortBy) params.set("sort_by", sortBy);
    if (sortOrder) params.set("sort_order", sortOrder);
    if (featuredOnly) params.set("featured_only", "true");
    params.set("page", page.toString());
    
    router.push(`/products?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("created_at");
    setSortOrder("desc");
    setFeaturedOnly(false);
    setPage(1);
    router.push("/products");
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = category || search || minPrice || maxPrice || featuredOnly || sortBy !== "created_at";

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          All Products
        </h1>
        <p className="text-muted-foreground">
          {loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Search products"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Sort by"
            >
              <option value="created_at">Newest</option>
              <option value="price">Price</option>
              <option value="title">Name</option>
              <option value="stock">Stock</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                hasActiveFilters
                  ? "border-brand bg-brand-light text-brand"
                  : "border-border hover:bg-muted"
              }`}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {category && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-sm">
                {category}
                <button onClick={() => setCategory("")} aria-label={`Remove ${category} filter`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-sm">
                Search: {search}
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {featuredOnly && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-sm">
                Featured Only
                <button onClick={() => setFeaturedOnly(false)} aria-label="Remove featured filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-sm">
                Price: ${minPrice || "0"} - ${maxPrice || "∞"}
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} aria-label="Clear price filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-down">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="category-filter">
                Category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  min="0"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  min="0"
                />
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium">Featured Only</span>
              </label>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <Button onClick={applyFilters} variant="primary" fullWidth>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPage(page - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? "bg-brand text-brand-foreground"
                        : "hover:bg-muted"
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={page === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPage(page + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          type="products"
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      )}
    </div>
  );
}
