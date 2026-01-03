import { NextRequest, NextResponse } from "next/server";
import { furgonetkaProvider, initializeFurgonetka } from "@/lib/shipping/furgonetka";

/**
 * GET /api/inpost/points
 *
 * Wyszukuje paczkomaty InPost przez Furgonetkę
 * Zachowuje format odpowiedzi kompatybilny z InPost GeoWidget
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const type = searchParams.get("type") || "parcel_locker";
  const perPage = parseInt(searchParams.get("per_page") || "100");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const service = searchParams.get("service") || "inpost"; // inpost, dhl, orlen

  try {
    // Inicjalizuj Furgonetkę
    initializeFurgonetka();

    // Pobierz punkty przez Furgonetkę
    const points = await furgonetkaProvider.findPoints({
      location: lat && lng ? {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: 20,
      } : undefined,
      type: type === "parcel_locker" ? "locker" : "pop",
      limit: perPage,
      service, // przekaż usługę do filtrowania
    } as Parameters<typeof furgonetkaProvider.findPoints>[0]);

    // Przekształć na format kompatybilny z InPost GeoWidget (dla modala)
    const items = points.map((point) => ({
      name: point.id,
      type: point.type === "locker" ? ["parcel_locker"] : ["pop"],
      status: "Operating",
      location: {
        longitude: point.location.lng,
        latitude: point.location.lat,
      },
      address: {
        line1: point.address.street,
        line2: `${point.address.postCode} ${point.address.city}`,
      },
      address_details: {
        city: point.address.city,
        province: "",
        post_code: point.address.postCode,
        street: point.address.street.split(" ").slice(0, -1).join(" ") || point.address.street,
        building_number: point.address.street.split(" ").pop() || "",
      },
      opening_hours: point.openingHours || "24/7",
      location_description: point.name,
      distance: point.meta?.distance as number | undefined,
      image_url: undefined,
    }));

    // Sortuj po odległości jeśli mamy lokalizację
    if (lat && lng) {
      items.sort((a, b) => {
        const distA = a.distance || Infinity;
        const distB = b.distance || Infinity;
        return distA - distB;
      });
    }

    return NextResponse.json({
      items,
      count: items.length,
      total_pages: 1,
      page: 1,
    });
  } catch (error) {
    console.error("Error fetching points via Furgonetka:", error);

    // Fallback do bezpośredniego API InPost
    return fetchFromInPostDirectly(searchParams);
  }
}

// Fallback do bezpośredniego API InPost
async function fetchFromInPostDirectly(searchParams: URLSearchParams) {
  const params = new URLSearchParams();
  params.set("type", searchParams.get("type") || "parcel_locker");
  params.set("status", "Operating");
  params.set("per_page", searchParams.get("per_page") || "100");

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (lat && lng) {
    params.set("relative_point", `${lat},${lng}`);
    params.set("sort_by", "distance_asc");
  }

  try {
    const response = await fetch(
      `https://api-pl-points.easypack24.net/v1/points?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`InPost API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching InPost points (fallback):", error);
    return NextResponse.json(
      { error: "Failed to fetch points", items: [] },
      { status: 500 }
    );
  }
}
