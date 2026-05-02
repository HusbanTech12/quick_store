from sqlalchemy.orm import Session
<<<<<<< HEAD
from sqlalchemy import func, asc, desc
=======
from sqlalchemy import desc, asc, or_
>>>>>>> daea38e (Stripe Integration Successfully)
from typing import List, Optional, Tuple
import bcrypt
import uuid
<<<<<<< HEAD
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
=======


# ========== User CRUD ==========

def get_user(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = models.User(
        id=uuid.uuid4(),
        email=user.email,
        name=user.name,
        hashed_password=hashed_password.decode('utf-8'),
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: uuid.UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email

    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_password(db: Session, user_id: uuid.UUID, new_password: str) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    db_user.hashed_password = hashed_password.decode('utf-8')

    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# ========== Product CRUD ==========

def get_product(db: Session, product_id: uuid.UUID) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


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
    featured_only: bool = False
) -> Tuple[List[models.Product], int]:
    query = db.query(models.Product)

    # Apply filters
    if category:
        query = query.filter(models.Product.category == category)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if search:
        query = query.filter(
            or_(
                models.Product.title.ilike(f"%{search}%"),
                models.Product.description.ilike(f"%{search}%")
            )
        )
    if featured_only:
        query = query.filter(models.Product.is_featured == True)

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_column = getattr(models.Product, sort_by, models.Product.created_at)
    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Apply pagination
    products = query.offset(skip).limit(limit).all()

    return products, total


def get_categories(db: Session) -> List[str]:
    categories = db.query(models.Product.category).distinct().all()
    return [cat[0] for cat in categories]


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(
        id=uuid.uuid4(),
        **product.model_dump()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(
    db: Session,
    product_id: uuid.UUID,
    product_update: schemas.ProductUpdate
) -> Optional[models.Product]:
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: uuid.UUID) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False

    db.delete(db_product)
    db.commit()
    return True


# ========== Order CRUD ==========

def get_order(db: Session, order_id: uuid.UUID) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[uuid.UUID] = None
) -> List[models.Order]:
    query = db.query(models.Order)

    if user_id:
        query = query.filter(models.Order.user_id == user_id)

    return query.order_by(desc(models.Order.created_at)).offset(skip).limit(limit).all()


def create_order(db: Session, order: schemas.OrderCreate, user_id: Optional[uuid.UUID] = None) -> models.Order:
    # Calculate total and validate stock
>>>>>>> daea38e (Stripe Integration Successfully)
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

    # Create order
    db_order = models.Order(
        id=uuid.uuid4(),
        user_id=user_id,
        total_price=total,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_email=order.shipping_email,
<<<<<<< HEAD
        stripe_session_id=None,
        payment_status="pending",
    )
    db.add(db_order)
    db.flush()
    for itm in order_items:
=======
        payment_status="pending"
    )
    db.add(db_order)
    db.flush()

    # Create order items and reduce stock
    for item_data in order_items:
>>>>>>> daea38e (Stripe Integration Successfully)
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


<<<<<<< HEAD
def update_order_payment_status(db: Session, order_id: uuid.UUID, payment_status: str, stripe_session_id: Optional[str] = None):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
=======
# ========== Payment-Related CRUD ==========

def update_order_payment_status(
    db: Session,
    order_id: uuid.UUID,
    payment_status: str,
    stripe_session_id: Optional[str] = None
) -> models.Order:
    order = get_order(db, order_id)
>>>>>>> daea38e (Stripe Integration Successfully)
    if not order:
        raise ValueError("Order not found")
    order.payment_status = payment_status
    if stripe_session_id:
        order.stripe_session_id = stripe_session_id
    db.commit()
    db.refresh(order)
    return order


<<<<<<< HEAD
def get_order_by_stripe_session(db: Session, stripe_session_id: str):
=======
def get_order_by_stripe_session(db: Session, stripe_session_id: str) -> Optional[models.Order]:
>>>>>>> daea38e (Stripe Integration Successfully)
    return db.query(models.Order).filter(models.Order.stripe_session_id == stripe_session_id).first()
