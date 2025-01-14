"use client";

import { api } from "@/trpc/react";
import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";

export default function RequestAreaPage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areas = api.area.getAreasByWard.useQuery(
    { wardNumber: selectedWard! },
    { enabled: !!selectedWard },
  );

  const requestArea = api.area.requestArea.useMutation({
    onSuccess: () => {
      toast.success("Area request submitted successfully");
      setSelectedArea(null);
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async () => {
    if (!selectedArea) return;
    setIsSubmitting(true);
    try {
      await requestArea.mutateAsync({
        areaId: selectedArea,
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(areas);

  return (
    <ContentLayout title="Request Area">
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex flex-col items-start justify-start gap-4">
            <p className="text-gray-600">
              Select a ward and then choose an area from the map below
            </p>
            <Select onValueChange={(value) => setSelectedWard(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i + 1).map((ward) => (
                  <SelectItem key={ward} value={ward.toString()}>
                    Ward {ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="h-[70vh] relative">
            {selectedWard ? (
              <MapContainer
                className="h-full w-full z-10"
                center={[26.72069444681497, 88.04840072844279]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {areas.data?.map((area) => (
                  <GeoJSON
                    key={area.code}
                    data={area.geometry as GeoJsonObject}
                    style={{
                      color: area.assignedTo ? "#9ca3af" : "#2563eb",
                      weight: 2,
                      opacity: 0.6,
                      fillColor: area.assignedTo ? "#d1d5db" : "#3b82f6",
                      fillOpacity: 0.1,
                    }}
                  >
                    <Popup className="z-[10000]">
                      <div className="text-center">
                        <p className="font-semibold">Area Code: {area.code}</p>
                        {!area.assignedTo && (
                          <Button
                            className="mt-2"
                            size="sm"
                            onClick={() => setSelectedArea(area.id)}
                          >
                            Request This Area
                          </Button>
                        )}
                        {area.assignedTo && (
                          <p className="text-sm text-gray-500 mt-2">
                            Already assigned
                          </p>
                        )}
                      </div>
                    </Popup>
                  </GeoJSON>
                ))}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Please select a ward first</p>
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={!!selectedArea}
          onOpenChange={() => setSelectedArea(null)}
        >
          <DialogContent className="max-w-[320px] sm:max-w-[400px] md:max-w-[600px] rounded-md">
            <DialogHeader>
              <DialogTitle>
                Request Area{" "}
                {areas.data?.find((area) => area.id === selectedArea)?.code}
              </DialogTitle>
              <DialogDescription>
                Add an optional message with your request
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Why do you want to survey this area?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedArea(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}
