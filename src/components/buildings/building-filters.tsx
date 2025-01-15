import { Input } from "@/components/ui/input";
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
        <Input
          type="number"
          value={wardNumber || ""}
          onChange={(e) =>
            onFilterChange("wardNumber", parseInt(e.target.value))
          }
          placeholder="Filter by ward number"
          className="h-9"
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label className="text-xs font-medium">Locality</Label>
        <Input
          value={locality || ""}
          onChange={(e) => onFilterChange("locality", e.target.value)}
          placeholder="Filter by locality"
          className="h-9"
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label className="text-xs font-medium">Map Status</Label>
        <Select
          value={mapStatus}
          onValueChange={(value) => onFilterChange("mapStatus", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="map_passed">Passed</SelectItem>
            <SelectItem value="map_failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
