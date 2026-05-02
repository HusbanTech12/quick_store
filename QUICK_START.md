# Quick Start Guide - Phase 1 Features

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Add Stripe keys to your .env file
echo "STRIPE_SECRET_KEY=sk_test_your_key_here" >> .env
echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret_here" >> .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Run migrations
cd ..
alembic upgrade head

# Start backend
cd backend
uvicorn app.main:app --reload
```

### 2. Frontend Setup (1 minute)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

### 3. Test New Features (2 minutes)

**Test Payment:**
1. Add items to cart
2. Go to checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete payment ✅

**Test Profile:**
1. Click your name → "My Profile"
2. Edit your information
3. Change password ✅

**Test Admin (if admin user):**
1. Click "Admin" in header
2. Manage products
3. View orders ✅

## 🎯 Key URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Profile: http://localhost:3000/profile
- Admin: http://localhost:3000/admin

## 🔑 Test Credentials

**Stripe Test Card:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

## ✅ What's New

- ✅ Stripe payment integration
- ✅ User profile management
- ✅ Admin dashboard
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Payment status tracking

## 🆘 Troubleshooting

**Backend won't start:**
- Check if port 8000 is available
- Verify DATABASE_URL in .env

**Frontend won't start:**
- Check if port 3000 is available
- Run `npm install` again

**Payment not working:**
- Verify STRIPE_SECRET_KEY is set
- Use test card numbers only
- Check backend logs for errors

**Admin features not visible:**
- Set `is_admin=true` for your user in database
- Logout and login again

## 📚 Full Documentation

See `PHASE1_IMPLEMENTATION.md` for complete details.
