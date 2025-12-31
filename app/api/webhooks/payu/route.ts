import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/lib/payments";
import { updateOrderStatus } from "@/lib/prestashop/orders";

/**
 * POST /api/webhooks/payu
 *
 * Obsługuje webhooki od PayU
 * PayU wysyła: COMPLETED, CANCELED, REJECTED, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("OpenPayu-Signature") || "";

    console.log("[Webhook] PayU received");

    // Obsłuż webhook
    const result = await handlePaymentWebhook("payu", payload, signature);

    if (!result.success) {
      console.error("[Webhook] PayU error:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Jeśli mamy nowy status i orderId, zaktualizuj zamówienie w PrestaShop
    if (result.orderId && result.newStatus) {
      console.log(
        `[Webhook] PayU - Order ${result.orderId} -> ${result.newStatus}`
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
    console.error("[Webhook] PayU error:", error);
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
  // Mapowanie statusów (te same co Stripe)
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
