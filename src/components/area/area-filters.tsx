import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxSearchable } from "@/components/ui/combobox-searchable";
import { api } from "@/trpc/react";
import { MapPin, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";

interface AreaFiltersProps {
  wardNumber: number | undefined;
  code: number | undefined;
  status: string | undefined;
  assignedTo: string | undefined;
  onFilterChange: (key: string, value: any) => void;
}

export function AreaFilters({
  wardNumber,
  code,
  status,
  assignedTo,
  onFilterChange,
}: AreaFiltersProps) {
  const { data: enumerators } = api.admin.getEnumerators.useQuery();

  const enumeratorOptions = [
    { value: "all", label: "All Enumerators" },
    ...(enumerators?.map((enumerator) => ({
      value: enumerator.id,
      label: enumerator.name,
      searchTerms: [enumerator.name],
    })) ?? []),
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", icon: AlertCircle },
    { value: "approved", label: "Approved", icon: CheckCircle2 },
    { value: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Ward
            </div>
          </Label>
          <Select
            value={wardNumber?.toString() || ""}
            onValueChange={(value) =>
              onFilterChange("wardNumber", value ? parseInt(value) : undefined)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Wards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7].map((ward) => (
                <SelectItem key={ward} value={ward.toString()}>
                  Ward {ward}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Area Code
            </div>
          </Label>
          <Input
            type="number"
            placeholder="Search by code..."
            className="h-8"
            value={code || ""}
            onChange={(e) =>
              onFilterChange(
                "code",
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Assigned To
            </div>
          </Label>
          <ComboboxSearchable
            options={enumeratorOptions}
            value={assignedTo || "all"}
            onChange={(value) =>
              onFilterChange(
                "enumeratorId",
                value === "all" ? undefined : value,
              )
            }
            placeholder="Search enumerator..."
            className="min-w-[180px] z-[10000]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              Status
            </div>
          </Label>
          <Select
            value={status || ""}
            onValueChange={(value) =>
              onFilterChange("status", value || undefined)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
