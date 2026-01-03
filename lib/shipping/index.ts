/**
 * Shipping System - główny moduł
 *
 * Używanie:
 * ```ts
 * import { getShippingProvider, getActiveShippingMethods, findShippingPoints } from "@/lib/shipping";
 *
 * // Pobranie metod dostawy
 * const methods = await getActiveShippingMethods(totalAmount);
 *
 * // Wyszukiwanie paczkomatów
 * const points = await findShippingPoints("inpost", { city: "Kraków" });
 * ```
 */

import { inpostProvider, initializeInPost } from "./inpost";
import { furgonetkaProvider, initializeFurgonetka } from "./furgonetka";
import type {
  ShippingProvider,
  ShippingRate,
  ShippingPoint,
  CreateShipmentParams,
  ShipmentResult,
  TrackingInfo,
  PointSearchQuery,
} from "./types";

// Re-export types
export * from "./types";

// Lista dostępnych providerów
export const SHIPPING_PROVIDERS = {
  inpost: inpostProvider,
  furgonetka: furgonetkaProvider,
} as const;

export type ShippingProviderCode = keyof typeof SHIPPING_PROVIDERS;

// Inicjalizacja wszystkich providerów
let initialized = false;

export function initializeShipping() {
  if (initialized) return;

  initializeInPost();
  initializeFurgonetka();

  initialized = true;
  console.log("[Shipping] Providers initialized (InPost + Furgonetka)");
}

// Pobranie providera po kodzie
export function getShippingProvider(code: string): ShippingProvider | null {
  initializeShipping();

  // Używamy Furgonetki dla wszystkich przewoźników (agregator)
  // Furgonetka obsługuje: InPost, DHL, Orlen, DPD, GLS i inne
  const furgonetkaServices = [
    "inpost",
    "dhl",
    "zabka",
    "orlen",
    "dpd",
    "gls",
    "furgonetka",
  ];

  // Sprawdź czy kod zaczyna się od jednej z obsługiwanych usług
  for (const service of furgonetkaServices) {
    if (code.startsWith(service) || code.includes(service)) {
      return SHIPPING_PROVIDERS.furgonetka;
    }
  }

  // Fallback do InPost dla kompatybilności wstecznej
  if (code.startsWith("inpost")) {
    return SHIPPING_PROVIDERS.inpost;
  }

  return null;
}

// ===========================================
// METODY DOSTAWY Z BAZY DANYCH
// ===========================================

import { prisma } from "@/lib/prisma";

export interface ShippingMethodInfo {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  price: number;
  freeFromAmount: number | null;
  deliveryTime: string;
  deliveryTimeMin: number | null;
  deliveryTimeMax: number | null;
  requiresPoint: boolean;
  prestashopCarrierId: number | null;
}

// Pobranie aktywnych metod dostawy
export async function getActiveShippingMethods(
  orderAmount?: number
): Promise<ShippingMethodInfo[]> {
  try {
    const providers = await prisma.shippingProvider.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return providers.map((p) => {
      // Sprawdź czy darmowa dostawa
      const isFree = orderAmount && p.freeFromAmount && orderAmount >= p.freeFromAmount;

      // Formatuj czas dostawy
      let deliveryTime = "Sprawdź szczegóły";
      if (p.deliveryTimeMin && p.deliveryTimeMax) {
        if (p.deliveryTimeMin === p.deliveryTimeMax) {
          deliveryTime = `${p.deliveryTimeMin} ${p.deliveryTimeMin === 1 ? "dzień roboczy" : "dni robocze"}`;
        } else {
          deliveryTime = `${p.deliveryTimeMin}-${p.deliveryTimeMax} dni robocze`;
        }
      }

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        icon: p.icon,
        price: isFree ? 0 : p.basePrice,
        freeFromAmount: p.freeFromAmount,
        deliveryTime,
        deliveryTimeMin: p.deliveryTimeMin,
        deliveryTimeMax: p.deliveryTimeMax,
        requiresPoint: p.requiresPoint,
        prestashopCarrierId: p.prestashopCarrierId,
      };
    });
  } catch (error) {
    console.error("[Shipping] getActiveShippingMethods error:", error);
    // Zwróć domyślne metody jeśli baza nie jest gotowa
    return getDefaultShippingMethods(orderAmount);
  }
}

// Domyślne metody dostawy (fallback)
function getDefaultShippingMethods(orderAmount?: number): ShippingMethodInfo[] {
  const FREE_SHIPPING_THRESHOLD = 100;
  const isFree = orderAmount && orderAmount >= FREE_SHIPPING_THRESHOLD;

  return [
    {
      id: 1,
      code: "inpost_locker",
      name: "Paczkomat InPost",
      description: "Odbiór w najbliższym paczkomacie",
      icon: "Package",
      price: isFree ? 0 : 12.99,
      freeFromAmount: FREE_SHIPPING_THRESHOLD,
      deliveryTime: "1-2 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: true,
      prestashopCarrierId: 437,
    },
    {
      id: 2,
      code: "inpost_courier",
      name: "Kurier InPost",
      description: "Dostawa pod wskazany adres",
      icon: "Truck",
      price: isFree ? 0 : 14.99,
      freeFromAmount: FREE_SHIPPING_THRESHOLD,
      deliveryTime: "1-2 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: false,
      prestashopCarrierId: 506,
    },
    {
      id: 3,
      code: "zabka",
      name: "Odbiór w Żabce",
      description: "Odbierz w najbliższym sklepie Żabka",
      icon: "Store",
      price: isFree ? 0 : 9.99,
      freeFromAmount: FREE_SHIPPING_THRESHOLD,
      deliveryTime: "1-2 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: true,
      prestashopCarrierId: 515,
    },
    {
      id: 4,
      code: "orlen_paczka",
      name: "Orlen Paczka",
      description: "Odbierz na stacji Orlen",
      icon: "Fuel",
      price: isFree ? 0 : 8.99,
      freeFromAmount: FREE_SHIPPING_THRESHOLD,
      deliveryTime: "1-3 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 3,
      requiresPoint: true,
      prestashopCarrierId: 516,
    },
    {
      id: 5,
      code: "pickup",
      name: "Odbiór osobisty",
      description: "Odbierz w naszym punkcie",
      icon: "Building2",
      price: 0,
      freeFromAmount: null,
      deliveryTime: "Dostępny od ręki",
      deliveryTimeMin: 0,
      deliveryTimeMax: 0,
      requiresPoint: false,
      prestashopCarrierId: 279,
    },
  ];
}

// Pobranie metody dostawy po kodzie
export async function getShippingMethodByCode(
  code: string
): Promise<ShippingMethodInfo | null> {
  try {
    const provider = await prisma.shippingProvider.findUnique({
      where: { code },
    });

    if (!provider) {
      // Fallback do domyślnych
      const defaults = getDefaultShippingMethods();
      return defaults.find((m) => m.code === code) || null;
    }

    return {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      description: provider.description,
      icon: provider.icon,
      price: provider.basePrice,
      freeFromAmount: provider.freeFromAmount,
      deliveryTime: `${provider.deliveryTimeMin || 1}-${provider.deliveryTimeMax || 3} dni robocze`,
      deliveryTimeMin: provider.deliveryTimeMin,
      deliveryTimeMax: provider.deliveryTimeMax,
      requiresPoint: provider.requiresPoint,
      prestashopCarrierId: provider.prestashopCarrierId,
    };
  } catch (error) {
    console.error("[Shipping] getShippingMethodByCode error:", error);
    const defaults = getDefaultShippingMethods();
    return defaults.find((m) => m.code === code) || null;
  }
}

// ===========================================
// PUNKTY ODBIORU (PACZKOMATY)
// ===========================================

export async function findShippingPoints(
  providerCode: string,
  query: PointSearchQuery
): Promise<ShippingPoint[]> {
  initializeShipping();

  const provider = getShippingProvider(providerCode);

  if (!provider) {
    return [];
  }

  return provider.findPoints(query);
}

// ===========================================
// TWORZENIE PRZESYŁEK
// ===========================================

export async function createShipment(
  params: CreateShipmentParams
): Promise<ShipmentResult> {
  initializeShipping();

  const provider = getShippingProvider(params.providerCode);

  if (!provider) {
    return {
      success: false,
      error: `Nieznany provider: ${params.providerCode}`,
    };
  }

  return provider.createShipment(params);
}

// ===========================================
// TRACKING
// ===========================================

export async function getTracking(
  providerCode: string,
  trackingNumber: string
): Promise<TrackingInfo | null> {
  initializeShipping();

  const provider = getShippingProvider(providerCode);

  if (!provider) {
    return null;
  }

  return provider.getTracking(trackingNumber);
}

// ===========================================
// MAPOWANIE NA PRESTASHOP
// ===========================================

/**
 * Mapuje kod metody dostawy na PrestaShop carrier ID
 * Używane przy tworzeniu zamówienia
 */
export async function getPrestaShopCarrierId(
  shippingCode: string
): Promise<number> {
  const method = await getShippingMethodByCode(shippingCode);

  if (method?.prestashopCarrierId) {
    return method.prestashopCarrierId;
  }

  // Domyślny carrier (fallback) - Paczkomat InPost
  return 437;
}

/**
 * Oblicza koszt dostawy dla zamówienia
 */
export async function calculateShippingCost(
  shippingCode: string,
  orderAmount: number
): Promise<number> {
  const method = await getShippingMethodByCode(shippingCode);

  if (!method) {
    return 0;
  }

  // Sprawdź czy darmowa dostawa
  if (method.freeFromAmount && orderAmount >= method.freeFromAmount) {
    return 0;
  }

  return method.price;
}
