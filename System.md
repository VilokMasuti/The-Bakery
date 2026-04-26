# Sweet Bakes - Complete System Overview

## Visual Architecture Map

### High-Level System Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        USER BROWSER                            ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  Next.js App (Client Components)                        │  ┃
┃  │  - /page.tsx (Homepage)                                 │  ┃
┃  │  - /signin, /signup (Auth)                              │  ┃
┃  │  - /shop (Product listing)                              │  ┃
┃  │  - /cart (Shopping cart)                                │  ┃
┃  │  - /checkout (Order form)                               │  ┃
┃  │  - /orders (Order history)                              │  ┃
┃  │  - /admin (Admin panel)                                 │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              ↓
                         HTTPS Request
                              ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              BUSINESS LOGIC LAYER (lib/)                       ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  lib/db.ts - Database functions                         │  ┃
┃  │  - getProducts()                                        │  ┃
┃  │  - addToCart()                                          │  ┃
┃  │  - createOrder()                                        │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  lib/auth.ts - Authentication                           │  ┃
┃  │  - signUp()                                             │  ┃
┃  │  - signIn()                                             │  ┃
┃  │  - getCurrentUser()                                     │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  lib/types.ts - Type definitions                        │  ┃
┃  │  - Product, Order, CartItem types                       │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              ↓
                    Calls Supabase Client
                              ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              DATA LAYER (lib/supabase.ts)                      ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  createSupabaseClient()                                 │  ┃
┃  │  - Initialize with NEXT_PUBLIC_SUPABASE_URL             │  ┃
┃  │  - Initialize with NEXT_PUBLIC_SUPABASE_ANON_KEY        │  ┃
┃  │  - Handle authentication state                          │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              ↓
                    HTTPS to Supabase API
                              ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 SUPABASE BACKEND                               ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  Authentication Service                                 │  ┃
┃  │  - Email/password verification                          │  ┃
┃  │  - JWT token generation & validation                    │  ┃
┃  │  - User session management                              │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  PostgREST API (Auto-generated from DB)                 │  ┃
┃  │  - GET /rest/v1/products                                │  ┃
┃  │  - POST /rest/v1/orders                                 │  ┃
┃  │  - PUT /rest/v1/cart_items                              │  ┃
┃  │  - DELETE /rest/v1/cart_items                           │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  Row Level Security (RLS) Policies                       │  ┃
┃  │  - Users can only see their own data                    │  ┃
┃  │  - Admins can see all data                              │  ┃
┃  │  - Public products visible to everyone                  │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  PostgreSQL Database                                    │  ┃
┃  │  - products table                                       │  ┃
┃  │  - orders table                                         │  ┃
┃  │  - cart_items table                                     │  ┃
┃  │  - profiles table (synced with auth.users)              │  ┃
┃  │  - order_items table                                    │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## User Journey: Complete Flow

### 1. Landing on Homepage
```
User → Browser → /page.tsx
                    ↓
                Checks: getCurrentUser()
                    ↓
              lib/auth.ts → supabase.auth.getUser()
                    ↓
            Response: user object or null
                    ↓
          Renders: "Sign In" or "Shop" button
```

### 2. Sign Up Process
```
User clicks "Get Started" → /signup/page.tsx
                    ↓
         Form: Email, Password, Name
                    ↓
         User submits form
                    ↓
     handleSignUp() → lib/auth.ts → signUp()
                    ↓
    supabase.auth.signUp({email, password, data})
                    ↓
     Supabase creates auth.users entry
            ↓
     Trigger creates profiles entry
            ↓
     Returns user object with ID
            ↓
     Browser stores JWT token
            ↓
     Redirect to /shop
```

### 3. Browse Products
```
User navigates to /shop
            ↓
    /shop/page.tsx renders (ShopContent)
            ↓
    useEffect calls getProducts()
            ↓
    lib/db.ts → getProducts()
            ↓
    Creates Supabase client
            ↓
    SELECT * FROM products WHERE is_available = true
            ↓
    Supabase API processes:
    1. Receives query
    2. Validates JWT (if auth required)
    3. Applies RLS policies
    4. Executes SQL
    5. Returns JSON
            ↓
    Component receives data
            ↓
    Renders product grid with price and image
```

### 4. Add to Cart
```
User clicks "Add to Cart" on product
            ↓
    addToCart(userId, productId, 1)
            ↓
    lib/db.ts checks if item already in cart
            ↓
    If exists: UPDATE quantity
    If new: INSERT new row
            ↓
    Supabase executes:
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (current_user_id, product_id, 1)
            ↓
    Returns cart item
            ↓
    UI shows "Added to cart" message
```

### 5. View Cart
```
User navigates to /cart
            ↓
    /cart/page.tsx renders
            ↓
    useEffect calls getCartItems(userId)
            ↓
    Supabase query:
    SELECT *, products(*) FROM cart_items
    WHERE user_id = current_user_id
            ↓
    Join with products table to get prices
            ↓
    Component renders:
    - Each item with qty controls
    - Product price × qty
    - Subtotal + $5 delivery fee
    - "Checkout" button
```

### 6. Checkout
```
User clicks "Proceed to Checkout"
            ↓
    /checkout/page.tsx
            ↓
    Form: Name, Email, Address, Special Instructions
            ↓
    User submits
            ↓
    handleCheckout():
    
    1. Get cart items
    2. Calculate totals
    3. Create order:
       INSERT INTO orders (customer_name, email, address, total_amount, status)
    4. Add order items:
       INSERT INTO order_items (order_id, product_id, product_name, qty, subtotal)
    5. Clear cart:
       DELETE FROM cart_items WHERE user_id = current_user_id
            ↓
    All 3 operations complete
            ↓
    Redirect to /orders with success message
```

### 7. View Orders
```
User navigates to /orders
            ↓
    /orders/page.tsx
            ↓
    useEffect calls getOrdersByUser(userId)
            ↓
    Supabase query:
    SELECT * FROM orders WHERE user_id = current_user_id
    ORDER BY created_at DESC
            ↓
    Component renders list of orders with:
    - Order ID
    - Date
    - Status
    - Total amount
            ↓
    Click order to see details and items
```

### 8. Admin Panel
```
Admin user navigates to /admin
            ↓
    /admin/page.tsx checks: isAdmin()
            ↓
    lib/auth.ts → getCurrentProfile() → check role
            ↓
    If role !== 'admin': redirect to /shop
            ↓
    If admin: show admin dashboard
            ↓
    Admin can:
    - View all products: getAllProductsAdmin()
    - Add product: createProduct()
    - Edit product: updateProduct()
    - Delete product: deleteProduct()
    - View all orders: getAllOrders()
    - Update order status: updateOrderStatus()
```

---

## Component Responsibility Map

```
┌─────────────────────────────────────────────────────────────┐
│              APP ROUTES (/app)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  (auth)/ [Unauthenticated routes]                           │
│  ├── signin/page.tsx      → Email/password form            │
│  └── signup/page.tsx      → Registration form              │
│                                                             │
│  (customer)/ [Customer routes]                              │
│  ├── shop/page.tsx        → Browse products                │
│  ├── cart/page.tsx        → Shopping cart                  │
│  ├── checkout/page.tsx    → Order form                     │
│  └── orders/              → Order history                  │
│      ├── page.tsx         → List orders                    │
│      └── [id]/page.tsx    → Order details                  │
│                                                             │
│  (admin)/ [Admin only]                                      │
│  └── admin/               → Admin dashboard                │
│      ├── page.tsx         → Overview                       │
│      ├── products/        → Product management             │
│      └── orders/          → Order management               │
│                                                             │
│  page.tsx                 → Homepage / Landing             │
│  layout.tsx               → Root layout (dark mode)        │
│  globals.css              → Theme & global styles          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              UI COMPONENTS (/components)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /ui (shadcn/ui components)                                 │
│  ├── button.tsx           → Interactive buttons            │
│  ├── input.tsx            → Text input fields              │
│  ├── card.tsx             → Card containers                │
│  ├── dropdown-menu.tsx    → Dropdown menus                 │
│  ├── alert.tsx            → Alert messages                 │
│  └── ... more shadcn components                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC (/lib)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  supabase.ts    → Supabase client initialization            │
│  auth.ts        → Authentication functions                  │
│  db.ts          → Database operations (CRUD)                │
│  types.ts       → TypeScript type definitions               │
│  utils.ts       → Helper functions                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (Supabase)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL Tables                                          │
│  ├── profiles      → User profile data                     │
│  ├── products      → Bakery item catalog                   │
│  ├── cart_items    → Shopping cart entries                 │
│  ├── orders        → Customer orders                       │
│  └── order_items   → Items in each order                   │
│                                                             │
│  Auth Service                                               │
│  ├── Email/password auth                                   │
│  ├── JWT tokens                                            │
│  └── Session management                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram: Add to Cart → Checkout → Order

```
┌──────────────────┐
│   User Clicks    │
│  "Add to Cart"   │
└────────┬─────────┘
         ↓
    handleAddToCart()
    {
      addToCart(userId, productId, quantity)
    }
         ↓
    ┌────────────────────────────────┐
    │  lib/db.ts                     │
    │  addToCart()                   │
    │  {                             │
    │    const supabase =            │
    │      createSupabaseClient()    │
    │                                │
    │    SELECT * FROM cart_items    │
    │    WHERE user_id = ?           │
    │                                │
    │    if exists: UPDATE quantity  │
    │    else: INSERT new row        │
    │  }                             │
    └────────────┬───────────────────┘
                 ↓
    ┌────────────────────────────────┐
    │  Supabase PostgREST API        │
    │                                │
    │  INSERT INTO cart_items        │
    │  (user_id, product_id, qty)    │
    │  VALUES (?, ?, ?)              │
    │                                │
    │  Or UPDATE cart_items          │
    │  SET quantity = quantity + ?   │
    │                                │
    │  Check RLS: user_id matches    │
    │  JWT token user                │
    │                                │
    │  Execute SQL                   │
    │  Return inserted row           │
    └────────────┬───────────────────┘
                 ↓
    Component receives CartItem
    UI updates: "Added to cart!"
                 ↓
    ┌──────────────────────────────┐
    │  User navigates to /cart      │
    └────────────┬─────────────────┘
                 ↓
    getCartItems(userId)
         ↓
    SELECT *, products(*) FROM cart_items
    WHERE user_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
         ↓
    Component renders:
    - Item name, price
    - Quantity controls (-, qty, +)
    - Remove button
    - Subtotal
    - Order summary
    - "Checkout" button
                 ↓
    ┌──────────────────────────────┐
    │  User clicks "Checkout"      │
    │  Navigate to /checkout       │
    └────────────┬─────────────────┘
                 ↓
    Form with:
    - customer_name
    - customer_email
    - delivery_address
    - special_instructions
                 ↓
    ┌──────────────────────────────┐
    │  User submits form           │
    └────────────┬─────────────────┘
                 ↓
    handleCheckout() {
      1. getCartItems()
      2. Calculate subtotal + $5 fee
      3. createOrder({
           customer_name,
           customer_email,
           delivery_address,
           special_instructions,
           subtotal,
           delivery_fee: 5.00,
           total_amount,
           status: 'pending'
         })
      4. addOrderItems(orderId, cartItems)
      5. clearCart(userId)
    }
                 ↓
    ┌────────────────────────────────┐
    │  Supabase Database Ops         │
    │                                │
    │  1. INSERT INTO orders         │
    │     RETURNING *                │
    │     → Get orderId              │
    │                                │
    │  2. INSERT INTO order_items    │
    │     (order_id, product_name,   │
    │      product_price, qty, ...)  │
    │     (SELECT from cart_items)   │
    │                                │
    │  3. DELETE FROM cart_items     │
    │     WHERE user_id = ?          │
    │                                │
    │  All 3 operations successful   │
    └────────────┬───────────────────┘
                 ↓
    Redirect to /orders
    Show success message:
    "Order created! Order ID: xyz"
                 ↓
    ┌──────────────────────────────┐
    │  /orders/page.tsx renders    │
    │                              │
    │  getOrdersByUser(userId)     │
    │  SELECT * FROM orders        │
    │  WHERE user_id = ?           │
    │  ORDER BY created_at DESC    │
    │                              │
    │  Shows list of orders with   │
    │  - Date                      │
    │  - Status (pending)          │
    │  - Total amount              │
    │  - Click to view details     │
    └──────────────────────────────┘
```

---

## Styling System Flow

```
┌─────────────────────────────────────┐
│  globals.css                        │
│                                     │
│  :root {                            │
│    --background: #ffffff            │
│    --foreground: #0a0a0a            │
│    --border: #e5e5e5                │
│    ... 20 more variables             │
│  }                                  │
│                                     │
│  .dark {                            │
│    --background: #000000 (override) │
│    --foreground: #ffffff (override) │
│    --border: #1a1a1a (override)     │
│    ... 20 more overrides             │
│  }                                  │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Tailwind CSS                       │
│                                     │
│  Generates utility classes from:    │
│  - bg-background  (uses --bg var)   │
│  - text-foreground (uses --text var)│
│  - border-border (uses --border var)│
│  - ... 100+ utilities from vars      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Components                         │
│                                     │
│  <Button className="                │
│    bg-foreground                    │
│    text-background                  │
│    border border-border             │
│    px-4 py-2 rounded                │
│  ">                                 │
│    Click me                         │
│  </Button>                          │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Browser Rendering                  │
│                                     │
│  Dark mode (.dark class on <html>): │
│  - Background: #000000 (black)      │
│  - Text: #ffffff (white)            │
│  - Border: #1a1a1a (dark gray)      │
│                                     │
│  Light mode (no .dark class):       │
│  - Background: #ffffff (white)      │
│  - Text: #0a0a0a (black)            │
│  - Border: #e5e5e5 (light gray)     │
└─────────────────────────────────────┘
```

---

## Environment & Deployment

```
┌─────────────────────────────────────┐
│  Development (.env.local)           │
│                                     │
│  NEXT_PUBLIC_SUPABASE_URL=          │
│    https://[project].supabase.co    │
│                                     │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY=     │
│    eyJhbGciOiJIUzI1NiI...           │
│                                     │
│  npm run dev                        │
│  → http://localhost:3000            │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Build                              │
│                                     │
│  pnpm build                         │
│  → Compiles Next.js                 │
│  → Optimizes images                 │
│  → Creates .next/ folder            │
│  → Ready for deploy                 │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Vercel Deployment                  │
│                                     │
│  Git push → Vercel sees commit      │
│         → Automatic build            │
│         → Deploy to CDN              │
│         → Environment vars added     │
│         → Live at https://app.url   │
│                                     │
│  Production (.env.production)       │
│  NEXT_PUBLIC_SUPABASE_URL=          │
│    (same, production db)            │
│                                     │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY=     │
│    (same, production key)           │
└─────────────────────────────────────┘
```

---

## Key Facts to Remember

### 1. **Three-Layer Architecture**
- **UI Layer**: React components in `/app`
- **Logic Layer**: Functions in `/lib`
- **Data Layer**: Supabase backend

### 2. **Data Flow Direction**
```
User Action → Component → lib function → Supabase → Database
Response: Database → Supabase → Component → UI Update
```

### 3. **Authentication Flow**
```
User signup/login → Supabase.auth.signUp/signIn → JWT token stored
Every request → JWT auto-attached by Supabase client → Verified by RLS
```

### 4. **No Colors Used**
- Only black (#000000), white (#ffffff), and grays
- CSS variables in globals.css
- Tailwind utilities applied from variables
- Dark mode toggle changes variable values

### 5. **Database Operations**
- All CRUD via PostgREST API (auto-generated)
- RLS policies enforce security
- Users can only see their own data
- Admins have full access

### 6. **Deployment Ready**
- No hardcoded secrets (uses .env.local)
- Environment variables in Vercel project settings
- Zero configuration deployment on Vercel
- Automatic HTTPS and CDN

---

## Complete Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 | Full-stack React framework |
| | React 19 | UI library |
| | TypeScript | Type safety |
| **Styling** | Tailwind CSS 4 | Utility CSS framework |
| | CSS Variables | Theme system |
| **UI Components** | shadcn/ui | Accessible components |
| **Backend** | Supabase | PostgreSQL + Auth |
| **Database** | PostgreSQL | Relational database |
| **Auth** | Supabase Auth | Email/password auth |
| **API** | PostgREST | Auto-generated REST API |
| **Deployment** | Vercel | Hosting platform |

---

## What You Can Modify

 **SAFE TO CHANGE:**
- Add new pages in `/app`
- Add new components in `/components`
- Add new database functions in `/lib/db.ts`
- Change CSS colors in `globals.css`
- Add new Tailwind utilities
- Modify environment variables
- Change page layouts

 **DON'T CHANGE (unless migrating):**
- `lib/supabase.ts` (unless using different backend)
- `lib/types.ts` without updating database
- `lib/auth.ts` without updating Supabase Auth config
- Core structure of `/app` routing

---

## Conclusion

This is a **production-ready, scalable, secure** bakery application with:
- Clean separation of concerns
- Type-safe entire stack
- Minimalist modern design
- Easy to extend
- Ready to deploy

To get started:
1. Read ARCHITECTURE.md for complete overview
2. Read IMPLEMENTATION_GUIDE.md for code patterns
3. Read BACKEND_INTEGRATION.md to connect your own backend
4. Check SYSTEM_OVERVIEW.md (this file) for visual understanding

