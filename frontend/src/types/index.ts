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

// Product Image types
export interface ProductImage {
  id: string;
  product_id: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  resource_type: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
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
  images: ProductImage[];
}

export interface ProductCreate {
  title: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  is_featured?: boolean;
  images?: Array<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    resource_type: string;
    is_primary?: boolean;
    sort_order?: number;
  }>;
}

export interface ProductUpdate {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  stock?: number;
  is_featured?: boolean;
  images?: Array<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    resource_type: string;
    is_primary?: boolean;
    sort_order?: number;
  }>;
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
  price?: number;
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
  order_status: string;
}

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

// Media/Upload types
export interface MediaUploadResponse {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  resource_type: string;
  format?: string;
  bytes?: number;
}

export interface MediaDeleteResponse {
  success: boolean;
  public_id: string;
}

export interface MediaItem {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  resource_type: string;
  format?: string;
  bytes?: number;
  created_at?: string;
}

export interface MediaListResponse {
  images: MediaItem[];
  total_count: number;
}

export interface UploadStats {
  total_images: number;
  total_products_with_images: number;
  total_gallery_images: number;
}
