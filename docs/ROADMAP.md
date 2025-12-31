# Roadmapa Projektu: PrestaShop Headless E-commerce

> **Ostatnia aktualizacja:** 2025-12-31
> **Status analizy:** Zweryfikowane przez 4 agentów AI

## Podsumowanie Analizy

Projekt to headless sklep internetowy oparty na Next.js 16.1.1 (React 19) z backendem PrestaShop API. Frontend jest w stanie **semi-finished** - większość podstawowych funkcji e-commerce jest zaimplementowana, ale istnieje wiele krytycznych luk, placeholderów i problemów bezpieczeństwa.

---

## KRYTYCZNE PROBLEMY BEZPIECZEŃSTWA

### 1. ~~Hardkodowany klucz API~~ (NAPRAWIONE)
**Plik:** `scripts/sync-categories.ts:23-29`
```typescript
const PRESTASHOP_URL = process.env.PRESTASHOP_URL;
const PRESTASHOP_API_KEY = process.env.PRESTASHOP_API_KEY;

if (!PRESTASHOP_URL || !PRESTASHOP_API_KEY) {
  throw new Error("Missing required environment variables...");
}
```
**Status:** ✅ NAPRAWIONE - usunięto fallback, wymuszono zmienne środowiskowe

### 2. ~~Brak weryfikacji hasła przy logowaniu~~ (NAPRAWIONE)
**Plik:** `app/actions/auth.ts`
- Usunięto niebezpieczny fallback `UNSAFE_DEV_AUTH`
- Logowanie wymaga teraz działającego endpointu PrestaShop `/api/auth/login`
- Wymaga zainstalowania modułu PHP w PrestaShop
**Status:** ✅ NAPRAWIONE - usunięto niebezpieczny kod

### 3. ~~Słaby domyślny SECRET_KEY~~ (NAPRAWIONE)
**Plik:** `lib/auth/session.ts:4-14`
```typescript
const SECRET_KEY = process.env.AUTH_SECRET;

if (!SECRET_KEY) {
  throw new Error("AUTH_SECRET environment variable is required...");
}

if (SECRET_KEY.length < 32) {
  throw new Error("AUTH_SECRET must be at least 32 characters long");
}
```
**Status:** ✅ NAPRAWIONE - wymuszono AUTH_SECRET min. 32 znaki

### 4. ~~Brak sprawdzenia przynależności zamówienia~~ (NAPRAWIONE)
**Plik:** `app/account/orders/[id]/page.tsx:67-72`
```typescript
// SECURITY: Verify order belongs to logged-in user
const customerOrders = await prestashop.getCustomerOrders(session.customerId);
const orderBelongsToUser = customerOrders.some((o) => o.id === order.id);
if (!orderBelongsToUser) {
  notFound();
}
```
**Status:** ✅ NAPRAWIONE - włączono weryfikację właściciela zamówienia

### 5. ~~Brak rate limitingu na API routes~~ (NAPRAWIONE)
**Plik:** `proxy.ts` (NOWY)

| Route | Rate Limit | Status |
|-------|-----------|--------|
| `/api/checkout` | 10/min | ✅ |
| `/api/search` | 30/min | ✅ |
| `/api/products` | 60/min | ✅ |
| `/api/categories` | 60/min | ✅ |
| `/api/auth` | 10/min | ✅ |
| `/api/*` (default) | 100/min | ✅ |

**Status:** ✅ NAPRAWIONE - utworzono `proxy.ts` z rate limiting

### 6. ~~Brak proxy.ts / middleware~~ (NAPRAWIONE)
**Plik:** `proxy.ts` - UTWORZONY
- Rate limiting dla wszystkich API routes
- Headery X-RateLimit-* w odpowiedziach
- Odpowiedź 429 Too Many Requests przy przekroczeniu limitu
**Status:** ✅ NAPRAWIONE

### 7. ~~Brak CSP headerów~~ (NAPRAWIONE)
**Plik:** `next.config.ts`
Dodano security headers:
- ✅ Content-Security-Policy
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
**Status:** ✅ NAPRAWIONE

---

## KRYTYCZNY PROBLEM: DESYNCHRONIZACJA CHECKOUT

### Frontend wysyła dane, Backend je ignoruje!

**Frontend (`app/checkout/page.tsx:127-140`):**
```javascript
body: JSON.stringify({
  customer: form,
  items: items.map(...),
  shippingMethod: selectedShipping,    // WYSYŁANE
  paymentMethod: selectedPayment,      // WYSYŁANE
  discountCode: discountApplied ? discountCode : null, // WYSYŁANE
})
```

**Backend (`app/api/checkout/route.ts:53-68`):**
```typescript
interface CheckoutRequest {
  customer: { ... };
  items: { productId, quantity, productAttributeId }[];
  // BRAK: shippingMethod, paymentMethod, discountCode!
}
```

**Efekt - hardcoded wartości w zamówieniu:**
- `id_carrier: 1` - zawsze pierwsza metoda dostawy
- `payment: "Przelew bankowy"` - zawsze ta sama metoda
- `total_shipping: 0.000000` - zawsze zero!
- `current_state: 1` - zawsze "oczekiwanie na płatność"

---

## BRAKUJĄCE STRONY (Placeholdery)

| Strona | Status | Linkowana z |
|--------|--------|-------------|
| `/contact` | NIE ISTNIEJE | Footer (href="#") |
| `/terms` | NIE ISTNIEJE | Footer (href="#") |
| `/privacy` | NIE ISTNIEJE | Footer (href="#") |
| `/forgot-password` | NIE ISTNIEJE | Login |
| `/about` | NIE ISTNIEJE | Footer (href="#") |
| `/faq` | NIE ISTNIEJE | Footer (href="#") |
| `/delivery-info` | NIE ISTNIEJE | Footer (href="#") |
| `/returns` | NIE ISTNIEJE | Footer (href="#") |
| `/payments-info` | NIE ISTNIEJE | Footer (href="#") |

### Footer.tsx - 12 linków `href="#"`
**Plik:** `components/layout/footer.tsx`

**Sekcja "Pomoc" (linie 106-121):**
- Dostawa → powinno `/delivery-info`
- Zwroty i reklamacje → powinno `/returns`
- Płatności → powinno `/payments-info`
- FAQ → powinno `/faq`

**Sekcja "Firma" (linie 133-148):**
- O nas → powinno `/about`
- Regulamin → powinno `/terms`
- Polityka prywatności → powinno `/privacy`
- Kontakt → powinno `/contact`

**Sekcja "Sklep" (linie 89-94):**
- Nowości → placeholder
- Wyprzedaż → placeholder

**Social media (linie 52-68):**
- Facebook, Instagram, X, TikTok, YouTube → wszystkie `href="#"`

---

## BRAKUJĄCE INTEGRACJE PŁATNOŚCI

### Obecny stan:
**UI (`app/checkout/page.tsx:40-46`):**
```javascript
const PAYMENT_METHODS = [
  { id: "cod", name: "Płatność przy odbiorze" },
  { id: "blik", name: "BLIK" },
  { id: "card", name: "Karta płatnicza" },
  { id: "transfer", name: "Przelew online" },
  { id: "installments", name: "Raty PayU" },
];
```

**Backend:** Wszystko hardcoded jako "Przelew bankowy" (`ps_checkpayment`)

| Element | UI | Backend | Status |
|---------|-----|---------|--------|
| Wybór metody | ✅ | ❌ Ignorowane | STUB |
| Stripe SDK | ❌ | ❌ | BRAK |
| PayU SDK | ❌ | ❌ | BRAK |
| Webhooks | ❌ | ❌ | BRAK |
| Status płatności | ❌ | Zawsze "niezapłacone" | STUB |

### Wymagane integracje:
1. **Stripe** - karty płatnicze
2. **PayU** - BLIK, przelewy, raty
3. **Przelewy24** - alternatywa dla PayU
4. Webhooks do potwierdzenia płatności (`/api/webhooks/stripe`, `/api/webhooks/payu`)
5. Zmiana statusu zamówienia po opłaceniu

---

## BRAKUJĄCE INTEGRACJE DOSTAW

### Obecny stan:
**UI (`app/checkout/page.tsx:33-38`):**
```javascript
const SHIPPING_METHODS = [
  { id: "courier", name: "Kurier DPD", price: 14.99, time: "1-2 dni robocze" },
  { id: "inpost", name: "Paczkomat InPost", price: 12.99, time: "1-2 dni robocze" },
  { id: "courier-express", name: "Kurier Express", price: 24.99, time: "Następny dzień roboczy" },
  { id: "pickup", name: "Odbiór osobisty", price: 0, time: "Dostępny od ręki" },
];
```

**Backend:** Zawsze `id_carrier=1`, `total_shipping=0`

| Element | UI | Backend | Status |
|---------|-----|---------|--------|
| Wybór metody | ✅ | ❌ Hardcoded carrier=1 | STUB |
| Ceny wysyłki | ✅ Hardcoded | ❌ Zawsze 0 | STUB |
| Darmowa od 100 PLN | ✅ UI only | ❌ Nie zapisywane | STUB |
| InPost API | ❌ | ❌ | BRAK |
| Mapa paczkomatów | ❌ | ❌ | BRAK |
| Tracking | ❌ | ❌ | BRAK |

### Wymagane integracje:
1. **InPost API** - wybór paczkomatu, mapa, walidacja
2. **DPD/DHL API** - śledzenie przesyłek
3. Dynamiczna kalkulacja kosztów (waga, wymiary, lokalizacja)
4. Mapowanie UI methods → PrestaShop `id_carrier`
5. Tracking number w szczegółach zamówienia

---

## BRAKUJĄCE FUNKCJONALNOŚCI E-COMMERCE

| Funkcja | Status | Uwagi |
|---------|--------|-------|
| Porównywarka produktów | NIE ISTNIEJE | Brak komponentów |
| Newsletter | STUB | Form bez backendu |
| Opinie/recenzje | STUB | UI + demo data, bez zapisu |
| Kody rabatowe | STUB | TODO w kodzie, zawsze 0 PLN |
| Paginacja produktów | NIE ISTNIEJE | Load all |
| Filtry zaawansowane | CZĘŚCIOWE | Brak: marka, atrybuty, rating |
| Reset hasła | NIE ISTNIEJE | Link jest, strona nie |
| Faktury PDF | NIE ISTNIEJE | Tylko CSV/HTML export |
| Śledzenie przesyłki | NIE ISTNIEJE | Brak tracking |
| Walidacja stanów magazynowych | BRAK | Można zamówić niedostępne |
| Panel admina | NIE ISTNIEJE | Tylko PrestaShop backend |
| Toast notifications | NIE ISTNIEJE | Brak feedback UI |

---

## ROADMAPA IMPLEMENTACJI

### ~~FAZA 1: KRYTYCZNE BEZPIECZEŃSTWO~~ ✅ UKOŃCZONA

#### ~~1.1 Napraw hardkodowany API key~~ ✅
- [x] Usuń fallback z `scripts/sync-categories.ts:24`
- [x] Wymuś zmienne środowiskowe (throw error jeśli brak)

#### ~~1.2 Implementuj weryfikację hasła~~ ✅
- [x] Usuń kod `UNSAFE_DEV_AUTH` z `app/actions/auth.ts`
- [ ] Stwórz custom moduł PHP w PrestaShop dla `/api/auth/login` (osobne zadanie)

#### ~~1.3 Wymuś AUTH_SECRET~~ ✅
- [x] Usuń domyślny secret z `lib/auth/session.ts:4`
- [x] Dodaj walidację na starcie aplikacji (throw error)
- [x] Dodaj walidację minimalnej długości (32 znaki)

#### ~~1.4 Napraw sprawdzanie zamówień~~ ✅
- [x] Odkomentuj weryfikację `customerId` w `app/account/orders/[id]/page.tsx:67-73`

#### ~~1.5 Utwórz proxy.ts z rate limiting~~ ✅
- [x] Utwórz `proxy.ts` w głównym katalogu (Next.js 16)
- [x] Dodaj rate limiting dla wszystkich `/api/*` routes
- [x] Limity: 60 req/min dla products, 10 req/min dla checkout

#### ~~1.6 Dodaj security headers~~ ✅
- [x] CSP headers w `next.config.ts`
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security
- [x] X-XSS-Protection
- [x] Referrer-Policy
- [x] Permissions-Policy

---

### FAZA 2: NAPRAWA CHECKOUT (Priorytet: KRYTYCZNY)

#### 2.1 Napraw desynchronizację Frontend/Backend
- [ ] Dodaj `shippingMethod`, `paymentMethod`, `discountCode` do `CheckoutRequest` interface
- [ ] Mapuj `shippingMethod` → PrestaShop `id_carrier`
- [ ] Zapisuj rzeczywiste `total_shipping` w zamówieniu
- [ ] Waliduj `paymentMethod` przed tworzeniem zamówienia

#### 2.2 Integracja Stripe
- [ ] Instalacja `@stripe/react-stripe-js`, `stripe`
- [ ] Stripe Elements dla kart
- [ ] Webhook `/api/webhooks/stripe`
- [ ] Aktualizacja statusu zamówienia

#### 2.3 Integracja PayU
- [ ] BLIK
- [ ] Przelewy online
- [ ] Raty
- [ ] Webhook `/api/webhooks/payu`

#### 2.4 Obsługa statusów płatności
- [ ] Pending → Paid → Shipped flow
- [ ] Email notifications (Resend/SendGrid)

---

### FAZA 3: DOSTAWY (Priorytet: WYSOKI)

#### 3.1 Integracja InPost
- [ ] API do pobierania paczkomatów
- [ ] Mapa wyboru paczkomatu (Leaflet/Google Maps)
- [ ] Walidacja adresu paczkomatu

#### 3.2 Dynamiczna kalkulacja kosztów
- [ ] Pobieranie carriers z PrestaShop API
- [ ] Kalkulacja na podstawie wagi/wymiarów
- [ ] Mapowanie UI → PrestaShop carriers

#### 3.3 Tracking
- [ ] Pole tracking number w zamówieniu
- [ ] Integracja z API kurierów
- [ ] Wyświetlanie statusu w panelu konta

---

### FAZA 4: BRAKUJĄCE STRONY (Priorytet: ŚREDNI)

#### 4.1 Strony prawne (WYMAGANE przed produkcją)
- [ ] `/terms` - regulamin
- [ ] `/privacy` - polityka prywatności

#### 4.2 Strony informacyjne
- [ ] `/contact` - formularz kontaktowy + mapa
- [ ] `/about` - o firmie
- [ ] `/faq` - pytania i odpowiedzi (accordion)
- [ ] `/delivery-info` - informacje o dostawie
- [ ] `/returns` - zwroty i reklamacje
- [ ] `/payments-info` - metody płatności

#### 4.3 Strony funkcjonalne
- [ ] `/forgot-password` - reset hasła z tokenem email
- [ ] Napraw linki w `components/layout/footer.tsx`

---

### FAZA 5: FUNKCJONALNOŚCI E-COMMERCE (Priorytet: ŚREDNI)

#### 5.1 Kody rabatowe
- [ ] Walidacja kodu w PrestaShop API (`cart_rules`)
- [ ] Wyliczenie rabatu
- [ ] Obsługa reguł (min. wartość, kategorie, daty)
- [ ] Zapisywanie w zamówieniu

#### 5.2 System opinii
- [ ] API route do zapisywania opinii
- [ ] Moderacja opinii
- [ ] Weryfikacja zakupu
- [ ] Agregacja ratingu

#### 5.3 Newsletter
- [ ] API route `/api/newsletter`
- [ ] Integracja z Mailchimp/SendGrid
- [ ] Double opt-in

#### 5.4 Porównywarka produktów
- [ ] Hook `use-compare.ts`
- [ ] Strona `/compare`
- [ ] Tabela porównawcza atrybutów

#### 5.5 Paginacja
- [ ] Produkty - infinite scroll lub paginacja
- [ ] Kategorie - paginacja
- [ ] Search results

---

### FAZA 6: UX/UI IMPROVEMENTS (Priorytet: NISKI)

#### 6.1 Toast notifications
- [ ] Komponent Toast/Notification (sonner/react-hot-toast)
- [ ] Feedback dla akcji (dodano do koszyka, błąd, sukces)

#### 6.2 Quick view
- [ ] Modal z podglądem produktu
- [ ] Dodawanie do koszyka z modal

#### 6.3 Filtry zaawansowane
- [ ] Filtr po marce
- [ ] Filtr po atrybutach (rozmiar, kolor)
- [ ] Filtr po ratingu

#### 6.4 Faktury PDF
- [ ] Generowanie PDF z zamówienia (@react-pdf/renderer)
- [ ] Pobieranie z panelu konta

---

### FAZA 7: PANEL ADMINISTRACYJNY (Priorytet: OPCJONALNY)

Obecnie zarządzanie przez backend PrestaShop. Opcjonalnie:
- [ ] Dashboard z statystykami
- [ ] Zarządzanie zamówieniami
- [ ] Zarządzanie produktami
- [ ] Zarządzanie klientami
- [ ] CMS dla stron informacyjnych

---

## PODSUMOWANIE PRIORYTETÓW

```
✅ UKOŃCZONE:
└── FAZA 1: Bezpieczeństwo
    ├── ✅ Usunięto hardkodowany API key
    ├── ✅ Wymuszono AUTH_SECRET (min. 32 znaki)
    ├── ✅ Utworzono proxy.ts z rate limiting
    ├── ✅ Włączono security check zamówień
    ├── ✅ Usunięto UNSAFE_DEV_AUTH
    └── ✅ Dodano CSP i security headers

NASTĘPNE (przed produkcją):
├── Checkout
│   ├── Naprawić desynchronizację Frontend/Backend
│   └── Integracja min. 1 bramki płatności
└── Strony prawne (regulamin, privacy)

WYSOKI (tydzień po starcie):
├── Pełna integracja płatności (PayU + Stripe)
├── Integracja dostaw (InPost)
├── Reset hasła
└── Tracking zamówień

ŚREDNI (rozwój):
├── Kody rabatowe
├── Opinie i recenzje
├── Newsletter
├── Porównywarka
└── Paginacja

NISKI (nice-to-have):
├── Toast notifications
├── Quick view
├── Zaawansowane filtry
└── Panel admina
```

---

## PLIKI ZMODYFIKOWANE (FAZA 1)

| Plik | Zmiana | Status |
|------|--------|--------|
| `scripts/sync-categories.ts` | Usunięto hardkodowany API key | ✅ |
| `lib/auth/session.ts` | Wymuszono AUTH_SECRET min. 32 znaki | ✅ |
| `app/actions/auth.ts` | Usunięto UNSAFE_DEV_AUTH | ✅ |
| `app/account/orders/[id]/page.tsx` | Włączono weryfikację właściciela | ✅ |
| `next.config.ts` | Dodano security headers | ✅ |
| `proxy.ts` | NOWY - rate limiting | ✅ |
| `.env.local` | Dodano AUTH_SECRET | ✅ |

## PLIKI DO MODYFIKACJI (NASTĘPNE)

| Plik | Problem | Akcja |
|------|---------|-------|
| `app/api/checkout/route.ts:53-68` | Ignoruje payment/shipping | Rozszerzyć interface |
| `components/layout/footer.tsx` | 12x href="#" | Naprawić linki |

---

## SZACOWANY ZAKRES PRAC

- ~~**Faza 1 (Bezpieczeństwo):** ~8 plików do modyfikacji + 1 nowy (proxy.ts)~~ ✅ UKOŃCZONA
- **Faza 2 (Checkout/Płatności):** ~10 nowych plików + integracje SDK
- **Faza 3 (Dostawy):** ~8 nowych plików + integracje API
- **Faza 4 (Strony):** ~10 nowych stron + footer fix
- **Faza 5 (Funkcje):** ~15 plików (nowe + modyfikacje)
- **Faza 6 (UX):** ~8 komponentów
- **Faza 7 (Admin):** Opcjonalnie, duży scope

---

## HISTORIA ZMIAN

| Data | Wersja | Zmiany |
|------|--------|--------|
| 2025-12-31 | 3.0 | **FAZA 1 UKOŃCZONA** - wszystkie problemy bezpieczeństwa naprawione, utworzono proxy.ts, dodano security headers |
| 2025-12-31 | 2.0 | Pełna weryfikacja przez 4 agentów AI, dodano sekcję o desynchronizacji checkout, zaktualizowano ścieżki plików, dodano szczegóły Footer.tsx |
| 2025-12-30 | 1.0 | Pierwsza wersja roadmapy |
