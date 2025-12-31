import { NextResponse } from "next/server";
import { getActivePaymentMethods } from "@/lib/payments";

/**
 * GET /api/payments/methods
 *
 * Zwraca listę dostępnych metod płatności
 *
 * Query params:
 * - amount: Kwota zamówienia (do walidacji min/max)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount");

    const methods = await getActivePaymentMethods();

    // Filtruj metody na podstawie kwoty
    let filteredMethods = methods;

    if (amount) {
      const orderAmount = parseFloat(amount);

      filteredMethods = methods.filter((method) => {
        if (method.minAmount && orderAmount < method.minAmount) {
          return false;
        }
        if (method.maxAmount && orderAmount > method.maxAmount) {
          return false;
        }
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      methods: filteredMethods,
    });
  } catch (error) {
    console.error("[API] /payments/methods error:", error);
    return NextResponse.json(
      { error: "Błąd pobierania metod płatności" },
      { status: 500 }
    );
  }
}
