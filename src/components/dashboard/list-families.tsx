"use client";

import { ContentLayout } from "../admin-panel/content-layout";
import { api } from "@/trpc/react";
import { familyColumns } from "@/components/family/columns";
import { FamilyFilters } from "@/components/family/family-filters";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaQuery } from "react-responsive";
import { User } from "lucia";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { Filter, Users2 } from "lucide-react";
import { PaginationControls } from "./invalid-buildings/pagination";

interface ListFamiliesProps {
  user: User;
}

export function ListFamilies({ user }: ListFamiliesProps) {
  const [filters, setFilters] = useState({
    wardNo: undefined as number | undefined,
    locality: undefined as string | undefined,
    headName: undefined as string | undefined,
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
  const [sorting, setSorting] = useState<string>(""); // Add sorting state

  const handleSort = (field: string) => {
    setSorting(field);
  };

  const {
    data,
    isLoading,
    error: familiesError,
  } = api.family.getAll.useQuery({
    limit: 10,
    offset: page * 10,
    filters: debouncedFilters,
  });

  const { data: stats, error: statsError } = api.family.getStats.useQuery();

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

  if (familiesError || statsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          {familiesError?.message || statsError?.message || "An error occurred"}
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
    <ContentLayout title="Families">
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
                    <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Families Management
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  View and manage all family records in the system
                </p>
              </div>
              {/* ... export buttons ... */}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Families"
                value={stats?.totalFamilies || 0}
              />
              <StatCard
                title="Total Members"
                value={stats?.totalMembers || 0}
              />
              <StatCard
                title="Average Members per Family"
                value={Number(stats?.avgMembersPerFamily || 0).toFixed(1)}
              />
            </div>

            {/* Filters Section */}
            <Card className="mt-6">
              <CardHeader className="border-b bg-muted/50 py-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Filter Records</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <FamilyFilters
                  {...filters}
                  onFilterChange={handleFilterChange}
                />
              </CardContent>
            </Card>

            {/* Families Table */}
            <Card className="mt-6">
              <CardHeader className="border-b bg-muted/50 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Families List</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {data?.pagination.total || 0} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <DataTable
                  //@ts-ignore
                  columns={familyColumns(handleSort)}
                  data={data?.data || []}
                  isLoading={isLoading}
                />
                {data?.data && data.data.length > 0 && (
                  <div className="mt-4">
                    <PaginationControls
                      currentPage={page}
                      totalItems={data.pagination.total}
                      pageSize={10}
                      currentDisplayCount={currentDisplayCount}
                      onPageChange={setPage}
                      hasMore={page < totalPages - 1}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}

export default ListFamilies;
