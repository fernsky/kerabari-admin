"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { buildingColumns as originalBuildingColumns } from "@/components/building/columns";
import { BuildingFilters } from "@/components/building/building-filters";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaQuery } from "react-responsive";
import { User } from "lucia";
import { InvalidBuildingsList } from "./invalid-buildings-list";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildingsHeader } from "./buildings/buildings-header";
import { BuildingsActions } from "./buildings/buildings-actions";
import { BuildingsTable } from "./buildings/buildings-table";
import { PaginationControls } from "./invalid-buildings/pagination";
import Link from "next/link";
import { TabHeader } from "./buildings/tab-header";
import { motion, AnimatePresence } from "framer-motion";

export default function ListBuildings({ user }: { user: User }) {
  const [filters, setFilters] = useState({
    wardNumber: undefined as number | undefined,
    locality: undefined as string | undefined,
    mapStatus: undefined as string | undefined,
  });
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 500);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [activeTab, setActiveTab] = useState("all");

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

  const buildingColumns = [
    ...originalBuildingColumns,
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Link href={`/buildings/${row.original.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

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

  return (
    <ContentLayout title="Buildings">
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Buildings Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all building records in the system
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TabHeader
              active={activeTab}
              stats={{
                totalBuildings: stats?.totalBuildings || 0,
                //@ts-ignore
                invalidBuildings: stats?.invalidBuildings || 0,
              }}
              onChange={setActiveTab}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className="min-h-[400px]"
              >
                {activeTab === "all" ? (
                  <div className="p-6">
                    <div className="rounded-lg border bg-card shadow-sm">
                      <BuildingsHeader
                        stats={stats || { totalBuildings: 0, totalFamilies: 0 }}
                      />
                      <div className="p-6 space-y-6">
                        <BuildingsActions
                          isDesktop={isDesktop}
                          filters={filters}
                          onFilterChange={handleFilterChange}
                        />
                        {isDesktop && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border bg-muted/50 p-4"
                          >
                            <BuildingFilters
                              {...filters}
                              onFilterChange={handleFilterChange}
                            />
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <BuildingsTable
                            isLoading={isLoading}
                            isDesktop={isDesktop}
                            data={data?.data || []}
                            columns={buildingColumns}
                          />
                        </motion.div>
                        {data?.data && data.data.length > 0 && (
                          <PaginationControls
                            currentPage={page}
                            totalItems={data.pagination.total}
                            pageSize={10}
                            currentDisplayCount={currentDisplayCount}
                            onPageChange={setPage}
                            hasMore={page < totalPages - 1}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <InvalidBuildingsList />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
