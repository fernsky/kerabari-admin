"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
// import { FamilyActions } from "@/components/family/family-actions";
import { z } from "zod";
import { FamilyLoadingState } from "@/components/family/family-loading-state";
import { FamilyInfoGrid } from "@/components/family/family-info-grid";
import { FamilyStatsGrid } from "@/components/family/family-stats-grid";
import { LocationDetailsSection } from "@/components/family/location-details-section";
import { FamilyMediaSection } from "@/components/family/family-media-section";

const gpsSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

export default function FamilyDetails({ params }: { params: { id: string } }) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: family,
    isLoading,
    error,
    refetch: familyRefetch,
  } = api.family.getById.useQuery({ id: decodedId });

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
      title="Family Details"
      actions={
        <div className="flex gap-2">
          <Link href={`/families/edit/${params.id}`}>
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
        <FamilyLoadingState />
      ) : (
        <div className="space-y-6 lg:px-10 px-2">
          <FamilyStatsGrid
            totalMembers={family?.totalMembers ?? 0}
            wardNo={family?.wardNo ?? 0}
            headName={family?.headName ?? "N/A"}
          />

          <div className="grid lg:grid-cols-5 gap-6">
            {family?.geom && gpsSchema.safeParse(family.geom).success && (
              <LocationDetailsSection
                coordinates={[
                  family.geom.coordinates[1],
                  family.geom.coordinates[0],
                ]}
                gpsAccuracy={
                  family.gpsAccuracy
                    ? parseFloat(family.gpsAccuracy)
                    : undefined
                }
                altitude={
                  family.altitude ? parseFloat(family.altitude) : undefined
                }
              />
            )}

            {(family?.enumeratorSelfie ||
              family?.surveyAudioRecording ||
              (family?.gps && gpsSchema.safeParse(business.gps).success)) && (
              <div className="grid gap-6 lg:grid-cols-5">
                <FamilyMediaSection
                  selfieUrl={family.enumeratorSelfie ?? undefined}
                  audioUrl={family.surveyAudioRecording ?? undefined}
                />

                {family?.gps && gpsSchema.safeParse(family.gps).success && (
                  <LocationDetailsSection
                    coordinates={[
                      family.gps.coordinates[1],
                      family.gps.coordinates[0],
                    ]}
                    gpsAccuracy={parseFloat(
                      family.gpsAccuracy?.toString() ?? "0",
                    )}
                    altitude={parseFloat(family.altitude?.toString() ?? "0")}
                  />
                )}
              </div>
            )}
          </div>

          <FamilyInfoGrid family={family} />
        </div>
      )}
    </ContentLayout>
  );
}
