"use client";

import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PickupPoint {
  name: string;
  type: string[];
  status: string;
  location: {
    longitude: number;
    latitude: number;
  };
  address: {
    line1: string;
    line2: string;
  };
  address_details: {
    city: string;
    province: string;
    post_code: string;
    street: string;
    building_number: string;
  };
  opening_hours: string;
  location_description?: string;
  distance?: number;
  image_url?: string;
}

interface LeafletMapProps {
  center: [number, number];
  points: PickupPoint[];
  selectedPoint: PickupPoint | null;
  onPointClick: (point: PickupPoint) => void;
  onPointSelect: (point: PickupPoint) => void;
  onMapMove: (lat: number, lng: number) => void;
  markerColor?: string; // hex color like "#FFCD00"
  markerLogo?: string; // URL to logo image for markers
  userLocation?: [number, number] | null; // user's current location
}

// User location marker - blue pulsing dot
const createUserLocationIcon = () => {
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: #3b82f6;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom marker icons - pin style with logo
const createMarkerIcon = (selected: boolean, color: string = "#FFCD00", logoUrl?: string) => {
  const size = selected ? 48 : 40;
  const logoSize = selected ? 28 : 24;

  return L.divIcon({
    className: selected ? "point-marker-selected" : "point-marker",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 12}px;
        filter: drop-shadow(0 3px 8px rgba(0,0,0,0.35));
      ">
        <div style="
          background: ${selected ? color : '#fff'};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid ${color};
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            ${logoUrl
              ? `<img src="${logoUrl}" style="width: ${logoSize}px; height: ${logoSize}px; object-fit: contain;" />`
              : `<div style="width: ${logoSize}px; height: ${logoSize}px; background: ${color}; border-radius: 4px;"></div>`
            }
          </div>
        </div>
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  });
};

// Map event handler component
function MapEventHandler({
  onMapMove,
}: {
  onMapMove: (lat: number, lng: number) => void;
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const map = useMapEvents({
    moveend: () => {
      // Debounce the map move event
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        try {
          if (map && map.getCenter) {
            const center = map.getCenter();
            onMapMove(center.lat, center.lng);
          }
        } catch {
          // Map not ready yet
        }
      }, 500);
    },
  });

  return null;
}

// Component to update map center and open popup when selectedPoint changes
function MapController({
  center,
  selectedPoint,
  markerRefs
}: {
  center: [number, number];
  selectedPoint: PickupPoint | null;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  const lastCenter = useRef<string>("");

  // Update map center when coordinates change
  useEffect(() => {
    const centerKey = `${center[0].toFixed(6)},${center[1].toFixed(6)}`;
    if (centerKey !== lastCenter.current) {
      lastCenter.current = centerKey;
      map.flyTo(center, map.getZoom(), { duration: 0.5 });
    }
  }, [center, map]);

  // Open popup when selectedPoint changes
  useEffect(() => {
    if (selectedPoint) {
      const marker = markerRefs.current.get(selectedPoint.name);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPoint, markerRefs]);

  return null;
}

export default function LeafletMap({
  center,
  points,
  selectedPoint,
  onPointClick,
  onPointSelect,
  onMapMove,
  markerColor = "#FFCD00",
  markerLogo,
  userLocation,
}: LeafletMapProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // Fix default marker icon issue in Leaflet
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  // Store marker ref
  const setMarkerRef = useCallback((name: string, marker: L.Marker | null) => {
    if (marker) {
      markerRefs.current.set(name, marker);
    } else {
      markerRefs.current.delete(name);
    }
  }, []);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Dane dostarcza <a href="https://furgonetka.pl">Furgonetka.pl</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onMapMove={onMapMove} />
        <MapController center={center} selectedPoint={selectedPoint} markerRefs={markerRefs} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
            zIndexOffset={1000}
          />
        )}

        {points.slice(0, 100).map((point) => (
        <Marker
          key={point.name}
          ref={(marker) => setMarkerRef(point.name, marker)}
          position={[point.location.latitude, point.location.longitude]}
          icon={createMarkerIcon(selectedPoint?.name === point.name, markerColor, markerLogo)}
          eventHandlers={{
            click: () => onPointClick(point),
          }}
        >
          <Popup closeButton={false} className="pickup-popup" maxWidth={420} minWidth={320}>
            <div style={{ padding: "12px" }}>
              {/* Top row: Image + Content */}
              <div style={{ display: "flex", gap: "12px" }}>
                {/* Image - left side */}
                {point.image_url && (
                  <div style={{ width: "120px", height: "100px", flexShrink: 0, borderRadius: "8px", overflow: "hidden" }}>
                    <img
                      src={point.image_url}
                      alt={point.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content - right side */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <p style={{ fontWeight: 700, fontSize: "15px", color: "#111", margin: 0 }}>{point.name}</p>
                    {point.distance && (
                      <span style={{ fontSize: "11px", color: "#666", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "12px", whiteSpace: "nowrap" }}>
                        {point.distance < 1000 ? `${Math.round(point.distance)} m` : `${(point.distance / 1000).toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "#444", margin: "4px 0 0 0" }}>
                    {point.address_details.street} {point.address_details.building_number}
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0 0" }}>
                    {point.address_details.post_code} {point.address_details.city}
                  </p>
                  {point.location_description && (
                    <p style={{ fontSize: "11px", color: "#888", margin: "6px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {point.location_description}
                    </p>
                  )}
                  {point.opening_hours && (
                    <p style={{ fontSize: "11px", color: "#666", margin: "6px 0 0 0" }}>
                      Godziny otwarcia: {point.opening_hours}
                    </p>
                  )}
                </div>
              </div>

              {/* Button - full width at bottom */}
              <button
                onClick={() => onPointSelect(point)}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  height: "36px",
                  padding: "0 16px",
                  backgroundColor: markerColor,
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: markerColor === "#FFCD00" ? "#000" : "#fff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontFamily: "inherit",
                }}
              >
                Wybierz ten punkt
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}
