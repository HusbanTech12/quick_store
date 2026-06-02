"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { inventoryAPI, productsAPI } from "@/lib/api";
import type { ProductInventory, InventoryStats, StockAdjustment } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminLayout from "@/components/AdminLayout";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  History,
  Edit2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InventoryContent() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "out">("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState(0);
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; product: ProductInventory | null }>({
    open: false,
    product: null,
  });
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<StockAdjustment["change_type"]>("restock");
  const [adjustNotes, setAdjustNotes] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        inventoryAPI.getStats(),
        inventoryAPI.getProducts({ limit: 200 }),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
    } catch {
      showError("Failed to load", "Could not fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      setCategories(res.data);
    } catch {
      // silently fail
    }
  };

  const filteredProducts = products.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (filterStatus === "low" && (p.stock === 0 || p.stock > p.reorder_threshold)) return false;
    if (filterStatus === "out" && p.stock !== 0) return false;
    return true;
  });

  const handleAdjustStock = async () => {
    if (!adjustModal.product || !adjustQty) return;
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty === 0) {
      showError("Invalid quantity", "Please enter a valid number");
      return;
    }

    try {
      const change = adjustType === "restock" || adjustType === "return" ? Math.abs(qty) : -Math.abs(qty);
      await inventoryAPI.adjustStock(adjustModal.product.id, {
        quantity_change: change,
        change_type: adjustType,
        notes: adjustNotes || undefined,
      });
      success("Stock updated", `Stock adjusted by ${change > 0 ? "+" : ""}${change}`);
      setAdjustModal({ open: false, product: null });
      setAdjustQty("");
      setAdjustNotes("");
      fetchInventory();
    } catch (err: any) {
      showError("Update failed", err?.response?.data?.detail || "Could not adjust stock");
    }
  };

  const handleUpdateThreshold = async (productId: string) => {
    try {
      await inventoryAPI.updateReorderThreshold(productId, editThreshold);
      success("Threshold updated", "Reorder threshold has been updated");
      setEditingId(null);
      fetchInventory();
    } catch (err: any) {
      showError("Update failed", err?.response?.data?.detail || "Could not update threshold");
    }
  };

  const getStockStatus = (product: ProductInventory) => {
    if (product.stock === 0) return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    if (product.stock <= product.reorder_threshold) return { label: "Low Stock", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "In Stock", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, adjust quantities, and manage reorder thresholds</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Products</span>
              </div>
              <p className="text-2xl font-bold">{stats.total_products}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Stock Value</span>
              </div>
              <p className="text-2xl font-bold">${stats.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-card border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-600">Low Stock</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.low_stock_count}</p>
            </div>
            <div className="bg-card border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600">Out of Stock</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.out_of_stock_count}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Overstock</span>
              </div>
              <p className="text-2xl font-bold">{stats.overstock_count}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["all", "low", "out"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterStatus === status
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "all" ? "All" : status === "low" ? "Low Stock" : "Out of Stock"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reorder Level</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img src={product.image} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <span className="text-sm font-medium text-foreground max-w-[200px] truncate">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${
                          product.stock === 0 ? "text-red-600" : product.stock <= product.reorder_threshold ? "text-amber-600" : "text-foreground"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editThreshold}
                              onChange={(e) => setEditThreshold(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand"
                              min={0}
                            />
                            <button onClick={() => handleUpdateThreshold(product.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{product.reorder_threshold}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAdjustModal({ open: true, product })}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Adjust Stock"
                          >
                            {product.stock <= product.reorder_threshold ? (
                              <Plus className="w-4 h-4 text-amber-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => { setEditingId(product.id); setEditThreshold(product.reorder_threshold); }}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Edit Reorder Level"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/inventory/${product.id}/history`)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="View History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          )}

          <div className="border-t border-border px-4 py-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of {products.length} products
            </p>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {adjustModal.open && adjustModal.product && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setAdjustModal({ open: false, product: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-border"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">Adjust Stock</h3>
                <p className="text-sm text-muted-foreground mb-4">{adjustModal.product.title}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Change Type</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as StockAdjustment["change_type"])}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="restock">Restock (Add)</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="return">Return</option>
                      <option value="damage">Damage (Remove)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdjustQty(String(Math.max(0, parseInt(adjustQty) - 1 || 0)))}
                        className="p-2 border border-border rounded-lg hover:bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={adjustQty}
                        onChange={(e) => setAdjustQty(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        min={1}
                        placeholder="0"
                      />
                      <button
                        onClick={() => setAdjustQty(String((parseInt(adjustQty) || 0) + 1))}
                        className="p-2 border border-border rounded-lg hover:bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Current stock: {adjustModal.product.stock}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
                    <input
                      type="text"
                      value={adjustNotes}
                      onChange={(e) => setAdjustNotes(e.target.value)}
                      placeholder="Reason for adjustment..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setAdjustModal({ open: false, product: null })}
                    className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdjustStock}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

export default function InventoryPage() {
  return <InventoryContent />;
}
