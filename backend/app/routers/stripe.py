from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import stripe
import os
from datetime import datetime, timedelta
from .. import schemas, crud

router = APIRouter(prefix="/api", tags=["stripe"])

# Initialize Stripe with environment variable
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class CheckoutSessionRequest(schemas.Base):
    cart_items: list[schemas.CartItem]
    success_url: str
    cancel_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest,
    db: Session = Depends(crud.get_db),
    current_user: schemas.UserResponse = Depends(crud.get_current_user)
):
    # Calculate total amount
    total_amount = sum(item.price * item.quantity for item in request.cart_items)

    # Create product data for Stripe
    line_items = []
    for item in request.cart_items:
        # Get product from database
        product = crud.get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}")

        # Create line item for Stripe Checkout
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": product.title,
                    "description": product.description or "",
                    "images": [product.image] if product.image else None
                },
                "unit_amount": int(product.price * 100)  # Convert to cents
            },
            "quantity": item.quantity
        })

    # Create Stripe Checkout Session
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "order_id": str(uuid.uuid4()),  # You'll need to create the order first
            }
        )

        # Create or update order in database
        # order = crud.create_order_with_payment(db, request, checkout_session.id, current_user.id)

        return {"url": checkout_session.url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
):
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": "Invalid payload"})
    except stripe.error.SignatureVerificationError as e:
        return JSONResponse(status_code=400, content={"error": "Invalid signature"})

    # Handle the event
    if event.type == "checkout.session.completed":
        session = event.data.object

        # Update order status in database
        # order = crud.update_order_payment_status(
        #     db,
        #     session.metadata.get("order_id"),
        #     "paid",
        #     session.id
        # )

    return JSONResponse(content={"status": "success"})