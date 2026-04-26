# Sweet Bakes - Complete Bakery E-Commerce Application

A production-ready, full-stack bakery e-commerce application built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. Features user authentication, product catalog, shopping cart, checkout, order management, and admin panel.

##  Quick Start

### 1. Setup Environment
```bash
# Create .env.local in project root
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
```

Get these from: [Supabase Dashboard](https://app.supabase.com) → Settings → API

### 2. Install & Run
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000 in browser
```

### 3. Test the App
- Visit homepage
- Click "Get Started"
- Create account
- Browse products
- Add to cart
- Checkout
- View orders

---

##  Project Structure

```
/vercel/share/v0-project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (signin, signup)
│   ├── (customer)/               # Customer pages (shop, cart, checkout, orders)
│   ├── (admin)/                  # Admin pages (admin panel)
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout (dark mode)
│   └── globals.css               # Global styles & theme
│
├── components/
│   └── ui/                       # shadcn/ui components (button, input, etc)
│
├── lib/
│   ├── supabase.ts               # Supabase client initialization
│   ├── auth.ts                   # Authentication functions
│   ├── db.ts                     # Database operations (CRUD)
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helper utilities
│
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.mjs               # Next.js config
│
├── ARCHITECTURE.md               # Complete architecture guide (START HERE)
├── IMPLEMENTATION_GUIDE.md       # Code-by-code implementation
├── SYSTEM_OVERVIEW.md            # Visual diagrams and flows
├── BACKEND_INTEGRATION.md        # How to use your own backend
├── QUICK_START.md                # Quick reference cheat sheet
└── README.md                     # This file
```

---

##  Design System

**Minimalist Black & White** (Vercel style)

- **No colors** - Only black, white, and grayscale
- **CSS Variables** - Theme system in globals.css
- **Tailwind CSS 4** - Utility-first styling
- **Design Tokens** - Use `bg-background`, `text-foreground`, `border-border`
- **Dark Mode** - Always enabled (pure black #000000)

---

##  Three-Layer Architecture

### 1. **UI Layer** (`/app`)
React components handling user interactions

### 2. **Business Logic Layer** (`/lib`)
Pure functions for authentication, database operations, and data transformation

### 3. **Data Layer** (Supabase)
PostgreSQL database with PostgREST API and authentication

**Data flows:**
```
User Action → Component → lib function → Supabase API → PostgreSQL
Response: PostgreSQL → Supabase → Component → UI Update
```

---

##  Authentication

- **Method**: Email/password via Supabase Auth
- **Storage**: JWT token in browser (auto-managed)
- **Security**: Row Level Security (RLS) policies
- **Roles**: `admin` or `customer`

```typescript
// Example auth flow
const { user, error } = await signIn(email, password)
if (!error) {
  // JWT token auto-stored
  // Redirect to /shop
}
```

---

##  Database Schema

### Tables

1. **profiles** - User profile data
   - Synced with Supabase Auth
   - Contains: id, email, full_name, role

2. **products** - Bakery items
   - name, description, price, image_url, category
   - stock_quantity, is_available

3. **cart_items** - Shopping cart
   - user_id, product_id, quantity

4. **orders** - Customer orders
   - customer_name, customer_email, delivery_address
   - subtotal, delivery_fee, total_amount, status

5. **order_items** - Items in each order
   - order_id, product_id, product_name, quantity, subtotal

---

##  Data Flow Examples

### Add to Cart
```
User clicks "Add to Cart"
  ↓
addToCart(userId, productId, quantity)
  ↓
lib/db.ts checks if exists:
  - If yes: UPDATE quantity
  - If no: INSERT new row
  ↓
Supabase executes SQL
  ↓
Component updates UI
```

### Checkout
```
User submits order form
  ↓
handleCheckout():
  1. Get cart items
  2. Calculate totals
  3. Create order (INSERT)
  4. Add order items (INSERT)
  5. Clear cart (DELETE)
  ↓
All operations succeed
  ↓
Redirect to /orders with success
```

---

##  Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 16 |
| Runtime | Node.js | 18+ |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui | Latest |
| Language | TypeScript | 5+ |
| Backend | Supabase | Cloud |
| Database | PostgreSQL | 14+ |
| Auth | Supabase Auth | Built-in |
| Deployment | Vercel | Cloud |

---

##  Important Files to Understand

### Must Read
1. `lib/types.ts` - All data types (Product, Order, CartItem, etc)
2. `lib/auth.ts` - How authentication works
3. `lib/db.ts` - How data operations work
4. `app/globals.css` - The entire color/theme system

### Setup Files
1. `.env.local` - Environment variables (not in git)
2. `next.config.mjs` - Next.js configuration
3. `tsconfig.json` - TypeScript configuration
4. `tailwind.config.ts` - Tailwind configuration

### Key Pages
1. `app/page.tsx` - Homepage
2. `app/(auth)/signin/page.tsx` - Sign in page
3. `app/(customer)/shop/page.tsx` - Product catalog
4. `app/(customer)/cart/page.tsx` - Shopping cart
5. `app/(customer)/checkout/page.tsx` - Checkout

---

##  Data Flow Diagram

```
┌─────────────────────────────────────────┐
│  Browser (React Components)             │
│  - page.tsx, signin/page.tsx, etc       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Business Logic (lib/)                  │
│  - lib/auth.ts                          │
│  - lib/db.ts                            │
│  - lib/supabase.ts                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Supabase Backend                       │
│  - Auth Service                         │
│  - PostgREST API                        │
│  - Row Level Security                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  - products, orders, cart_items, etc    │
└─────────────────────────────────────────┘
```

---

##  Features Included

### Customer Features
- [x] View product catalog
- [x] Add items to cart
- [x] Manage cart (add, remove, update quantity)
- [x] Checkout with order form
- [x] View order history
- [x] Track order status
- [x] User authentication (email/password)
- [x] User profile management

### Admin Features
- [x] Manage product catalog (create, read, update, delete)
- [x] View all orders
- [x] Update order status
- [x] Track revenue and orders
- [x] Admin-only access control

### Design Features
- [x] Minimalist black & white design (Vercel style)
- [x] Responsive mobile & desktop layouts
- [x] Dark mode (always enabled)
- [x] Accessible UI components
- [x] Type-safe entire stack

---

##  Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Vercel automatically deploys on git push

### Deploy to Other Platforms

Works with any Node.js hosting:
- AWS, Azure, Google Cloud
- Heroku, Railway, Render
- Self-hosted VPS

Just set environment variables and run `pnpm build && pnpm start`

---

##  Common Tasks

### Add a New Page
1. Create file in `/app/(group)/page.tsx`
2. Add route to navigation links
3. Import and use components

### Add a New Database Function
1. Create function in `lib/db.ts`
2. Define TypeScript return type
3. Use in components with `import { yourFunction } from '@/lib/db'`

### Change Colors
1. Edit `app/globals.css`
2. Update CSS variables in `.dark` section
3. All components auto-update

### Connect Your Own Backend
1. Read `BACKEND_INTEGRATION.md`
2. Create `lib/api.ts` with HTTP client
3. Replace Supabase calls in `lib/db.ts`
4. Implement required API endpoints

---

## Enable Debug Logging
Add to any component:
```typescript
useEffect(() => {
  console.log('[v0] Component mounted')
  getCurrentUser().then(user => {
    console.log('[v0] Current user:', user)
  })
}, [])
```

### Check Supabase Connection
```typescript
const supabase = createSupabaseClient()
console.log('[v0] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('[v0] Connected:', !!supabase)
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for requests to `supabase.co`
4. Check status code (200 = success)

---
### Common Issues

**"Can't find Supabase environment variables"**
- Create `.env.local` file
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server

**"User can't add items to cart"**
- Check user is logged in: `getCurrentUser()`
- Check cart table has proper RLS policy
- Check userId matches in database

**"Styling not working"**
- Use design tokens: `bg-background`, not `bg-white`
- Check globals.css variables exist
- Rebuild: `pnpm build`

---

### Core
- next@16.x
- react@19.x
- typescript@5.x

### UI
- @radix-ui/\* (shadcn/ui components)
- tailwindcss@4.x
- lucide-react (icons)

### Database
- @supabase/supabase-js

See `package.json` for complete list

-##  Credits

Built with:
- Next.js 16
- Supabase
- Tailwind CSS 4
- shadcn/ui
- Vercel

---

##  Next Steps

1. **Read Documentation**
   - Start with QUICK_START.md
   - Then read SYSTEM_OVERVIEW.md
   - Then read ARCHITECTURE.md for deep dive

2. **Get Supabase Credentials**
   - Visit supabase.com
   - Create account
   - Create project
   - Copy URL and anon key

3. **Setup .env.local**
   - Add Supabase credentials
   - No other variables needed

4. **Run the App**
   - `pnpm dev`
   - Open http://localhost:3000
   - Test all features

5. **Deploy to Vercel**
   - Connect GitHub
   - Add env vars
   - Automatic deployment!

---



