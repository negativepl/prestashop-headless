# Kestrel

Next.js 16 headless frontend for PrestaShop e-commerce.

## Requirements

- Node.js 18+ (recommended: 20+)
- npm 9+
- PrestaShop 8.x/9.x with Webservice API enabled

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/kestrel.git
cd kestrel

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Edit .env.local with your values (see Configuration section below)

# 5. Generate Prisma client and create database
npx prisma generate
npx prisma db push

# 6. Start development server
npm run dev
```

App will be available at: http://localhost:3000

## Configuration

Edit the `.env.local` file with your values:

```env
# PrestaShop API
PRESTASHOP_URL=https://your-prestashop.com
PRESTASHOP_API_KEY=YOUR_PRESTASHOP_API_KEY

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRESTASHOP_URL=https://your-prestashop.com

# Auth Secret (REQUIRED - generate with: openssl rand -base64 32)
AUTH_SECRET=your-generated-secret-here

# CMS (Kestrel CMS)
CMS_URL=http://localhost:3001

# InPost Geowidget (optional - for InPost parcel lockers)
NEXT_PUBLIC_INPOST_TOKEN=your-inpost-token
```

### How to get PrestaShop API key?

1. Log in to PrestaShop admin panel
2. Go to: **Advanced Parameters → Webservice**
3. Enable webservice (toggle to "Yes")
4. Click **Add new key**
5. Generate key and set **only these permissions**:

| Resource | GET | PUT | POST | PATCH | DELETE | HEAD |
|----------|-----|-----|------|-------|--------|------|
| `addresses` | ✅ | | ✅ | | ✅ | |
| `carriers` | ✅ | | | | | |
| `carts` | ✅ | ✅ | ✅ | | | |
| `categories` | ✅ | | | | | |
| `countries` | ✅ | | | | | |
| `customers` | ✅ | ✅ | ✅ | | | |
| `images` | ✅ | | | | | |
| `manufacturers` | ✅ | | | | | |
| `order_states` | ✅ | | | | | |
| `orders` | ✅ | | ✅ | | | |
| `messages` | | | ✅ | | | |
| `products` | ✅ | | | | | |
| `stock_availables` | ✅ | | | | | |
| `taxes` | ✅ | | | | | |
| `tax_rules` | ✅ | | | | | |

6. Save and copy the generated key to `.env.local`

> **Security note:** Do not enable more permissions than listed above. The frontend only needs these specific resources.

## Development

```bash
npm run dev
```

App available at: http://localhost:3000

## Architecture

Kestrel consists of two parts:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│        KESTREL          │     │      KESTREL CMS        │
│       (frontend)        │     │    (admin panel)        │
│                         │     │                         │
│   Next.js 16            │     │   PayloadCMS + Next.js  │
│   Port: 3000            │     │   Port: 3001            │
└────────────┬────────────┘     └────────────┬────────────┘
             │                               │
             │◄──────────────────────────────┤
             │   REST API (hero, brands...)  │
             │                               │
             ▼                               ▼
      PrestaShop API                  SQLite / PostgreSQL
      (products, cart)                  (CMS content)
```

See `../kestrel-cms/docs/` for CMS documentation.

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database not found" or Prisma errors
```bash
npx prisma db push
```

### Native module errors (better-sqlite3)
```bash
npm rebuild better-sqlite3
```

### Peer dependency warnings during npm install
Use the legacy flag if you get peer dependency conflicts:
```bash
npm install --legacy-peer-deps
```

### Missing environment variables
Make sure you have `.env.local` file with all required variables. Copy from `.env.example`:
```bash
cp .env.example .env.local
```

## Production Build

```bash
npm run build
npm start
```

## Features

### Catalog & Products
- Product catalog with categories and subcategories
- Product filters (price range, availability)
- Grid and list view modes
- Lazy loading with "Load more" pagination
- Out-of-stock products sorted to bottom
- Product images from PrestaShop
- Manufacturer/brand display

### Shopping
- Shopping cart with quantity management
- Favorites/wishlist (local storage)
- Product variants support

### User Account
- User registration and login
- Secure authentication via PrestaShop headlessauth module
- Account dashboard with order history
- Address management

### Checkout
- Multi-step checkout process
- Shipping method selection
- **InPost Paczkomat** integration with map picker
- Order summary and confirmation

### CMS Integration (Kestrel CMS)
- Hero carousel management
- Brand logos
- Trust items (shipping, returns, etc.)
- Promotional banners
- Site settings

### Performance
- ISR (Incremental Static Regeneration) caching
- SWR for client-side data fetching
- Optimized product loading (lightweight ID fetch + batch details)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Zustand (state management)
- SWR (data fetching)
- Prisma + SQLite (local data)
- Zod (validation)
- Leaflet (maps)

## Project Structure

```
kestrel/
├── app/                # Next.js App Router
│   ├── account/        # User account page
│   ├── api/            # API Routes
│   ├── checkout/       # Checkout process
│   ├── favorites/      # Favorite products
│   ├── login/          # Login page
│   ├── products/       # Product list & details
│   └── register/       # Registration page
├── components/         # React components
│   └── ui/             # Shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utilities and config
    └── cms/            # CMS client (Kestrel CMS)
```

---

## Roadmap / TODO

### Shipping Integrations
- [x] InPost Paczkomat (map picker)
- [ ] DHL Parcel (Żabka points)
- [ ] Orlen Paczka
- [ ] DPD Pickup
- [ ] Poczta Polska

### Payment Integrations
- [ ] Przelewy24
- [ ] PayU
- [ ] BLIK
- [ ] Stripe

### High Priority
- [x] Product filters (price, availability)
- [x] ISR caching for product/category pages
- [x] Secure authentication (headlessauth module)
- [x] InPost Paczkomat integration
- [x] CMS integration (Kestrel CMS)
- [ ] Product search with filters
- [ ] Order tracking page

### Medium Priority
- [x] Breadcrumbs navigation
- [x] Grid/list view toggle
- [x] Category descriptions with HTML
- [ ] Product reviews/ratings
- [ ] Wishlist sync with PrestaShop
- [ ] Password reset flow
- [ ] Email notifications

### Low Priority / Nice to Have
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Compare products
- [ ] Recently viewed products
- [ ] Related products improvements
- [ ] SEO meta tags from PrestaShop
- [ ] Sitemap generation
- [ ] Analytics integration (GA4, GTM)

### Performance & Security
- [x] SWR data fetching with caching
- [x] Optimized pagination (ID-first loading)
- [ ] Redis/Upstash caching layer
- [ ] Rate limiting on API routes
- [ ] Image optimization pipeline

---

## Production Deployment

See `../kestrel-cms/docs/DEPLOYMENT-COOLIFY.md` for full deployment guide.

### Quick Overview

```
Coolify / VPS
├── kestrel           ← This frontend (port 3000)
│   └── shop.example.com
│
├── kestrel-cms       ← Admin panel (port 3001)
│   └── cms.example.com
│
└── prestashop        ← PrestaShop API (hidden)
    └── api.example.com
```

### Environment Variables (Production)

```env
PRESTASHOP_URL=https://api.example.com
PRESTASHOP_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=https://shop.example.com
NEXT_PUBLIC_PRESTASHOP_URL=https://api.example.com
CMS_URL=https://cms.example.com
AUTH_SECRET=your-secret
```

---

## License

MIT
