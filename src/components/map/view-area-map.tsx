"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { Area } from "@/server/api/routers/areas/area.schema";
import L from "leaflet";

import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

export default function ViewAreaMap({ area }: { area: Area }) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (area.geometry) {
      const geoJsonLayer = L.geoJSON(area.geometry);
      setBounds(geoJsonLayer.getBounds());
    }
  }, [area]);

  if (!area.geometry || !bounds) {
    return null;
  }

  return (
    <MapContainer
      bounds={bounds}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      scrollWheelZoom={false}
      className="z-20"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={area.geometry}
        style={{
          color: "#000",
          weight: 2,
          fillOpacity: 0.2,
        }}
      />
    </MapContainer>
  );
}
