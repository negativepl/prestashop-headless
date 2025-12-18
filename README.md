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
5. Generate key and set permissions:
   - `products` - read
   - `categories` - read
   - `images` - read
   - `customers` - read/write
   - `carts` - read/write
   - `orders` - read/write
6. Save and copy the generated key to `.env.local`

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

## Deploy on Vercel

1. Connect repository to [Vercel](https://vercel.com)
2. Add environment variables in project settings
3. Auto-deploy on every push

## License

MIT
