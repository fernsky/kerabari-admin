"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { MapStateProvider, useMapContext } from "@/lib/map-state";
import React from "react";
import { LayerControl } from "../map/layer-control";
import { useLayerStore } from "@/store/use-layer-store";
import { api } from "@/trpc/react";
import { GeoJsonObject } from "geojson";

const Map = dynamic(
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

const MapDrawer = dynamic(
  () => import("../map/map-drawer").then((mod) => mod.MapDrawer),
  { ssr: false },
);

interface CreateAreaMapProps {
  id: string;
  onGeometryChange: (geometry: any) => void;
}

const CreateAreaMap = ({ onGeometryChange }: CreateAreaMapProps) => {
  const { geometry } = useMapContext();
  const wardLayers = useLayerStore((state) => state.wardLayers);

  const { data: wards } = api.ward.getWards.useQuery();
  const { data: areas } = api.area.getAreas.useQuery();

  React.useEffect(() => {
    onGeometryChange(geometry);
  }, [geometry, onGeometryChange]);

  return (
    <Card className="relative mt-4 min-h-[400px] h-[calc(100vh-400px)]">
      <Map
        center={[26.72069444681497, 88.04840072844279]}
        zoom={13}
        className="h-full w-full rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Background Layers */}
        {wards?.map((ward) => {
          if (!wardLayers[ward.wardNumber]?.visible || !ward.geometry)
            return null;

          return (
            <GeoJSON
              key={`ward-${ward.wardNumber}`}
              data={ward.geometry as GeoJsonObject}
              style={{
                fillColor: "#ff7800",
                weight: 2,
                opacity: 0.6,
                color: "blue",
                fillOpacity: 0.1,
              }}
            />
          );
        })}

        {areas?.map((area) => {
          const wardLayer = wardLayers[area.wardNumber];
          if (
            !wardLayer?.visible ||
            !wardLayer.areas[area.id] ||
            !area.geometry
          )
            return null;

          return (
            <GeoJSON
              key={`area-${area.id}`}
              data={area.geometry as GeoJsonObject}
              style={{
                fillColor: "#00ff00",
                weight: 1,
                opacity: 0.6,
                color: "green",
                fillOpacity: 0.1,
              }}
            />
          );
        })}

        {/* Drawing Layer - Always on top */}
        <MapDrawer zIndex={1000} />
        <LayerControl />
      </Map>
    </Card>
  );
};

export { CreateAreaMap, MapStateProvider };
