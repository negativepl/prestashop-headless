# PrestaShop Headless Frontend

Next.js 16 headless frontend for PrestaShop e-commerce.

## Requirements

- Node.js 18+
- PrestaShop 8.x/9.x with Webservice API enabled

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file in the root directory:

```env
# PrestaShop API
PRESTASHOP_URL=http://your-prestashop.com
PRESTASHOP_API_KEY=YOUR_API_KEY

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRESTASHOP_URL=http://your-prestashop.com
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
| `carts` | ✅ | ✅ | ✅ | | | |
| `categories` | ✅ | | | | | |
| `countries` | ✅ | | | | | |
| `customers` | ✅ | ✅ | ✅ | | | |
| `manufacturers` | ✅ | | | | | |
| `order_states` | ✅ | | | | | |
| `orders` | ✅ | | ✅ | | | |
| `products` | ✅ | | | | | |
| `stock_availables` | ✅ | | | | | |

6. Save and copy the generated key to `.env.local`

> **Security note:** Do not enable more permissions than listed above. The frontend only needs these specific resources.

## Development

```bash
npm run dev
```

App available at: http://localhost:3000

## Production Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Zustand (state management)
- Zod (validation)

## Project Structure

```
frontend/
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
```

---

## Roadmap / TODO

### High Priority
- [x] Product filters (price, availability)
- [x] ISR caching for product/category pages
- [ ] Secure password verification (PrestaShop module or custom endpoint)
- [ ] Payment integrations (Przelewy24, PayU, BLIK)
- [ ] Shipping integrations (InPost, DPD, Poczta Polska)

### Medium Priority
- [ ] Product search with filters
- [x] Breadcrumbs navigation
- [ ] Product reviews/ratings
- [ ] Wishlist sync with PrestaShop
- [ ] Order tracking page
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
- [ ] Redis/Upstash caching layer
- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Input sanitization audit
- [ ] Image optimization pipeline
- [ ] CDN for static assets

---

## Production Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    YOUR MAIN DOMAIN                          │
│                   shop.example.com                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NGINX / REVERSE PROXY                   │    │
│  │                                                      │    │
│  │   /*  ──────────────►  Next.js Frontend (:3000)     │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (internal API calls)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESTASHOP (HIDDEN)                       │
│              api.example.com or internal IP                  │
│                                                              │
│   • Webservice API only (no public storefront)              │
│   • Admin panel: api.example.com/admin-xyz                  │
│   • Product images served from here                          │
└─────────────────────────────────────────────────────────────┘
```

### Option 1: Deploy on Vercel (Recommended)

Best for: Quick deployment, automatic scaling, zero server management.

1. **Push code to GitHub** (already done)

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Set environment variables** in Vercel dashboard:
   ```
   PRESTASHOP_URL=https://api.yourdomain.com
   PRESTASHOP_API_KEY=your_api_key
   NEXT_PUBLIC_APP_URL=https://shop.yourdomain.com
   NEXT_PUBLIC_PRESTASHOP_URL=https://api.yourdomain.com
   ```

4. **Configure domain**
   - Add your domain in Vercel project settings
   - Point DNS to Vercel

5. **Hide PrestaShop storefront** (see section below)

### Option 2: Deploy on VPS (Self-hosted)

Best for: Full control, existing server infrastructure.

1. **Clone and build on server:**
   ```bash
   git clone https://github.com/negativepl/prestashop-headless.git
   cd prestashop-headless
   npm install
   npm run build
   ```

2. **Run with PM2 (process manager):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "prestashop-frontend" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx as reverse proxy:**
   ```nginx
   # /etc/nginx/sites-available/shop.example.com

   server {
       listen 80;
       server_name shop.example.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name shop.example.com;

       ssl_certificate /etc/letsencrypt/live/shop.example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/shop.example.com/privkey.pem;

       # Next.js Frontend
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable site and reload Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/shop.example.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Hiding PrestaShop Storefront

The original PrestaShop store should be hidden from public access. Only the API and admin panel need to be accessible.

### Method 1: Subdomain + Nginx (Recommended)

Keep PrestaShop on a separate subdomain (e.g., `api.example.com`) and restrict access:

```nginx
# /etc/nginx/sites-available/api.example.com

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    root /var/www/prestashop;
    index index.php;

    # Allow API access (used by Next.js backend)
    location /api/ {
        # Optional: Restrict to your server IPs only
        # allow 123.456.789.0;  # Your Vercel/server IP
        # deny all;

        try_files $uri $uri/ /index.php?$args;
    }

    # Allow admin panel access
    location /admin-xyz/ {
        # Optional: Restrict to your IP only
        # allow 1.2.3.4;  # Your IP
        # deny all;

        try_files $uri $uri/ /index.php?$args;
    }

    # Allow product images
    location /img/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Block everything else (original storefront)
    location / {
        return 404;
        # Or redirect to new frontend:
        # return 301 https://shop.example.com$request_uri;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Method 2: .htaccess (Apache)

If using Apache, add to PrestaShop's `.htaccess`:

```apache
# Block public storefront, allow only API and admin
RewriteEngine On

# Allow API
RewriteCond %{REQUEST_URI} ^/api/ [OR]
# Allow admin panel (change 'admin-xyz' to your admin folder)
RewriteCond %{REQUEST_URI} ^/admin-xyz/ [OR]
# Allow images
RewriteCond %{REQUEST_URI} ^/img/ [OR]
# Allow modules assets
RewriteCond %{REQUEST_URI} ^/modules/
RewriteRule ^ - [L]

# Block or redirect everything else
RewriteRule ^(.*)$ https://shop.example.com/$1 [R=301,L]
```

### Method 3: PrestaShop Maintenance Mode

Quick temporary solution:

1. Go to **Shop Parameters → General**
2. Enable **Maintenance mode**
3. Add your IP to allowed IPs

Note: This still shows maintenance page to visitors. Methods 1 or 2 are better for production.

---

## Domain Configuration Examples

### Scenario A: Same domain, different servers

```
shop.example.com     → Vercel (Next.js frontend)
api.example.com      → Your VPS (PrestaShop API only)
```

**.env.local:**
```env
PRESTASHOP_URL=https://api.example.com
NEXT_PUBLIC_PRESTASHOP_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://shop.example.com
```

### Scenario B: Same server, different ports

```
shop.example.com     → Nginx → localhost:3000 (Next.js)
                     → Nginx → localhost:80 (PrestaShop, internal only)
```

**.env.local:**
```env
PRESTASHOP_URL=http://localhost:80
NEXT_PUBLIC_PRESTASHOP_URL=https://shop.example.com/ps-api
NEXT_PUBLIC_APP_URL=https://shop.example.com
```

### Scenario C: PrestaShop on external hosting

```
shop.example.com           → Vercel (Next.js)
your-prestashop.hosting.com → External PrestaShop
```

**.env.local:**
```env
PRESTASHOP_URL=https://your-prestashop.hosting.com
NEXT_PUBLIC_PRESTASHOP_URL=https://your-prestashop.hosting.com
NEXT_PUBLIC_APP_URL=https://shop.example.com
```

---

## Image Handling

Product images are still served from PrestaShop. Make sure:

1. **CORS is enabled** on PrestaShop server (for image loading)
2. **Images are accessible** via `/img/` path
3. **Next.js image domains** are configured in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.example.com',  // Your PrestaShop domain
        pathname: '/img/**',
      },
    ],
  },
}
```

---

## Checklist Before Going Live

- [ ] PrestaShop API key created with correct permissions
- [ ] Environment variables set in production
- [ ] PrestaShop storefront hidden (only API/admin accessible)
- [ ] SSL certificates configured for both domains
- [ ] Image domains configured in next.config.ts
- [ ] CORS enabled on PrestaShop for image requests
- [ ] Admin panel URL changed from default (security)
- [ ] Test: Products load correctly
- [ ] Test: Cart functionality works
- [ ] Test: Checkout process completes
- [ ] Test: User registration/login works

---

## License

MIT
