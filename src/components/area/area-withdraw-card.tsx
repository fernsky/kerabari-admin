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
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Area Code: {area.code}</span>
          <Badge
            variant={area.areaStatus === "unassigned" ? "secondary" : "default"}
          >
            {area.areaStatus}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ward Number: {area.wardNumber}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full overflow-hidden rounded-md border">
          <MapContainer
            center={area.centroid.coordinates.reverse()}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              //   url="https://mt2.google.com/vt/lyrs=s&x=%7Bx%7D&y=%7By%7D&z=%7Bz%7D"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <button
          onClick={async () => {
            try {
              if (!area.userid) {
                throw new Error("User ID is required");
              }
              await onWithdraw(area.areaId, area.userid);
              router.push("/");
            } catch (error) {
              console.error("Withdrawal failed:", error);
            }
          }}
          disabled={isWithdrawing}
          className={`rounded-md px-3 py-2 text-sm ${
            isWithdrawing
              ? "bg-gray-100 text-gray-400"
              : "bg-red-50 text-red-600 hover:bg-red-200"
          }`}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw Area"}
        </button>
      </CardFooter>
    </Card>
  );
};
