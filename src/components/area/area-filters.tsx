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

  const statusOptions = [
    { value: "pending", label: "Pending", icon: AlertCircle },
    { value: "approved", label: "Approved", icon: CheckCircle2 },
    { value: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Similar to building-filters, show active filters */}
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-4">
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
              <Label className="text-xs font-medium">Area Code</Label>
              <Input
                type="number"
                placeholder="Search by code..."
                value={code || ""}
                onChange={(e) =>
                  onFilterChange(
                    "code",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Assigned To
              </Label>
              <ComboboxSearchable
                options={[
                  { value: "", label: "All Enumerators" },
                  ...(enumerators?.map((e) => ({
                    value: e.id,
                    label: e.name,
                    searchTerms: [e.name],
                  })) ?? []),
                ]}
                value={assignedTo || ""}
                onChange={(value) =>
                  onFilterChange("assignedTo", value || undefined)
                }
                placeholder="Select enumerator..."
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
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
      </CardContent>
    </Card>
  );
}
