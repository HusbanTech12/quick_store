"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { ordersAPI } from "@/lib/api";
import type { OrderSummary } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AdminLayout from "@/components/AdminLayout";
import {
  ShoppingBag,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Package,
  Truck,
  Ban,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

function AdminOrdersContent() {
  const router = useRouter();
  const { error: showError } = useToast();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAllAdmin(0, 50);
      setOrders(response.data);
    } catch (err) {
      showError("Failed to load orders", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
    } catch {
      showError("Status update failed", "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
            <RefreshCw className="w-4 h-4" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-sm font-semibold">
            <Package className="w-4 h-4" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-semibold">
            <Truck className="w-4 h-4" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-full text-sm font-semibold">
            <Ban className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Unknown
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterPayment !== "all" && order.payment_status !== filterPayment) return false;
    if (filterOrderStatus !== "all" && order.order_status !== filterOrderStatus) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Order Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium self-center">Payment:</span>
              <Button
                variant={filterPayment === "all" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilterPayment("all")}
              >
                All
              </Button>
              <Button
                variant={filterPayment === "paid" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilterPayment("paid")}
              >
                Paid
              </Button>
              <Button
                variant={filterPayment === "pending" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilterPayment("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterPayment === "failed" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilterPayment("failed")}
              >
                Failed
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-4">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={filterOrderStatus === status ? "primary" : "ghost"}
                  size="xs"
                  onClick={() => setFilterOrderStatus(status)}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {filterPayment !== "all"
              ? `No ${filterPayment} orders at the moment`
              : "No orders have been placed yet"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Items</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">
                        {order.item_count} {order.item_count === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-brand">
                        ${order.total_price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`appearance-none px-3 py-1.5 pr-8 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer disabled:opacity-50 ${
                          {
                            pending: "bg-warning/10 text-warning border-warning/30",
                            processing: "bg-blue-50 text-blue-600 border-blue-200",
                            shipped: "bg-violet-50 text-violet-600 border-violet-200",
                            delivered: "bg-success/10 text-success border-success/30",
                            cancelled: "bg-error/10 text-error border-error/30",
                          }[order.order_status] || "bg-muted text-muted-foreground border-border"
                        }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60" />
                        {updatingId === order.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/orders/${order.id}`)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          View
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredOrders.length}</span>{" "}
                {filterPayment !== "all" ? filterPayment : ""} orders
              </p>
              <p className="text-sm font-semibold">
                Total Revenue:{" "}
                <span className="text-brand text-lg">
                  ${filteredOrders.reduce((sum, order) => sum + order.total_price, 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  );
}
