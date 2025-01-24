import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyFiltersProps {
  wardNo?: number;
  locality?: string;
  headName?: string;
  status?: "pending" | "approved" | "rejected" | "requested_for_edit";
  onFilterChange: (key: string, value: any) => void;
}

export function FamilyFilters({
  wardNo,
  status,
  onFilterChange,
}: FamilyFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            onFilterChange(
              "status",
              value as "pending" | "approved" | "rejected" | "requested_for_edit",
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="requested_for_edit">Edit Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
