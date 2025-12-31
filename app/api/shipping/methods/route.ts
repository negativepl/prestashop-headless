import { NextResponse } from "next/server";
import { getActiveShippingMethods } from "@/lib/shipping";

/**
 * GET /api/shipping/methods
 *
 * Zwraca listę dostępnych metod dostawy
 *
 * Query params:
 * - amount: Kwota zamówienia (do obliczenia darmowej dostawy)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount");

    const orderAmount = amount ? parseFloat(amount) : undefined;
    const methods = await getActiveShippingMethods(orderAmount);

    return NextResponse.json({
      success: true,
      methods,
      freeShippingThreshold: 100, // TODO: z konfiguracji
    });
  } catch (error) {
    console.error("[API] /shipping/methods error:", error);
    return NextResponse.json(
      { error: "Błąd pobierania metod dostawy" },
      { status: 500 }
    );
  }
}
