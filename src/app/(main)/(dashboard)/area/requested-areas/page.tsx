"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ContentLayout } from "@/components/admin-panel/content-layout";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
} as const;

export default function RequestedAreas() {
  const [updating, setUpdating] = useState<string | null>(null);

  const {
    data: requests,
    isLoading,
    error,
  } = api.area.getAllAreaRequests.useQuery(undefined, {
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  const updateStatus = api.area.updateAreaRequestStatus.useMutation({
    onSuccess: () => {
      toast("The area request status has been updated.");
      setUpdating(null);
    },
    onError: (error) => {
      toast(`Error updating status ${error.message}`);
      setUpdating(null);
    },
  });

  useEffect(() => {
    return () => {
      const containers = document.querySelectorAll(".leaflet-container");
      containers.forEach((container) => {
        // @ts-ignore
        container._leaflet_id = null;
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading area requests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading area requests: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ContentLayout title="Area Access Requests">
      <div className="container mx-auto space-y-6 p-4 pt-1">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage area access requests from enumerators
          </p>
        </div>

        {requests?.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No area requests found</p>
          </div>
        ) : (
          <div className="flex gap-4">
            {requests?.map((request) => (
              <Card
                key={`${request.request.areaId}-${request.request.userId}`}
                className="transition-all duration-200 hover:shadow-md w-[280px]"
              >
                {request.area?.geometry! && (
                  <div className="h-[150px] w-full overflow-hidden rounded-t-lg">
                    <MapContainer
                      className="h-full w-full"
                      zoom={13}
                      scrollWheelZoom={false}
                      center={[26.72069444681497, 88.04840072844279]}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <GeoJSON
                        data={JSON.parse(request.area.geometry as string)}
                        style={{
                          color: "#2563eb",
                          weight: 2,
                          opacity: 0.6,
                          fillColor: "#3b82f6",
                          fillOpacity: 0.1,
                        }}
                      />
                    </MapContainer>
                  </div>
                )}

                <CardHeader className="space-y-1 p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Area {request.area?.code}
                    </CardTitle>
                    <Badge variant="outline">
                      Ward {request.area?.wardNumber}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Requested{" "}
                    {formatDistanceToNow(new Date(request.request.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Requester</span>
                      <span className="font-medium">{request.user?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">
                        {request.user?.phoneNumber}
                      </span>
                    </div>
                    {request.request.message && (
                      <div className="mt-2 rounded-md bg-muted/50 p-2">
                        <p className="text-xs italic">
                          "{request.request.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {request.request.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        disabled={!!updating}
                        onClick={() => {
                          setUpdating(
                            `${request.request.areaId}-${request.request.userId}`,
                          );
                          updateStatus.mutate({
                            areaId: request.request.areaId,
                            userId: request.request.userId,
                            status: "approved",
                          });
                        }}
                        className="flex-1 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-200 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={!!updating}
                        onClick={() => {
                          setUpdating(
                            `${request.request.areaId}-${request.request.userId}`,
                          );
                          updateStatus.mutate({
                            areaId: request.request.areaId,
                            userId: request.request.userId,
                            status: "rejected",
                          });
                        }}
                        className="flex-1 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <Badge
                      className={`w-full justify-center ${statusColors[request.request.status as keyof typeof statusColors]}`}
                    >
                      {request?.request?.status
                        ? request.request.status.charAt(0).toUpperCase() +
                          request.request.status.slice(1)
                        : ""}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
