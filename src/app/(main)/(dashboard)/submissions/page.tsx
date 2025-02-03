"use client";

import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const AreaPointsMap = dynamic(
  () => import("@/components/map/area-points-map"),
  {
    ssr: false,
  },
);

interface Point {
  id: string;
  enumeratorName: string | null;
  locality: string | null;
  gpsPoint: {
    lat: number;
    lng: number;
    accuracy: number;
  } | null;
  [key: string]: any; // for other properties
}

interface Boundary {
  type: string;
  coordinates: number[][][];
}

export default function SubmissionsPage() {
  const [selectedWard, setSelectedWard] = useState<string>();
  const [selectedArea, setSelectedArea] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch areas for selected ward
  const { data: areas } = api.area.getAreas.useQuery(
    { wardNumber: selectedWard ? parseInt(selectedWard) : undefined },
    { enabled: !!selectedWard },
  );

  // Fetch points for selected area
  const { data: points } = api.building.getByAreaCode.useQuery<Point[]>(
    { areaCode: selectedArea ?? "" },
    { enabled: !!selectedArea },
  );

  // Fetch boundary for selected area
  const { data: boundary } = api.area.getAreaBoundaryByCode.useQuery<{
    boundary: Boundary;
  }>({ code: parseInt(selectedArea ?? "0") }, { enabled: !!selectedArea });

  // Get unique enumerators and count
  const pointCount = points?.length ?? 0;

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-[200px] border-gray-200">
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((ward) => (
                <SelectItem key={ward} value={ward.toString()}>
                  Ward {ward}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedArea}
            onValueChange={setSelectedArea}
            disabled={!selectedWard}
          >
            <SelectTrigger className="w-[200px] border-gray-200">
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              {areas?.map((area) => (
                <SelectItem key={area.id} value={area.code.toString()}>
                  Area {area.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger
              className={cn(
                "w-[200px] border-gray-200",
                selectedType === "family" && "text-blue-600",
                selectedType === "business" && "text-green-600",
                selectedType === "building" && "text-purple-600",
              )}
            >
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="building">Buildings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {points && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Points
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {pointCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full">
                  <HomeIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Selected Area
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {selectedArea ? `Area ${selectedArea}` : "None"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="h-[600px] w-full relative rounded-xl overflow-hidden bg-white shadow-md">
          {points && boundary && (
            <AreaPointsMap
              //@ts-ignore
              points={points.map((point) => ({
                ...point,
                enumeratorName: point.enumeratorName || undefined,
                locality: point.locality || undefined,
                gpsPoint: point.gpsPoint || undefined,
              }))}
              //@ts-ignore
              boundary={boundary.boundary}
            />
          )}
        </div>
      </div>
    </div>
  );
}
