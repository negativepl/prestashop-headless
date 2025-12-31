/**
 * Stripe Payment Provider
 *
 * Wrapper dla Stripe API. Wymaga zainstalowania:
 * npm install stripe @stripe/stripe-js
 *
 * Zmienne środowiskowe:
 * - STRIPE_SECRET_KEY
 * - STRIPE_PUBLISHABLE_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

import type {
  PaymentProvider,
  ProviderConfig,
  CreatePaymentParams,
  PaymentResult,
  WebhookResult,
  RefundParams,
  RefundResult,
  PaymentStatus,
  STRIPE_STATUS_MAP,
} from "./types";

// Dynamiczny import Stripe (zainstaluj: npm install stripe)
let Stripe: typeof import("stripe").default | null = null;

async function getStripe() {
  if (!Stripe) {
    try {
      const stripeModule = await import("stripe");
      Stripe = stripeModule.default;
    } catch {
      throw new Error(
        "Stripe SDK nie jest zainstalowany. Uruchom: npm install stripe"
      );
    }
  }
  return Stripe;
}

class StripeProvider implements PaymentProvider {
  readonly name = "Stripe";
  readonly code = "stripe";

  private client: import("stripe").default | null = null;
  private config: ProviderConfig | null = null;

  initialize(config: ProviderConfig): void {
    this.config = config;
  }

  private async getClient(): Promise<import("stripe").default> {
    if (!this.client) {
      if (!this.config?.secretKey) {
        throw new Error("Stripe secret key nie jest skonfigurowany");
      }

      const StripeClass = await getStripe();
      this.client = new StripeClass(this.config.secretKey, {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
      });
    }
    return this.client;
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      // Sprawdź czy Stripe jest skonfigurowany
      if (!this.config?.secretKey) {
        // Zwróć mock response jeśli nie ma klucza
        console.warn("[Stripe] Brak klucza API - używam trybu mock");
        return {
          success: true,
          externalId: `mock_pi_${Date.now()}`,
          clientSecret: `mock_secret_${Date.now()}`,
          status: "pending",
        };
      }

      const stripe = await this.getClient();

      // Utwórz PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Stripe używa groszy
        currency: params.currency?.toLowerCase() || "pln",
        metadata: {
          orderId: params.orderId.toString(),
          orderReference: params.orderReference || "",
          ...params.metadata,
        },
        receipt_email: params.customerEmail,
        description: params.description || `Zamówienie #${params.orderId}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        externalId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: this.mapStatus(paymentIntent.status),
      };
    } catch (error) {
      console.error("[Stripe] createPayment error:", error);
      return {
        success: false,
        status: "failed",
        error: {
          code: "stripe_error",
          message: error instanceof Error ? error.message : "Błąd Stripe",
        },
      };
    }
  }

  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookResult> {
    try {
      if (!this.config?.webhookSecret) {
        console.warn("[Stripe] Brak webhook secret - pomijam weryfikację");
        // Parse payload bez weryfikacji (tylko dev!)
        const event = JSON.parse(
          typeof payload === "string" ? payload : payload.toString()
        );
        return this.processWebhookEvent(event);
      }

      const stripe = await this.getClient();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      return this.processWebhookEvent(event);
    } catch (error) {
      console.error("[Stripe] handleWebhook error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Błąd webhooka",
      };
    }
  }

  private processWebhookEvent(event: {
    type: string;
    data: { object: Record<string, unknown> };
  }): WebhookResult {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          metadata?: { orderId?: string };
        };
        return {
          success: true,
          orderId: pi.metadata?.orderId
            ? parseInt(pi.metadata.orderId)
            : undefined,
          newStatus: "completed",
        };
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as {
          id: string;
          metadata?: { orderId?: string };
        };
        return {
          success: true,
          orderId: pi.metadata?.orderId
            ? parseInt(pi.metadata.orderId)
            : undefined,
          newStatus: "failed",
        };
      }

      case "charge.refunded": {
        const charge = event.data.object as {
          payment_intent: string;
          metadata?: { orderId?: string };
        };
        return {
          success: true,
          orderId: charge.metadata?.orderId
            ? parseInt(charge.metadata.orderId)
            : undefined,
          newStatus: "refunded",
        };
      }

      default:
        return {
          success: true,
          // Nieobsługiwany event - ignorujemy
        };
    }
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    try {
      if (!this.config?.secretKey) {
        console.warn("[Stripe] Brak klucza API - mock refund");
        return {
          success: true,
          refundId: `mock_refund_${Date.now()}`,
        };
      }

      const stripe = await this.getClient();

      // Pobierz transakcję z bazy aby uzyskać externalId
      // TODO: W prawdziwej implementacji pobierz z bazy
      const refund = await stripe.refunds.create({
        payment_intent: `pi_${params.transactionId}`, // Tymczasowo
        amount: params.amount ? Math.round(params.amount * 100) : undefined,
        reason: (params.reason as "duplicate" | "fraudulent" | "requested_by_customer") || "requested_by_customer",
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error("[Stripe] refund error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Błąd zwrotu",
      };
    }
  }

  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    try {
      if (!this.config?.secretKey) {
        return "pending";
      }

      const stripe = await this.getClient();
      const pi = await stripe.paymentIntents.retrieve(externalId);
      return this.mapStatus(pi.status);
    } catch {
      return "failed";
    }
  }

  private mapStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: "pending",
      requires_confirmation: "pending",
      requires_action: "pending",
      processing: "processing",
      requires_capture: "processing",
      succeeded: "completed",
      canceled: "cancelled",
    };
    return statusMap[stripeStatus] || "pending";
  }
}

// Singleton instance
export const stripeProvider = new StripeProvider();

// Helper do inicjalizacji z env
export function initializeStripe() {
  stripeProvider.initialize({
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? true,
  });
  return stripeProvider;
}
