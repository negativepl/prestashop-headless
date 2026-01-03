import { NextResponse } from "next/server";
import { findShippingPoints } from "@/lib/shipping";

/**
 * GET /api/shipping/points
 *
 * Uniwersalny endpoint do wyszukiwania punktów odbioru
 * Wszystko idzie przez Furgonetka (agregator)
 * Obsługuje: InPost, Żabka, Orlen Paczka, DHL, DPD, GLS
 *
 * Query params:
 * - provider: Kod usługi ("inpost", "zabka", "orlen", "dhl")
 * - city: Miasto
 * - postCode: Kod pocztowy
 * - lat: Szerokość geograficzna
 * - lng: Długość geograficzna
 * - radius: Promień w km (domyślnie 30)
 * - limit: Limit wyników (domyślnie 100)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const provider = searchParams.get("provider") || "inpost";
    const city = searchParams.get("city") || undefined;
    const postCode = searchParams.get("postCode") || undefined;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");
    const limit = searchParams.get("limit");

    // Walidacja - potrzebujemy przynajmniej jednego kryterium wyszukiwania
    if (!city && !postCode && (!lat || !lng)) {
      return NextResponse.json(
        { error: "Wymagany parametr: city, postCode lub lat+lng" },
        { status: 400 }
      );
    }

    // Wszystkie providery idą przez Furgonetka (agregator)
    const points = await findShippingPoints(provider, {
      city,
      postCode,
      location:
        lat && lng
          ? {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              radius: radius ? parseFloat(radius) : 30,
            }
          : undefined,
      limit: limit ? parseInt(limit) : 100,
    });

    return NextResponse.json({
      success: true,
      points,
      count: points.length,
      provider,
    });
  } catch (error) {
    console.error("[API] /shipping/points error:", error);
    return NextResponse.json(
      { error: "Błąd wyszukiwania punktów" },
      { status: 500 }
    );
  }
}
