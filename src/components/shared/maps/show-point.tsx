"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { LatLngTuple } from "leaflet";

interface ShowPointProps {
  coordinates: LatLngTuple;
  zoom?: number;
}

export const ShowPoint = ({ coordinates, zoom = 15 }: ShowPointProps) => {
  useEffect(() => {
    return () => {
      const container = document.querySelector(".leaflet-container");
      if (container) {
        // @ts-ignore
        container._leaflet_id = null;
      }
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <MapContainer
        className="w-full aspect-[21/9]"
        zoom={zoom}
        scrollWheelZoom={false}
        center={coordinates}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={coordinates}
          radius={8}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.7,
          }}
        />
      </MapContainer>
    </div>
  );
};
