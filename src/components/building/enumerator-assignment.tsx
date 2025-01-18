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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Enumerator Assignment
        </CardTitle>
        <CardDescription>Assign this building to an enumerator</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select
            value={currentEnumeratorId}
            onValueChange={handleAssign}
            disabled={isLoading || assignMutation.isLoading}
          >
            <SelectTrigger className="w-[300px]">
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
          {assignMutation.isLoading && (
            <Button variant="ghost" disabled>
              <UserCheck className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
