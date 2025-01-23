"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { BusinessLoadingState } from "@/components/business/business-loading-state";
import { BusinessStatsGrid } from "@/components/business/business-stats-grid";
import { BusinessInfoGrid } from "@/components/business/business-info-grid";
import { LocationDetailsSection } from "@/components/business/location-details-section";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { BusinessActions } from "@/components/business/business-actions";
import { z } from "zod";

const gpsSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

export default function BusinessDetails({
  params,
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: business,
    isLoading,
    error,
    refetch: businessRefetch,
  } = api.business.getById.useQuery({ id: decodedId });

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
      title="Business Details"
      actions={
        <div className="flex gap-2">
          <Link href={`/businesses/edit/${params.id}`}>
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
        <BusinessLoadingState />
      ) : (
        <div className="space-y-6 lg:px-10 px-2">
          <BusinessStatsGrid
            totalEmployees={
              (business?.totalPermanentEmployees ?? 0) +
              (business?.totalTemporaryEmployees ?? 0)
            }
            totalPartners={business?.totalPartners ?? 0}
            wardNumber={business?.wardNo ?? 0}
          />

          <BusinessActions
            businessId={business.id}
            currentStatus={business.status ?? "pending"}
            onStatusChange={businessRefetch}
          />

          <BusinessInfoGrid business={business} />

          {business?.gps && gpsSchema.safeParse(business.gps).success && (
            <div className="grid gap-6 lg:grid-cols-5">
              <LocationDetailsSection
                coordinates={[
                  business.gps.coordinates[1],
                  business.gps.coordinates[0],
                ]}
                gpsAccuracy={
                  business.gpsAccuracy
                    ? parseFloat(business.gpsAccuracy)
                    : undefined
                }
                altitude={
                  business.altitude ? parseFloat(business.altitude) : undefined
                }
              />
            </div>
          )}
        </div>
      )}
    </ContentLayout>
  );
}
