# Project Roadmap: PrestaShop Headless E-commerce

> **Last updated:** 2026-01-02
> **Analysis status:** Verified by 4 AI agents

## Analysis Summary

This project is a headless e-commerce store built on Next.js 16.1.1 (React 19) with PrestaShop API backend. The frontend is in a **semi-finished** state - most basic e-commerce features are implemented, but there are many critical gaps, placeholders, and security issues.

### API Architecture (NEW)

Since 2026-01-02, the project uses a **dual-API architecture**:
- **Binshops REST API Pro** - all read operations (products, categories, account, order history)
- **PrestaShop XML API** - write operations only (checkout, order creation)

This significantly improves security (fewer API permissions) and performance (JSON instead of XML).

### Search Architecture

The project supports **Meilisearch** for AI-powered product search:
- Primary: Meilisearch (sub-50ms, typo-tolerant, faceted filtering)
- Fallback: Binshops REST API (if Meilisearch unavailable)

---

## CRITICAL SECURITY ISSUES

### 1. ~~Hardcoded API key~~ (FIXED)
**File:** `scripts/sync-categories.ts:23-29`
```typescript
const PRESTASHOP_URL = process.env.PRESTASHOP_URL;
const PRESTASHOP_API_KEY = process.env.PRESTASHOP_API_KEY;

if (!PRESTASHOP_URL || !PRESTASHOP_API_KEY) {
  throw new Error("Missing required environment variables...");
}
```
**Status:** ✅ FIXED - removed fallback, enforced environment variables

### 2. ~~No password verification on login~~ (FIXED)
**File:** `app/actions/auth.ts` + `prestashop-modules/headlessauth/`
- Removed dangerous `UNSAFE_DEV_AUTH` fallback
- Created PHP module `headlessauth` for PrestaShop
- Endpoint: `POST /modules/headlessauth/api.php`
- Secure password verification via PrestaShop (bcrypt + legacy MD5)
- Module installed on server: `presta.trkhspl.com`
- Module author: Home Screen Distribution sp. z o.o.
**Status:** ✅ FIXED - module installed and working

### 3. ~~Weak default SECRET_KEY~~ (FIXED)
**File:** `lib/auth/session.ts:4-14`
```typescript
const SECRET_KEY = process.env.AUTH_SECRET;

if (!SECRET_KEY) {
  throw new Error("AUTH_SECRET environment variable is required...");
}

if (SECRET_KEY.length < 32) {
  throw new Error("AUTH_SECRET must be at least 32 characters long");
}
```
**Status:** ✅ FIXED - enforced AUTH_SECRET min. 32 characters

### 4. ~~No order ownership check~~ (FIXED)
**File:** `app/account/orders/[id]/page.tsx:67-72`
```typescript
// SECURITY: Verify order belongs to logged-in user
const customerOrders = await binshops.getCustomerOrders();
const orderBelongsToUser = customerOrders.some((o) => o.id === order.id);
if (!orderBelongsToUser) {
  notFound();
}
```
**Status:** ✅ FIXED - enabled order ownership verification

### 5. ~~No rate limiting on API routes~~ (FIXED)
**File:** `proxy.ts` (NEW)

| Route | Rate Limit | Status |
|-------|-----------|--------|
| `/api/checkout` | 10/min | ✅ |
| `/api/search` | 30/min | ✅ |
| `/api/products` | 60/min | ✅ |
| `/api/categories` | 60/min | ✅ |
| `/api/auth` | 10/min | ✅ |
| `/api/*` (default) | 100/min | ✅ |

**Status:** ✅ FIXED - created `proxy.ts` with rate limiting

### 6. ~~Missing proxy.ts / middleware~~ (FIXED)
**File:** `proxy.ts` - CREATED
- Rate limiting for all API routes
- X-RateLimit-* headers in responses
- 429 Too Many Requests response when limit exceeded
**Status:** ✅ FIXED

### 7. ~~No CSP headers~~ (FIXED)
**File:** `next.config.ts`
Added security headers:
- ✅ Content-Security-Policy
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
**Status:** ✅ FIXED

---

## CRITICAL ISSUE: CHECKOUT DESYNC

### Frontend sends data, Backend ignores it!

**Frontend (`app/checkout/page.tsx:127-140`):**
```javascript
body: JSON.stringify({
  customer: form,
  items: items.map(...),
  shippingMethod: selectedShipping,    // SENT
  paymentMethod: selectedPayment,      // SENT
  discountCode: discountApplied ? discountCode : null, // SENT
})
```

**Backend (`app/api/checkout/route.ts:53-68`):**
```typescript
interface CheckoutRequest {
  customer: { ... };
  items: { productId, quantity, productAttributeId }[];
  // MISSING: shippingMethod, paymentMethod, discountCode!
}
```

**Result - hardcoded values in order:**
- `id_carrier: 1` - always first shipping method
- `payment: "Bank transfer"` - always same payment
- `total_shipping: 0.000000` - always zero!
- `current_state: 1` - always "awaiting payment"

---

## MISSING PAGES (Placeholders)

| Page | Status | Linked from |
|------|--------|-------------|
| `/contact` | MISSING | Footer (href="#") |
| `/terms` | MISSING | Footer (href="#") |
| `/privacy` | MISSING | Footer (href="#") |
| `/forgot-password` | MISSING | Login |
| `/about` | MISSING | Footer (href="#") |
| `/faq` | MISSING | Footer (href="#") |
| `/delivery-info` | MISSING | Footer (href="#") |
| `/returns` | MISSING | Footer (href="#") |
| `/payments-info` | MISSING | Footer (href="#") |

### Footer.tsx - 12 links with `href="#"`
**File:** `components/layout/footer.tsx`

**"Help" section (lines 106-121):**
- Delivery → should be `/delivery-info`
- Returns & complaints → should be `/returns`
- Payments → should be `/payments-info`
- FAQ → should be `/faq`

**"Company" section (lines 133-148):**
- About us → should be `/about`
- Terms → should be `/terms`
- Privacy policy → should be `/privacy`
- Contact → should be `/contact`

**"Shop" section (lines 89-94):**
- New arrivals → placeholder
- Sale → placeholder

**Social media (lines 52-68):**
- Facebook, Instagram, X, TikTok, YouTube → all `href="#"`

---

## MISSING PAYMENT INTEGRATIONS

### Current state:
**UI (`app/checkout/page.tsx:40-46`):**
```javascript
const PAYMENT_METHODS = [
  { id: "cod", name: "Cash on delivery" },
  { id: "blik", name: "BLIK" },
  { id: "card", name: "Credit card" },
  { id: "transfer", name: "Bank transfer" },
  { id: "installments", name: "PayU installments" },
];
```

**Backend:** Everything hardcoded as "Bank transfer" (`ps_checkpayment`)

| Element | UI | Backend | Status |
|---------|-----|---------|--------|
| Method selection | ✅ | ❌ Ignored | STUB |
| Stripe SDK | ❌ | ❌ | MISSING |
| PayU SDK | ❌ | ❌ | MISSING |
| Webhooks | ❌ | ❌ | MISSING |
| Payment status | ❌ | Always "unpaid" | STUB |

### Required integrations:
1. **Stripe** - credit cards
2. **PayU** - BLIK, transfers, installments
3. **Przelewy24** - alternative to PayU
4. Webhooks for payment confirmation (`/api/webhooks/stripe`, `/api/webhooks/payu`)
5. Order status change after payment

---

## MISSING SHIPPING INTEGRATIONS

### Current state:
**UI (`app/checkout/page.tsx:33-38`):**
```javascript
const SHIPPING_METHODS = [
  { id: "courier", name: "DPD Courier", price: 14.99, time: "1-2 business days" },
  { id: "inpost", name: "InPost Parcel Locker", price: 12.99, time: "1-2 business days" },
  { id: "courier-express", name: "Express Courier", price: 24.99, time: "Next business day" },
  { id: "pickup", name: "Store pickup", price: 0, time: "Available immediately" },
];
```

**Backend:** Always `id_carrier=1`, `total_shipping=0`

| Element | UI | Backend | Status |
|---------|-----|---------|--------|
| Method selection | ✅ | ❌ Hardcoded carrier=1 | STUB |
| Shipping prices | ✅ Hardcoded | ❌ Always 0 | STUB |
| Free shipping >100 PLN | ✅ UI only | ❌ Not saved | STUB |
| InPost API | ✅ | ✅ | DONE |
| Parcel locker map | ✅ | ✅ | DONE |
| Tracking | ❌ | ❌ | MISSING |

### Required integrations:
1. ~~**InPost API** - parcel locker selection, map, validation~~ ✅ DONE
2. **DPD/DHL API** - shipment tracking
3. Dynamic cost calculation (weight, dimensions, location)
4. Mapping UI methods → PrestaShop `id_carrier`
5. Tracking number in order details

---

## MISSING E-COMMERCE FEATURES

| Feature | Status | Notes |
|---------|--------|-------|
| Product comparison | MISSING | No components |
| Newsletter | STUB | Form without backend |
| Reviews/ratings | STUB | UI + demo data, no saving |
| Discount codes | STUB | TODO in code, always 0 PLN |
| Product pagination | PARTIAL | SWR infinite scroll |
| Advanced filters | PARTIAL | Missing: brand, attributes, rating |
| Password reset | MISSING | Link exists, page doesn't |
| PDF invoices | MISSING | Only CSV/HTML export |
| Shipment tracking | MISSING | No tracking |
| Stock validation | MISSING | Can order unavailable items |
| Admin panel | MISSING | Only PrestaShop backend |
| Toast notifications | MISSING | No feedback UI |

---

## IMPLEMENTATION ROADMAP

### ~~PHASE 1: CRITICAL SECURITY~~ ✅ COMPLETED

#### ~~1.1 Fix hardcoded API key~~ ✅
- [x] Remove fallback from `scripts/sync-categories.ts:24`
- [x] Enforce environment variables (throw error if missing)

#### ~~1.2 Implement password verification~~ ✅
- [x] Remove `UNSAFE_DEV_AUTH` code from `app/actions/auth.ts`
- [x] Create PHP module `headlessauth` in PrestaShop (`prestashop-modules/headlessauth/`)
- [x] Endpoint `POST /modules/headlessauth/api.php` with password verification

#### ~~1.3 Enforce AUTH_SECRET~~ ✅
- [x] Remove default secret from `lib/auth/session.ts:4`
- [x] Add validation on app start (throw error)
- [x] Add minimum length validation (32 characters)

#### ~~1.4 Fix order ownership check~~ ✅
- [x] Uncomment `customerId` verification in `app/account/orders/[id]/page.tsx:67-73`

#### ~~1.5 Create proxy.ts with rate limiting~~ ✅
- [x] Create `proxy.ts` in root directory (Next.js 16)
- [x] Add rate limiting for all `/api/*` routes
- [x] Limits: 60 req/min for products, 10 req/min for checkout

#### ~~1.6 Add security headers~~ ✅
- [x] CSP headers in `next.config.ts`
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security
- [x] X-XSS-Protection
- [x] Referrer-Policy
- [x] Permissions-Policy

---

### ~~PHASE 1.5: BINSHOPS REST API MIGRATION~~ ✅ COMPLETED

#### Changes made (2026-01-02):

**New files:**
- `lib/binshops/client.ts` - Binshops REST API client
- `lib/binshops/types.ts` - TypeScript types for Binshops API

**Migrated files (prestashop → binshops):**
| File | Operation |
|------|----------|
| `app/layout.tsx` | getCategoryTree() |
| `app/page.tsx` | getFeaturedProducts(), getProducts() |
| `app/products/page.tsx` | getProducts() |
| `app/products/[id]/page.tsx` | getProduct(), getRelatedProducts() |
| `app/account/page.tsx` | getCustomerOrders(), getCustomerAddresses(), getAccountInfo() |
| `app/account/orders/page.tsx` | getCustomerOrders() |
| `app/account/orders/[id]/page.tsx` | getOrder(), getCustomerOrders() |
| `app/actions/auth.ts` | login(), register() |
| `app/actions/account.ts` | updateAccount() |
| `app/actions/address.ts` | createAddress(), deleteAddress() |
| `app/api/search/route.ts` | searchProducts() (fallback) |
| `app/api/products/route.ts` | getProducts() |
| `app/api/products/by-ids/route.ts` | getProductsByIds() |
| `app/api/products/ids/route.ts` | getProductIdsWithStock() |
| `app/api/products/related/route.ts` | getProducts() |
| `app/api/products/new-arrivals/route.ts` | getProducts() |
| `app/api/mega-menu/products/route.ts` | getProducts() |
| `app/api/categories/route.ts` | getCategories() |
| `app/api/categories/[id]/route.ts` | getCategory() |
| `app/api/categories/tree/route.ts` | getCategoryTree() |
| `app/api/account/export/route.ts` | getAccountInfo(), getCustomerOrders(), getCustomerAddresses() |

**Remaining on PrestaShop XML API (write operations):**
- `app/api/checkout/route.ts` - order creation
- `lib/prestashop/orders.ts` - order status updates (webhooks)

**Reduced API permissions:**
- Before: 16 resources with permissions
- After: 7 resources (write-only)

---

### PHASE 2: FIX CHECKOUT (Priority: CRITICAL)

#### 2.1 Fix Frontend/Backend desync
- [ ] Add `shippingMethod`, `paymentMethod`, `discountCode` to `CheckoutRequest` interface
- [ ] Map `shippingMethod` → PrestaShop `id_carrier`
- [ ] Save actual `total_shipping` in order
- [ ] Validate `paymentMethod` before creating order

#### 2.2 Stripe Integration
- [ ] Install `@stripe/react-stripe-js`, `stripe`
- [ ] Stripe Elements for cards
- [ ] Webhook `/api/webhooks/stripe`
- [ ] Order status update

#### 2.3 PayU Integration
- [ ] BLIK
- [ ] Online transfers
- [ ] Installments
- [ ] Webhook `/api/webhooks/payu`

#### 2.4 Payment status handling
- [ ] Pending → Paid → Shipped flow
- [ ] Email notifications (Resend/SendGrid)

---

### PHASE 3: SHIPPING (Priority: HIGH)

#### 3.1 InPost Integration ✅ DONE
- [x] API for fetching parcel lockers
- [x] Parcel locker selection map (Leaflet)
- [x] Custom Paczkomat picker component

#### 3.2 Dynamic cost calculation
- [ ] Fetch carriers from PrestaShop API
- [ ] Calculate based on weight/dimensions
- [ ] Map UI → PrestaShop carriers

#### 3.3 Tracking
- [ ] Tracking number field in order
- [ ] Integration with courier APIs
- [ ] Status display in account panel

---

### PHASE 4: MISSING PAGES (Priority: MEDIUM)

#### 4.1 Legal pages (REQUIRED before production)
- [ ] `/terms` - terms of service
- [ ] `/privacy` - privacy policy

#### 4.2 Informational pages
- [ ] `/contact` - contact form + map
- [ ] `/about` - about company
- [ ] `/faq` - questions and answers (accordion)
- [ ] `/delivery-info` - delivery information
- [ ] `/returns` - returns and complaints
- [ ] `/payments-info` - payment methods

#### 4.3 Functional pages
- [ ] `/forgot-password` - password reset with email token
- [ ] Fix links in `components/layout/footer.tsx`

---

### PHASE 5: E-COMMERCE FEATURES (Priority: MEDIUM)

#### 5.1 Discount codes
- [ ] Code validation via PrestaShop API (`cart_rules`)
- [ ] Discount calculation
- [ ] Rule handling (min. value, categories, dates)
- [ ] Save in order

#### 5.2 Reviews system
- [ ] API route for saving reviews
- [ ] Review moderation
- [ ] Purchase verification
- [ ] Rating aggregation

#### 5.3 Newsletter
- [ ] API route `/api/newsletter`
- [ ] Mailchimp/SendGrid integration
- [ ] Double opt-in

#### 5.4 Product comparison
- [ ] Hook `use-compare.ts`
- [ ] Page `/compare`
- [ ] Attribute comparison table

#### 5.5 Pagination
- [x] Products - SWR infinite scroll
- [ ] Categories - pagination
- [ ] Search results

---

### PHASE 6: UX/UI IMPROVEMENTS (Priority: LOW)

#### 6.1 Toast notifications
- [ ] Toast/Notification component (sonner/react-hot-toast)
- [ ] Action feedback (added to cart, error, success)

#### 6.2 Quick view
- [ ] Product preview modal
- [ ] Add to cart from modal

#### 6.3 Advanced filters
- [ ] Filter by brand
- [ ] Filter by attributes (size, color)
- [ ] Filter by rating

#### 6.4 PDF invoices
- [ ] Generate PDF from order (@react-pdf/renderer)
- [ ] Download from account panel

---

### PHASE 7: ADMIN PANEL (Priority: OPTIONAL)

Currently managed via PrestaShop backend. Optionally:
- [ ] Dashboard with statistics
- [ ] Order management
- [ ] Product management
- [ ] Customer management
- [ ] CMS for informational pages

---

## PRIORITY SUMMARY

```
✅ COMPLETED:
├── PHASE 1: Security + Authentication
│   ├── ✅ Removed hardcoded API key
│   ├── ✅ Enforced AUTH_SECRET (min. 32 chars)
│   ├── ✅ Created proxy.ts with rate limiting
│   ├── ✅ Enabled order security check
│   ├── ✅ Removed UNSAFE_DEV_AUTH
│   ├── ✅ Added CSP and security headers
│   ├── ✅ headlessauth module installed (login works!)
│   └── ✅ UI: user menu, social login tiles (Google, Apple, Facebook, TikTok)
│
└── PHASE 1.5: Binshops REST API Migration
    ├── ✅ All read operations via Binshops
    ├── ✅ Reduced API permissions (16 → 7 resources)
    └── ✅ Dual-API architecture

NEXT (before production):
├── Checkout
│   ├── Fix Frontend/Backend desync
│   └── Integrate min. 1 payment gateway
└── Legal pages (terms, privacy)

HIGH (week after launch):
├── Full payment integration (PayU + Stripe)
├── Shipping integration (carriers mapping)
├── Password reset
└── Order tracking

MEDIUM (development):
├── Discount codes
├── Reviews and ratings
├── Newsletter
├── Product comparison
└── Advanced pagination

LOW (nice-to-have):
├── Toast notifications
├── Quick view
├── Advanced filters
└── Admin panel
```

---

## FILES MODIFIED (PHASE 1)

| File | Change | Status |
|------|--------|--------|
| `scripts/sync-categories.ts` | Removed hardcoded API key | ✅ |
| `lib/auth/session.ts` | Enforced AUTH_SECRET min. 32 chars | ✅ |
| `app/actions/auth.ts` | Removed UNSAFE_DEV_AUTH, headlessauth endpoint | ✅ |
| `app/account/orders/[id]/page.tsx` | Enabled owner verification | ✅ |
| `next.config.ts` | Added security headers | ✅ |
| `proxy.ts` | NEW - rate limiting | ✅ |
| `.env.local` | Added AUTH_SECRET | ✅ |
| `prestashop-modules/headlessauth/` | NEW - PHP login module | ✅ |
| `components/layout/header.tsx` | User menu closes on navigation | ✅ |
| `app/login/page.tsx` | Social login as tiles (Google, Apple, Facebook, TikTok) | ✅ |
| `app/register/page.tsx` | Social login as tiles (Google, Apple, Facebook, TikTok) | ✅ |

---

## FILES TO MODIFY (NEXT)

| File | Problem | Action |
|------|---------|--------|
| `app/api/checkout/route.ts:53-68` | Ignores payment/shipping | Extend interface |
| `components/layout/footer.tsx` | 12x href="#" | Fix links |

---

## ESTIMATED SCOPE

- ~~**Phase 1 (Security):** ~8 files to modify + 1 new (proxy.ts)~~ ✅ COMPLETED
- ~~**Phase 1.5 (Binshops):** ~25 files migrated~~ ✅ COMPLETED
- **Phase 2 (Checkout/Payments):** ~10 new files + SDK integrations
- **Phase 3 (Shipping):** ~8 new files + API integrations
- **Phase 4 (Pages):** ~10 new pages + footer fix
- **Phase 5 (Features):** ~15 files (new + modifications)
- **Phase 6 (UX):** ~8 components
- **Phase 7 (Admin):** Optional, large scope

---

## CHANGELOG

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-02 | 4.0 | **PHASE 1.5 COMPLETED** - Binshops REST API migration. All read operations via Binshops, reduced PrestaShop API permissions from 16 to 7 resources. Dual-API architecture. |
| 2025-12-31 | 3.1 | `headlessauth` module installed on server, login works, UI improvements (user menu, social login tiles) |
| 2025-12-31 | 3.0 | **PHASE 1 COMPLETED** - all security issues fixed, created proxy.ts, added security headers |
| 2025-12-31 | 2.0 | Full verification by 4 AI agents, added checkout desync section, updated file paths, added Footer.tsx details |
| 2025-12-30 | 1.0 | First roadmap version |
