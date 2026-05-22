// User types
export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: "bearer";
}

// Product types
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  is_featured?: boolean;
  created_at: string;
}

export interface ProductCreate {
  title: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  is_featured?: boolean;
}

export interface ProductUpdate {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  stock?: number;
  is_featured?: boolean;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order types
export interface OrderItemCreate {
  product_id: string;
  quantity: number;
  price?: number; // optional, can be derived from product
}

export interface OrderCreate {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_email: string;
  items: OrderItemCreate[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_email: string;
  payment_status?: string;
  stripe_session_id?: string;
}

export interface OrderSummary {
  id: string;
  user_id?: string;
  total_price: number;
  created_at: string;
  item_count: number;
  payment_status?: string;
}

// API response wrappers
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Inventory types
export interface ProductInventory {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  reorder_threshold: number;
  is_active: boolean;
  image?: string;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  change_type: "sale" | "restock" | "return" | "adjustment" | "damage" | "cancellation";
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  reference_id?: string;
  created_at: string;
}

export interface InventoryStats {
  total_products: number;
  total_stock_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  overstock_count: number;
}

export interface StockAdjustment {
  quantity_change: number;
  change_type: "restock" | "adjustment" | "return" | "damage" | "cancellation";
  notes?: string;
}

export interface BulkStockUpdateItem {
  product_id: string;
  stock: number;
  reorder_threshold?: number;
}
