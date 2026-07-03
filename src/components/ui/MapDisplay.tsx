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
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapDisplay({ latitude, longitude, name, draggable = false, onLocationChange }: MapDisplayProps) {
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

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={true} className="h-full w-full z-0">
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
