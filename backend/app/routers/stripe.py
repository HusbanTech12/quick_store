from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Annotated, Optional
import stripe
import os
from datetime import datetime, timedelta
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/stripe", tags=["stripe"])

# Initialize Stripe with environment variable
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


class PaymentIntentRequest(schemas.BaseModel):
    """Request schema for creating payment intent"""
    order_data: schemas.OrderCreate
    payment_method_types: list[str] = ["card"]


@router.post("/create-payment-intent")
async def create_payment_intent(
    request: PaymentIntentRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """
    Create a PaymentIntent for embedded payment form.
    This allows payment to happen directly on your site.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    try:
        # Calculate total and validate stock
        total_amount = 0
        for item in request.order_data.items:
            product = crud.get_product(db, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.title}. Available: {product.stock}"
                )

            price = item.price if item.price else product.price
            total_amount += price * item.quantity

        # Create order with pending payment status
        db_order = crud.create_order(db, request.order_data, user_id=current_user.id)

        # Create Stripe PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Convert to cents
            currency="usd",
            payment_method_types=request.payment_method_types,
            metadata={
                "order_id": str(db_order.id),
                "user_id": str(current_user.id),
                "user_email": current_user.email,
            },
            description=f"Order #{str(db_order.id)[:8]} - {len(request.order_data.items)} items",
        )

        # Update order with payment intent ID
        crud.update_order_payment_status(
            db,
            db_order.id,
            payment_status="pending",
            stripe_session_id=payment_intent.id
        )

        return {
            "clientSecret": payment_intent.client_secret,
            "orderId": str(db_order.id),
            "amount": total_amount,
        }

    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.post("/confirm-payment")
async def confirm_payment(
    payment_intent_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """
    Confirm payment status after client-side confirmation.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    try:
        # Retrieve payment intent from Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        # Find order by payment intent ID
        order = crud.get_order_by_stripe_session(db, payment_intent_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Verify user owns this order
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Update order status based on payment intent status
        if payment_intent.status == "succeeded":
            crud.update_order_payment_status(db, order.id, payment_status="paid")
            return {
                "status": "success",
                "orderId": str(order.id),
                "message": "Payment successful"
            }
        elif payment_intent.status == "processing":
            return {
                "status": "processing",
                "orderId": str(order.id),
                "message": "Payment is processing"
            }
        else:
            crud.update_order_payment_status(db, order.id, payment_status="failed")
            return {
                "status": "failed",
                "orderId": str(order.id),
                "message": "Payment failed"
            }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.post("/create-checkout-session")
async def create_checkout_session(
    order_data: schemas.OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """
    Create order and Stripe checkout session in one call.
    This is the recommended approach for the checkout flow.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    try:
        # Calculate total and prepare line items
        line_items = []
        total_amount = 0

        for item in order_data.items:
            product = crud.get_product(db, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.title}. Available: {product.stock}"
                )

            price = item.price if item.price else product.price
            total_amount += price * item.quantity

            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": product.title,
                        "description": product.description or "",
                        "images": [product.image] if product.image else [],
                    },
                    "unit_amount": int(price * 100),  # Convert to cents
                },
                "quantity": item.quantity,
            })

        # Create order with pending payment status
        db_order = crud.create_order(db, order_data, user_id=current_user.id)

        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/orders/{db_order.id}?payment=success",
            cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/checkout?payment=cancelled",
            metadata={
                "order_id": str(db_order.id),
                "user_id": str(current_user.id),
            },
            customer_email=current_user.email,
        )

        # Update order with Stripe session ID
        crud.update_order_payment_status(
            db,
            db_order.id,
            payment_status="pending",
            stripe_session_id=checkout_session.id
        )

        return {
            "sessionId": checkout_session.id,
            "url": checkout_session.url,
            "orderId": str(db_order.id)
        }

    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhook events.
    This endpoint is called by Stripe when payment events occur.
    """
    if not STRIPE_WEBHOOK_SECRET:
        return JSONResponse(status_code=400, content={"error": "Webhook secret not configured"})

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JSONResponse(status_code=400, content={"error": "Invalid payload"})
    except stripe.error.SignatureVerificationError:
        return JSONResponse(status_code=400, content={"error": "Invalid signature"})

    # Handle the event
    if event.type == "checkout.session.completed":
        session = event.data.object

        # Get order from metadata
        order_id = session.metadata.get("order_id")
        if order_id:
            try:
                # Update order payment status
                crud.update_order_payment_status(
                    db,
                    uuid.UUID(order_id),
                    payment_status="paid",
                    stripe_session_id=session.id
                )
            except Exception as e:
                print(f"Error updating order {order_id}: {str(e)}")
                return JSONResponse(status_code=500, content={"error": "Failed to update order"})

    elif event.type == "checkout.session.expired":
        session = event.data.object
        order_id = session.metadata.get("order_id")
        if order_id:
            try:
                crud.update_order_payment_status(
                    db,
                    uuid.UUID(order_id),
                    payment_status="failed"
                )
            except Exception as e:
                print(f"Error updating order {order_id}: {str(e)}")

    elif event.type == "payment_intent.payment_failed":
        payment_intent = event.data.object
        # Handle failed payment
        print(f"Payment failed: {payment_intent.id}")

    return JSONResponse(content={"status": "success"})


@router.get("/session/{session_id}")
async def get_session_status(
    session_id: str,
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """
    Get the status of a Stripe checkout session.
    Used by frontend to verify payment completion.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "customer_email": session.customer_email,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
