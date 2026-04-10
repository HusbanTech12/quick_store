"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders/" + params.id);
      return;
    }
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(params.id);
        setOrder(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, router, params.id]);

  if (!user) return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Order #{order.id.slice(0, 8)}</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">Shipping Information</h2>
        <p>{order.shipping_name}</p>
        <p>{order.shipping_address}</p>
        <p>{order.shipping_city}</p>
        <p>{order.shipping_email}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left">Product</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.product.title}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">${item.price.toFixed(2)}</td>
                <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right font-bold text-lg">
          Total: ${order.total_price.toFixed(2)}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Order placed on: {new Date(order.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
