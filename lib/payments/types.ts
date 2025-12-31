// Typy dla systemu płatności

export type PaymentStatus =
  | "pending"      // Oczekuje na płatność
  | "processing"   // W trakcie przetwarzania
  | "completed"    // Opłacone
  | "failed"       // Błąd płatności
  | "refunded"     // Zwrócone
  | "cancelled";   // Anulowane

export interface CreatePaymentParams {
  orderId: number;
  orderReference?: string;
  amount: number;
  currency?: string;
  methodCode: string;
  customerEmail: string;
  customerName: string;
  description?: string;
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: number;       // ID w naszej bazie
  externalId?: string;          // ID u dostawcy (Stripe PI, PayU order)
  paymentUrl?: string;          // URL do przekierowania
  clientSecret?: string;        // Dla Stripe Elements
  status: PaymentStatus;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebhookResult {
  success: boolean;
  transactionId?: number;
  orderId?: number;
  newStatus?: PaymentStatus;
  error?: string;
}

export interface RefundParams {
  transactionId: number;
  amount?: number;  // Częściowy zwrot, jeśli undefined = pełny
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

// Interfejs dla providera płatności
export interface PaymentProvider {
  // Nazwa providera
  readonly name: string;
  readonly code: string;

  // Inicjalizacja z konfiguracją
  initialize(config: ProviderConfig): void;

  // Tworzenie płatności
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  // Obsługa webhooka
  handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult>;

  // Zwrot płatności
  refund(params: RefundParams): Promise<RefundResult>;

  // Weryfikacja statusu płatności
  getPaymentStatus(externalId: string): Promise<PaymentStatus>;
}

export interface ProviderConfig {
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  isTestMode: boolean;
  // PayU specific
  posId?: string;
  secondKey?: string;
  // Additional config
  [key: string]: unknown;
}

// Mapowanie statusów z zewnętrznych systemów
export const STRIPE_STATUS_MAP: Record<string, PaymentStatus> = {
  "requires_payment_method": "pending",
  "requires_confirmation": "pending",
  "requires_action": "pending",
  "processing": "processing",
  "requires_capture": "processing",
  "succeeded": "completed",
  "canceled": "cancelled",
};

export const PAYU_STATUS_MAP: Record<string, PaymentStatus> = {
  "NEW": "pending",
  "PENDING": "processing",
  "WAITING_FOR_CONFIRMATION": "processing",
  "COMPLETED": "completed",
  "CANCELED": "cancelled",
  "REJECTED": "failed",
};
