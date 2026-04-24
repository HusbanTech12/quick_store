from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
from typing import List, Optional, Tuple
import bcrypt
import uuid
from datetime import datetime

from . import models, schemas

# -------------------- User CRUD --------------------

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Return a User model instance matching the given email, or None."""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    """Fetch a user by primary key UUID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user_data: schemas.UserCreate) -> models.User:
    """Create a new user, hashing the password with bcrypt."""
    hashed = bcrypt.hashpw(user_data.password.encode("utf-8"), bcrypt.gensalt())
    db_user = models.User(
        id=uuid.uuid4(),
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed.decode("utf-8"),
        is_admin=False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against a stored bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# -------------------- Product CRUD --------------------

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    featured_only: bool = False,
) -> Tuple[List[models.Product], int]:
    """Return a list of products with pagination, filters and total count.

    The query supports optional category, price range, free‑text search on title/description,
    sorting by a whitelist of fields, and a flag to return only featured products.
    """
    query = db.query(models.Product)

    if category:
        query = query.filter(models.Product.category == category)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if featured_only:
        query = query.filter(models.Product.is_featured.is_(True))
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            func.lower(models.Product.title).like(pattern) |
            func.lower(models.Product.description).like(pattern)
        )

    total = query.count()

    # Apply sorting – only allow safe column names
    sort_column = getattr(models.Product, sort_by, None)
    if sort_column is not None:
        order_func = desc if sort_order.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column))

    items = query.offset(skip).limit(limit).all()
    return items, total


def get_product(db: Session, product_id: uuid.UUID) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, product_data: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(
        id=uuid.uuid4(),
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        image=product_data.image,
        stock=product_data.stock,
        is_featured=product_data.is_featured,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(
    db: Session,
    product_id: uuid.UUID,
    product_update: schemas.ProductUpdate,
) -> Optional[models.Product]:
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        return None
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: uuid.UUID) -> bool:
    result = db.query(models.Product).filter(models.Product.id == product_id).delete()
    db.commit()
    return bool(result)


def get_categories(db: Session) -> List[str]:
    """Return a list of distinct product categories."""
    categories = db.query(models.Product.category).distinct().order_by(models.Product.category).all()
    return [c[0] for c in categories]

# -------------------- Order CRUD --------------------

def create_order(db: Session, order: schemas.OrderCreate, user_id: Optional[uuid.UUID] = None) -> models.Order:
    """Create a new order without payment integration (used by the public endpoint).
    Delegates to the existing payment helper for consistency.
    """
    return create_order_with_payment(db, order, user_id)


def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[uuid.UUID] = None,
) -> List[models.Order]:
    query = db.query(models.Order)
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
    return query.offset(skip).limit(limit).all()


def get_order(db: Session, order_id: uuid.UUID) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()

# -------------------- Payment‑related CRUD (existing) --------------------

def create_order_with_payment(db: Session, order: schemas.OrderCreate, user_id: Optional[uuid.UUID] = None) -> models.Order:
    total = 0.0
    order_items = []
    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise ValueError(f"Insufficient stock for product {product.title}")
        price = item.price if item.price is not None else product.price
        total += price * item.quantity
        order_items.append({"product_id": item.product_id, "quantity": item.quantity, "price": price})

    db_order = models.Order(
        id=uuid.uuid4(),
        user_id=user_id,
        total_price=total,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_email=order.shipping_email,
        stripe_session_id=None,
        payment_status="pending",
    )
    db.add(db_order)
    db.flush()
    for itm in order_items:
        db_item = models.OrderItem(
            id=uuid.uuid4(),
            order_id=db_order.id,
            product_id=itm["product_id"],
            quantity=itm["quantity"],
            price=itm["price"],
        )
        db.add(db_item)
        # Decrease product stock
        prod = get_product(db, itm["product_id"])
        prod.stock -= itm["quantity"]
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order_payment_status(db: Session, order_id: uuid.UUID, payment_status: str, stripe_session_id: Optional[str] = None):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    order.payment_status = payment_status
    if stripe_session_id:
        order.stripe_session_id = stripe_session_id
    db.commit()
    db.refresh(order)
    return order


def get_order_by_stripe_session(db: Session, stripe_session_id: str):
    return db.query(models.Order).filter(models.Order.stripe_session_id == stripe_session_id).first()
