"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { Package, MapPin, CreditCard, CheckCircle, Clock, XCircle, ArrowLeft, Mail, User } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders/" + resolvedParams.id);
      return;
    }
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(resolvedParams.id);
        setOrder(response.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Order not found";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, router, resolvedParams.id]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20">
        <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 shadow-xl"
          >
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Order Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">{error}</p>
            <Button variant="primary" onClick={() => router.push("/orders")} fullWidth>
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-bold shadow-sm">
            <CheckCircle className="w-5 h-5" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-bold shadow-sm">
            <Clock className="w-5 h-5" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-bold shadow-sm">
            <XCircle className="w-5 h-5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm">
            <Clock className="w-5 h-5" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Orders</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                Order Details
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Order ID: <span className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            {getPaymentStatusBadge(order.payment_status)}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </motion.div>

        {/* Payment Status Alert */}
        {order.payment_status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-1 text-lg">Payment Pending</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Your payment is being processed. This may take a few minutes.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {order.payment_status === "failed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 dark:text-rose-300 mb-1 text-lg">Payment Failed</h3>
                <p className="text-sm text-rose-700 dark:text-rose-400">
                  There was an issue processing your payment. Please contact support.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shipping Info</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.shipping_name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">{order.shipping_email}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Summary</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Items</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.items.length}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ${order.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl">
                <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Items</h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
                >
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {item.product.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>${item.price.toFixed(2)} each</span>
                    </div>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/orders")}
            fullWidth
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/products")}
            fullWidth
            size="lg"
          >
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
