"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { updateBuildingSchema } from "@/server/api/routers/building/building.schema";
import { useEffect } from "react";
import { EnumeratorAssignment } from "@/components/building/enumerator-assignment";
import { Form } from "@/components/ui/form";
import { AreaAssignmentSection } from "@/components/building/edit/area-assignment-section";
import { BasicInformationSection } from "@/components/building/edit/basic-information-section";
import { BuildingDetailsSection } from "@/components/building/edit/building-details-section";
import { AccessibilitySection } from "@/components/building/edit/accessibility-section";
import { isNull } from "util";
import { EditPageLayout } from "@/components/building/edit/edit-page-layout";
import { Building2, MapPin, Info, Home, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function EditBuilding({ params }: { params: { id: string } }) {
  const router = useRouter();
  const decodedId = decodeURIComponent(params.id);

  const form = useForm({
    resolver: zodResolver(updateBuildingSchema),
    defaultValues: {
      surveyDate: "",
      enumeratorName: "",
      enumeratorId: "",
      wardNumber: 0,
      locality: "",
      areaCode: "",
      totalFamilies: 0,
      totalBusinesses: 0,
      landOwnership: "",
      base: "",
      outerWall: "",
      roof: "",
      floor: "",
      mapStatus: "",
      roadStatus: "",
      timeToMarket: "",
      timeToActiveRoad: "",
      timeToPublicBus: "",
      timeToHealthOrganization: "",
      timeToFinancialOrganization: "",
      areaId: null as unknown as string | undefined,
      buildingToken: "",
    },
  });

  const {
    data: building,
    isLoading,
    refetch: refetchBuilding,
  } = api.building.getById.useQuery({
    id: decodedId,
  });

  const updateBuilding = api.building.update.useMutation({
    onSuccess: () => {
      toast.success("Building updated successfully");
      router.push(`/buildings/${decodedId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (building) {
      form.reset({
        surveyDate: building.surveyDate?.toISOString().split("T")[0] ?? "",
        enumeratorName: building.enumeratorName ?? "",
        enumeratorId: building.enumeratorId ?? "",
        locality: building.locality ?? "",
        totalFamilies: building.totalFamilies ?? 0,
        totalBusinesses: building.totalBusinesses ?? 0,

        // Use the display values directly
        landOwnership: building.landOwnership ?? "",
        base: building.base ?? "",
        outerWall: building.outerWall ?? "",
        roof: building.roof ?? "",
        floor: building.floor ?? "",
        mapStatus: building.mapStatus ?? "",
        roadStatus: building.roadStatus ?? "",
        timeToMarket: building.timeToMarket ?? "",
        timeToActiveRoad: building.timeToActiveRoad ?? "",
        timeToPublicBus: building.timeToPublicBus ?? "",
        timeToHealthOrganization: building.timeToHealthOrganization ?? "",
        timeToFinancialOrganization: building.timeToFinancialOrganization ?? "",
        areaId: building.areaId ?? undefined,
        buildingToken: building.buildingToken ?? "",
      });
    }
  }, [building, form]);

  const onSubmit = (data: any) => {
    // Submit the data directly without mapping
    updateBuilding.mutate({
      id: decodedId,
      data: {
        ...data,
        wardNumber: parseInt(data.wardNumber),
        totalFamilies: parseInt(data.totalFamilies),
        totalBusinesses: parseInt(data.totalBusinesses),
      },
    });
  };

  if (isLoading) {
    return (
      <ContentLayout title="Edit Building">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      </ContentLayout>
    );
  }

  const currentBuildingToken = form.watch("buildingToken");

  return (
    <ContentLayout
      title="Edit Building"
      subtitle={`ID: ${decodedId}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/buildings/${decodedId}`)}
            className="hover:border-destructive hover:text-destructive"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="building-form"
            disabled={updateBuilding.isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {updateBuilding.isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4"
                >
                  ◌
                </motion.div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      }
    >
      <EditPageLayout>
        <EnumeratorAssignment
          refetchBuilding={refetchBuilding}
          buildingId={decodedId}
          currentEnumeratorId={building?.enumeratorId ?? undefined}
        />

        <Form {...form}>
          <form
            id="building-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <AreaAssignmentSection
              form={form}
              currentBuildingToken={currentBuildingToken}
              icon={<MapPin className="h-5 w-5" />}
            />
            <BasicInformationSection
              form={form}
              icon={<Info className="h-5 w-5" />}
            />
            <BuildingDetailsSection
              form={form}
              icon={<Building2 className="h-5 w-5" />}
            />
            <AccessibilitySection
              form={form}
              icon={<Clock className="h-5 w-5" />}
            />
          </form>
        </Form>
      </EditPageLayout>
    </ContentLayout>
  );
}
