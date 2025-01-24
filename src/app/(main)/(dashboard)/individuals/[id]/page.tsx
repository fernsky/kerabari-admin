"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function IndividualDetails({
  params,
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: individual,
    isLoading,
    error,
  } = api.individual.getById.useQuery({ id: decodedId });

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
      title="Individual Details"
      actions={
        <div className="flex gap-2">
          <Link href={`/individuals/edit/${params.id}`}>
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
        <div className="animate-pulse space-y-6 p-4">
          <div className="h-32 rounded-lg bg-muted"></div>
          <div className="h-64 rounded-lg bg-muted"></div>
        </div>
      ) : (
        <div className="space-y-6 lg:px-10 px-2">
          {/* Basic Information */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Personal Info
              </h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {individual?.name}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {individual?.age}
                </p>
                <p>
                  <span className="font-medium">Gender:</span>{" "}
                  {individual?.gender}
                </p>
                <p>
                  <span className="font-medium">Family Role:</span>{" "}
                  {individual?.familyRole}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Demographics
              </h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-medium">Ward:</span>{" "}
                  {individual?.wardNo}
                </p>
                <p>
                  <span className="font-medium">Citizenship:</span>{" "}
                  {individual?.citizenOf}
                </p>
                <p>
                  <span className="font-medium">Caste:</span>{" "}
                  {individual?.caste}
                </p>
                <p>
                  <span className="font-medium">Religion:</span>{" "}
                  {individual?.religion}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Education & Work
              </h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-medium">Education:</span>{" "}
                  {individual?.educationalLevel}
                </p>
                <p>
                  <span className="font-medium">Occupation:</span>{" "}
                  {individual?.primaryOccupation}
                </p>
                <p>
                  <span className="font-medium">Skills:</span>{" "}
                  {individual?.primarySkill}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h3 className="font-medium">Additional Information</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Health Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Health Status
                </h4>
                <p>
                  <span className="font-medium">Chronic Disease:</span>{" "}
                  {individual?.hasChronicDisease}
                </p>
                <p>
                  <span className="font-medium">Disability:</span>{" "}
                  {individual?.isDisabled}
                </p>
              </div>

              {/* Migration Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Migration Details
                </h4>
                <p>
                  <span className="font-medium">Present Status:</span>{" "}
                  {individual?.isPresent}
                </p>
                {individual?.absenceReason && (
                  <p>
                    <span className="font-medium">Absence Reason:</span>{" "}
                    {individual.absenceReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ContentLayout>
  );
}
