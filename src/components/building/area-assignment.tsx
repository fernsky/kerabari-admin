import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComboboxSearchable } from "@/components/ui/combobox-searchable";
import { toast } from "sonner";
import { useState } from "react";

interface AreaAssignmentProps {
  buildingId: string;
  currentAreaId?: string | null;
  currentBuildingToken?: string | null;
  isAreaValid?: boolean;
  refetchBuilding: () => void;
}

export function AreaAssignment({
  buildingId,
  currentAreaId,
  currentBuildingToken,
  isAreaValid = false,
  refetchBuilding,
}: AreaAssignmentProps) {
  const [selectedAreaId, setSelectedAreaId] = useState(currentAreaId ?? null);

  const { data: areas } = api.area.getAreas.useQuery({
    status: "all",
  });

  const { data: areaTokens } = api.area.getAreaTokens.useQuery(
    { areaId: selectedAreaId ?? "" },
    { enabled: !!selectedAreaId },
  );

  const assignMutation = api.building.assignAreaUpdate.useMutation({
    onSuccess: () => {
      toast.success("Successfully assigned area");
      refetchBuilding();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId === "none" ? null : areaId);
    assignMutation.mutate({
      buildingId,
      areaId: areaId === "none" ? null : areaId,
      buildingToken: null,
    });
  };

  const handleTokenChange = (token: string) => {
    assignMutation.mutate({
      buildingId,
      areaId: selectedAreaId,
      buildingToken: token === "none" ? null : token,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Area Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ComboboxSearchable
          options={[
            //@ts-ignore
            { value: null, label: "None" },
            ...(areas?.map((area) => ({
              value: area.id,
              label: `Area ${area.code} (Ward ${area.wardNumber})`,
              searchTerms: [`${area.code}`, `${area.wardNumber}`],
            })) ?? []),
          ]}
          value={currentAreaId || "none"}
          onChange={handleAreaChange}
          placeholder="Search area..."
          className="w-full"
        />

        <ComboboxSearchable
          options={[
            //@ts-ignore
            { value: null, label: "None" },
            ...(areaTokens?.tokens
              ?.filter(
                (token) =>
                  token.status === "unallocated" ||
                  token.token === currentBuildingToken,
              )
              .map((token) => ({
                value: token.token,
                label: `Token ${token.token}`,
                searchTerms: [token.token],
              })) ?? []),
          ]}
          value={currentBuildingToken || "none"}
          onChange={handleTokenChange}
          placeholder="Search token..."
          disabled={!selectedAreaId || selectedAreaId === "none"}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
