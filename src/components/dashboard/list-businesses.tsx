"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import Link from "next/link";
import { businessColumns } from "@/components/business/columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { BusinessFilters } from "@/components/business/business-filters";
import { FilterDrawer } from "@/components/shared/filters/filter-drawer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaQuery } from "react-responsive";
import { BusinessCard } from "@/components/business/business-card";
import { User } from "lucia";

interface ListBusinessesProps {
  user: User;
}

export function ListBusinesses({ user }: ListBusinessesProps) {
  const [filters, setFilters] = useState({
    wardNo: undefined as number | undefined,
    businessNature: undefined as string | undefined,
    status: undefined as
      | "pending"
      | "approved"
      | "rejected"
      | "requested_for_edit"
      | undefined,
  });
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 500);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const {
    data,
    isLoading,
    error: businessesError,
  } = api.business.getAll.useQuery({
    limit: 10,
    offset: page * 10,
    filters: debouncedFilters,
  });

  const { data: stats, error: statsError } = api.business.getStats.useQuery();

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

  if (businessesError || statsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          {businessesError?.message ||
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
    <div className="rounded-lg border bg-card/50 p-4 shadow-sm transition-colors hover:bg-card">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );

  return (
    <ContentLayout title="Businesses">
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Businesses Overview</h2>
            <Link href="/businesses/odk-settings">
              <Button size="sm" className="w-full sm:w-auto">
                <Settings className="mr-1 h-4 w-4" /> Go To ODK Settings
              </Button>
            </Link>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Businesses"
                value={stats?.totalBusinesses || 0}
              />
              <StatCard
                title="Total Employees"
                value={stats?.totalEmployees || 0}
              />
              <StatCard
                title="Average Investment"
                value={`Rs. ${((stats?.avgInvestmentAmount || 0) / 1000).toFixed(1)}K`}
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {!isDesktop && (
                  <div className="flex items-center gap-2">
                    <FilterDrawer title="Filters">
                      <BusinessFilters
                        wardNumber={filters.wardNo}
                        {...filters}
                        onFilterChange={handleFilterChange}
                      />
                    </FilterDrawer>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ward no."
                        type="number"
                        className="w-full sm:w-[100px] h-9"
                        value={filters.wardNo || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "wardNo",
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              <Input
                placeholder="Search Business Nature..."
                className="w-full sm:w-[400px] h-9"
                value={filters.businessNature || ""}
                onChange={(e) => handleFilterChange("locality", e.target.value)}
              />
              <Link href="/businesses/create">
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-1 h-4 w-4" /> Add Business
                </Button>
              </Link>
            </div>

            {/* Desktop Filters */}
            {isDesktop && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <BusinessFilters
                  wardNumber={undefined}
                  {...filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            {/* Data Table or Cards */}
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : isDesktop ? (
              <div className="rounded-lg border">
                <DataTable
                  columns={businessColumns}
                  //@ts-ignore
                  data={data?.data || []}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data?.data.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data?.data.length ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground text-center">
                  Showing {currentDisplayCount} of {data.pagination.total}{" "}
                  businesses
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[100px] text-center font-medium">
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
                No businesses found
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}

export default ListBusinesses;
