"use client";

import { useMapContext } from "@/lib/map-state";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useEffect, useRef } from "react";
import { GeoJSON } from "geojson";
import L from "leaflet";

export const MapDrawer = () => {
  const { geometry, setGeometry } = useMapContext();
  const featureGroupRef = useRef<any>(null);

  useEffect(() => {
    if (featureGroupRef.current && geometry) {
      const leafletFG = featureGroupRef.current;
      // Clear existing layers
      leafletFG.clearLayers();
      // Add new geometry
      const leafletGeoJSON = new L.GeoJSON(geometry as GeoJSON);
      leafletGeoJSON.eachLayer((layer) => {
        leafletFG.addLayer(layer);
      });
    }
  }, [geometry]);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    setGeometry(layer.toGeoJSON());
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      setGeometry(layer.toGeoJSON());
    });
  };

  const handleDeleted = () => {
    setGeometry(null);
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topright"
        onCreated={handleCreated}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={{
          rectangle: true,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          polygon: true,
        }}
      />
    </FeatureGroup>
  );
};
