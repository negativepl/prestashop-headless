import { NextResponse } from "next/server";
import { findShippingPoints } from "@/lib/shipping";

/**
 * GET /api/shipping/points
 *
 * Wyszukuje punkty odbioru (paczkomaty, punkty)
 *
 * Query params:
 * - provider: Kod providera (np. "inpost")
 * - city: Miasto
 * - postCode: Kod pocztowy
 * - lat: Szerokość geograficzna
 * - lng: Długość geograficzna
 * - radius: Promień w km (domyślnie 10)
 * - type: Typ punktu (locker, pop)
 * - limit: Limit wyników (domyślnie 20)
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
    const type = searchParams.get("type") || undefined;
    const limit = searchParams.get("limit");

    // Walidacja - potrzebujemy przynajmniej jednego kryterium wyszukiwania
    if (!city && !postCode && (!lat || !lng)) {
      return NextResponse.json(
        { error: "Wymagany parametr: city, postCode lub lat+lng" },
        { status: 400 }
      );
    }

    const points = await findShippingPoints(provider, {
      city,
      postCode,
      location:
        lat && lng
          ? {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              radius: radius ? parseFloat(radius) : 10,
            }
          : undefined,
      type,
      limit: limit ? parseInt(limit) : 20,
    });

    return NextResponse.json({
      success: true,
      points,
      count: points.length,
    });
  } catch (error) {
    console.error("[API] /shipping/points error:", error);
    return NextResponse.json(
      { error: "Błąd wyszukiwania punktów" },
      { status: 500 }
    );
  }
}
