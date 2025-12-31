// Typy dla systemu dostaw

export type ShipmentStatus =
  | "pending"      // Oczekuje na nadanie
  | "shipped"      // Nadana
  | "in_transit"   // W transporcie
  | "out_for_delivery" // W doręczeniu
  | "delivered"    // Dostarczona
  | "returned"     // Zwrócona
  | "failed";      // Niedoręczona

export interface ShippingPoint {
  id: string;           // Np. KRA123
  name: string;         // Np. "Paczkomat KRA123"
  type: string;         // locker, pop (punkt odbioru)
  address: {
    street: string;
    city: string;
    postCode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
  paymentAvailable?: boolean;
  // Dodatkowe info specyficzne dla providera
  meta?: Record<string, unknown>;
}

export interface ShippingRate {
  providerId: number;
  code: string;
  name: string;
  description?: string;
  price: number;          // Cena brutto w PLN
  priceNet?: number;      // Cena netto
  deliveryTime: string;   // "1-2 dni robocze"
  deliveryTimeMin?: number; // Min dni
  deliveryTimeMax?: number; // Max dni
  requiresPoint: boolean;
  icon?: string;
}

export interface CreateShipmentParams {
  orderId: number;
  providerCode: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  // Dla kuriera
  address?: {
    street: string;
    city: string;
    postCode: string;
    country?: string;
  };
  // Dla paczkomatu
  pointId?: string;
  // Wymiary paczki
  parcel?: {
    weight: number;    // kg
    width?: number;    // cm
    height?: number;   // cm
    depth?: number;    // cm
  };
  // COD
  codAmount?: number;
  // Dodatkowe
  reference?: string;
  comments?: string;
}

export interface ShipmentResult {
  success: boolean;
  shipmentId?: string;      // ID u kuriera
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;        // URL do etykiety PDF
  error?: string;
}

export interface TrackingEvent {
  timestamp: Date;
  status: ShipmentStatus;
  description: string;
  location?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: ShipmentStatus;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
}

// Interfejs dla providera wysyłki
export interface ShippingProvider {
  readonly name: string;
  readonly code: string;

  // Inicjalizacja z konfiguracją
  initialize(config: ShippingProviderConfig): void;

  // Wyszukiwanie punktów (paczkomaty, punkty odbioru)
  findPoints(query: PointSearchQuery): Promise<ShippingPoint[]>;

  // Kalkulacja kosztów
  calculateRate(params: RateCalculationParams): Promise<ShippingRate | null>;

  // Utworzenie przesyłki
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;

  // Pobranie statusu/tracking
  getTracking(trackingNumber: string): Promise<TrackingInfo | null>;

  // Pobranie etykiety
  getLabel(shipmentId: string): Promise<string | null>; // URL lub base64
}

export interface ShippingProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  organizationId?: string;
  isTestMode: boolean;
  [key: string]: unknown;
}

export interface PointSearchQuery {
  city?: string;
  postCode?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number; // km
  };
  type?: string; // locker, pop
  limit?: number;
}

export interface RateCalculationParams {
  destinationPostCode: string;
  destinationCountry?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  codAmount?: number;
  isPoint?: boolean; // Czy do punktu/paczkomatu
}
