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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit,
} from "lucide-react";

interface BuildingFiltersProps {
  wardNumber: number | undefined;
  locality: string | undefined;
  mapStatus: string | undefined;
  enumeratorId?: string;
  status?: string;
  onFilterChange: (key: string, value: any) => void;
}

export function BuildingFilters({
  wardNumber,
  locality,
  mapStatus,
  enumeratorId,
  status,
  onFilterChange,
}: BuildingFiltersProps) {
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
    {
      value: "pending",
      label: "Pending",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "approved",
      label: "Approved",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "rejected",
      label: "Rejected",
      icon: AlertCircle,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "requested_for_edit",
      label: "Edit Requested",
      icon: Edit,
      color: "bg-blue-100 text-blue-800",
    },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {wardNumber && (
              <Badge variant="secondary" className="gap-2">
                <MapPin className="h-3 w-3" />
                Ward {wardNumber}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFilterChange("wardNumber", undefined)}
                />
              </Badge>
            )}
            {enumeratorId && (
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                {enumerators?.find((e) => e.id === enumeratorId)?.name ||
                  "Enumerator"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFilterChange("enumeratorId", undefined)}
                />
              </Badge>
            )}
            {status && (
              <Badge
                variant="secondary"
                className={`gap-2 ${statusOptions.find((s) => s.value === status)?.color}`}
              >
                {(() => {
                  const StatusIcon =
                    statusOptions.find((s) => s.value === status)?.icon ||
                    Clock;
                  return <StatusIcon className="h-3 w-3" />;
                })()}
                {statusOptions.find((s) => s.value === status)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFilterChange("status", undefined)}
                />
              </Badge>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Ward Number
              </Label>
              <Select
                value={wardNumber?.toString() || ""}
                onValueChange={(value) =>
                  onFilterChange(
                    "wardNumber",
                    value ? parseInt(value) : undefined,
                  )
                }
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Collected By
              </Label>
              <ComboboxSearchable
                options={enumeratorOptions}
                value={enumeratorId || "all"}
                onChange={(value) =>
                  onFilterChange(
                    "enumeratorId",
                    value === "all" ? undefined : value,
                  )
                }
                placeholder="Search enumerator..."
                className={""}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Status
              </Label>
              <Select
                value={status || ""}
                onValueChange={(value) =>
                  onFilterChange("status", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
