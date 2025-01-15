import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BuildingFiltersProps {
  wardNumber: number | undefined;
  locality: string | undefined;
  mapStatus: string | undefined;
  onFilterChange: (key: string, value: any) => void;
}

export function BuildingFilters({
  wardNumber,
  locality,
  mapStatus,
  onFilterChange,
}: BuildingFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      <div className="flex flex-col space-y-1.5">
        <Label className="text-xs font-medium">Ward Number</Label>
        <Select
          value={wardNumber?.toString()}
          onValueChange={(value) =>
            onFilterChange("wardNumber", parseInt(value))
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select ward" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7].map((ward) => (
              <SelectItem key={ward} value={ward.toString()}>
                Ward {ward}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
