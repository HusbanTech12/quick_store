"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { OrderSummary } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import AuthGuard from "@/components/AuthGuard";
import { Package, Calendar, DollarSign, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";

function OrdersContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll(0, 20);
        setOrders(response.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch orders";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
            My Orders
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Track and manage your order history
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-rose-700 dark:text-rose-300 mb-2">
              Failed to Load Orders
            </h3>
            <p className="text-rose-600 dark:text-rose-400">{error}</p>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center shadow-lg"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              No Orders Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Start shopping to see your orders here. Browse our collection of premium products.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/orders/${order.id}`}>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Left Section - Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(order.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <ShoppingBag className="w-4 h-4" />
                                <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Price & Action */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">Total</span>
                          </div>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">
                            ${order.total_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Mobile View Details Button */}
                    <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth>
      <OrdersContent />
    </AuthGuard>
  );
}
