"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import Link from "next/link";
import { buildingColumns } from "@/components/buildings/columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { BuildingFilters } from "@/components/buildings/building-filters";
import { FilterDrawer } from "@/components/shared/filters/filter-drawer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Buildings() {
  const [filters, setFilters] = useState({
    wardNumber: undefined as number | undefined,
    locality: undefined as string | undefined,
    mapStatus: undefined as string | undefined,
  });
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 500);

  const {
    data,
    isLoading,
    error: buildingsError,
  } = api.building.getAll.useQuery({
    limit: 10,
    offset: page * 10,
    filters: debouncedFilters,
  });

  const { data: stats, error: statsError } = api.building.getStats.useQuery();

  const totalPages = Math.ceil((data?.pagination.total || 0) / 10);
  const currentDisplayCount = Math.min(
    (page + 1) * 10,
    data?.pagination.total || 0,
  );

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(0);
  };

  const handleNextPage = () => page < totalPages - 1 && setPage(page + 1);
  const handlePrevPage = () => page > 0 && setPage(page - 1);

  if (buildingsError || statsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          {buildingsError?.message ||
            statsError?.message ||
            "An error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  const StatCard = ({
    title,
    value,
  }: {
    title: string;
    value: string | number;
  }) => (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );

  return (
    <ContentLayout title="Buildings">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Buildings"
            value={stats?.totalBuildings || 0}
          />
          <StatCard title="Total Families" value={stats?.totalFamilies || 0} />
          {/* <StatCard
            title="Avg. Businesses"
            value={stats?.avgBusinesses?.toFixed(1) || 0}
          /> */}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <FilterDrawer title="Filters">
              <BuildingFilters
                {...filters}
                onFilterChange={handleFilterChange}
              />
            </FilterDrawer>
            <Input
              placeholder="Search locality..."
              className="w-[200px]"
              value={filters.locality || ""}
              onChange={(e) => handleFilterChange("locality", e.target.value)}
            />
          </div>
          <Link href="/resources/buildings/create">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Building
            </Button>
          </Link>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block"></div>
        <BuildingFilters {...filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={buildingColumns}
          //@ts-ignore
          data={data?.data || []}
          isLoading={isLoading}
        />
      )}

      {/* Pagination */}
      {data?.data.length ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            Showing {currentDisplayCount} of {data.pagination.total} buildings
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[100px] text-center">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8">
          No buildings found
        </div>
      )}
    </ContentLayout>
  );
}
