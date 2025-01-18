"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { BuildingLoadingState } from "@/components/building/building-loading-state";
import { BuildingStatsGrid } from "@/components/building/building-stats-grid";
import { BuildingInfoGrid } from "@/components/building/building-info-grid";
import { BuildingMediaSection } from "@/components/building/building-media-section";
import { LocationDetailsSection } from "@/components/building/location-details-section";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BuildingActions } from "@/components/building/building-actions";
import { z } from "zod";

const gpsSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

export default function BuildingDetails({
  params,
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: building,
    isLoading,
    error,
    refetch: buildingRefetch,
  } = api.building.getById.useQuery({ id: decodedId });

  if (error) {
    return (
      <ContentLayout title="Error">
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title="Building Details"
      actions={
        <div className="flex gap-2">
          <Link href={`/buildings/edit/${params.id}`}>
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <BuildingLoadingState />
      ) : (
        <div className="space-y-6 lg:px-10 px-2">
          <BuildingStatsGrid
            totalFamilies={building?.totalFamilies ?? 0}
            totalBusinesses={building?.totalBusinesses ?? 0}
            wardNumber={building?.wardNumber ?? 0}
          />

          <BuildingActions
            buildingId={building.id}
            currentStatus={building.status ?? "pending"}
            onStatusChange={buildingRefetch}
          />

          {building?.buildingImage && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="aspect-video relative">
                <Image
                  src={building.buildingImage}
                  alt="Building"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <BuildingInfoGrid building={building} />

          {(building?.enumeratorSelfie ||
            building?.surveyAudioRecording ||
            (building?.gps && gpsSchema.safeParse(building.gps).success)) && (
            <div className="grid gap-6 lg:grid-cols-5">
              <BuildingMediaSection
                selfieUrl={building.enumeratorSelfie ?? undefined}
                audioUrl={building.surveyAudioRecording ?? undefined}
              />

              {building?.gps && gpsSchema.safeParse(building.gps).success && (
                <LocationDetailsSection
                  coordinates={[
                    building.gps.coordinates[1],
                    building.gps.coordinates[0],
                  ]}
                  gpsAccuracy={building.gpsAccuracy ?? undefined}
                  altitude={building.altitude ?? undefined}
                />
              )}
            </div>
          )}
        </div>
      )}
    </ContentLayout>
  );
}
