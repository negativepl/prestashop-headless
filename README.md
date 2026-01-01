# Kestrel

**Modern headless e-commerce frontend for PrestaShop**

Kestrel is a high-performance Next.js 15 storefront that transforms PrestaShop into a modern, fast, and customizable e-commerce platform. Combined with [Kestrel CMS](https://github.com/negativepl/kestrel-cms), it provides a complete headless commerce solution.

## The Kestrel Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KESTREL ECOSYSTEM                                  │
│                                                                              │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│   │   PrestaShop    │      │     Kestrel     │      │   Kestrel CMS   │     │
│   │                 │      │   (This Repo)   │      │                 │     │
│   │  Product Data   │─────►│                 │◄─────│  Marketing      │     │
│   │  Orders, Cart   │ API  │   Next.js 15    │ API  │  Content        │     │
│   │  Customers      │      │   Port: 3000    │      │  Port: 3001     │     │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│                            Your Customers                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Component | Purpose | Repository |
|-----------|---------|------------|
| **Kestrel** | Customer-facing storefront | This repo |
| **Kestrel CMS** | Admin panel for marketing content | [kestrel-cms](https://github.com/negativepl/kestrel-cms) |
| **PrestaShop** | Product catalog, orders, customers | Your PrestaShop instance |

## Why Kestrel?

- **Lightning Fast** — Next.js App Router with ISR caching delivers sub-second page loads
- **Modern Stack** — React 19, TypeScript, Tailwind CSS, Shadcn/ui
- **SEO Optimized** — Server-side rendering for search engines
- **Mobile First** — Responsive design that works on all devices
- **Flexible CMS** — Manage hero banners, brands, and promotions without code changes
- **Polish Market Ready** — Built-in InPost Paczkomat integration

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
- **InPost Paczkomat** integration with interactive map picker
- Order summary and confirmation

### CMS Integration (Kestrel CMS)
- Hero carousel management
- Brand logos showcase
- Trust badges (free shipping, returns, support)
- Promotional banners with scheduling
- Site settings and footer configuration

### Performance
- ISR (Incremental Static Regeneration) caching
- SWR for client-side data fetching
- Optimized product loading (lightweight ID fetch + batch details)

---

## Quick Start

### Requirements

- Node.js 18+ (recommended: 20+)
- npm 9+
- PrestaShop 8.x/9.x with Webservice API enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/negativepl/kestrel.git
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

---

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

# Kestrel CMS
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

---

## Kestrel CMS

[Kestrel CMS](https://github.com/negativepl/kestrel-cms) is the companion admin panel for managing marketing content. Built with Payload CMS 3.x and Next.js 15.

### What Kestrel CMS Manages

| Content Type | Description |
|--------------|-------------|
| **Hero Slides** | Full-width homepage carousel with CTAs |
| **Brands** | Partner and brand logo showcase |
| **Trust Items** | Store benefits (free shipping, returns, etc.) |
| **Promotional Banners** | Time-sensitive campaigns |
| **Site Settings** | Logo, contact info, social media |
| **Footer** | Customizable footer link groups |

### CMS API Endpoints

The frontend fetches content from these endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/hero-slides` | Homepage carousel slides |
| `GET /api/brands` | Brand logos |
| `GET /api/trust-items` | Trust badges |
| `GET /api/promotional-banners` | Active promotions |
| `GET /api/globals/site-settings` | Site configuration |
| `GET /api/globals/footer` | Footer configuration |

### Setting Up Kestrel CMS

```bash
# Clone the CMS repository
git clone https://github.com/negativepl/kestrel-cms.git
cd kestrel-cms

# Install dependencies
npm install

# Start development server
npm run dev

# Access admin panel at http://localhost:3001/admin
```

See [Kestrel CMS documentation](https://github.com/negativepl/kestrel-cms) for detailed setup instructions.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | UI component library |
| **Zustand** | State management |
| **SWR** | Data fetching and caching |
| **Prisma + SQLite** | Local data storage |
| **Zod** | Schema validation |
| **Leaflet** | Interactive maps (InPost picker) |

---

## Project Structure

```
kestrel/
├── app/                    # Next.js App Router
│   ├── account/            # User account pages
│   ├── api/                # API Routes
│   ├── checkout/           # Checkout process
│   ├── favorites/          # Wishlist
│   ├── login/              # Authentication
│   ├── products/           # Product list & details
│   └── register/           # User registration
│
├── components/             # React components
│   ├── checkout/           # Checkout components
│   ├── home/               # Homepage components
│   ├── products/           # Product components
│   └── ui/                 # Shadcn/ui components
│
├── hooks/                  # Custom React hooks
│
├── lib/                    # Utilities and config
│   ├── cms/                # Kestrel CMS client
│   ├── payments/           # Payment integrations
│   ├── prestashop/         # PrestaShop API client
│   └── shipping/           # Shipping integrations
│
└── prisma/                 # Database schema
```

---

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

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
```bash
npm install --legacy-peer-deps
```

### Missing environment variables
```bash
cp .env.example .env.local
```

---

## Production Deployment

### Architecture Overview

```
Coolify / VPS
├── kestrel           ← Frontend (port 3000)
│   └── shop.example.com
│
├── kestrel-cms       ← Admin panel (port 3001)
│   └── cms.example.com
│
└── prestashop        ← PrestaShop API
    └── api.example.com
```

### Production Environment Variables

```env
PRESTASHOP_URL=https://api.example.com
PRESTASHOP_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=https://shop.example.com
NEXT_PUBLIC_PRESTASHOP_URL=https://api.example.com
CMS_URL=https://cms.example.com
AUTH_SECRET=your-secret
```

See [Kestrel CMS Deployment Guide](https://github.com/negativepl/kestrel-cms/blob/main/docs/DEPLOYMENT-COOLIFY.md) for full production setup instructions.

---

## Roadmap

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
- [ ] SEO meta tags from PrestaShop
- [ ] Sitemap generation
- [ ] Analytics integration (GA4, GTM)

---

## Related Projects

- **[Kestrel CMS](https://github.com/negativepl/kestrel-cms)** — Admin panel for marketing content
- **[PrestaShop](https://www.prestashop.com/)** — E-commerce platform

---

## License

MIT
