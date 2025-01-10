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
import "leaflet/dist/leaflet.css";

export default function RequestAreaPage() {
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areas = api.area.getUnassignedWardAreasofEnumerator.useQuery();
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
        areaCode: selectedArea,
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (areas.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <ContentLayout title="Request Area">
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <p className="mt-2 text-gray-600">
            Select an area from the map below to survey
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="h-[70vh] relative">
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
                  data={JSON.parse(area.geometry as unknown as string)}
                  style={{
                    color: "#2563eb",
                    weight: 2,
                    opacity: 0.6,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                  }}
                >
                  <Popup className="z-[10000]">
                    <div className="text-center">
                      <p className="font-semibold">Area Code: {area.code}</p>
                      <Button
                        className="mt-2"
                        size="sm"
                        onClick={() => setSelectedArea(area.code)}
                      >
                        Request This Area
                      </Button>
                    </div>
                  </Popup>
                </GeoJSON>
              ))}
            </MapContainer>
          </div>
        </div>

        <Dialog
          open={!!selectedArea}
          onOpenChange={() => setSelectedArea(null)}
        >
          <DialogContent className="max-w-[320px] sm:max-w-[400px] md:max-w-[600px] rounded-md">
            <DialogHeader>
              <DialogTitle>Request Area {selectedArea}</DialogTitle>
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
