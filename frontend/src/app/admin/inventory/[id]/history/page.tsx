"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ToastProvider";
import { inventoryAPI } from "@/lib/api";
import type { InventoryLog } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminLayout from "@/components/AdminLayout";
import {
  ArrowLeft,
  History,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  Ban,
  Filter,
} from "lucide-react";

const changeTypeIcons: Record<string, React.ReactNode> = {
  sale: <ShoppingCart className="w-4 h-4" />,
  restock: <ArrowUpRight className="w-4 h-4" />,
  return: <RotateCcw className="w-4 h-4" />,
  adjustment: <Filter className="w-4 h-4" />,
  damage: <AlertTriangle className="w-4 h-4" />,
  cancellation: <Ban className="w-4 h-4" />,
};

const changeTypeColors: Record<string, string> = {
  sale: "text-blue-600 bg-blue-50 border-blue-200",
  restock: "text-emerald-600 bg-emerald-50 border-emerald-200",
  return: "text-violet-600 bg-violet-50 border-violet-200",
  adjustment: "text-amber-600 bg-amber-50 border-amber-200",
  damage: "text-red-600 bg-red-50 border-red-200",
  cancellation: "text-orange-600 bg-orange-50 border-orange-200",
};

function HistoryContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { error: showError } = useToast();

  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await inventoryAPI.getLogs(resolvedParams.id, { limit: 100 });
      setLogs(res.data);
    } catch {
      showError("Failed to load", "Could not fetch inventory logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterType === "all" ? logs : logs.filter((log) => log.change_type === filterType);

  if (!user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/inventory")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-light rounded-xl">
              <History className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Stock History</h1>
              <p className="text-muted-foreground">Inventory change log for this product</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterType === "all" ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({logs.length})
          </button>
          {Object.keys(changeTypeIcons).map((type) => {
            const count = logs.filter((l) => l.change_type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filterType === type ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${changeTypeColors[log.change_type] || "text-muted-foreground bg-muted border-border"}`}>
                    {changeTypeIcons[log.change_type] || <Package className="w-4 h-4" />}
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize border ${changeTypeColors[log.change_type] || ""}`}>
                          {log.change_type}
                        </span>
                        <span className="text-sm font-semibold">
                          {log.quantity_change > 0 ? "+" : ""}{log.quantity_change}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="text-muted-foreground line-through">{log.previous_stock}</span>
                        <ArrowDownRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{log.new_stock}</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        {log.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No inventory changes recorded yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function InventoryHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  return <HistoryContent params={params} />;
}
