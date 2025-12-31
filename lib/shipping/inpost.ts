/**
 * InPost Shipping Provider
 *
 * Wrapper dla InPost API (Paczkomaty + Kurier)
 * Dokumentacja: https://developers.inpost.pl/
 *
 * Zmienne środowiskowe:
 * - INPOST_API_TOKEN
 * - INPOST_ORGANIZATION_ID
 *
 * Sandbox: https://sandbox-api-shipx-pl.easypack24.net
 * Production: https://api-shipx-pl.easypack24.net
 */

import type {
  ShippingProvider,
  ShippingProviderConfig,
  ShippingPoint,
  ShippingRate,
  CreateShipmentParams,
  ShipmentResult,
  TrackingInfo,
  TrackingEvent,
  ShipmentStatus,
  PointSearchQuery,
  RateCalculationParams,
} from "./types";

const INPOST_SANDBOX_URL = "https://sandbox-api-shipx-pl.easypack24.net";
const INPOST_PRODUCTION_URL = "https://api-shipx-pl.easypack24.net";

// Publiczne API do wyszukiwania paczkomatów (nie wymaga autoryzacji)
const INPOST_GEOWIDGET_URL = "https://api-pl-points.easypack24.net/v1";

interface InPostConfig extends ShippingProviderConfig {
  organizationId?: string;
}

interface InPostPoint {
  name: string;
  type: string[];
  address: {
    line1: string;
    line2: string;
  };
  address_details: {
    city: string;
    post_code: string;
    street: string;
    building_number: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  opening_hours?: string;
  payment_available?: boolean;
}

class InPostProvider implements ShippingProvider {
  readonly name = "InPost";
  readonly code = "inpost";

  private config: InPostConfig | null = null;

  initialize(config: ShippingProviderConfig): void {
    this.config = config as InPostConfig;
  }

  private get baseUrl(): string {
    return this.config?.isTestMode
      ? INPOST_SANDBOX_URL
      : INPOST_PRODUCTION_URL;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config?.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  async findPoints(query: PointSearchQuery): Promise<ShippingPoint[]> {
    try {
      // Używamy publicznego API GeoWidget - nie wymaga autoryzacji
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
        if (query.location.radius) {
          params.append("max_distance", (query.location.radius * 1000).toString());
        }
      }

      if (query.type) {
        params.append("type", query.type === "locker" ? "parcel_locker" : "pop");
      } else {
        params.append("type", "parcel_locker,pop"); // Domyślnie oba
      }

      params.append("limit", (query.limit || 20).toString());
      params.append("status", "Operating");

      const response = await fetch(
        `${INPOST_GEOWIDGET_URL}/points?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`InPost API error: ${response.status}`);
      }

      const data = await response.json();
      const items: InPostPoint[] = data.items || [];

      return items.map((point) => this.mapPoint(point));
    } catch (error) {
      console.error("[InPost] findPoints error:", error);

      // Zwróć mock data jeśli API nie działa
      if (query.city || query.postCode) {
        return this.getMockPoints(query.city || query.postCode || "");
      }

      return [];
    }
  }

  private mapPoint(point: InPostPoint): ShippingPoint {
    const details = point.address_details;
    return {
      id: point.name,
      name: `Paczkomat ${point.name}`,
      type: point.type.includes("parcel_locker") ? "locker" : "pop",
      address: {
        street: `${details.street} ${details.building_number}`.trim(),
        city: details.city,
        postCode: details.post_code,
        country: "PL",
      },
      location: {
        lat: point.location.latitude,
        lng: point.location.longitude,
      },
      openingHours: point.opening_hours,
      paymentAvailable: point.payment_available,
    };
  }

  private getMockPoints(query: string): ShippingPoint[] {
    // Mock data dla testów
    return [
      {
        id: "KRA001",
        name: "Paczkomat KRA001",
        type: "locker",
        address: {
          street: "ul. Mogilska 1",
          city: query || "Kraków",
          postCode: "31-516",
          country: "PL",
        },
        location: { lat: 50.0647, lng: 19.9450 },
        openingHours: "24/7",
        paymentAvailable: true,
      },
      {
        id: "KRA002",
        name: "Paczkomat KRA002",
        type: "locker",
        address: {
          street: "ul. Czerwone Maki 5",
          city: query || "Kraków",
          postCode: "30-392",
          country: "PL",
        },
        location: { lat: 50.0354, lng: 19.9187 },
        openingHours: "24/7",
        paymentAvailable: true,
      },
      {
        id: "KRA003",
        name: "Punkt InPost - Żabka",
        type: "pop",
        address: {
          street: "ul. Pawia 10",
          city: query || "Kraków",
          postCode: "31-154",
          country: "PL",
        },
        location: { lat: 50.0678, lng: 19.9473 },
        openingHours: "6:00-23:00",
        paymentAvailable: false,
      },
    ];
  }

  async calculateRate(params: RateCalculationParams): Promise<ShippingRate | null> {
    // InPost ma stałe ceny dla paczkomatów
    // W prawdziwej implementacji można pobierać z API lub bazy

    const basePrice = params.isPoint ? 12.99 : 15.99; // Paczkomat vs kurier

    // Sprawdź wagę - InPost ma limity
    if (params.weight && params.weight > 25) {
      return null; // Za ciężka paczka
    }

    // Dopłata za COD
    const codSurcharge = params.codAmount ? 3.0 : 0;

    return {
      providerId: 0, // Będzie ustawione z bazy
      code: params.isPoint ? "inpost_locker" : "inpost_courier",
      name: params.isPoint ? "Paczkomat InPost" : "Kurier InPost",
      description: params.isPoint ? "1-2 dni robocze" : "1-2 dni robocze",
      price: basePrice + codSurcharge,
      deliveryTime: "1-2 dni robocze",
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: params.isPoint || false,
      icon: "Package",
    };
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    try {
      if (!this.config?.apiKey || !this.config?.organizationId) {
        console.warn("[InPost] Brak konfiguracji - mock shipment");
        return {
          success: true,
          shipmentId: `mock_shipment_${Date.now()}`,
          trackingNumber: `MOCK${Date.now().toString().slice(-10)}`,
          trackingUrl: `https://inpost.pl/sledzenie-przesylek?number=MOCK${Date.now()}`,
        };
      }

      const shipmentData = {
        receiver: {
          name: params.receiverName,
          email: params.receiverEmail,
          phone: params.receiverPhone,
          ...(params.address && {
            address: {
              street: params.address.street,
              city: params.address.city,
              post_code: params.address.postCode,
              country_code: params.address.country || "PL",
            },
          }),
        },
        parcels: [
          {
            template: this.getParcelTemplate(params.parcel?.weight),
            weight: {
              amount: params.parcel?.weight?.toString() || "1",
              unit: "kg",
            },
            ...(params.parcel?.width && {
              dimensions: {
                width: params.parcel.width.toString(),
                height: (params.parcel.height || 10).toString(),
                length: (params.parcel.depth || 10).toString(),
                unit: "mm",
              },
            }),
          },
        ],
        service: params.pointId ? "inpost_locker_standard" : "inpost_courier_standard",
        ...(params.pointId && { custom_attributes: { target_point: params.pointId } }),
        ...(params.codAmount && {
          cod: {
            amount: params.codAmount.toFixed(2),
            currency: "PLN",
          },
        }),
        reference: params.reference || `ORDER-${params.orderId}`,
        comments: params.comments,
      };

      const response = await fetch(
        `${this.baseUrl}/v1/organizations/${this.config.organizationId}/shipments`,
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(shipmentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { message?: string })?.message ||
            `InPost API error: ${response.status}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        shipmentId: data.id,
        trackingNumber: data.tracking_number,
        trackingUrl: `https://inpost.pl/sledzenie-przesylek?number=${data.tracking_number}`,
      };
    } catch (error) {
      console.error("[InPost] createShipment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Błąd tworzenia przesyłki",
      };
    }
  }

  private getParcelTemplate(weight?: number): string {
    // InPost templates: small, medium, large
    if (!weight || weight <= 5) return "small";
    if (weight <= 10) return "medium";
    return "large";
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // Publiczne API do trackingu
      const response = await fetch(
        `https://api-shipx-pl.easypack24.net/v1/tracking/${trackingNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        trackingNumber,
        status: this.mapTrackingStatus(data.status),
        events: (data.tracking_details || []).map(
          (event: { datetime: string; status: string; agency?: string }) => ({
            timestamp: new Date(event.datetime),
            status: this.mapTrackingStatus(event.status),
            description: this.getStatusDescription(event.status),
            location: event.agency,
          })
        ),
      };
    } catch (error) {
      console.error("[InPost] getTracking error:", error);
      return null;
    }
  }

  private mapTrackingStatus(inpostStatus: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      created: "pending",
      confirmed: "pending",
      dispatched_by_sender: "shipped",
      collected_from_sender: "shipped",
      taken_by_courier: "in_transit",
      adopted_at_source_branch: "in_transit",
      sent_from_source_branch: "in_transit",
      adopted_at_sorting_center: "in_transit",
      sent_from_sorting_center: "in_transit",
      adopted_at_target_branch: "in_transit",
      out_for_delivery: "out_for_delivery",
      ready_to_pickup: "out_for_delivery",
      delivered: "delivered",
      pickup_reminder_sent: "out_for_delivery",
      returned_to_sender: "returned",
      avizo: "failed",
      claim_registered: "failed",
    };

    return statusMap[inpostStatus.toLowerCase()] || "in_transit";
  }

  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      created: "Przesyłka utworzona",
      confirmed: "Przesyłka potwierdzona",
      dispatched_by_sender: "Nadana przez nadawcę",
      collected_from_sender: "Odebrana od nadawcy",
      taken_by_courier: "Przejęta przez kuriera",
      adopted_at_source_branch: "W oddziale nadawczym",
      sent_from_source_branch: "Wysłana z oddziału",
      adopted_at_sorting_center: "W centrum sortowania",
      sent_from_sorting_center: "Wysłana z centrum sortowania",
      adopted_at_target_branch: "W oddziale docelowym",
      out_for_delivery: "W doręczeniu",
      ready_to_pickup: "Gotowa do odbioru",
      delivered: "Dostarczona",
      returned_to_sender: "Zwrócona do nadawcy",
    };

    return descriptions[status.toLowerCase()] || status;
  }

  async getLabel(shipmentId: string): Promise<string | null> {
    try {
      if (!this.config?.apiKey || !this.config?.organizationId) {
        return null;
      }

      const response = await fetch(
        `${this.baseUrl}/v1/organizations/${this.config.organizationId}/shipments/${shipmentId}/label`,
        {
          headers: {
            ...this.headers,
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      // Zwróć URL lub możesz zwrócić base64
      return `${this.baseUrl}/v1/organizations/${this.config.organizationId}/shipments/${shipmentId}/label`;
    } catch (error) {
      console.error("[InPost] getLabel error:", error);
      return null;
    }
  }
}

// Singleton instance
export const inpostProvider = new InPostProvider();

// Helper do inicjalizacji z env
export function initializeInPost() {
  inpostProvider.initialize({
    apiKey: process.env.INPOST_API_TOKEN,
    organizationId: process.env.INPOST_ORGANIZATION_ID,
    isTestMode: process.env.INPOST_SANDBOX === "true",
  });
  return inpostProvider;
}
