/**
 * Furgonetka Shipping Provider
 *
 * Agregator wysyłek - obsługuje wielu przewoźników przez jedno API:
 * - InPost (paczkomaty i kurier)
 * - DHL (w tym Żabka)
 * - Orlen Paczka
 * - i inne
 *
 * Dokumentacja: https://furgonetka.pl/api/rest
 * OAuth2: https://furgonetka.pl/api/oauth
 *
 * Zmienne środowiskowe:
 * - FURGONETKA_CLIENT_ID
 * - FURGONETKA_CLIENT_SECRET
 * - FURGONETKA_SANDBOX (true/false)
 */

import type {
  ShippingProvider,
  ShippingProviderConfig,
  ShippingPoint,
  ShippingRate,
  CreateShipmentParams,
  ShipmentResult,
  TrackingInfo,
  ShipmentStatus,
  PointSearchQuery,
  RateCalculationParams,
} from "./types";

const FURGONETKA_API_URL = "https://api.furgonetka.pl";
const FURGONETKA_SANDBOX_URL = "https://api.sandbox.furgonetka.pl";

interface FurgonetkaConfig extends ShippingProviderConfig {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
}

interface FurgonetkaToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  expires_at?: number;
}

interface FurgonetkaOpeningHours {
  [day: string]: {
    start_hour: string;
    end_hour: string;
  } | null;
}

interface FurgonetkaPoint {
  id: string;
  code: string;
  name: string;
  type: string;
  service: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  opening_hours?: FurgonetkaOpeningHours;
}

interface FurgonetkaService {
  id: string;
  name: string;
  type: string;
  carrier: string;
  carrier_name: string;
  pickup_type: string;
  delivery_type: string;
}

class FurgonetkaProvider implements ShippingProvider {
  readonly name = "Furgonetka";
  readonly code = "furgonetka";

  private config: FurgonetkaConfig | null = null;
  private token: FurgonetkaToken | null = null;

  initialize(config: ShippingProviderConfig): void {
    this.config = config as FurgonetkaConfig;
  }

  private get baseUrl(): string {
    return this.config?.isTestMode
      ? FURGONETKA_SANDBOX_URL
      : FURGONETKA_API_URL;
  }

  // ==========================================
  // OAuth2 Authentication
  // ==========================================

  private async getAccessToken(): Promise<string> {
    // Sprawdź czy mamy ważny token
    if (this.token && this.token.expires_at) {
      const now = Date.now();
      if (now < this.token.expires_at - 60000) {
        // 1 min buffer
        return this.token.access_token;
      }
    }

    // Pobierz nowy token
    await this.authenticate();
    return this.token!.access_token;
  }

  private async authenticate(): Promise<void> {
    if (!this.config?.clientId || !this.config?.clientSecret) {
      throw new Error("Furgonetka: Brak konfiguracji client_id/client_secret");
    }

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    // Client credentials flow
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    // Jeśli mamy username/password, użyj password grant
    if (this.config.username && this.config.password) {
      params.set("grant_type", "password");
      params.append("username", this.config.username);
      params.append("password", this.config.password);
    }

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Furgonetka] Auth error:", error);
      throw new Error(`Furgonetka: Błąd autoryzacji - ${response.status}`);
    }

    const data = await response.json();
    this.token = {
      ...data,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    console.log("[Furgonetka] Token obtained successfully");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Furgonetka] API error ${endpoint}:`, error);
      throw new Error(`Furgonetka API error: ${response.status}`);
    }

    return response.json();
  }

  // ==========================================
  // Punkty odbioru (Paczkomaty, Żabka, Orlen)
  // ==========================================

  async findPoints(query: PointSearchQuery): Promise<ShippingPoint[]> {
    try {
      // Prawidłowy format dla Furgonetka API
      const lat = query.location?.lat || 52.2297;
      const lng = query.location?.lng || 21.0122;
      const radius = query.location?.radius || 30;

      // Mapuj nazwę usługi na format Furgonetki
      const serviceMap: Record<string, string> = {
        inpost: "inpost",
        zabka: "dhl", // Żabka = DHL POP
        orlen: "orlen",
      };

      const requestBody = {
        location: {
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
          points_max_distance: radius,
        },
        filters: {
          country_codes: ["PL"],
          point_id: "",
          point_types: [],
          services: query.service ? [serviceMap[query.service] || query.service] : [],
          map_bounds: {},
          limit: query.limit || 100,
        },
      };

      const response = await fetch(`${this.baseUrl}/points/map`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Furgonetka] points/map error:", response.status, error);
        throw new Error(`Furgonetka API error: ${response.status}`);
      }

      const data = await response.json();
      const points = data.points || [];

      // Mapuj punkty na format ShippingPoint
      return points.map((point: FurgonetkaPoint & { distance?: number; coordinates?: { latitude: number; longitude: number } }) => ({
        id: point.code || point.id,
        name: point.name,
        type: point.type === "APM" || point.type === "PACZKOMAT" ? "locker" : "pop",
        address: {
          street: point.address?.street || "",
          city: point.address?.city || "",
          postCode: point.address?.postcode || "",
          country: point.address?.country || "PL",
        },
        location: point.coordinates
          ? { lat: point.coordinates.latitude, lng: point.coordinates.longitude }
          : { lat: 0, lng: 0 },
        openingHours: this.formatOpeningHours(point.opening_hours),
        meta: {
          service: point.service,
          description: (point as { description?: string }).description,
          // Distance from API is in km, convert to meters for frontend
          distance: point.distance ? point.distance * 1000 : undefined,
        },
      }));
    } catch (error) {
      console.error("[Furgonetka] findPoints error:", error);

      // Fallback - użyj publicznego API InPost dla paczkomatów
      if (!query.service || query.service === "inpost") {
        return this.findPointsFallback(query);
      }

      return [];
    }
  }

  private formatOpeningHours(hours: FurgonetkaOpeningHours | undefined): string {
    if (!hours) return "24/7";

    const firstDay = hours["monday"];

    if (!firstDay) return "24/7";
    if (firstDay.start_hour === "00:00" && firstDay.end_hour === "00:00") return "24/7";

    return `${firstDay.start_hour} - ${firstDay.end_hour}`;
  }

  private mapPoint(point: FurgonetkaPoint): ShippingPoint {
    // Określ typ na podstawie service
    let type = "locker";
    if (point.service?.includes("dhl") || point.type?.includes("pop")) {
      type = "pop";
    }

    return {
      id: point.code || point.id,
      name: point.name,
      type,
      address: {
        street: point.address?.street || "",
        city: point.address?.city || "",
        postCode: point.address?.postcode || "",
        country: point.address?.country || "PL",
      },
      location: point.location
        ? {
            lat: point.location.latitude,
            lng: point.location.longitude,
          }
        : { lat: 0, lng: 0 },
      openingHours: this.formatOpeningHours(point.opening_hours),
      meta: {
        service: point.service,
        originalType: point.type,
      },
    };
  }

  // Fallback do publicznego API InPost
  private async findPointsFallback(
    query: PointSearchQuery
  ): Promise<ShippingPoint[]> {
    try {
      const params = new URLSearchParams();

      if (query.city) {
        params.append("city", query.city);
      }
      if (query.postCode) {
        params.append("post_code", query.postCode);
      }
      if (query.location) {
        params.append(
          "relative_point",
          `${query.location.lat},${query.location.lng}`
        );
      }

      params.append("type", "parcel_locker,pop");
      params.append("limit", (query.limit || 30).toString());
      params.append("status", "Operating");

      const response = await fetch(
        `https://api-pl-points.easypack24.net/v1/points?${params.toString()}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (data.items || []).map((point: {
        name: string;
        type: string[];
        address_details: {
          street: string;
          building_number: string;
          city: string;
          post_code: string;
        };
        location: {
          latitude: number;
          longitude: number;
        };
        opening_hours?: string;
      }) => ({
        id: point.name,
        name: `Paczkomat ${point.name}`,
        type: point.type.includes("parcel_locker") ? "locker" : "pop",
        address: {
          street: `${point.address_details.street} ${point.address_details.building_number}`.trim(),
          city: point.address_details.city,
          postCode: point.address_details.post_code,
          country: "PL",
        },
        location: {
          lat: point.location.latitude,
          lng: point.location.longitude,
        },
        openingHours: point.opening_hours,
      }));
    } catch (error) {
      console.error("[Furgonetka] fallback findPoints error:", error);
      return [];
    }
  }

  // ==========================================
  // Lista dostępnych usług
  // ==========================================

  async getServices(): Promise<FurgonetkaService[]> {
    try {
      const data = await this.request<{ services: FurgonetkaService[] }>(
        "/api/v1/services"
      );
      return data.services || [];
    } catch (error) {
      console.error("[Furgonetka] getServices error:", error);
      return [];
    }
  }

  // ==========================================
  // Kalkulacja kosztów
  // ==========================================

  async calculateRate(params: RateCalculationParams): Promise<ShippingRate | null> {
    // Furgonetka oferuje różne ceny w zależności od usługi
    // Tu możemy pobrać ceny z API lub użyć stałych

    const basePrice = params.isPoint ? 11.99 : 14.99;
    const codSurcharge = params.codAmount ? 3.0 : 0;

    return {
      providerId: 0,
      code: params.isPoint ? "furgonetka_point" : "furgonetka_courier",
      name: params.isPoint ? "Punkt odbioru" : "Kurier",
      description: "1-3 dni robocze",
      price: basePrice + codSurcharge,
      deliveryTime: "1-3 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 3,
      requiresPoint: params.isPoint || false,
      icon: params.isPoint ? "Package" : "Truck",
    };
  }

  // ==========================================
  // Tworzenie przesyłki
  // ==========================================

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    try {
      // Mapuj kod usługi na service_id Furgonetki
      const serviceId = this.mapProviderCodeToService(params.providerCode);

      const packageData = {
        service: serviceId,
        sender: {
          // Dane nadawcy (z konfiguracji sklepu)
          company: "HomeScreen",
          name: "HomeScreen",
          street: "Szeroka 20",
          city: "Koszalin",
          postcode: "75-814",
          country: "PL",
          email: "info@homescreen.pl",
          phone: "+48793237970",
        },
        receiver: {
          name: params.receiverName,
          email: params.receiverEmail,
          phone: params.receiverPhone,
          ...(params.address && {
            street: params.address.street,
            city: params.address.city,
            postcode: params.address.postCode,
            country: params.address.country || "PL",
          }),
        },
        parcels: [
          {
            weight: params.parcel?.weight || 0.5,
            width: params.parcel?.width || 20,
            height: params.parcel?.height || 10,
            depth: params.parcel?.depth || 15,
          },
        ],
        ...(params.pointId && {
          pickup_point: params.pointId,
        }),
        ...(params.codAmount && {
          cod: {
            amount: params.codAmount,
            currency: "PLN",
          },
        }),
        reference: params.reference || `ORDER-${params.orderId}`,
        description: params.comments || `Zamówienie #${params.orderId}`,
      };

      const data = await this.request<{
        id: string;
        tracking_number: string;
        tracking_url: string;
        label_url?: string;
      }>("/api/v1/packages", {
        method: "POST",
        body: JSON.stringify(packageData),
      });

      return {
        success: true,
        shipmentId: data.id,
        trackingNumber: data.tracking_number,
        trackingUrl: data.tracking_url,
        labelUrl: data.label_url,
      };
    } catch (error) {
      console.error("[Furgonetka] createShipment error:", error);

      // W przypadku błędu, zwróć mock dla deweloperów
      if (this.config?.isTestMode) {
        return {
          success: true,
          shipmentId: `mock_${Date.now()}`,
          trackingNumber: `FURG${Date.now().toString().slice(-10)}`,
          trackingUrl: `https://furgonetka.pl/tracking/FURG${Date.now()}`,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Błąd tworzenia przesyłki",
      };
    }
  }

  private mapProviderCodeToService(code: string): string {
    // Mapowanie kodów na usługi Furgonetki
    const serviceMap: Record<string, string> = {
      inpost_locker: "inpost_paczkomat",
      inpost_courier: "inpost_kurier",
      zabka: "dhl_parcelshop",
      orlen_paczka: "orlen",
      dhl_pop: "dhl_parcelshop",
      dhl_courier: "dhl_kurier",
      dpd: "dpd",
      gls: "gls",
    };

    return serviceMap[code] || code;
  }

  // ==========================================
  // Tracking
  // ==========================================

  async getTracking(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      const data = await this.request<{
        tracking_number: string;
        status: string;
        events: Array<{
          date: string;
          status: string;
          description: string;
          location?: string;
        }>;
      }>(`/api/v1/tracking/${trackingNumber}`);

      return {
        trackingNumber: data.tracking_number,
        status: this.mapStatus(data.status),
        events: (data.events || []).map((event) => ({
          timestamp: new Date(event.date),
          status: this.mapStatus(event.status),
          description: event.description,
          location: event.location,
        })),
      };
    } catch (error) {
      console.error("[Furgonetka] getTracking error:", error);
      return null;
    }
  }

  private mapStatus(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      created: "pending",
      confirmed: "pending",
      picked_up: "shipped",
      in_transit: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      returned: "returned",
      failed: "failed",
    };

    return statusMap[status.toLowerCase()] || "in_transit";
  }

  // ==========================================
  // Etykieta
  // ==========================================

  async getLabel(shipmentId: string): Promise<string | null> {
    try {
      const data = await this.request<{ label_url: string }>(
        `/api/v1/packages/${shipmentId}/label`
      );
      return data.label_url;
    } catch (error) {
      console.error("[Furgonetka] getLabel error:", error);
      return null;
    }
  }
}

// Singleton instance
export const furgonetkaProvider = new FurgonetkaProvider();

// Helper do inicjalizacji z env
export function initializeFurgonetka() {
  furgonetkaProvider.initialize({
    clientId: process.env.FURGONETKA_CLIENT_ID || "",
    clientSecret: process.env.FURGONETKA_CLIENT_SECRET || "",
    username: process.env.FURGONETKA_USERNAME,
    password: process.env.FURGONETKA_PASSWORD,
    isTestMode: process.env.FURGONETKA_SANDBOX === "true",
  });
  return furgonetkaProvider;
}
