"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import type { OrderSummary, Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Package, Calendar, ShoppingBag, ArrowRight, AlertCircle, ChevronDown, ChevronRight, CheckCircle, Clock, XCircle, MapPin, CreditCard, Eye } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.06 } },
};

function getStatusBadge(status?: string) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[10px] font-medium">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-medium">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-medium">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md text-[10px] font-medium">
          <Clock className="w-3 h-3" />
          Unknown
        </span>
      );
  }
}

function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(orderId);
        setOrder(response.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-4 mt-4 border-t border-zinc-100">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Shipping Info */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-0.5">Shipping To</p>
              <p className="text-xs font-medium text-zinc-900">{order.shipping_name}</p>
              <p className="text-xs text-zinc-500">{order.shipping_address}</p>
              <p className="text-xs text-zinc-500">{order.shipping_city}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-0.5">Payment</p>
              <p className="text-xs font-medium text-zinc-900">{order.payment_status === "paid" ? "Paid" : order.payment_status}</p>
              <p className="text-xs text-zinc-500">${order.total_price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-2">Items ({order.items.length})</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50">
                <div className="w-10 h-10 rounded-md overflow-hidden border border-zinc-200 bg-white flex-shrink-0">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-900 truncate">{item.product.title}</p>
                  <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-semibold text-zinc-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* View Full Details */}
        <Link href={`/orders/${order.id}`}>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            View Full Details
            <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto px-6 max-w-7xl lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-1">My Orders</h1>
          <p className="text-sm text-zinc-500">Track and manage your order history</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white border border-zinc-200 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Failed to Load Orders</h3>
            <p className="text-sm text-zinc-500">{error}</p>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white border border-zinc-200 rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No Orders Yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
              Start shopping to see your orders here. Browse our collection of premium products.
            </p>
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            {orders.map((order) => (
              <motion.div key={order.id} variants={fadeInUp}>
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="w-full text-left"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left - Order Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 flex-shrink-0">
                            <Package className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900 truncate">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </h3>
                              {getStatusBadge(order.payment_status)}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(order.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <ShoppingBag className="w-3 h-3" />
                                <span>
                                  {order.item_count} {order.item_count === 1 ? "item" : "items"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right - Price & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-zinc-900">${order.total_price.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400">Total</p>
                          </div>
                          <Link
                            href={`/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-zinc-400" />
                          </Link>
                          <ChevronDown
                            className={`w-4 h-4 text-zinc-400 transition-transform ${
                              expandedOrderId === order.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <div className="px-5 pb-5">
                        <OrderDetails orderId={order.id} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
