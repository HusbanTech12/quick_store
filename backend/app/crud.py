from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional, Tuple
from . import models, schemas
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ========== User CRUD ==========

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


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

    if featured_only:
        query = query.filter(models.Product.is_featured == True)

    if category:
        query = query.filter(models.Product.category == category)

    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)

    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    if search:
        query = query.filter(models.Product.title.ilike(f"%{search}%"))

    # Sorting
    sort_column = getattr(models.Product, sort_by, models.Product.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    total = query.count()
    products = query.offset(skip).limit(limit).all()

    return products, total


def get_categories(db: Session) -> List[str]:
    categories = db.query(models.Product.category).distinct().all()
    return [cat[0] for cat in categories]


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.model_dump())
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

def create_order(db: Session, order: schemas.OrderCreate, user_id: Optional[uuid.UUID] = None) -> models.Order:
    total = 0.0
    order_items = []

    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise ValueError(f"Insufficient stock for product {product.title}")

        price = item.price if item.price else product.price
        total += price * item.quantity
        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": price
        })

    order_id = str(uuid.uuid4())

    db_order = models.Order(
        id=uuid.UUID(order_id),
        user_id=user_id,
        total_price=total,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_email=order.shipping_email
    )
    db.add(db_order)
    db.flush()

    for item_data in order_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)

        # Reduce stock
        product = get_product(db, item_data["product_id"])
        product.stock -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)
    return db_order


def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[uuid.UUID] = None
) -> List[models.Order]:
    query = db.query(models.Order)

    if user_id:
        query = query.filter(models.Order.user_id == user_id)

    query = query.order_by(desc(models.Order.created_at))
    return query.offset(skip).limit(limit).all()


def get_order(db: Session, order_id: uuid.UUID) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_order_items(db: Session, order_id: uuid.UUID) -> List[models.OrderItem]:
    return db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
