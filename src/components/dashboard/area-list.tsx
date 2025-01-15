"use client";

import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { areaColumns } from "./area-columns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AreaList() {
  const { data: areas, isLoading } = api.area.getAreas.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <DataTable columns={areaColumns} data={areas ?? []} />
    </Card>
  );
}
