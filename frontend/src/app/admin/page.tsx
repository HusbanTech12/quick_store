"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import AuthGuard from "@/components/AuthGuard";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  ShieldAlert
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  // AuthGuard ensures user exists, but add defensive check for TypeScript
  if (!user) return null;

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
      title: "Orders",
      description: "View and manage customer orders",
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "accent",
      stats: "Track sales",
    },
    {
      title: "Users",
      description: "Manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "success",
      stats: "View customers",
    },
  ];

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
              Welcome back, {user.name}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-light rounded-lg">
              <TrendingUp className="w-6 h-6 text-brand" />
            </div>
            <span className="text-sm text-success font-semibold">+12%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">$12,345</h3>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent-light rounded-lg">
              <ShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm text-success font-semibold">+8%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">156</h3>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-light rounded-lg">
              <Users className="w-6 h-6 text-success" />
            </div>
            <span className="text-sm text-success font-semibold">+24%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">1,234</h3>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.href}
                onClick={() => router.push(section.href)}
                className="bg-card border border-border rounded-xl shadow-sm p-6 hover:border-brand transition-all cursor-pointer group hover:shadow-lg"
              >
                <div className={`p-3 bg-${section.color}-light rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 text-${section.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                <p className="text-sm font-semibold text-brand">{section.stats} →</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-brand to-accent rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/products/new")}
            className="bg-white text-brand hover:bg-white/90 border-white"
          >
            Add New Product
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/orders")}
            className="bg-white text-brand hover:bg-white/90 border-white"
          >
            View Recent Orders
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/users")}
            className="bg-white text-brand hover:bg-white/90 border-white"
          >
            Manage Users
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAuth requireAdmin>
      <AdminDashboardContent />
    </AuthGuard>
  );
}
