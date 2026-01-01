"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InPostPoint {
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
  points: InPostPoint[];
  selectedPoint: InPostPoint | null;
  onPointClick: (point: InPostPoint) => void;
  onPointSelect: (point: InPostPoint) => void;
  onMapMove: (lat: number, lng: number) => void;
}

// Custom InPost marker icons - pin style
const createInPostIcon = (selected: boolean) => {
  const size = selected ? 44 : 36;
  const tailHeight = 10;

  return L.divIcon({
    className: selected ? "inpost-marker-selected" : "inpost-marker",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + tailHeight}px;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
      ">
        <div style="
          background: ${selected ? '#000' : '#FFCD00'};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: ${selected ? '3px solid #FFCD00' : '2px solid #000'};
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg width="${selected ? 22 : 18}" height="${selected ? 22 : 18}" viewBox="0 0 24 24" fill="none" stroke="${selected ? '#FFCD00' : '#000'}" stroke-width="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [size, size + tailHeight],
    iconAnchor: [size / 2, size + tailHeight],
    popupAnchor: [0, -(size + tailHeight)],
  });
};

// Map event handler component
function MapEventHandler({ onMapMove }: { onMapMove: (lat: number, lng: number) => void }) {
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
  selectedPoint: InPostPoint | null;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
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
}: LeafletMapProps) {
  const [mapKey, setMapKey] = useState(0);
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
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      key={mapKey}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventHandler onMapMove={onMapMove} />
      <MapController center={center} selectedPoint={selectedPoint} markerRefs={markerRefs} />

      {points.slice(0, 100).map((point) => (
        <Marker
          key={point.name}
          ref={(marker) => setMarkerRef(point.name, marker)}
          position={[point.location.latitude, point.location.longitude]}
          icon={createInPostIcon(selectedPoint?.name === point.name)}
          eventHandlers={{
            click: () => onPointClick(point),
          }}
        >
          <Popup closeButton={false} className="inpost-popup" maxWidth={420} minWidth={320}>
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
                    <p style={{ fontSize: "11px", color: "#666", margin: "6px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {point.opening_hours}
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
                  backgroundColor: "#FFCD00",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#000",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e6b800")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFCD00")}
              >
                Wybierz ten Paczkomat®
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
