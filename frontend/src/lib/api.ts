import axios, { type AxiosResponse } from "axios";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  User,
  UserCreate,
  Token,
  Order,
  OrderCreate,
  OrderSummary,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        // Only redirect if not already on login/register pages
        const path = window.location.pathname;
        if (!["/login", "/register"].includes(path)) {
          window.location.href = "/login";
        }
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
    return api.get<User>("/auth/me");
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
    return api.get<Product[]>("/products", { params });
  },

  getById: async (id: string): Promise<AxiosResponse<Product>> => {
    return api.get<Product>(`/products/${id}`);
  },

  getCategories: async (): Promise<AxiosResponse<string[]>> => {
    return api.get<string[]>("/products/categories");
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
    return api.get<OrderSummary[]>("/orders", { params: { skip, limit } });
  },

  getById: async (id: string): Promise<AxiosResponse<Order>> => {
    return api.get<Order>(`/orders/${id}`);
  },
};

export default api;
