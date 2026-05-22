"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import type { Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Package, MapPin, CreditCard, CheckCircle, Clock, XCircle, ArrowLeft, Mail, User, ChevronRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
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
  }, [isLoaded, user, router, resolvedParams.id]);

  if (!isLoaded) return null;
  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8 py-16 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white border border-zinc-200 rounded-xl p-12 max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-6 h-6 text-zinc-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Order Not Found</h2>
            <p className="text-sm text-zinc-500 mb-6">{error}</p>
            <button
              onClick={() => router.push("/orders")}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto px-6 max-w-7xl lg:px-8 py-8 lg:py-12">
        {/* Back Button */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </motion.button>

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Order Details</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Order ID: <span className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            {getStatusBadge(order.payment_status)}
          </div>
          <p className="text-xs text-zinc-400">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </motion.div>

        {/* Status Alerts */}
        {order.payment_status === "pending" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900">Payment Pending</h3>
                <p className="text-xs text-amber-700 mt-0.5">Your payment is being processed. This may take a few minutes.</p>
              </div>
            </div>
          </motion.div>
        )}

        {order.payment_status === "failed" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">Payment Failed</h3>
                <p className="text-xs text-red-700 mt-0.5">There was an issue processing your payment. Please contact support.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping & Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Shipping Information */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white border border-zinc-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-900">Shipping Info</h2>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-zinc-900">{order.shipping_name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-500">{order.shipping_email}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-zinc-500">
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="bg-white border border-zinc-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-900">Order Summary</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Items</span>
                  <span className="font-medium text-zinc-900">{order.items.length}</span>
                </div>
                <div className="border-t border-zinc-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-900">Total</span>
                    <span className="text-lg font-bold text-zinc-900">${order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Items */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                <Package className="w-4 h-4 text-zinc-500" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">Order Items</h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${index}`}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex gap-4 pb-4 border-b border-zinc-100 last:border-0 last:pb-0"
                >
                  <div className="w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 line-clamp-2">{item.product.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>${item.price.toFixed(2)} each</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 mt-1">
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
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <Link href="/products">
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20">
              Continue Shopping
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
