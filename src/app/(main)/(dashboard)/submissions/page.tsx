"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
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
import {
  Building2,
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  MapIcon,
  ArrowDownCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AreaPointsMap = dynamic(
  () => import("@/components/map/area-points-map"),
  {
    ssr: false,
  },
);

interface Point {
  id: string;
  name: string | null;
  wardNo: string | null;
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

// Add this helper function outside the component
const calculatePolygonCenter = (coordinates: number[][][]) => {
  let totalLat = 0;
  let totalLng = 0;
  let pointCount = 0;

  coordinates[0].forEach((point) => {
    totalLat += point[1];
    totalLng += point[0];
    pointCount++;
  });

  return {
    lat: totalLat / pointCount,
    lng: totalLng / pointCount,
  };
};

export default function SubmissionsPage() {
  const [selectedWard, setSelectedWard] = useState<string>();
  const [selectedArea, setSelectedArea] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>("building");

  // Fetch areas for selected ward
  const { data: areas } = api.area.getAreas.useQuery(
    { wardNumber: selectedWard ? parseInt(selectedWard) : undefined },
    { enabled: !!selectedWard },
  );

  // Fetch points for selected area and type
  const queryProcedure =
    selectedType === "family"
      ? api.family.getByAreaCode
      : selectedType === "business"
        ? api.business.getByAreaCode
        : api.building.getByAreaCode;

  //@ts-ignore
  const { data: points, isLoading: pointsLoading } = queryProcedure.useQuery(
    { areaCode: selectedArea ?? "" },
    {
      enabled: !!selectedArea,
      retry: 1,
    },
  );

  // Fetch boundary for selected area
  const { data: boundary } = api.area.getAreaBoundaryByCode.useQuery<{
    boundary: Boundary;
  }>({ code: parseInt(selectedArea ?? "0") }, { enabled: !!selectedArea });

  // Get unique enumerators and count
  const pointCount = points?.length ?? 0;

  // Add this before the return statement
  const mapCenter = boundary?.boundary
    ? calculatePolygonCenter(boundary.boundary.coordinates)
    : undefined;

  return (
    <ContentLayout title={""}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6" // reduced padding
      >
        <div className="flex flex-col gap-4 md:gap-6">
          {" "}
          {/* reduced gap */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="flex flex-col md:flex-row flex-wrap items-center gap-3 bg-white p-3 md:p-4 rounded-lg shadow-sm"
          >
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
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="building">Buildings</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
          {/* Content Section */}
          {!selectedWard ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm space-y-4 text-center"
            >
              <MapIcon className="w-16 h-16 text-gray-400" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-700">
                  Welcome to Area Submissions
                </h2>
                <p className="text-gray-500 max-w-md">
                  View and analyze data submissions across different wards and
                  areas. Start by selecting a ward from the dropdown above.
                </p>
              </div>
              <ArrowDownCircle className="w-6 h-6 text-blue-500 animate-bounce mt-4" />
            </motion.div>
          ) : !selectedArea ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm space-y-4 text-center"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-700">
                  Ward {selectedWard} Selected
                </h2>
                <p className="text-gray-500">
                  Now select an area to view detailed submissions data and map
                  visualization.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {pointsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" /> {/* reduced height */}
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : points ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {selectedType === "family" && (
                          <UsersIcon className="w-6 h-6 text-blue-600" />
                        )}
                        {selectedType === "business" && (
                          <BriefcaseIcon className="w-6 h-6 text-green-600" />
                        )}
                        {selectedType === "building" && (
                          <Building2 className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-xs font-medium mb-0.5",
                            selectedType === "family" && "text-blue-600",
                            selectedType === "business" && "text-green-600",
                            selectedType === "building" && "text-purple-600",
                          )}
                        >
                          {selectedType === "family"
                            ? "Total Families"
                            : selectedType === "business"
                              ? "Total Businesses"
                              : "Total Buildings"}
                        </p>
                        <p
                          className={cn(
                            "text-2xl font-bold leading-none",
                            selectedType === "family" && "text-blue-700",
                            selectedType === "business" && "text-green-700",
                            selectedType === "building" && "text-purple-700",
                          )}
                        >
                          {pointCount}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <HomeIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-0.5 text-purple-600">
                          Selected Area
                        </p>
                        <p className="text-2xl font-bold leading-none text-purple-700">
                          {selectedArea ? `Area ${selectedArea}` : "None"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : selectedArea ? (
                <Alert variant="destructive" className="py-2">
                  {" "}
                  {/* reduced padding */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load data. Please try again.
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* Map Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-[400px] md:h-[600px] w-full relative rounded-xl overflow-hidden bg-white shadow-sm" // lighter shadow
              >
                {points && boundary ? (
                  <AreaPointsMap
                    //@ts-ignore
                    points={points.map((point) => ({
                      ...point,
                      name: point.name || undefined,
                      wardNo: point.wardNo || undefined,
                      gpsPoint: point.gpsPoint || undefined,
                    }))}
                    //@ts-ignore
                    boundary={boundary.boundary}
                    center={mapCenter}
                    defaultZoom={15}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </ContentLayout>
  );
}
