"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvalidBuildingsFilters } from "./invalid-buildings/filters";
import { PaginationControls } from "./invalid-buildings/pagination";
import { BuildingCard } from "./invalid-buildings/building-card";
import { SortingState } from "@tanstack/react-table";

interface Filters {
  wardNumber?: number;
  areaCode?: number;
  enumeratorId?: string;
}

interface InvalidBuilding {
  id: string;
  locality: string | null;
  tmpWardNumber?: number;
  tmpAreaCode?: string;
  tmpEnumeratorId?: string;
  tmpBuildingToken?: string;
  isWardValid: boolean;
  isAreaValid: boolean;
  isEnumeratorValid: boolean;
  isBuildingTokenValid: boolean;
  enumeratorName?: string;
  areaId?: string;
}

export function InvalidBuildingsList() {
  const [filters, setFilters] = useState<Filters>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "locality", desc: false },
  ]);
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 500);

  const { data, isLoading, error } = api.building.getInvalidBuildings.useQuery({
    filters: debouncedFilters,
    limit: 10,
    offset: page * 10,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const currentDisplayCount = Math.min(
    (page + 1) * 10,
    data?.pagination.total || 0,
  );

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const invalidBuildings = data?.data.map(
    (building): InvalidBuilding => ({
      ...building,
      locality: building.locality ?? "Unknown Location",
      tmpWardNumber: building.tmpWardNumber ?? undefined,
      tmpAreaCode: building.tmpAreaCode ?? undefined,
      tmpEnumeratorId: building.tmpEnumeratorId ?? undefined,
      tmpBuildingToken: building.tmpBuildingToken ?? undefined,
      enumeratorName: building.enumeratorName ?? undefined,
      areaId: building.areaId ?? undefined,
      isWardValid: building.isWardValid ?? false,
      isAreaValid: building.isAreaValid ?? false,
      isEnumeratorValid: building.isEnumeratorValid ?? false,
      isBuildingTokenValid: building.isBuildingTokenValid ?? false,
    }),
  );

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Invalid Buildings</h2>
        <p className="text-sm text-muted-foreground">
          View and manage buildings with validation issues
        </p>
        {data?.summary && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Total Invalid: {data.summary.totalInvalid}</span>
            <span>Invalid Ward: {data.summary.invalidWard}</span>
            <span>Invalid Area: {data.summary.invalidArea}</span>
            <span>Invalid Enumerator: {data.summary.invalidEnumerator}</span>
            <span>Invalid Token: {data.summary.invalidToken}</span>
          </div>
        )}
      </div>
      <div className="p-6 space-y-6">
        <InvalidBuildingsFilters
          {...filters}
          //@ts-ignore
          onFilterChange={handleFilterChange}
        />

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {invalidBuildings?.map((building) => (
                // @ts-ignore
                <BuildingCard key={building.id} building={building} />
              ))}
            </div>

            {invalidBuildings?.length ? (
              <PaginationControls
                currentPage={page}
                totalItems={data.pagination.total}
                pageSize={10}
                currentDisplayCount={currentDisplayCount}
                onPageChange={setPage}
                hasMore={(invalidBuildings?.length ?? 0) === 10}
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No invalid buildings found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
