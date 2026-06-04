import os
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, asc, desc, or_
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


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")


def create_user_from_clerk(db: Session, email: str, name: str) -> models.User:
    """Create a user from Clerk authentication (no password)."""
    existing = get_user_by_email(db, email)
    if existing:
        return existing

    import random
    fake_password = uuid.uuid4().hex + str(random.randint(1000, 9999))
    hashed = bcrypt.hashpw(fake_password.encode("utf-8"), bcrypt.gensalt())
    db_user = models.User(
        id=uuid.uuid4(),
        name=name,
        email=email,
        hashed_password=hashed.decode("utf-8"),
        is_admin=email == ADMIN_EMAIL if ADMIN_EMAIL else False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against a stored bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def set_password_reset_token(db: Session, user: models.User, token: str, expiry: datetime) -> models.User:
    """Set password reset token and expiry for a user."""
    user.password_reset_token = token
    user.reset_token_expiry = expiry
    db.commit()
    db.refresh(user)
    return user


def get_user_by_reset_token(db: Session, token: str) -> Optional[models.User]:
    """Get user by password reset token if token is valid and not expired."""
    user = db.query(models.User).filter(models.User.password_reset_token == token).first()
    if not user or not user.reset_token_expiry:
        return None

    # Check if token is expired
    if datetime.utcnow() > user.reset_token_expiry:
        return None

    return user


def reset_user_password(db: Session, user: models.User, new_password: str) -> models.User:
    """Reset user password and clear reset token."""
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    user.hashed_password = hashed.decode("utf-8")
    user.password_reset_token = None
    user.reset_token_expiry = None
    db.commit()
    db.refresh(user)
    return user


def change_user_password(db: Session, user: models.User, new_password: str) -> models.User:
    """Change user password (for authenticated password change)."""
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    user.hashed_password = hashed.decode("utf-8")
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get all users (admin only)."""
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: uuid.UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Update user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user_id: uuid.UUID, new_password: str) -> Optional[models.User]:
    """Update user password."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    user.hashed_password = hashed.decode("utf-8")
    db.commit()
    db.refresh(user)
    return user


def update_user_role(db: Session, user_id: uuid.UUID, is_admin: bool) -> Optional[models.User]:
    """Update user admin role (admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    user.is_admin = is_admin
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: uuid.UUID) -> bool:
    """Delete user (admin only)."""
    result = db.query(models.User).filter(models.User.id == user_id).delete()
    db.commit()
    return bool(result)

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
    include_inactive: bool = False,
) -> Tuple[List[models.Product], int]:
    """Return a list of products with pagination, filters and total count.

    The query supports optional category, price range, free-text search on title/description,
    sorting by a whitelist of fields, and a flag to return only featured products.
    """
    query = db.query(models.Product)

    # Filter by active status unless include_inactive is True
    if not include_inactive:
        query = query.filter(models.Product.is_active.is_(True))

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

    # Apply sorting -- only allow safe column names
    sort_column = getattr(models.Product, sort_by, None)
    if sort_column is not None:
        order_func = desc if sort_order.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column))

    items = query.offset(skip).limit(limit).all()
    return items, total


def get_product(db: Session, product_id: uuid.UUID, include_inactive: bool = False) -> Optional[models.Product]:
    query = db.query(models.Product).filter(models.Product.id == product_id)
    if not include_inactive:
        query = query.filter(models.Product.is_active.is_(True))
    return query.first()


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
    db.flush()

    for i, img_data in enumerate(product_data.images):
        db_image = models.ProductImage(
            id=uuid.uuid4(),
            product_id=db_product.id,
            secure_url=img_data.secure_url,
            public_id=img_data.public_id,
            width=img_data.width,
            height=img_data.height,
            resource_type=img_data.resource_type,
            is_primary=img_data.is_primary,
            sort_order=img_data.sort_order if img_data.sort_order is not None else i,
        )
        db.add(db_image)

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

    update_data = product_update.model_dump(exclude_unset=True, exclude={"images"})
    images_data = product_update.images

    for field, value in update_data.items():
        setattr(db_product, field, value)

    if images_data is not None:
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id
        ).delete(synchronize_session='fetch')

        for i, img_data in enumerate(images_data):
            db_image = models.ProductImage(
                id=uuid.uuid4(),
                product_id=product_id,
                secure_url=img_data.secure_url,
                public_id=img_data.public_id,
                width=img_data.width,
                height=img_data.height,
                resource_type=img_data.resource_type,
                is_primary=img_data.is_primary,
                sort_order=img_data.sort_order if img_data.sort_order is not None else i,
            )
            db.add(db_image)

    db.commit()
    db.expire(db_product)
    return db_product


def delete_product(db: Session, product_id: uuid.UUID) -> bool:
    """Soft delete a product by setting is_active to False."""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        return False

    db_product.is_active = False
    db.commit()
    db.refresh(db_product)
    return True


def get_categories(db: Session) -> List[str]:
    """Return a list of distinct product categories from active products only."""
    categories = db.query(models.Product.category).filter(
        models.Product.is_active.is_(True)
    ).distinct().order_by(models.Product.category).all()
    return [c[0] for c in categories]

# -------------------- Product Image CRUD --------------------

def get_product_images(db: Session, product_id: uuid.UUID) -> List[models.ProductImage]:
    """Get all images for a product, ordered by sort_order."""
    return db.query(models.ProductImage).filter(
        models.ProductImage.product_id == product_id
    ).order_by(models.ProductImage.sort_order).all()


def add_product_image(db: Session, image_data: schemas.ProductImageCreate) -> models.ProductImage:
    """Add an image to a product's gallery."""
    db_image = models.ProductImage(
        id=uuid.uuid4(),
        product_id=image_data.product_id,
        secure_url=image_data.secure_url,
        public_id=image_data.public_id,
        width=image_data.width,
        height=image_data.height,
        resource_type=image_data.resource_type,
        is_primary=image_data.is_primary,
        sort_order=image_data.sort_order,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def update_product_image(
    db: Session,
    image_id: uuid.UUID,
    image_update: schemas.ProductImageUpdate,
) -> Optional[models.ProductImage]:
    """Update a product image (e.g., set primary, change order)."""
    db_image = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not db_image:
        return None
    for field, value in image_update.model_dump(exclude_unset=True).items():
        setattr(db_image, field, value)
    db.commit()
    db.refresh(db_image)
    return db_image


def delete_product_image(db: Session, image_id: uuid.UUID) -> bool:
    """Delete a product image from the database."""
    result = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).delete()
    db.commit()
    return bool(result)


def delete_product_image_by_public_id(db: Session, public_id: str) -> bool:
    """Delete a product image by Cloudinary public_id."""
    result = db.query(models.ProductImage).filter(
        models.ProductImage.public_id == public_id
    ).delete()
    db.commit()
    return bool(result)


def set_primary_image(db: Session, product_id: uuid.UUID, image_id: uuid.UUID) -> Optional[models.ProductImage]:
    """Set one image as primary (unset others) for a product."""
    db.query(models.ProductImage).filter(
        models.ProductImage.product_id == product_id,
        models.ProductImage.is_primary.is_(True),
    ).update({"is_primary": False})

    db_image = db.query(models.ProductImage).filter(
        models.ProductImage.id == image_id,
        models.ProductImage.product_id == product_id,
    ).first()
    if not db_image:
        return None
    db_image.is_primary = True
    db.commit()
    db.refresh(db_image)
    return db_image


def get_upload_stats(db: Session) -> dict:
    """Get upload/media statistics."""
    total_images = db.query(models.ProductImage).count()
    total_products_with_images = db.query(models.ProductImage.product_id).distinct().count()
    total_gallery_images = db.query(models.ProductImage).filter(
        models.ProductImage.is_primary.is_(False)
    ).count()
    return {
        "total_images": total_images,
        "total_products_with_images": total_products_with_images,
        "total_gallery_images": total_gallery_images,
    }

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
    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    )
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
    return query.order_by(desc(models.Order.created_at)).offset(skip).limit(limit).all()


def get_order(db: Session, order_id: uuid.UUID) -> Optional[models.Order]:
    return db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == order_id).first()

# -------------------- Payment-related CRUD --------------------

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

    # Create order
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
        # Decrease product stock and log the change
        prod = get_product(db, itm["product_id"])
        previous_stock = prod.stock
        prod.stock -= itm["quantity"]
        log_inventory_change(
            db=db,
            product_id=itm["product_id"],
            change_type="sale",
            quantity_change=-itm["quantity"],
            previous_stock=previous_stock,
            new_stock=prod.stock,
            notes=f"Order {db_order.id}",
            reference_id=db_order.id,
        )
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order_payment_status(
    db: Session,
    order_id: uuid.UUID,
    payment_status: str,
    stripe_session_id: Optional[str] = None
) -> models.Order:
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    order.payment_status = payment_status
    if stripe_session_id:
        order.stripe_session_id = stripe_session_id
    db.commit()
    db.refresh(order)
    return order


def get_order_by_stripe_session(db: Session, stripe_session_id: str) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.stripe_session_id == stripe_session_id).first()


def update_order_status(db: Session, order_id: uuid.UUID, order_status: str) -> models.Order:
    """Update order status (pending, processing, shipped, delivered, cancelled)."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    order.order_status = order_status
    db.commit()
    db.refresh(order)
    return order


# -------------------- Inventory CRUD --------------------

def log_inventory_change(
    db: Session,
    product_id: uuid.UUID,
    change_type: str,
    quantity_change: int,
    previous_stock: int,
    new_stock: int,
    notes: Optional[str] = None,
    reference_id: Optional[uuid.UUID] = None,
    created_by: Optional[uuid.UUID] = None,
) -> models.InventoryLog:
    """Create an inventory log entry."""
    log = models.InventoryLog(
        id=uuid.uuid4(),
        product_id=product_id,
        change_type=change_type,
        quantity_change=quantity_change,
        previous_stock=previous_stock,
        new_stock=new_stock,
        notes=notes,
        reference_id=reference_id,
        created_by=created_by,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def adjust_stock(
    db: Session,
    product_id: uuid.UUID,
    quantity_change: int,
    change_type: str,
    notes: Optional[str] = None,
    reference_id: Optional[uuid.UUID] = None,
    created_by: Optional[uuid.UUID] = None,
) -> models.Product:
    """Adjust product stock and log the change."""
    product = get_product(db, product_id, include_inactive=False)
    if not product:
        raise ValueError("Product not found")

    previous_stock = product.stock
    new_stock = previous_stock + quantity_change

    if new_stock < 0:
        raise ValueError(f"Cannot reduce stock below 0. Current stock: {previous_stock}")

    product.stock = new_stock
    log_inventory_change(
        db=db,
        product_id=product_id,
        change_type=change_type,
        quantity_change=quantity_change,
        previous_stock=previous_stock,
        new_stock=new_stock,
        notes=notes,
        reference_id=reference_id,
        created_by=created_by,
    )
    db.commit()
    db.refresh(product)
    return product


def get_inventory_logs(
    db: Session,
    product_id: Optional[uuid.UUID] = None,
    change_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[models.InventoryLog], int]:
    """Get inventory logs with optional filters."""
    query = db.query(models.InventoryLog)
    if product_id:
        query = query.filter(models.InventoryLog.product_id == product_id)
    if change_type:
        query = query.filter(models.InventoryLog.change_type == change_type)

    total = query.count()
    logs = query.order_by(desc(models.InventoryLog.created_at)).offset(skip).limit(limit).all()
    return logs, total


def get_low_stock_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> Tuple[List[models.Product], int]:
    """Get products where stock is at or below reorder threshold."""
    query = db.query(models.Product).filter(
        models.Product.is_active.is_(True),
        models.Product.stock <= models.Product.reorder_threshold
    )
    total = query.count()
    products = query.order_by(asc(models.Product.stock)).offset(skip).limit(limit).all()
    return products, total


def get_inventory_stats(db: Session) -> dict:
    """Get aggregate inventory statistics."""
    total_products = db.query(models.Product).filter(
        models.Product.is_active.is_(True)
    ).count()

    total_stock_value = db.query(
        func.sum(models.Product.stock * models.Product.price)
    ).filter(
        models.Product.is_active.is_(True)
    ).scalar() or 0.0

    low_stock_count = db.query(models.Product).filter(
        models.Product.is_active.is_(True),
        models.Product.stock > 0,
        models.Product.stock <= models.Product.reorder_threshold
    ).count()

    out_of_stock_count = db.query(models.Product).filter(
        models.Product.is_active.is_(True),
        models.Product.stock == 0
    ).count()

    overstock_count = db.query(models.Product).filter(
        models.Product.is_active.is_(True),
        models.Product.stock > models.Product.reorder_threshold * 5
    ).count()

    return {
        "total_products": total_products,
        "total_stock_value": total_stock_value,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "overstock_count": overstock_count,
    }


def bulk_update_stock(
    db: Session,
    items: list,
    created_by: Optional[uuid.UUID] = None,
) -> List[models.Product]:
    """Update stock for multiple products at once."""
    updated = []
    for item in items:
        product = get_product(db, item["product_id"], include_inactive=False)
        if not product:
            continue

        previous_stock = product.stock
        new_stock = item["stock"]
        quantity_change = new_stock - previous_stock

        if quantity_change != 0:
            product.stock = new_stock
            log_inventory_change(
                db=db,
                product_id=item["product_id"],
                change_type="adjustment",
                quantity_change=quantity_change,
                previous_stock=previous_stock,
                new_stock=new_stock,
                notes="Bulk stock update",
                created_by=created_by,
            )

        if "reorder_threshold" in item and item["reorder_threshold"] is not None:
            product.reorder_threshold = item["reorder_threshold"]

        db.commit()
        db.refresh(product)
        updated.append(product)

    return updated


def restore_stock_for_order(db: Session, order_id: uuid.UUID) -> None:
    """Restore stock for all items in a cancelled order."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")

    for item in order.items:
        product = get_product(db, item.product_id, include_inactive=True)
        if product:
            previous_stock = product.stock
            product.stock += item.quantity
            log_inventory_change(
                db=db,
                product_id=item.product_id,
                change_type="cancellation",
                quantity_change=item.quantity,
                previous_stock=previous_stock,
                new_stock=product.stock,
                notes=f"Stock restored from cancelled order {order_id}",
                reference_id=order_id,
            )
    db.commit()
