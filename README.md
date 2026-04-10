# 🛒 QuickStore - Premium E-commerce Platform

A modern, production-ready full-stack e-commerce application built with **Next.js 16**, **FastAPI**, and **PostgreSQL**, featuring a premium UI/UX design system with dark mode, animations, and conversion-optimized user flows.

---

## ✨ Features

### 🎨 Premium UI/UX

- **Modern Design System** - Custom CSS tokens, animations, and micro-interactions
- **Dark Mode** - System preference detection with manual toggle (light/dark/system)
- **Responsive Design** - Mobile-first, optimized for all screen sizes
- **Accessibility** - Keyboard navigation, ARIA roles, focus states, reduced motion support
- **Skeleton Loaders** - Premium loading states instead of basic spinners
- **Toast Notifications** - Real-time user feedback for all actions
- **Empty States** - Actionable messages when no data is available
- **Error Boundaries** - Graceful error handling with recovery options

### 🛍️ E-commerce Features

- **Product Catalog** - Browse, search, filter, and sort products
- **Advanced Filtering** - Category, price range, featured, and search queries
- **Product Details** - Image gallery, stock status, quantity selector, related products
- **Shopping Cart** - Add/remove/update quantities with localStorage persistence
- **3-Step Checkout** - Shipping → Payment → Review with inline validation
- **Order Management** - View order history and details
- **User Authentication** - JWT-based auth with secure password hashing
- **Stock Management** - Real-time stock tracking with low-stock warnings

### ⚡ Performance

- **Optimistic UI Updates** - Instant cart feedback before API response
- **Lazy Loading** - Images and components load on demand
- **Code Splitting** - Automatic route-based code splitting
- **API Integration** - Axios client with automatic token attachment
- **State Management** - Zustand for lightweight, persistent state

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.2 | React framework with App Router |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Zustand** | 5.0.3 | State management |
| **Axios** | 1.7.9 | HTTP client |
| **Lucide React** | 0.474.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | Python web framework |
| **SQLAlchemy** | 2.0.23 | ORM |
| **Alembic** | 1.12.1 | Database migrations |
| **PostgreSQL** | - | Database |
| **psycopg2** | 2.9.9 | PostgreSQL driver |
| **python-jose** | 3.3.0 | JWT authentication |
| **passlib** | 1.7.4 | Password hashing |
| **Pydantic** | 2.5.0 | Data validation |

---

## 📁 Project Structure

```
quick_store/
├── frontend/                      # Next.js frontend
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── layout.tsx         # Root layout with providers
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── products/          # Product listing
│   │   │   ├── product/[id]/      # Product detail
│   │   │   ├── cart/              # Shopping cart
│   │   │   ├── checkout/          # Checkout flow
│   │   │   └── orders/            # Order management
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Button.tsx         # Premium button variants
│   │   │   ├── ProductCard.tsx    # Product card with variants
│   │   │   ├── Header.tsx         # Sticky header with search
│   │   │   ├── Footer.tsx         # Footer with links
│   │   │   ├── Hero.tsx           # Animated hero section
│   │   │   ├── Toast.tsx          # Toast notifications
│   │   │   ├── ToastProvider.tsx  # Toast context provider
│   │   │   ├── Skeleton.tsx       # Skeleton loader component
│   │   │   ├── Skeletons.tsx      # Pre-built skeleton layouts
│   │   │   ├── EmptyState.tsx     # Empty state component
│   │   │   ├── ErrorBoundary.tsx  # React error boundary
│   │   │   ├── DarkModeToggle.tsx # Theme switcher
│   │   │   └── CheckoutStepper.tsx# Checkout progress indicator
│   │   ├── store/                 # Zustand stores
│   │   │   ├── authStore.ts       # Authentication state
│   │   │   └── cartStore.ts       # Shopping cart state
│   │   ├── lib/
│   │   │   └── api.ts             # Axios API client
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                       # FastAPI backend
│   ├── app/
│   │   ├── main.py                # FastAPI application
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── database.py            # Database configuration
│   │   ├── crud.py                # CRUD operations
│   │   └── routers/
│   │       ├── auth.py            # Authentication endpoints
│   │       ├── users.py           # User endpoints
│   │       ├── products.py        # Product endpoints
│   │       └── orders.py          # Order endpoints
│   ├── requirements.txt
│   └── .env.example
│
└── alembic/                       # Database migrations
    └── versions/
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** database (local or Neon serverless)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Update .env with your database URL
# DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/ecommerce_db
# SECRET_KEY=your-secret-key-here

# Run database migrations
cd ../alembic
alembic upgrade head

# Seed the database (optional)
cd ../backend
python -m backend.seed

# Start the server
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

---

## 🎨 Design System

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--brand` | #0066ff | #0066ff | Primary actions, links |
| `--accent` | #00a86b | #00a86b | Secondary actions |
| `--success` | #10b981 | #10b981 | Success states |
| `--warning` | #f59e0b | #f59e0b | Warning states |
| `--error` | #ef4444 | #ef4444 | Error states |
| `--background` | #fafafa | #09090b | Page background |
| `--card` | #ffffff | #18181b | Card backgrounds |

### Animations

- **fadeIn** - Smooth opacity transitions
- **slideInUp/Down/Right** - Directional entrance animations
- **scaleIn** - Scale entrance for modals/cards
- **shimmer** - Skeleton loading effect
- **pulse** - Subtle pulsing for badges/indicators
- **bounce-subtle** - Scroll indicators

### Micro-interactions

- **Buttons**: Hover scale (1.02), active scale (0.97)
- **Cards**: Hover lift (-4px) with shadow increase
- **Cart Add**: Toast notification + badge update
- **Forms**: Focus ring with brand color

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login (OAuth2) |
| GET | `/auth/me` | Yes | Get current user |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/` | No | List products (paginated, filterable) |
| GET | `/products/categories` | No | Get all categories |
| GET | `/products/{id}` | No | Get single product |
| POST | `/products/` | **Admin** | Create product |
| PUT | `/products/{id}` | **Admin** | Update product |
| DELETE | `/products/{id}` | **Admin** | Delete product |

**Query Parameters**: `skip`, `limit`, `category`, `min_price`, `max_price`, `search`, `sort_by`, `sort_order`, `featured_only`

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/` | Yes | Create order |
| GET | `/orders/` | Yes | List user's orders |
| GET | `/orders/{id}` | Yes | Get order details |

---

## 🎯 UX Highlights

### Conversion Optimization

1. **Hero Section** - Strong CTA above the fold with trust signals
2. **Product Cards** - Quick add-to-cart from any page
3. **Sticky Header** - Always-visible cart and navigation
4. **Cart Drawer** - Slide-out cart for quick review
5. **Checkout Stepper** - Clear progress indication
6. **Empty States** - Actionable messages with CTAs
7. **Stock Warnings** - Urgency indicators (low stock badges)

### Accessibility

- ✅ Keyboard navigation for all interactive elements
- ✅ Visible focus indicators (2px brand-colored ring)
- ✅ ARIA labels and roles throughout
- ✅ Screen reader support (`sr-only` class)
- ✅ Reduced motion respect (`prefers-reduced-motion`)
- ✅ Color contrast ≥ 4.5:1 (WCAG AA)

### Performance

- ✅ Skeleton loaders for all async content
- ✅ Lazy image loading
- ✅ Route prefetching (Next.js automatic)
- ✅ Optimistic cart updates
- ✅ LocalStorage persistence for cart/auth

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt
- **Environment Variables** - Secret keys in `.env` files
- **CORS Configuration** - Restricted to frontend origin
- **Admin Protection** - Product CRUD requires admin role
- **Input Validation** - Pydantic schemas on all endpoints

---

## 🌐 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/ecommerce_db
SECRET_KEY=your-super-secret-key-change-this
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Size | Layout |
|------------|------|--------|
| Mobile | ≤ 640px | Single column, stacked |
| Tablet | 641–1024px | 2-3 columns |
| Desktop | ≥ 1025px | 4-5 columns, full features |

---

## 🧪 Testing

```bash
# Frontend linting
cd frontend
npm run lint

# Frontend build
npm run build

# Backend linting (add flake8/black to requirements)
cd backend
flake8 app/
black app/
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Push to GitHub and connect to Vercel
# Vercel will auto-detect Next.js
# Set NEXT_PUBLIC_API_URL in Vercel env
```

### Backend (Render/Railway)

```bash
# Connect GitHub repo to Render/Railway
# Set environment variables:
# - DATABASE_URL
# - SECRET_KEY
# Build command: pip install -r backend/requirements.txt
# Start command: uvicorn backend.app.main:app --host 0.0.0.0
```

### Database (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new PostgreSQL database
3. Copy connection string to `DATABASE_URL`
4. Run migrations: `alembic upgrade head`

---

## 🎓 Learning Outcomes

This project demonstrates:

- ✅ Full-stack development (Next.js + FastAPI)
- ✅ RESTful API design
- ✅ Database modeling and migrations
- ✅ Authentication and authorization
- ✅ State management (Zustand)
- ✅ Responsive UI/UX implementation
- ✅ TypeScript type safety
- ✅ Modern CSS (Tailwind v4)
- ✅ Performance optimization
- ✅ Accessibility best practices

---

## 🐛 Known Issues & Future Enhancements

### To Implement

- [ ] Payment gateway integration (Stripe)
- [ ] Product reviews and ratings system
- [ ] Admin dashboard for product management
- [ ] Email notifications for orders
- [ ] Wishlist functionality
- [ ] Product search with autocomplete
- [ ] Image upload for products
- [ ] Order status tracking
- [ ] Discount codes and promotions

### Current Limitations

- Payment is placeholder (COD only)
- Ratings are hardcoded (not in database)
- No image upload (URLs only)
- No email verification

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, FastAPI, and Tailwind CSS**
