"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AuthGuard from "@/components/AuthGuard";
import AdminLayout from "@/components/AdminLayout";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Box,
} from "lucide-react";

function AdminProductsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: showError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({
        limit: 50,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      setProducts(response.data);
    } catch (err) {
      showError("Failed to load products", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      success("Product deleted", `${productTitle} has been removed`);
      fetchProducts();
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to delete product";
      showError("Delete failed", message);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProducts();
  };

  if (!user || !user.is_admin) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Product Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/admin/products/new")}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search Products</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name or description..."
                className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Search
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="relative">
              {categoriesLoading ? (
                <div className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted animate-pulse">
                  <span className="text-muted-foreground">Loading categories...</span>
                </div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setLoading(true);
                    fetchProducts();
                  }}
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-card text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No categories available
                    </option>
                  )}
                </select>
              )}
              {!categoriesLoading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory
              ? "Try adjusting your filters"
              : "Get started by adding your first product"}
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/admin/products/new")}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Add Product
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{product.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-brand-light text-brand text-sm font-medium rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? "text-error"
                            : product.stock <= 5
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_featured && (
                        <span className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          leftIcon={<Edit2 className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.title)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="text-error hover:text-error hover:bg-error/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t border-border px-6 py-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span>{" "}
              products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AuthGuard requireAuth requireAdmin>
      <AdminLayout>
        <AdminProductsContent />
      </AdminLayout>
    </AuthGuard>
  );
}
