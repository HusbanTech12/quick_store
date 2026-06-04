import axios, { type AxiosResponse } from "axios";
import type {
  Product,
  ProductCreate,
  ProductImage,
  ProductUpdate,
  User,
  UserCreate,
  Token,
  Order,
  OrderCreate,
  OrderSummary,
  ProductInventory,
  InventoryLog,
  InventoryStats,
  StockAdjustment,
  BulkStockUpdateItem,
  MediaUploadResponse,
  MediaDeleteResponse,
  MediaListResponse,
  UploadStats,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const dedupCache = new Map<string, Promise<any>>();
const DEDUP_TTL = 500;

function dedup<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = dedupCache.get(key);
  if (existing) return existing;

  const promise = factory();
  dedupCache.set(key, promise);
  promise.finally(() => setTimeout(() => dedupCache.delete(key), DEDUP_TTL));
  return promise;
}

import { getClerkToken } from "./clerk-token";

// Attach token to requests if available
api.interceptors.request.use(async (config) => {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = getClerkToken();
    if (!token) {
      try {
        token = localStorage.getItem("token");
      } catch {}
    }
    if (!token) {
      try {
        const clerk = (window as any).Clerk;
        if (clerk?.session) {
          token = await clerk.session.getToken();
        }
      } catch {}
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// ========== Auth endpoints ==========

export const authAPI = {
  login: async (
    email: string,
    password: string
  ): Promise<AxiosResponse<Token>> => {
    return api.post<Token>(
      "/auth/login",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  },

  register: async (
    userData: UserCreate
  ): Promise<AxiosResponse<User>> => {
    return api.post<User>("/auth/register", userData);
  },

  me: async (): Promise<AxiosResponse<User>> => {
    return dedup("GET /auth/me", () => api.get<User>("/auth/me"));
  },
};

// ========== Users endpoints ==========

export const usersAPI = {
  getProfile: async (): Promise<AxiosResponse<User>> => {
    return dedup("GET /users/me", () => api.get<User>("/users/me"));
  },

  updateProfile: async (
    userData: { name?: string; email?: string }
  ): Promise<AxiosResponse<User>> => {
    return api.put<User>("/users/me", userData);
  },

  changePassword: async (
    passwordData: { current_password: string; new_password: string }
  ): Promise<AxiosResponse<{ message: string }>> => {
    return api.post("/users/me/change-password", passwordData);
  },

  // Admin endpoints
  getAllUsers: async (
    skip?: number,
    limit?: number
  ): Promise<AxiosResponse<User[]>> => {
    const key = "GET /users?" + JSON.stringify({ skip, limit });
    return dedup(key, () => api.get<User[]>("/users", { params: { skip, limit } }));
  },

  updateUserRole: async (
    userId: string,
    is_admin: boolean
  ): Promise<AxiosResponse<User>> => {
    return api.put<User>(`/users/${userId}/role`, null, { params: { is_admin } });
  },

  deleteUser: async (userId: string): Promise<void> => {
    return api.delete(`/users/${userId}`);
  },
};

// ========== Products endpoints ==========

export const productsAPI = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort_by?: "created_at" | "price" | "title" | "stock";
    sort_order?: "asc" | "desc";
    featured_only?: boolean;
  }): Promise<AxiosResponse<Product[]>> => {
    const key = "GET /products?" + JSON.stringify(params ?? {});
    return dedup(key, () => api.get<Product[]>("/products", { params }));
  },

  getById: async (id: string): Promise<AxiosResponse<Product>> => {
    return dedup(`GET /products/${id}`, () => api.get<Product>(`/products/${id}`));
  },

  getCategories: async (): Promise<AxiosResponse<string[]>> => {
    return dedup("GET /products/categories", () => api.get<string[]>("/products/categories"));
  },

  create: async (
    product: ProductCreate
  ): Promise<AxiosResponse<Product>> => {
    return api.post<Product>("/products", product);
  },

  update: async (
    id: string,
    product: ProductUpdate
  ): Promise<AxiosResponse<Product>> => {
    return api.put<Product>(`/products/${id}`, product);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/products/${id}`);
  },

  addImages: async (
    id: string,
    images: Array<{
      secure_url: string;
      public_id: string;
      width?: number;
      height?: number;
      resource_type: string;
      is_primary?: boolean;
      sort_order?: number;
    }>
  ): Promise<AxiosResponse<ProductImage[]>> => {
    return api.post<ProductImage[]>(`/products/${id}/images`, images);
  },
};

// ========== Orders endpoints ==========

export const ordersAPI = {
  create: async (
    order: OrderCreate
  ): Promise<AxiosResponse<Order>> => {
    return api.post<Order>("/orders", order);
  },

  getAll: async (
    skip?: number,
    limit?: number
  ): Promise<AxiosResponse<OrderSummary[]>> => {
    const key = "GET /orders?" + JSON.stringify({ skip, limit });
    return dedup(key, () => api.get<OrderSummary[]>("/orders", { params: { skip, limit } }));
  },

  getById: async (id: string): Promise<AxiosResponse<Order>> => {
    return dedup(`GET /orders/${id}`, () => api.get<Order>(`/orders/${id}`));
  },

  updateStatus: async (
    id: string,
    order_status: string
  ): Promise<AxiosResponse<Order>> => {
    return api.patch<Order>(`/orders/${id}/status`, { order_status });
  },

  // Admin endpoints
  getAllAdmin: async (
    skip?: number,
    limit?: number
  ): Promise<AxiosResponse<OrderSummary[]>> => {
    const key = "GET /orders/admin/all?" + JSON.stringify({ skip, limit });
    return dedup(key, () => api.get<OrderSummary[]>("/orders/admin/all", { params: { skip, limit } }));
  },
};

// ========== Stripe/Payment endpoints ==========

export const stripeAPI = {
  createPaymentIntent: async (
    orderData: OrderCreate
  ): Promise<AxiosResponse<{ clientSecret: string; orderId: string; amount: number }>> => {
    return api.post("/stripe/create-payment-intent", {
      order_data: orderData,
      payment_method_types: ["card"],
    });
  },

  confirmPayment: async (
    paymentIntentId: string
  ): Promise<AxiosResponse<{ status: string; orderId: string; message: string }>> => {
    return api.post("/stripe/confirm-payment", null, {
      params: { payment_intent_id: paymentIntentId },
    });
  },

  getSessionStatus: async (
    sessionId: string
  ): Promise<AxiosResponse<{ payment_status: string; session: any }>> => {
    return dedup(`GET /stripe/session-status/${sessionId}`, () => api.get(`/stripe/session-status/${sessionId}`));
  },
};

// ========== Inventory endpoints ==========

export const inventoryAPI = {
  getStats: async (): Promise<AxiosResponse<InventoryStats>> => {
    return dedup("GET /inventory/stats", () => api.get<InventoryStats>("/inventory/stats"));
  },

  getProducts: async (params?: {
    skip?: number;
    limit?: number;
    low_stock?: boolean;
    out_of_stock?: boolean;
    category?: string;
    search?: string;
  }): Promise<AxiosResponse<ProductInventory[]>> => {
    const key = "GET /inventory/products?" + JSON.stringify(params ?? {});
    return dedup(key, () => api.get<ProductInventory[]>("/inventory/products", { params }));
  },

  getLowStock: async (
    skip?: number,
    limit?: number
  ): Promise<AxiosResponse<ProductInventory[]>> => {
    const key = "GET /inventory/low-stock?" + JSON.stringify({ skip, limit });
    return dedup(key, () => api.get<ProductInventory[]>("/inventory/low-stock", { params: { skip, limit } }));
  },

  adjustStock: async (
    productId: string,
    adjustment: StockAdjustment
  ): Promise<AxiosResponse<ProductInventory>> => {
    return api.post<ProductInventory>(`/inventory/${productId}/adjust`, adjustment);
  },

  updateReorderThreshold: async (
    productId: string,
    reorder_threshold: number
  ): Promise<AxiosResponse<ProductInventory>> => {
    return api.post<ProductInventory>(`/inventory/${productId}/reorder-threshold`, { reorder_threshold });
  },

  getLogs: async (
    productId: string,
    params?: {
      skip?: number;
      limit?: number;
      change_type?: string;
    }
  ): Promise<AxiosResponse<InventoryLog[]>> => {
    const key = `GET /inventory/${productId}/logs?` + JSON.stringify(params ?? {});
    return dedup(key, () => api.get<InventoryLog[]>(`/inventory/${productId}/logs`, { params }));
  },

  bulkUpdate: async (
    items: BulkStockUpdateItem[]
  ): Promise<AxiosResponse<ProductInventory[]>> => {
    return api.post<ProductInventory[]>("/inventory/bulk-update", { items });
  },
};

// ========== Upload endpoints ==========

export const uploadAPI = {
  upload: async (
    file: File,
    folder?: string,
    product_id?: string,
    onProgress?: (percent: number) => void
  ): Promise<AxiosResponse<MediaUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    const params: Record<string, string> = {};
    if (folder) params.folder = folder;
    if (product_id) params.product_id = product_id;
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  delete: async (
    public_id: string,
    resource_type?: string
  ): Promise<AxiosResponse<MediaDeleteResponse>> => {
    return api.delete(`/upload/${public_id}`, {
      params: { resource_type: resource_type || "image" },
    });
  },

  list: async (
    folder?: string,
    max_results?: number
  ): Promise<AxiosResponse<MediaListResponse>> => {
    const key = "GET /upload/media?" + JSON.stringify({ folder: folder || "shop_pk", max_results: max_results || 100 });
    return dedup(key, () => api.get<MediaListResponse>("/upload/media", {
      params: { folder: folder || "shop_pk", max_results: max_results || 100 },
    }));
  },

  stats: async (): Promise<AxiosResponse<UploadStats>> => {
    return dedup("GET /upload/stats", () => api.get<UploadStats>("/upload/stats"));
  },
};

export default api;
