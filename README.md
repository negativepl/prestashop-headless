# PrestaShop Headless Frontend

Next.js 16 frontend dla PrestaShop headless e-commerce.

## Wymagania

- Node.js 18+
- PrestaShop 8.x/9.x z włączonym Webservice API

## Instalacja

```bash
npm install
```

## Konfiguracja

Utwórz plik `.env.local` w głównym katalogu:

```env
# PrestaShop API
PRESTASHOP_URL=http://twoj-prestashop.pl
PRESTASHOP_API_KEY=TWOJ_KLUCZ_API

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRESTASHOP_URL=http://twoj-prestashop.pl
```

### Jak uzyskać klucz API PrestaShop?

1. Zaloguj się do panelu administracyjnego PrestaShop
2. Przejdź do: **Zaawansowane → Webservice**
3. Włącz webservice (przełącznik na "Tak")
4. Kliknij **Dodaj nowy klucz**
5. Wygeneruj klucz i zaznacz uprawnienia:
   - `products` - odczyt
   - `categories` - odczyt
   - `images` - odczyt
   - `customers` - odczyt/zapis
   - `carts` - odczyt/zapis
   - `orders` - odczyt/zapis
6. Zapisz i skopiuj wygenerowany klucz do `.env.local`

## Uruchomienie

```bash
npm run dev
```

Aplikacja dostępna pod: http://localhost:3000

## Build produkcyjny

```bash
npm run build
npm start
```

## Technologie

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Zustand (state management)
- Zod (walidacja)

## Struktura projektu

```
frontend/
├── app/                # Next.js App Router
│   ├── account/        # Strona konta użytkownika
│   ├── api/            # API Routes
│   ├── checkout/       # Proces zamówienia
│   ├── favorites/      # Ulubione produkty
│   ├── login/          # Logowanie
│   ├── products/       # Lista i szczegóły produktów
│   └── register/       # Rejestracja
├── components/         # Komponenty React
│   └── ui/             # Shadcn/ui komponenty
├── hooks/              # Custom React hooks
└── lib/                # Utilities i konfiguracja
```

## Deploy na Vercel

1. Połącz repozytorium z [Vercel](https://vercel.com)
2. Dodaj zmienne środowiskowe w ustawieniach projektu
3. Deploy automatyczny przy każdym pushu

## Licencja

MIT
