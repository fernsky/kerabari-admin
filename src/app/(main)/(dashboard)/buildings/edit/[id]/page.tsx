"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { updateBuildingSchema } from "@/server/api/routers/building/building.schema";
import { buildingChoices } from "@/lib/resources/building";
import { useEffect } from "react";
import { EnumeratorAssignment } from "@/components/building/enumerator-assignment";
import { ComboboxSearchable } from "@/components/ui/combobox-searchable";

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
      areaId: "",
      buildingToken: "",
    },
  });

  const { data: areas } = api.area.getAreas.useQuery({
    status: "all",
  });

  const selectedAreaId = form.watch("areaId");
  const { data: areaTokens } = api.area.getAreaTokens.useQuery(
    { areaId: selectedAreaId },
    { enabled: !!selectedAreaId },
  );

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
        wardNumber: building.wardNumber ?? 0,
        locality: building.locality ?? "",
        areaCode: building.areaCode ?? "",
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
        areaId: building.areaId ?? "",
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

  const FormCard = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );

  // Add this to get the current building token for comparison
  const currentBuildingToken = form.watch("buildingToken");

  return (
    <ContentLayout
      title="Edit Building"
      //@ts-ignore
      subtitle={`ID: ${decodedId}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/buildings/${decodedId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="building-form"
            disabled={updateBuilding.isLoading}
          >
            {updateBuilding.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 px-2 lg:px-10">
        <EnumeratorAssignment
          refetchBuilding={refetchBuilding}
          buildingId={decodedId}
          currentEnumeratorId={building?.userId ?? undefined}
        />

        <Form {...form}>
          <form
            id="building-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormCard
              title="Area Assignment"
              description="Assign building to an area and token"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <ComboboxSearchable
                          options={[
                            { value: "none", label: "None" },
                            ...(areas?.map((area) => ({
                              value: area.id,
                              label: `Area ${area.code} (Ward ${area.wardNumber})`,
                              searchTerms: [
                                `${area.code}`,
                                `${area.wardNumber}`,
                              ],
                            })) ?? []),
                          ]}
                          value={field.value || "none"}
                          onChange={(value) => {
                            field.onChange(value === "none" ? "" : value);
                            // Reset building token when area changes
                            form.setValue("buildingToken", "");
                          }}
                          placeholder="Search area..."
                          className="w-[300px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buildingToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building Token</FormLabel>
                      <FormControl>
                        <ComboboxSearchable
                          options={[
                            { value: "none", label: "None" },
                            ...(areaTokens?.tokens
                              ?.filter(
                                (token) =>
                                  // Include tokens that are either unallocated or match the current token
                                  token.status === "unallocated" ||
                                  token.token === currentBuildingToken,
                              )
                              .map((token) => ({
                                value: token.token,
                                label: `Token ${token.token}`,
                                searchTerms: [token.token],
                              })) ?? []),
                          ]}
                          value={field.value || "none"}
                          onChange={(value) =>
                            field.onChange(value === "none" ? "" : value)
                          }
                          placeholder="Search token..."
                          className="w-[300px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormCard>

            <FormCard
              title="Basic Information"
              description="General information about the building"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="enumeratorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enumerator Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Number</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((ward) => (
                            <SelectItem key={ward} value={ward.toString()}>
                              Ward {ward}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locality</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormCard>

            <FormCard
              title="Building Details"
              description="Physical characteristics of the building"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "landOwnership",
                    label: "Land Ownership",
                    choices: Object.values(buildingChoices.land_ownership),
                  },
                  {
                    name: "base",
                    label: "Base",
                    choices: Object.values(buildingChoices.house_base),
                  },
                  {
                    name: "outerWall",
                    label: "Outer Wall",
                    choices: Object.values(buildingChoices.house_outer_wall),
                  },
                  {
                    name: "roof",
                    label: "Roof",
                    choices: Object.values(buildingChoices.house_roof),
                  },
                  {
                    name: "floor",
                    label: "Floor",
                    choices: Object.values(buildingChoices.house_floor),
                  },
                  {
                    name: "mapStatus",
                    label: "Map Status",
                    choices: Object.values(buildingChoices.map_status),
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={`Select ${field.label}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.choices.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormCard>

            <FormCard
              title="Accessibility"
              description="Time distances to various facilities"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "timeToMarket",
                  "timeToActiveRoad",
                  "timeToPublicBus",
                  "timeToHealthOrganization",
                  "timeToFinancialOrganization",
                ].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {fieldName
                            .replace("timeTo", "")
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(buildingChoices.time).map(
                              (value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormCard>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
}
