#!/bin/bash

echo "=========================================="
echo "🔍 Environment Variables Verification"
echo "=========================================="
echo ""

# Backend verification
echo "📦 BACKEND (.env) - Checking..."
cd backend

check_var() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 - NOT SET"
        return 1
    else
        echo "✅ $1 - SET"
        return 0
    fi
}

# Load backend .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)

    check_var "DATABASE_URL"
    check_var "SECRET_KEY"
    check_var "STRIPE_SECRET_KEY"
    check_var "STRIPE_WEBHOOK_SECRET"
    check_var "FRONTEND_URL"

    echo ""
    echo "Stripe Key Format Check:"
    if [[ $STRIPE_SECRET_KEY == sk_test_* ]]; then
        echo "✅ STRIPE_SECRET_KEY - Correct format (test mode)"
    elif [[ $STRIPE_SECRET_KEY == sk_live_* ]]; then
        echo "⚠️  STRIPE_SECRET_KEY - Live mode (use test mode for development)"
    else
        echo "❌ STRIPE_SECRET_KEY - Invalid format (should start with sk_test_ or sk_live_)"
    fi
else
    echo "❌ backend/.env file not found!"
fi

echo ""
echo "=========================================="
echo ""

# Frontend verification
echo "🎨 FRONTEND (.env or .env.local) - Checking..."
cd ../frontend

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    ENV_FILE=".env.local"
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    ENV_FILE=".env"
else
    echo "❌ No .env or .env.local file found!"
    exit 1
fi

echo "Using: $ENV_FILE"
echo ""

check_var "NEXT_PUBLIC_API_URL"
check_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

echo ""
echo "Stripe Key Format Check:"
if [[ $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY == pk_test_* ]]; then
    echo "✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Correct format (test mode)"
elif [[ $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY == pk_live_* ]]; then
    echo "⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Live mode (use test mode for development)"
else
    echo "❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Invalid format (should start with pk_test_ or pk_live_)"
fi

echo ""
echo "=========================================="
echo "✅ Verification Complete!"
echo "=========================================="
