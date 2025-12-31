/**
 * Payment System - główny moduł
 *
 * Używanie:
 * ```ts
 * import { getPaymentProvider, createPayment, PAYMENT_PROVIDERS } from "@/lib/payments";
 *
 * // Pobranie providera
 * const provider = getPaymentProvider("stripe");
 *
 * // Utworzenie płatności
 * const result = await createPayment({
 *   providerCode: "payu",
 *   methodCode: "blik",
 *   orderId: 12345,
 *   amount: 99.99,
 *   ...
 * });
 * ```
 */

import { stripeProvider, initializeStripe } from "./stripe";
import { payuProvider, initializePayU } from "./payu";
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  WebhookResult,
  PaymentStatus,
} from "./types";

// Re-export types
export * from "./types";

// Lista dostępnych providerów
export const PAYMENT_PROVIDERS = {
  stripe: stripeProvider,
  payu: payuProvider,
} as const;

export type PaymentProviderCode = keyof typeof PAYMENT_PROVIDERS;

// Inicjalizacja wszystkich providerów
let initialized = false;

export function initializePayments() {
  if (initialized) return;

  initializeStripe();
  initializePayU();

  initialized = true;
  console.log("[Payments] Providers initialized");
}

// Pobranie providera po kodzie
export function getPaymentProvider(code: string): PaymentProvider | null {
  initializePayments();
  return PAYMENT_PROVIDERS[code as PaymentProviderCode] || null;
}

// Główna funkcja do tworzenia płatności
export interface CreatePaymentOptions extends CreatePaymentParams {
  providerCode: string;
}

export async function createPayment(
  options: CreatePaymentOptions
): Promise<PaymentResult> {
  initializePayments();

  const provider = getPaymentProvider(options.providerCode);

  if (!provider) {
    return {
      success: false,
      status: "failed",
      error: {
        code: "provider_not_found",
        message: `Nieznany provider: ${options.providerCode}`,
      },
    };
  }

  return provider.createPayment(options);
}

// Obsługa webhooka
export async function handlePaymentWebhook(
  providerCode: string,
  payload: string | Buffer,
  signature: string
): Promise<WebhookResult> {
  initializePayments();

  const provider = getPaymentProvider(providerCode);

  if (!provider) {
    return {
      success: false,
      error: `Nieznany provider: ${providerCode}`,
    };
  }

  return provider.handleWebhook(payload, signature);
}

// Sprawdzenie statusu płatności
export async function getPaymentStatus(
  providerCode: string,
  externalId: string
): Promise<PaymentStatus> {
  initializePayments();

  const provider = getPaymentProvider(providerCode);

  if (!provider) {
    return "failed";
  }

  return provider.getPaymentStatus(externalId);
}

// ===========================================
// METODY PŁATNOŚCI Z BAZY DANYCH
// ===========================================

import { prisma } from "@/lib/prisma";

export interface PaymentMethodInfo {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  providerCode: string;
  providerName: string;
  surcharge: number;
  minAmount: number | null;
  maxAmount: number | null;
}

// Pobranie aktywnych metod płatności
export async function getActivePaymentMethods(): Promise<PaymentMethodInfo[]> {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true,
        provider: {
          isActive: true,
        },
      },
      include: {
        provider: true,
      },
      orderBy: [
        { provider: { position: "asc" } },
        { position: "asc" },
      ],
    });

    return methods.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      icon: m.icon,
      providerCode: m.provider.code,
      providerName: m.provider.name,
      surcharge: m.surcharge,
      minAmount: m.minAmount,
      maxAmount: m.maxAmount,
    }));
  } catch (error) {
    console.error("[Payments] getActivePaymentMethods error:", error);
    // Zwróć domyślne metody jeśli baza nie jest gotowa
    return getDefaultPaymentMethods();
  }
}

// Domyślne metody płatności (fallback)
function getDefaultPaymentMethods(): PaymentMethodInfo[] {
  return [
    {
      id: 0,
      code: "cod",
      name: "Płatność przy odbiorze",
      description: "Zapłać gotówką lub kartą kurierowi",
      icon: "Banknote",
      providerCode: "cod",
      providerName: "COD",
      surcharge: 5,
      minAmount: null,
      maxAmount: 1000,
    },
    {
      id: 0,
      code: "blik",
      name: "BLIK",
      description: "Szybka płatność kodem BLIK",
      icon: "Wallet",
      providerCode: "payu",
      providerName: "PayU",
      surcharge: 0,
      minAmount: null,
      maxAmount: null,
    },
    {
      id: 0,
      code: "card",
      name: "Karta płatnicza",
      description: "Visa, Mastercard, Maestro",
      icon: "CreditCard",
      providerCode: "stripe",
      providerName: "Stripe",
      surcharge: 0,
      minAmount: null,
      maxAmount: null,
    },
    {
      id: 0,
      code: "transfer",
      name: "Przelew online",
      description: "Płatność przez Twój bank",
      icon: "Building2",
      providerCode: "payu",
      providerName: "PayU",
      surcharge: 0,
      minAmount: null,
      maxAmount: null,
    },
  ];
}

// Walidacja metody dla kwoty zamówienia
export function validatePaymentMethod(
  method: PaymentMethodInfo,
  amount: number
): { valid: boolean; error?: string } {
  if (method.minAmount && amount < method.minAmount) {
    return {
      valid: false,
      error: `Minimalna kwota dla ${method.name} to ${method.minAmount} PLN`,
    };
  }

  if (method.maxAmount && amount > method.maxAmount) {
    return {
      valid: false,
      error: `Maksymalna kwota dla ${method.name} to ${method.maxAmount} PLN`,
    };
  }

  return { valid: true };
}
