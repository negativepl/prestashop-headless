# PrestaShop Modules for Headless Frontend

## headlessauth - Authentication Module

Moduł zapewniający bezpieczny endpoint do logowania użytkowników z headless frontend.

### Instalacja

#### Metoda 1: Przez SSH/FTP

1. Skopiuj folder `headlessauth` do katalogu `/modules/` w PrestaShop:
   ```bash
   scp -r headlessauth/ user@server:/var/www/prestashop/modules/
   ```

2. Ustaw odpowiednie uprawnienia:
   ```bash
   chmod 755 /var/www/prestashop/modules/headlessauth/
   chmod 644 /var/www/prestashop/modules/headlessauth/*.php
   ```

3. Zainstaluj moduł w panelu admina PrestaShop:
   - Przejdź do: **Moduły > Module Manager**
   - Znajdź "Headless Authentication"
   - Kliknij **Zainstaluj**

#### Metoda 2: Przez panel admina

1. Spakuj folder `headlessauth` do ZIP:
   ```bash
   cd prestashop-modules
   zip -r headlessauth.zip headlessauth/
   ```

2. W panelu PrestaShop:
   - Przejdź do: **Moduły > Module Manager**
   - Kliknij **Prześlij moduł**
   - Wybierz plik `headlessauth.zip`
   - Zainstaluj moduł

### Endpoint API

**URL:** `POST /modules/headlessauth/api.php`

**Headers:**
```
Content-Type: application/json
Authorization: Basic {base64(API_KEY + ":")}
```

**Request body:**
```json
{
  "email": "customer@example.com",
  "password": "customerpassword"
}
```

**Response (success):**
```json
{
  "success": true,
  "customer": {
    "id": 123,
    "email": "customer@example.com",
    "firstname": "Jan",
    "lastname": "Kowalski",
    "id_gender": 1,
    "birthday": "1990-01-15",
    "newsletter": true,
    "date_add": "2024-01-01 12:00:00"
  }
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Bezpieczeństwo

- Wymaga ważnego klucza API WebService PrestaShop
- Nie ujawnia czy email istnieje w systemie (ochrona przed enumeration)
- Obsługuje zarówno nowy format haseł (bcrypt) jak i starszy (MD5 + cookie key)
- Sprawdza czy konto jest aktywne
- Rate limiting powinien być obsługiwany przez frontend (Next.js proxy.ts)

### Wymagania

- PrestaShop 1.7.0 - 8.x
- PHP 7.4+
- Aktywny klucz WebService API

### Troubleshooting

**Błąd 401 - Authorization required:**
- Sprawdź czy wysyłasz nagłówek `Authorization: Basic ...`
- Sprawdź czy klucz API jest poprawny i aktywny w PrestaShop

**Błąd 500 - PrestaShop config not found:**
- Sprawdź czy plik jest w `/modules/headlessauth/api.php`
- Sprawdź czy ścieżka do config.inc.php jest poprawna

**Błąd "Invalid email or password" mimo poprawnych danych:**
- Sprawdź czy konto jest aktywne w PrestaShop
- Sprawdź format hasła w bazie danych (bcrypt vs MD5)
