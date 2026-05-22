from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
import uuid


# ========== User Schemas ==========

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: uuid.UUID
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ========== Product Schemas ==========

class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    image: Optional[str] = Field(None, max_length=500)
    stock: int = Field(0, ge=0)
    is_featured: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    image: Optional[str] = Field(None, max_length=500)
    stock: Optional[int] = Field(None, ge=0)
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: uuid.UUID
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Order Item Schemas ==========

class OrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    price: Optional[float] = None


class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    order_id: uuid.UUID
    price: float

    class Config:
        from_attributes = True


class OrderItemNested(OrderItemBase):
    price: float
    product: ProductResponse

    class Config:
        from_attributes = True


# ========== Order Schemas ==========

class OrderBase(BaseModel):
    shipping_name: str = Field(..., min_length=1)
    shipping_address: str = Field(..., min_length=1)
    shipping_city: str = Field(..., min_length=1)
    shipping_email: EmailStr
    items: List[OrderItemCreate] = []


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    shipping_name: Optional[str] = Field(None, min_length=1)
    shipping_address: Optional[str] = Field(None, min_length=1)
    shipping_city: Optional[str] = Field(None, min_length=1)
    shipping_email: Optional[EmailStr] = None


class OrderResponse(OrderBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    total_price: float
    created_at: datetime
    items: List[OrderItemNested] = []
    payment_status: Optional[str] = "pending"
    order_status: str = "pending"
    stripe_session_id: Optional[str] = None

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    total_price: float
    created_at: datetime
    item_count: int
    payment_status: Optional[str] = "pending"
    order_status: str = "pending"

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    order_status: str = Field(..., pattern="^(pending|processing|shipped|delivered|cancelled)$")


# ========== Inventory Schemas ==========

class InventoryLogResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    change_type: str
    quantity_change: int
    previous_stock: int
    new_stock: int
    notes: Optional[str] = None
    reference_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StockAdjustment(BaseModel):
    quantity_change: int = Field(..., description="Positive to add stock, negative to remove")
    change_type: str = Field(..., pattern="^(restock|adjustment|return|damage|cancellation)$")
    notes: Optional[str] = None


class BulkStockUpdateItem(BaseModel):
    product_id: uuid.UUID
    stock: int = Field(..., ge=0)
    reorder_threshold: Optional[int] = Field(None, ge=0)


class BulkStockUpdate(BaseModel):
    items: List[BulkStockUpdateItem]


class InventoryStats(BaseModel):
    total_products: int
    total_stock_value: float
    low_stock_count: int
    out_of_stock_count: int
    overstock_count: int


class ProductInventoryResponse(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    price: float
    stock: int
    reorder_threshold: int
    is_active: bool
    image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
