import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

export function EnumeratorAssignment({
  buildingId,
  currentEnumeratorId,
  refetchBuilding,
}: {
  buildingId: string;
  currentEnumeratorId?: string;
  refetchBuilding: () => void;
}) {
  const { data: enumerators, isLoading } = api.admin.getEnumerators.useQuery();

  const assignMutation = api.building.assignToEnumerator.useMutation({
    onSuccess: () => {
      toast.success("Successfully assigned enumerator");
      refetchBuilding();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAssign = (enumeratorId: string) => {
    assignMutation.mutate({
      buildingId,
      enumeratorId,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Enumerator Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={currentEnumeratorId}
          onValueChange={handleAssign}
          disabled={isLoading || assignMutation.isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an enumerator" />
          </SelectTrigger>
          <SelectContent>
            {enumerators?.map((enumerator) => (
              <SelectItem key={enumerator.id} value={enumerator.id}>
                {enumerator.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
