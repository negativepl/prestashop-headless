import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/lib/payments";
import { updateOrderStatus } from "@/lib/prestashop/orders";

/**
 * POST /api/webhooks/stripe
 *
 * Obsługuje webhooki od Stripe
 * Stripe wysyła: payment_intent.succeeded, payment_intent.failed, charge.refunded, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    console.log("[Webhook] Stripe received");

    // Obsłuż webhook
    const result = await handlePaymentWebhook("stripe", payload, signature);

    if (!result.success) {
      console.error("[Webhook] Stripe error:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Jeśli mamy nowy status i orderId, zaktualizuj zamówienie w PrestaShop
    if (result.orderId && result.newStatus) {
      console.log(
        `[Webhook] Stripe - Order ${result.orderId} -> ${result.newStatus}`
      );

      try {
        await updateOrderStatusFromPayment(result.orderId, result.newStatus);
      } catch (updateError) {
        console.error("[Webhook] Failed to update PrestaShop order:", updateError);
        // Nie zwracamy błędu - webhook został obsłużony poprawnie
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Stripe error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Mapowanie statusu płatności na status zamówienia PrestaShop
async function updateOrderStatusFromPayment(
  orderId: number,
  paymentStatus: string
) {
  // Mapowanie statusów
  const statusMap: Record<string, number> = {
    completed: 2,    // Płatność zaakceptowana
    failed: 8,       // Błąd płatności
    refunded: 7,     // Zwróconych pieniędzy
    cancelled: 6,    // Anulowane
  };

  const prestashopStatus = statusMap[paymentStatus];

  if (prestashopStatus) {
    await updateOrderStatus(orderId, prestashopStatus);
  }
}
