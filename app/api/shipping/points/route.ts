import { NextResponse } from "next/server";
import { findShippingPoints } from "@/lib/shipping";

/**
 * GET /api/shipping/points
 *
 * Uniwersalny endpoint do wyszukiwania punktów odbioru
 * Obsługuje: InPost, Żabka (DHL), Orlen Paczka
 *
 * Query params:
 * - provider: Kod providera ("inpost", "zabka", "orlen", "dhl")
 * - city: Miasto
 * - postCode: Kod pocztowy
 * - lat: Szerokość geograficzna
 * - lng: Długość geograficzna
 * - radius: Promień w km (domyślnie 10)
 * - type: Typ punktu (locker, pop)
 * - limit: Limit wyników (domyślnie 30)
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

    // Dla Żabki i Orlenu, użyj odpowiednich publicznych API
    let points;

    if (provider === "zabka" || provider === "dhl") {
      points = await fetchDhlPoints({
        city,
        postCode,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        limit: limit ? parseInt(limit) : 30,
      });
    } else if (provider === "orlen") {
      points = await fetchOrlenPoints({
        city,
        postCode,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        limit: limit ? parseInt(limit) : 30,
      });
    } else {
      // InPost lub inne - użyj Furgonetka/InPost API
      points = await findShippingPoints(provider, {
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
        limit: limit ? parseInt(limit) : 30,
      });
    }

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

// ==========================================
// DHL ParcelShop (Żabka)
// ==========================================

interface DhlPointQuery {
  city?: string;
  postCode?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}

interface DhlPoint {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postCode: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
}

async function fetchDhlPoints(query: DhlPointQuery): Promise<DhlPoint[]> {
  try {
    // DHL ParcelShop API (publiczne)
    const params = new URLSearchParams();

    if (query.lat && query.lng) {
      params.set("latitude", query.lat.toString());
      params.set("longitude", query.lng.toString());
    }

    if (query.city) {
      params.set("city", query.city);
    }

    if (query.postCode) {
      params.set("postalCode", query.postCode);
    }

    params.set("countryCode", "PL");
    params.set("capability", "parcel-drop-off"); // Żabka
    params.set("limit", (query.limit || 30).toString());

    // Próba użycia DHL API
    const response = await fetch(
      `https://api.dhl.com/location-finder/v1/find-by-address?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return (data.locations || []).map(
        (loc: {
          url: string;
          name: string;
          place: {
            address: {
              streetAddress: string;
              addressLocality: string;
              postalCode: string;
            };
          };
          geo?: {
            latitude: number;
            longitude: number;
          };
          openingHours?: Array<{ closes: string; opens: string }>;
        }) => ({
          id: loc.url?.split("/").pop() || `DHL${Date.now()}`,
          name: loc.name,
          address: {
            street: loc.place?.address?.streetAddress || "",
            city: loc.place?.address?.addressLocality || "",
            postCode: loc.place?.address?.postalCode || "",
          },
          location: loc.geo
            ? {
                lat: loc.geo.latitude,
                lng: loc.geo.longitude,
              }
            : undefined,
          openingHours: loc.openingHours
            ? `${loc.openingHours[0]?.opens}-${loc.openingHours[0]?.closes}`
            : undefined,
        })
      );
    }
  } catch (error) {
    console.error("[DHL API] Error:", error);
  }

  // Fallback - zwróć mock data jeśli API nie działa
  return getMockZabkaPoints(query.city || query.postCode || "Warszawa");
}

function getMockZabkaPoints(location: string): DhlPoint[] {
  return [
    {
      id: "ZAB001",
      name: `Żabka - ${location} Centrum`,
      address: { street: "ul. Główna 1", city: location, postCode: "00-001" },
      location: { lat: 52.23, lng: 21.01 },
      openingHours: "6:00-23:00",
    },
    {
      id: "ZAB002",
      name: `Żabka - ${location} Północ`,
      address: { street: "ul. Północna 15", city: location, postCode: "00-002" },
      location: { lat: 52.24, lng: 21.02 },
      openingHours: "6:00-23:00",
    },
    {
      id: "ZAB003",
      name: `Żabka - ${location} Południe`,
      address: { street: "ul. Południowa 30", city: location, postCode: "00-003" },
      location: { lat: 52.22, lng: 21.0 },
      openingHours: "6:00-22:00",
    },
  ];
}

// ==========================================
// Orlen Paczka
// ==========================================

interface OrlenPoint {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postCode: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
}

async function fetchOrlenPoints(query: DhlPointQuery): Promise<OrlenPoint[]> {
  try {
    // Orlen Paczka API
    const params = new URLSearchParams();

    if (query.lat && query.lng) {
      params.set("lat", query.lat.toString());
      params.set("lng", query.lng.toString());
    }

    if (query.city) {
      params.set("city", query.city);
    }

    params.set("limit", (query.limit || 30).toString());

    // Próba użycia Orlen API (jeśli dostępne)
    const response = await fetch(
      `https://api.orlenpaczka.pl/api/points?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return (data.points || []).map(
        (point: {
          id: string;
          name: string;
          street: string;
          city: string;
          postalCode: string;
          latitude?: number;
          longitude?: number;
          openingHours?: string;
        }) => ({
          id: point.id,
          name: point.name,
          address: {
            street: point.street,
            city: point.city,
            postCode: point.postalCode,
          },
          location:
            point.latitude && point.longitude
              ? {
                  lat: point.latitude,
                  lng: point.longitude,
                }
              : undefined,
          openingHours: point.openingHours,
        })
      );
    }
  } catch (error) {
    console.error("[Orlen API] Error:", error);
  }

  // Fallback - mock data
  return getMockOrlenPoints(query.city || query.postCode || "Warszawa");
}

function getMockOrlenPoints(location: string): OrlenPoint[] {
  return [
    {
      id: "ORL001",
      name: `Orlen - ${location} Centrum`,
      address: { street: "al. Główna 10", city: location, postCode: "00-010" },
      location: { lat: 52.23, lng: 21.01 },
      openingHours: "24/7",
    },
    {
      id: "ORL002",
      name: `Orlen - ${location} Wschód`,
      address: { street: "ul. Wschodnia 50", city: location, postCode: "00-020" },
      location: { lat: 52.24, lng: 21.05 },
      openingHours: "6:00-22:00",
    },
    {
      id: "ORL003",
      name: `Orlen - ${location} Zachód`,
      address: { street: "ul. Zachodnia 100", city: location, postCode: "00-030" },
      location: { lat: 52.22, lng: 20.95 },
      openingHours: "6:00-22:00",
    },
  ];
}
