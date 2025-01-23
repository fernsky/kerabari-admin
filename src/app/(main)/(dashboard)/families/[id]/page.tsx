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

          {/* <FamilyActions
            familyId={family.id}
            currentStatus={family.status ?? "pending"}
            onStatusChange={familyRefetch}
          /> */}

          <FamilyInfoGrid family={family} />

          {family?.geom && gpsSchema.safeParse(family.geom).success && (
            <div className="grid gap-6">
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
            </div>
          )}
        </div>
      )}
    </ContentLayout>
  );
}
