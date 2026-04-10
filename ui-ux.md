# 🛍️ E-commerce UI/UX Guidelines
Modern, high-conversion, performance-driven design system.

---

# 🎯 Core UX Principles

## 1. Clarity over Complexity
- Each screen must have ONE primary goal.
- Avoid unnecessary elements and cognitive overload.
- Use clear visual hierarchy (CTA > price > title > description).

## 2. Conversion-First Design
- Primary CTA must always be visible.
- Reduce steps between product discovery and checkout.
- Enable quick add-to-cart from multiple entry points.

## 3. Trust & Reassurance
- Display reviews, ratings, and trust badges early.
- Reinforce security during checkout (SSL, guarantees).
- Show return policies and delivery info clearly.

## 4. Speed as a Feature
- Use skeleton loaders for all async content.
- Provide instant UI feedback (optimistic updates).
- Avoid layout shifts (CLS).

## 5. Consistency
- Use consistent spacing, typography, and components.
- Maintain predictable interaction patterns.

## 6. Feedback-Driven UI
- Every action must have a response:
  - Button press → animation
  - Add to cart → toast + badge update
  - Error → inline message

---

# 🔄 User Flow (Minimum Friction)

## Step 1: Homepage
**Goal:** Product discovery

- Hero section with strong CTA ("Shop Now")
- Featured product grid
- Trust signals visible above the fold

**UX Rules:**
- CTA must be visible without scroll
- Product cards include quick-add button

---

## Step 2: Product Listing
**Goal:** Exploration & filtering

- Filter bar (category, price, rating)
- Responsive product grid

**UX Rules:**
- Filters must not block content
- Use skeleton loaders during fetch
- Quick add-to-cart available

---

## Step 3: Product Detail Page (PDP)
**Goal:** Decision making

- Image gallery (zoom + thumbnails)
- Product info (title, price, rating)
- Sticky Add-to-Cart button (mobile)

**UX Rules:**
- Show reviews above the fold
- Display urgency (low stock, limited offer)
- CTA always visible

---

## Step 4: Cart
**Goal:** Review & proceed

- Cart drawer (preferred) or page
- Editable quantity + remove option

**UX Rules:**
- Minimize distractions
- Highlight checkout button
- Show price breakdown clearly

---

## Step 5: Checkout
**Goal:** Conversion

- 3-step flow:
  1. Shipping
  2. Payment
  3. Review

**UX Rules:**
- Inline validation
- Autofill support
- Progress indicator visible
- No unnecessary steps

---

# 🎨 Visual Hierarchy Rules

- Primary CTA = highest contrast color
- Only ONE primary CTA per section
- Typography priority:
  1. Price
  2. Title
  3. Description

- Use whitespace to separate sections
- Avoid cluttered layouts

---

# 🎭 Interaction & Motion

## Motion Principles
- Fast (<200ms)
- Subtle and meaningful
- Avoid excessive animation

## Micro-interactions
- Button hover → slight scale (1.02)
- Click → scale down (0.97)
- Add to cart → toast + badge update
- Card hover → elevation increase

## Accessibility
- Respect prefers-reduced-motion

---

# 🧩 Component UX Rules

## Button
- Variants: primary, secondary, ghost
- Primary = main action only
- Must have hover + active states

## Product Card
- Must include:
  - Image
  - Title (2 lines max)
  - Price
  - Rating
  - Quick Add button

## Navbar
- Sticky at top
- Includes:
  - Logo
  - Search
  - Cart icon (with badge)
  - Profile

## Cart Drawer
- Slides from right
- Shows items + subtotal
- Primary CTA = Checkout

## Checkout Stepper
- Shows progress
- Allows back navigation
- Highlights current step

---

# ⚡ Performance UX Rules

- Use skeleton loaders for all loading states
- Lazy load images (Next/Image)
- Prefetch routes (Next.js)
- Use caching (React Query / SWR)

## Optimistic UI
- Cart updates instantly
- Show feedback before API response

---

# 🚨 Edge Cases & States

## Empty States
- Empty cart → show CTA ("Start Shopping")
- No products → show suggestions

## Error States
- Payment failure → clear retry option
- Network error → retry button

## Stock Handling
- Out of stock → disable CTA
- Low stock → show warning badge

---

# ♿ Accessibility (WCAG)

- Keyboard navigation required
- Visible focus states
- ARIA roles for:
  - Navigation
  - Modals
  - Forms

- Color contrast ≥ 4.5:1

---

# 📱 Responsive Design

## Breakpoints
- Mobile: ≤ 640px
- Tablet: 641–1024px
- Desktop: ≥ 1025px

## Rules
- Mobile-first design
- Sticky CTA on mobile
- Grid:
  - Mobile: 1–2 columns
  - Tablet: 3 columns
  - Desktop: 4–5 columns

---

# 🔐 Trust & Conversion Elements

- Reviews and ratings
- “X sold” indicators
- Secure checkout badges
- Return policy highlights
- Urgency badges (low stock, limited time)

---

# 🧪 UX Testing Checklist

- Test full checkout flow
- Validate all forms
- Test mobile usability
- Run accessibility audit
- Check loading states

---

# ✅ Developer Implementation Checklist

## Components
- [ ] Button
- [ ] ProductCard
- [ ] Navbar
- [ ] CartDrawer
- [ ] CheckoutStepper
- [ ] SkeletonLoader
- [ ] Toast

## Pages
- [ ] Homepage
- [ ] Product Listing
- [ ] Product Detail
- [ ] Cart
- [ ] Checkout

## Features
- [ ] Dark mode
- [ ] Optimistic cart updates
- [ ] Lazy loading
- [ ] API caching
- [ ] Search with suggestions

---

# 🏁 Final Goal

Deliver a seamless, fast, and high-converting shopping experience by minimizing friction and maximizing trust, clarity, and performance.