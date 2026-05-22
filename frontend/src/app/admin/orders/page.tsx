"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ToastProvider";
import { ordersAPI } from "@/lib/api";
import type { OrderSummary } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AdminLayout from "@/components/AdminLayout";
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

function AdminOrdersContent() {
  const router = useRouter();
  const { user } = useUser();
  const { error: showError } = useToast();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
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
    if (filterStatus === "all") return true;
    return order.payment_status === filterStatus;
  });

  if (!user) {
    return <LoadingSpinner />;
  }

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
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All Orders
            </Button>
            <Button
              variant={filterStatus === "paid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("paid")}
            >
              Paid
            </Button>
            <Button
              variant={filterStatus === "pending" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "failed" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("failed")}
            >
              Failed
            </Button>
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
            {filterStatus !== "all"
              ? `No ${filterStatus} orders at the moment`
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
                  <th className="text-left px-6 py-4 text-sm font-semibold">Payment Status</th>
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
                {filterStatus !== "all" ? filterStatus : ""} orders
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
