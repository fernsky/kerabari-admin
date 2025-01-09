"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { MapStateProvider, useMapContext } from "@/lib/map-state";
import React from "react";

const Map = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const MapDrawer = dynamic(
  () => import("../map/map-drawer").then((mod) => mod.MapDrawer),
  { ssr: false },
);

interface CreateAreaMapProps {
  onGeometryChange: (geometry: any) => void;
}

const CreateAreaMap = ({ onGeometryChange }: CreateAreaMapProps) => {
  const { geometry } = useMapContext();

  React.useEffect(() => {
    onGeometryChange(geometry);
  }, [geometry, onGeometryChange]);

  return (
    <Card className="h-[400px] mt-4">
      <Map
        center={[26.72069444681497, 88.04840072844279]}
        zoom={13}
        className="h-full w-full rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapDrawer />
      </Map>
    </Card>
  );
};

export { CreateAreaMap, MapStateProvider };
