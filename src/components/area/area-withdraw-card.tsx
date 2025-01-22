"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AreaWithdrawCardProps {
  area: {
    areaId: string;
    code: string;
    areaStatus: string;
    wardNumber: number;
    userid: string;
    geometry: any;
    centroid: any;
  };
  onWithdraw: (areaId: string, userId: string) => Promise<void>;
  isWithdrawing: boolean;
}

export const AreaWithdrawCard: React.FC<AreaWithdrawCardProps> = ({
  area,
  onWithdraw,
  isWithdrawing,
}) => {
  const router = useRouter();
  const statusColor = {
    unassigned: "bg-yellow-100 text-yellow-800",
    assigned: "bg-green-100 text-green-800",
    pending: "bg-blue-100 text-blue-800",
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute right-4 top-4 z-10">
        <Badge
          className={`${
            statusColor[area.areaStatus as keyof typeof statusColor]
          } px-2.5 py-1 text-xs font-medium capitalize`}
        >
          {area.areaStatus}
        </Badge>
      </div>

      <div className="relative h-[200px] overflow-hidden">
        <MapContainer
          center={area.centroid.coordinates.reverse()}
          zoom={15}
          zoomControl={false}
          className="h-full w-full"
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            url="http://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
          <GeoJSON
            data={area.geometry}
            style={() => ({
              color: "#2563eb",
              weight: 2,
              fillOpacity: 0.2,
            })}
          />
        </MapContainer>
        <div />
      </div>

      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Area Code</h3>
              <p className="text-2xl font-bold tracking-tight text-primary">
                {area.code}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="rounded-full bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ward {area.wardNumber}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Ward Number: {area.wardNumber}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={async () => {
              try {
                if (!area.userid) throw new Error("User ID is required");
                await onWithdraw(area.areaId, area.userid);
              } catch (error) {
                console.error("Withdrawal failed:", error);
              }
            }}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Withdraw Area
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
