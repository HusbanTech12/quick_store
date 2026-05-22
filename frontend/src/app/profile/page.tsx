"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useToast } from "@/components/ToastProvider";
import { ordersAPI } from "@/lib/api";
import type { OrderSummary } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Package,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function ProfileContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { success } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login?redirect_url=" + encodeURIComponent("/profile"));
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll(0, 5);
        setOrders(response.data);
      } catch {
        // silently fail
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto px-6 max-w-7xl lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-1">My Profile</h1>
          <p className="text-sm text-zinc-500">Manage your account settings</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white border border-zinc-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center overflow-hidden">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{user.fullName}</h2>
                  <p className="text-sm text-zinc-500">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>{user.emailAddresses[0]?.emailAddress}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2">
                <Link href="/orders">
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      My Orders
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                </Link>
                <SignOutButton>
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </button>
                </SignOutButton>
              </div>
            </motion.div>

            {/* Security Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="bg-white border border-zinc-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Security</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Manage your password and security settings through your account dashboard.</p>
              <Link href="https://accounts.clerk.dev/user/settings">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Recent Orders */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.15 }}
              className="bg-white border border-zinc-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                    <Package className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900">Recent Orders</h3>
                </div>
                <Link href="/orders">
                  <span className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View All</span>
                </Link>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100">
                            <Package className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-zinc-500">
                              {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-semibold text-zinc-900">${order.total_price.toFixed(2)}</p>
                          <ArrowRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 mb-4">No orders yet</p>
                  <Link href="/products">
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                      Start Shopping
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
