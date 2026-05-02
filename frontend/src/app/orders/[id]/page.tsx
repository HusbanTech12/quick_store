"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { Package, MapPin, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

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
  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-error text-lg">{error}</p>
        <Button variant="primary" onClick={() => router.push("/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }
  if (!order) return null;

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

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Order Details
          </h1>
          {getPaymentStatusBadge(order.payment_status)}
        </div>
        <p className="text-muted-foreground">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Payment Status Alert */}
      {order.payment_status === "pending" && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning mb-1">Payment Pending</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is being processed. This may take a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {order.payment_status === "failed" && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-error mt-0.5" />
            <div>
              <h3 className="font-semibold text-error mb-1">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">
                There was an issue processing your payment. Please contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Information */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-light rounded-lg">
            <MapPin className="w-5 h-5 text-brand" />
          </div>
          <h2 className="text-xl font-bold">Shipping Information</h2>
        </div>
        <div className="space-y-1 text-muted-foreground">
          <p className="font-semibold text-foreground">{order.shipping_name}</p>
          <p>{order.shipping_email}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent-light rounded-lg">
            <Package className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold">Order Items</h2>
        </div>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">{item.product.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm font-medium">
                  ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Order Total</span>
            <span className="text-2xl font-bold text-brand">${order.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
          fullWidth
        >
          Back to Orders
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push("/products")}
          fullWidth
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
