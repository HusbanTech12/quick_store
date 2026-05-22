"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  Warehouse,
  Image as ImageIcon,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Uploads",
    href: "/admin/uploads",
    icon: ImageIcon,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Shop.pk</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-brand text-white shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Back to Store */}
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Store</span>
            </Link>

            {/* User Info */}
            {user && (
              <div className="mt-auto pt-6">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.emailAddresses[0]?.emailAddress}</p>
                  <SignOutButton>
                    <button className="mt-3 flex items-center gap-2 text-sm text-error hover:underline">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </SignOutButton>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
