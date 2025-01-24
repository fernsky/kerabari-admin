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

interface WardAssignmentProps {
  buildingId: string;
  currentWardNumber?: string | null;
  isWardValid?: boolean;
  refetchBuilding: () => void;
}

export function WardAssignment({
  buildingId,
  currentWardNumber,
  isWardValid = false,
  refetchBuilding,
}: WardAssignmentProps) {
  const assignMutation = api.building.assignWardUpdate.useMutation({
    onSuccess: () => {
      toast.success("Successfully assigned ward");
      refetchBuilding();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleWardChange = (ward: string) => {
    assignMutation.mutate({
      buildingId,
      wardId: ward === "none" ? null : ward,
    });
  };

  // Generate ward numbers 1-15 for example
  const wardOptions = Array.from({ length: 7 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Ward ${i + 1}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Ward Assignment</CardTitle>
        <CardDescription>Assign this building to a ward</CardDescription>
      </CardHeader>
      <CardContent>
        <ComboboxSearchable
          options={[{ value: "none", label: "None" }, ...wardOptions]}
          value={currentWardNumber || "none"}
          onChange={handleWardChange}
          placeholder="Search ward..."
          className={"w-full sm:w-[250px]"}
        />
      </CardContent>
    </Card>
  );
}
