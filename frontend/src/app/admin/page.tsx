"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import AdminLayout from "@/components/AdminLayout";
import { inventoryAPI, ordersAPI } from "@/lib/api";
import type { InventoryStats } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Warehouse,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          inventoryAPI.getStats(),
          ordersAPI.getAllAdmin(0, 1),
        ]);
        setInventoryStats(statsRes.data);
        setOrderCount(ordersRes.data.length > 0 ? ordersRes.headers["x-total-count"] ? parseInt(ordersRes.headers["x-total-count"]) : 0 : 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const adminSections = [
    {
      title: "Products",
      description: "Manage your product catalog",
      icon: Package,
      href: "/admin/products",
      color: "brand",
      stats: "Manage inventory",
    },
    {
      title: "Inventory",
      description: "Track stock levels and adjustments",
      icon: Warehouse,
      href: "/admin/inventory",
      color: "accent",
      stats: inventoryStats ? `${inventoryStats.low_stock_count} low stock alerts` : "View stock levels",
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "success",
      stats: "Track sales",
    },
    {
      title: "Users",
      description: "Manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "brand",
      stats: "View customers",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-light rounded-xl">
            <ShieldAlert className="w-8 h-8 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, Admin
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-brand-light rounded-lg">
              <DollarSign className="w-5 h-5 text-brand" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-0.5">${inventoryStats?.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}</h3>
          <p className="text-xs text-muted-foreground">Stock Value</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-accent-light rounded-lg">
              <ShoppingBag className="w-5 h-5 text-accent" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-0.5">{orderCount || "—"}</h3>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>

        <div className="bg-card border border-amber-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-0.5 text-amber-600">{inventoryStats?.low_stock_count || 0}</h3>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </div>

        <div className="bg-card border border-red-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-0.5 text-red-600">{inventoryStats?.out_of_stock_count || 0}</h3>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.href}
                onClick={() => router.push(section.href)}
                className="bg-card border border-border rounded-xl shadow-sm p-5 hover:border-brand transition-all cursor-pointer group hover:shadow-lg"
              >
                <div className={`p-2.5 bg-${section.color}-light rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${section.color}`} />
                </div>
                <h3 className="text-base font-bold mb-1">{section.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
                <p className="text-xs font-medium text-brand">{section.stats} →</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-brand to-accent rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/products/new")}
            className="bg-white text-brand hover:bg-white/90 border-white text-sm"
          >
            Add New Product
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/inventory")}
            className="bg-white text-brand hover:bg-white/90 border-white text-sm"
          >
            Manage Inventory
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/orders")}
            className="bg-white text-brand hover:bg-white/90 border-white text-sm"
          >
            View Orders
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
