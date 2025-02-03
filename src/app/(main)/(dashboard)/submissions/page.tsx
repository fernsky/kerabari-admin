"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import AreaPointsMap from "@/components/map/area-points-map";
import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";

const AreaCard = ({ area }: { area: any }) => {
  const { data: buildingData, isLoading: isBuildingLoading } =
    api.building.getByAreaCode.useQuery(
      { areaCode: area.code.toString() },
      { enabled: !!area.code },
    );

  // Skip rendering if no points or still loading
  if (isBuildingLoading || !buildingData || buildingData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-[400px] relative">
        <AreaPointsMap
          points={buildingData.map((building, index) => ({
            id: index.toString(),
            gpsPoint: building.gpsPoint
              ? {
                  ...building.gpsPoint,
                  accuracy: building.gpsAccuracy ?? 0,
                }
              : null,
          }))}
        />
        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md">
          <span className="font-medium text-sm">Area {area.code}</span>
          <span className="text-xs text-gray-500 ml-2">
            {buildingData.length} points
          </span>
        </div>
      </div>
    </div>
  );
};

export default function AreasPage() {
  const [selectedWard, setSelectedWard] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("buildings");
  const { data: areas, isLoading } = api.area.getAreas.useQuery({
    wardNumber: selectedWard,
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(Number(e.target.value))}
              className="ml-3 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map((ward) => (
                <option key={ward} value={ward}>
                  Ward {ward}
                </option>
              ))}
            </select>
          </div>
          <div className="border-l pl-4">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ml-3 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="buildings">Buildings</option>
              <option value="families">Families</option>
              <option value="businesses">Businesses</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-[400px] bg-white/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areas?.map((area) => <AreaCard key={area.id} area={area} />)}
        </div>
      )}
    </div>
  );
}
