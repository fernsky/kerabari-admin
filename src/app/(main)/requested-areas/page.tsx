"use client";
import React from "react";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { AreaWithdrawCard } from "@/components/area/area-withdraw-card";

const RequestedAreasPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } =
    api.enumerator.getRequestedAreas.useQuery();

  const withdrawAreaMutation = api.enumerator.withdrawArea.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["enumerator.getRequestedAreas"]);
      toast({
        title: "Success",
        description: "Area withdrawn successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        You do not have any requested area
      </div>
    );
  }

  type RequestedArea = {
    areaId: string;
    code: string;
    areaStatus: string;
    wardNumber: number;
    userid: string;
    geometry: any;
    centroid: any;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {(data as RequestedArea[]).map((area) => (
          <AreaWithdrawCard
            key={area.areaId}
            area={area}
            onWithdraw={async (areaId, userid) => {
              await withdrawAreaMutation.mutateAsync({
                areaId,
                userId: userid,
              });
            }}
            isWithdrawing={withdrawAreaMutation.isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default RequestedAreasPage;
