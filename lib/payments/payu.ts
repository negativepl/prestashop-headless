/**
 * PayU Payment Provider
 *
 * Wrapper dla PayU REST API (Polska)
 * Dokumentacja: https://developers.payu.com/pl/restapi.html
 *
 * Zmienne środowiskowe:
 * - PAYU_POS_ID (Merchant POS ID)
 * - PAYU_SECRET_KEY (Second Key / MD5 Key)
 * - PAYU_OAUTH_CLIENT_ID
 * - PAYU_OAUTH_CLIENT_SECRET
 *
 * Sandbox: https://secure.snd.payu.com
 * Production: https://secure.payu.com
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
} from "./types";
import crypto from "crypto";
import { paymentLogger, logError } from "@/lib/logger";

const PAYU_SANDBOX_URL = "https://secure.snd.payu.com";
const PAYU_PRODUCTION_URL = "https://secure.payu.com";

interface PayUConfig extends ProviderConfig {
  posId?: string;
  secondKey?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}

interface PayUOrderResponse {
  status: {
    statusCode: string;
    statusDesc?: string;
  };
  orderId?: string;
  redirectUri?: string;
  extOrderId?: string;
}

interface PayUNotification {
  order: {
    orderId: string;
    extOrderId: string;
    status: string;
    totalAmount: string;
  };
  localReceiptDateTime?: string;
  properties?: Array<{ name: string; value: string }>;
}

class PayUProvider implements PaymentProvider {
  readonly name = "PayU";
  readonly code = "payu";

  private config: PayUConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  initialize(config: ProviderConfig): void {
    this.config = config as PayUConfig;
  }

  private get baseUrl(): string {
    return this.config?.isTestMode ? PAYU_SANDBOX_URL : PAYU_PRODUCTION_URL;
  }

  private async getAccessToken(): Promise<string> {
    // Sprawdź czy token jest jeszcze ważny
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config?.oauthClientId || !this.config?.oauthClientSecret) {
      throw new Error("PayU OAuth credentials nie są skonfigurowane");
    }

    const response = await fetch(`${this.baseUrl}/pl/standard/user/oauth/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.oauthClientId,
        client_secret: this.config.oauthClientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`PayU OAuth error: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 60s buffer

    return this.accessToken!;
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      // Sprawdź czy PayU jest skonfigurowany
      if (!this.config?.posId || !this.config?.oauthClientId) {
        console.warn("[PayU] Brak konfiguracji - używam trybu mock");
        return {
          success: true,
          externalId: `mock_payu_${Date.now()}`,
          paymentUrl: `${params.returnUrl}?mock=true&orderId=${params.orderId}`,
          status: "pending",
        };
      }

      const accessToken = await this.getAccessToken();

      // Mapuj metodę płatności na PayU payMethod
      const payMethod = this.mapMethodToPayU(params.methodCode);

      const orderData = {
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payu`,
        continueUrl: params.returnUrl,
        customerIp: "127.0.0.1", // TODO: pobierz prawdziwe IP
        merchantPosId: this.config.posId,
        description: params.description || `Zamówienie #${params.orderId}`,
        currencyCode: params.currency?.toUpperCase() || "PLN",
        totalAmount: Math.round(params.amount * 100).toString(), // PayU używa groszy
        extOrderId: params.orderId.toString(),
        buyer: {
          email: params.customerEmail,
          firstName: params.customerName.split(" ")[0] || "Klient",
          lastName: params.customerName.split(" ").slice(1).join(" ") || ".",
          language: "pl",
        },
        products: [
          {
            name: params.description || `Zamówienie #${params.orderId}`,
            unitPrice: Math.round(params.amount * 100).toString(),
            quantity: "1",
          },
        ],
        ...(payMethod && { payMethods: { payMethod } }),
      };

      const response = await fetch(`${this.baseUrl}/api/v2_1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
        redirect: "manual", // PayU redirectuje na stronę płatności
      });

      // PayU zwraca 302 redirect
      if (response.status === 302 || response.status === 200) {
        const data: PayUOrderResponse = await response.json();

        if (data.status.statusCode === "SUCCESS") {
          return {
            success: true,
            externalId: data.orderId,
            paymentUrl: data.redirectUri,
            status: "pending",
          };
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { status?: { statusDesc?: string } })?.status?.statusDesc ||
          `PayU error: ${response.status}`
      );
    } catch (error) {
      logError(paymentLogger, "PayU createPayment error", error);
      return {
        success: false,
        status: "failed",
        error: {
          code: "payu_error",
          message: error instanceof Error ? error.message : "Błąd PayU",
        },
      };
    }
  }

  private mapMethodToPayU(
    methodCode: string
  ): { type: string; value?: string } | null {
    switch (methodCode) {
      case "blik":
        return { type: "PBL", value: "blik" };
      case "card":
        return { type: "CARD_TOKEN" };
      case "transfer":
        return { type: "PBL" }; // Pay-by-link - wybór banku na stronie PayU
      case "installments":
        return { type: "INSTALLMENTS" };
      default:
        return null; // Brak preferencji - PayU pokaże wszystkie metody
    }
  }

  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookResult> {
    try {
      const payloadStr =
        typeof payload === "string" ? payload : payload.toString();

      // Weryfikacja podpisu - WYMAGANA w produkcji
      const isProduction = process.env.NODE_ENV === "production";

      if (!this.config?.secondKey) {
        if (isProduction) {
          paymentLogger.error("PayU secondKey not configured in production");
          return { success: false, error: "Webhook verification not configured" };
        }
        paymentLogger.warn("PayU secondKey not configured - skipping verification (dev only)");
      } else {
        const expectedSignature = this.calculateSignature(payloadStr);
        if (signature !== expectedSignature) {
          paymentLogger.error({ signature, expected: expectedSignature.slice(0, 8) + "..." }, "PayU invalid webhook signature");
          return { success: false, error: "Invalid webhook signature" };
        }
      }

      const notification: PayUNotification = JSON.parse(payloadStr);
      const order = notification.order;

      paymentLogger.info({ orderId: order.extOrderId, status: order.status }, "PayU webhook received");

      return {
        success: true,
        orderId: parseInt(order.extOrderId),
        newStatus: this.mapStatus(order.status),
      };
    } catch (error) {
      logError(paymentLogger, "PayU handleWebhook error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Błąd webhooka",
      };
    }
  }

  private calculateSignature(payload: string): string {
    if (!this.config?.secondKey) return "";

    return crypto
      .createHash("md5")
      .update(payload + this.config.secondKey)
      .digest("hex");
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    try {
      if (!this.config?.posId || !this.config?.oauthClientId) {
        console.warn("[PayU] Brak konfiguracji - mock refund");
        return {
          success: true,
          refundId: `mock_refund_${Date.now()}`,
        };
      }

      const accessToken = await this.getAccessToken();

      // TODO: Pobierz externalId z bazy na podstawie transactionId
      const payuOrderId = `${params.transactionId}`; // Placeholder

      const refundData = {
        description: params.reason || "Zwrot zamówienia",
        ...(params.amount && {
          amount: Math.round(params.amount * 100).toString(),
        }),
      };

      const response = await fetch(
        `${this.baseUrl}/api/v2_1/orders/${payuOrderId}/refunds`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refund: refundData }),
        }
      );

      if (!response.ok) {
        throw new Error(`PayU refund error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        refundId: data.refund?.refundId,
      };
    } catch (error) {
      console.error("[PayU] refund error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Błąd zwrotu",
      };
    }
  }

  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    try {
      if (!this.config?.posId || !this.config?.oauthClientId) {
        return "pending";
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/api/v2_1/orders/${externalId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`PayU status error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapStatus(data.orders?.[0]?.status || "PENDING");
    } catch {
      return "failed";
    }
  }

  private mapStatus(payuStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      NEW: "pending",
      PENDING: "processing",
      WAITING_FOR_CONFIRMATION: "processing",
      COMPLETED: "completed",
      CANCELED: "cancelled",
      REJECTED: "failed",
    };
    return statusMap[payuStatus] || "pending";
  }
}

// Singleton instance
export const payuProvider = new PayUProvider();

// Helper do inicjalizacji z env
export function initializePayU() {
  payuProvider.initialize({
    posId: process.env.PAYU_POS_ID,
    secondKey: process.env.PAYU_SECOND_KEY,
    oauthClientId: process.env.PAYU_OAUTH_CLIENT_ID,
    oauthClientSecret: process.env.PAYU_OAUTH_CLIENT_SECRET,
    isTestMode: process.env.PAYU_SANDBOX === "true",
  });
  return payuProvider;
}
