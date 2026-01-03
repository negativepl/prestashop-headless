"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, Search, Navigation, Loader2, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Dynamic import for Leaflet components (client-only)
const LeafletMap = dynamic(
  () => import("./leaflet-map"),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse" /> }
);

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

type ServiceType = "inpost" | "zabka" | "orlen";

interface PointPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (point: {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
  }) => void;
  service: ServiceType;
}

const SERVICE_CONFIG = {
  inpost: {
    title: "Wybierz Paczkomat®",
    buttonText: "Wybierz ten Paczkomat®",
    emptyText: "Nie znaleziono paczkomatów",
    color: "#FFCD00",
    colorHover: "#e6b800",
    colorBg: "bg-[#FFCD00]",
    colorBgLight: "bg-[#FFCD00]/10",
    colorBorder: "border-[#FFCD00]",
    textColor: "text-black",
    logo: "/images/carriers/inpost-paczkomat.png",
  },
  zabka: {
    title: "Wybierz punkt Żabka",
    buttonText: "Wybierz ten punkt",
    emptyText: "Nie znaleziono punktów Żabka",
    color: "#00A651",
    colorHover: "#008c44",
    colorBg: "bg-[#00A651]",
    colorBgLight: "bg-[#00A651]/10",
    colorBorder: "border-[#00A651]",
    textColor: "text-white",
    logo: "/images/carriers/zabka.png",
  },
  orlen: {
    title: "Wybierz punkt Orlen Paczka",
    buttonText: "Wybierz ten punkt",
    emptyText: "Nie znaleziono punktów Orlen",
    color: "#E30613",
    colorHover: "#c00510",
    colorBg: "bg-[#E30613]",
    colorBgLight: "bg-[#E30613]/10",
    colorBorder: "border-[#E30613]",
    textColor: "text-white",
    logo: "/images/carriers/orlen-paczka.png",
  },
};

// Minimum zoom level to show/fetch points (13 = default zoom, miasto widoczne)
const MIN_ZOOM_FOR_POINTS = 13;

export function PointPickerModal({ isOpen, onClose, onSelect, service }: PointPickerModalProps) {
  const config = SERVICE_CONFIG[service];
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122]); // Warsaw
  const [locatingUser, setLocatingUser] = useState(false);
  const [isZoomSufficient, setIsZoomSufficient] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Flag to skip refetch when clicking point from list
  const skipNextMapMove = useRef(false);

  // Fetch points from API
  const fetchPoints = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      let url = `/api/inpost/points?service=${service}&type=parcel_locker&per_page=100`;

      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        setPoints(data.items);
        setFilteredPoints(data.items);
      }
    } catch (error) {
      console.error(`Error fetching ${service} points:`, error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fetchPoints();
      return;
    }

    setLocatingUser(true);
    setSelectedPoint(null); // Deselect any selected point
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        setUserLocation(location);
        // Skip the map move event that will be triggered by setMapCenter
        skipNextMapMove.current = true;
        setMapCenter(location);
        fetchPoints(latitude, longitude);
        setLocatingUser(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        fetchPoints();
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchPoints]);

  // Initial load
  useEffect(() => {
    if (isOpen && points.length === 0) {
      getUserLocation();
    }
  }, [isOpen, points.length, getUserLocation]);

  // Reset on service change
  useEffect(() => {
    setPoints([]);
    setFilteredPoints([]);
    setSelectedPoint(null);
  }, [service]);

  // Search filter (local)
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPoints(points);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = points.filter(
      (point) =>
        point.name.toLowerCase().includes(searchLower) ||
        point.address_details.city.toLowerCase().includes(searchLower) ||
        point.address_details.street.toLowerCase().includes(searchLower) ||
        point.address_details.post_code.includes(search)
    );
    setFilteredPoints(filtered);
  }, [search, points]);

  // Handle map move - fetch new points for area (skip if programmatic or zoom too low)
  const handleMapMove = useCallback((lat: number, lng: number, zoom: number) => {
    if (skipNextMapMove.current) {
      skipNextMapMove.current = false;
      return;
    }
    // Only fetch points if zoom is sufficient
    if (zoom >= MIN_ZOOM_FOR_POINTS) {
      fetchPoints(lat, lng);
    }
  }, [fetchPoints]);

  // Search by city/postcode via geocoding
  const handleSearchSubmit = useCallback(async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)},Poland&format=json&limit=1`;
      const geocodeRes = await fetch(geocodeUrl);
      const geocodeData = await geocodeRes.json();

      if (geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        // Skip the map move event that will be triggered by setMapCenter
        skipNextMapMove.current = true;
        setMapCenter(newCenter);
        await fetchPoints(newCenter[0], newCenter[1]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  }, [search, fetchPoints]);

  const handleSelect = useCallback((point: PickupPoint) => {
    onSelect({
      id: point.name,
      name: point.name,
      address: `${point.address_details.street} ${point.address_details.building_number}`,
      city: point.address_details.city,
      postcode: point.address_details.post_code,
    });
    onClose();
  }, [onSelect, onClose]);

  const handlePointClick = useCallback((point: PickupPoint) => {
    setSelectedPoint(point);
    // Skip refetch when centering map on selected point
    skipNextMapMove.current = true;
    setMapCenter([point.location.latitude, point.location.longitude]);
  }, []);

  // Format distance
  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <Image
              src={config.logo}
              alt={config.title}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{config.title}</h2>
            <p className="text-sm text-muted-foreground">
              {isZoomSufficient
                ? `${filteredPoints.length} punktów w okolicy`
                : "Przybliż mapę aby zobaczyć punkty"
              }
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b bg-card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Wpisz miasto, ulicę lub kod pocztowy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={getUserLocation}
            disabled={locatingUser}
          >
            {locatingUser ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
          </Button>
          <Button
            className="h-11"
            style={{ backgroundColor: config.color }}
            onClick={handleSearchSubmit}
          >
            <span className={config.textColor}>Szukaj</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Points list - left sidebar */}
        <div className="w-full md:w-[380px] border-r overflow-y-auto bg-card">
          {!isZoomSufficient ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <p className="font-medium">Przybliż mapę</p>
              <p className="text-sm mt-1">aby zobaczyć punkty odbioru w okolicy</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPoints.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-3 opacity-50">
                <Image
                  src={config.logo}
                  alt={config.title}
                  width={64}
                  height={64}
                  className="object-contain grayscale"
                />
              </div>
              <p>{config.emptyText}</p>
              <p className="text-sm mt-1">Spróbuj innej lokalizacji</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPoints.slice(0, 50).map((point) => (
                <div
                  key={point.name}
                  onClick={() => handlePointClick(point)}
                  className={cn(
                    "w-full p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedPoint?.name === point.name && cn(config.colorBgLight, "border-l-4", config.colorBorder)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Point logo */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden p-2",
                        selectedPoint?.name === point.name ? config.colorBgLight : "bg-muted"
                      )}>
                        <Image
                          src={config.logo}
                          alt={config.title}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{point.name}</span>
                        {point.distance && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {formatDistance(point.distance)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {point.address_details.street} {point.address_details.building_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {point.address_details.post_code} {point.address_details.city}
                      </p>
                      {point.location_description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {point.location_description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Godziny otwarcia: {point.opening_hours}
                      </p>
                    </div>
                  </div>

                  {selectedPoint?.name === point.name && (
                    <Button
                      className="w-full mt-3"
                      style={{ backgroundColor: config.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(point);
                      }}
                    >
                      <span className={config.textColor}>{config.buttonText}</span>
                      <ChevronRight className={cn("size-4 ml-1", config.textColor)} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map - right side */}
        <div className="hidden md:block flex-1 relative">
          <LeafletMap
            center={mapCenter}
            points={filteredPoints}
            selectedPoint={selectedPoint}
            onPointClick={handlePointClick}
            onPointSelect={handleSelect}
            onMapMove={handleMapMove}
            onZoomSufficiencyChange={setIsZoomSufficient}
            markerColor={config.color}
            markerLogo={config.logo}
            minZoom={MIN_ZOOM_FOR_POINTS}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );

  // Render in portal
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
