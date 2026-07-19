"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons in leaflet with webpack/nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  name: string;
  draggable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  instanceId?: string;
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  // Fix grey gap issue: modal animations cause Leaflet to miscalculate container size.
  // Invalidate size shortly after mount to recalculate map tiles.
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function MapDisplay({ latitude, longitude, name, draggable = false, onLocationChange, instanceId }: MapDisplayProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const markerRef = useRef<any>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onLocationChange) {
          const pos = marker.getLatLng();
          onLocationChange(pos.lat, pos.lng);
        }
      },
    }),
    [onLocationChange]
  );

  if (!isMounted) {
    return (
      <div className="h-[300px] w-full rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
    );
  }

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer key={instanceId || "map"} center={[latitude, longitude]} zoom={15} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[latitude, longitude]} 
          draggable={draggable} 
          eventHandlers={eventHandlers}
          ref={markerRef}
        >
          <Popup>{name || "Lokasi Mitra"}</Popup>
        </Marker>
        <MapUpdater lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
