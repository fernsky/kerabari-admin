"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { useMapViewStore } from "@/store/toggle-layer-store";
import { api } from "@/trpc/react";
import { AlertTriangle, Map } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GeoJsonObject } from "geojson";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds, LatLng } from "leaflet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Info, CheckSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import * as turf from "@turf/turf"; // Add this import

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Dynamic imports
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

const MapUpdater = ({
  wardBoundary,
  areas,
}: {
  wardBoundary: any;
  areas: any[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (wardBoundary?.geometry) {
      const bounds = new LatLngBounds([]);

      // Add ward boundary coordinates to bounds
      const wardCoords =
        wardBoundary.geometry.type === "Polygon"
          ? wardBoundary.geometry.coordinates[0]
          : wardBoundary.geometry.coordinates.flat(1);

      wardCoords.forEach((coord: number[]) => {
        bounds.extend(new LatLng(coord[1], coord[0]));
      });

      // Add area coordinates to bounds
      areas?.forEach((area) => {
        const coordinates =
          area.geometry.type === "Polygon"
            ? area.geometry.coordinates[0]
            : area.geometry.coordinates.flat(1);

        coordinates.forEach((coord: number[]) => {
          bounds.extend(new LatLng(coord[1], coord[0]));
        });
      });

      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  }, [wardBoundary, areas, map]);

  return null;
};

const RequestPointPage = () => {
  const router = useRouter();
  const { isStreetView, toggleView } = useMapViewStore();
  const [selectedPoint, setSelectedPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fix the ward boundary query
  const wardBoundary = api.ward.getWardByNumber.useQuery(
    { wardNumber: selectedWard! },
    {
      enabled: !!selectedWard,
      onSuccess: (data) => {
        console.log("Ward boundary loaded:", data);
      },
      onError: (error) => {
        console.error("Error loading ward boundary:", error);
      },
    },
  );

  // Fix the areas query
  const areas = api.area.getAreasByWardforRequest.useQuery(
    { wardNumber: selectedWard! },
    {
      enabled: !!selectedWard,
      onSuccess: (data) => {
        console.log("Areas loaded:", data);
      },
      onError: (error) => {
        console.error("Error loading areas:", error);
      },
    },
  );

  // Add the API mutation
  const createPointRequest = api.area.createPointRequest.useMutation({
    onSuccess: () => {
      toast.success("Area request submitted successfully");
      setSelectedPoint(null);
      setMessage("");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request");
    },
  });

  // Add query for point requests
  const pointRequests = api.area.getPointRequestsByWard.useQuery(
    { wardNumber: selectedWard! },
    {
      enabled: !!selectedWard,
    },
  ) as {
    data?: Array<{
      id: string;
      coordinates: any;
      enumeratorName: string;
      status: string;
      message: string;
      createdAt: Date;
    }>;
  };

  // Add click handler to map component itself
  const handleMapClick = (e: LeafletMouseEvent) => {
    if (!selectedWard) return;

    // Check if click point is inside any existing area
    const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);

    const isInsideExistingArea = areas.data?.some((area) => {
      if (!area.geometry) return false;
      try {
        return turf.booleanPointInPolygon(clickPoint, area.geometry);
      } catch (error) {
        console.error("Error checking point in polygon:", error);
        return false;
      }
    });

    if (isInsideExistingArea) {
      toast.error("Cannot request area here - area already exists");
      return;
    }

    setSelectedPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
  };

  const handleRequestConfirm = async () => {
    if (!selectedPoint || !message.trim() || !selectedWard) return;

    setIsSubmitting(true);
    try {
      await createPointRequest.mutateAsync({
        wardNumber: selectedWard,
        coordinates: {
          lat: selectedPoint.lat,
          lng: selectedPoint.lng,
        },
        message: message.trim(),
      });
    } catch (error) {
      // Error is handled by the mutation callbacks
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add useMapEvents hook
  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <ContentLayout
      title="Request Area by Point"
      actions={
        <Button variant="outline" onClick={() => router.push("/area/request")}>
          Back to Area Request
        </Button>
      }
    >
      <div className="space-y-6 px-2 lg:px-10">
        {/* Ward Selection */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Select Ward</h3>
              <p className="text-xs text-muted-foreground">
                Choose a ward to view existing areas
              </p>
            </div>
          </div>
          <div className="p-4">
            <Select onValueChange={(value) => setSelectedWard(Number(value))}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((ward) => (
                  <SelectItem key={ward} value={ward.toString()}>
                    Ward {ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map Container */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Select Point on Map</h3>
              <p className="text-xs text-muted-foreground">
                Click anywhere to request an area
              </p>
            </div>
          </div>
          <div className="relative h-[600px]">
            {selectedWard ? (
              <>
                <div className="absolute right-2 top-2 z-[400]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white"
                    onClick={toggleView}
                  >
                    <Map className="mr-2 h-4 w-4" />
                    {isStreetView ? "Satellite View" : "Street View"}
                  </Button>
                </div>
                <MapContainer
                  center={[26.72069444681497, 88.04840072844279]}
                  zoom={13}
                  className="h-full w-full z-10"
                >
                  <MapEvents /> {/* Add this component */}
                  {/* Add MapUpdater */}
                  {wardBoundary.data && (
                    <MapUpdater
                      wardBoundary={wardBoundary.data}
                      areas={areas.data || []}
                    />
                  )}
                  <TileLayer
                    key={isStreetView ? "street" : "satellite"}
                    attribution={
                      isStreetView
                        ? "© OpenStreetMap contributors"
                        : "© Google"
                    }
                    url={
                      isStreetView
                        ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        : "https://mt1.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}"
                    }
                  />
                  {/* Ward Boundary Layer */}
                  {wardBoundary.data?.geometry && (
                    <GeoJSON
                      key={`ward-${selectedWard}`}
                      data={wardBoundary.data.geometry as GeoJsonObject}
                      style={{
                        color: "#6b7280",
                        weight: 3,
                        opacity: 0.8,
                        fillColor: "#6b7280",
                        fillOpacity: 0.1,
                      }}
                    />
                  )}
                  {/* Area Layers */}
                  {areas.data?.map((area) => (
                    <GeoJSON
                      key={`area-${area.code}`}
                      data={area.geometry as GeoJsonObject}
                      style={{
                        color:
                          area.areaStatus === "completed"
                            ? "#dc2626"
                            : area.assignedTo
                              ? "#9ca3af"
                              : "#2563eb",
                        weight: 2,
                        opacity: 0.6,
                        fillColor:
                          area.areaStatus === "completed"
                            ? "#ef4444"
                            : area.assignedTo
                              ? "#d1d5db"
                              : "#3b82f6",
                        fillOpacity:
                          area.areaStatus === "completed" ? 0.3 : 0.1,
                      }}
                    />
                  ))}
                  {/* Add Point Request Markers */}
                  {pointRequests.data?.map((request) => {
                    if (!request.coordinates?.coordinates) return null;
                    const [lng, lat] = request.coordinates.coordinates;

                    return (
                      <Marker
                        key={request.id}
                        position={[lat, lng]}
                        icon={L.divIcon({
                          className: "custom-div-icon",
                          html: `<div class="bg-yellow-500 w-3 h-3 rounded-full border-2 border-white shadow-md"></div>`,
                          iconSize: [12, 12],
                          iconAnchor: [6, 6],
                        })}
                      >
                        <Popup>
                          <div className="space-y-2 p-1">
                            <p className="font-medium">Area Request</p>
                            <p className="text-sm text-muted-foreground">
                              Requested by: {request.enumeratorName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status:{" "}
                              <span className="capitalize">
                                {request.status}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Message: {request.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {selectedPoint && (
                    <Marker position={[selectedPoint.lat, selectedPoint.lng]}>
                      <Popup>
                        <div className="w-64 p-2">
                          <h3 className="font-medium mb-2">
                            Request Area in this Region?
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            GPS: {selectedPoint.lat.toFixed(6)},{" "}
                            {selectedPoint.lng.toFixed(6)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => setIsDialogOpen(true)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Request Area
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedPoint(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/10">
                <div className="text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Please select a ward to view the map
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] rounded-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2.5">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Request Area at Selected Point
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  GPS: {selectedPoint?.lat.toFixed(6)},{" "}
                  {selectedPoint?.lng.toFixed(6)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Request Message</span>
              </div>
              <Textarea
                placeholder="Please explain why you want to survey this area and what you plan to accomplish..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-none text-base focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestConfirm}
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default RequestPointPage;
