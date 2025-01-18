"use client";

import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaFilters } from "../area/area-filters";
import { useState } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaTableView } from "../area/area-table-view";
import { AreaCardView } from "../area/area-card-view";

export function AreaList() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState({
    wardNumber: undefined as number | undefined,
    code: undefined as number | undefined,
    status: undefined as
      | "unassigned"
      | "newly_assigned"
      | "ongoing_survey"
      | "revision"
      | "asked_for_completion"
      | "asked_for_revision_completion"
      | "asked_for_withdrawl"
      | undefined,
    assignedTo: undefined as string | undefined,
  });

  const { data: areas, isLoading } = api.area.getAreas.useQuery(filters);
  const utils = api.useContext();

  const { mutate: updateAreaStatus } =
    api.area.updateAreaRequestStatus.useMutation({
      onSuccess: () => {
        utils.area.getAreas.invalidate();
      },
    });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAction = (
    areaId: string,
    currentStatus: string,
    action: "approve" | "reject",
  ) => {
    /*
    updateAreaStatus({
      areaId,
      status: action === "approve" ? "approved" : "rejected",
      userId: "user_id", // You need to provide the actual userId here
    });
    */
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Areas</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <LayoutList className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      <AreaFilters {...filters} onFilterChange={handleFilterChange} />

      {view === "table" ? (
        <AreaTableView data={areas} onAction={handleAction} />
      ) : (
        <AreaCardView data={areas} onAction={handleAction} />
      )}
    </div>
  );
}
