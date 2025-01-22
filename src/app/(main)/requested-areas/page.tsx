"use client";
import React from "react";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { AreaWithdrawCard } from "@/components/area/area-withdraw-card";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const RequestedAreasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [withdrawingAreaId, setWithdrawingAreaId] = React.useState<
    string | null
  >(null);

  const {
    data,
    isLoading,
    error,
    refetch: refetchAreas,
  } = api.enumerator.getRequestedAreas.useQuery();

  const withdrawAreaMutation = api.enumerator.withdrawArea.useMutation({
    onSuccess: () => {
      setWithdrawingAreaId(null);
      queryClient.invalidateQueries(["enumerator.getRequestedAreas"]);
      refetchAreas();
      toast({
        title: "Success",
        description: "Area withdrawn successfully",
      });
    },
    onError: (error) => {
      setWithdrawingAreaId(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-16">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Error Loading Areas
              </h2>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
            <Button onClick={() => refetchAreas()} variant="outline" size="lg">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-16">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
            <div className="rounded-full bg-primary/10 p-4">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                No Requested Areas
              </h2>
              <p className="max-w-md text-muted-foreground">
                You haven't requested any areas yet. Request an area to begin
                your survey work.
              </p>
            </div>
            <Link href="/area/request">
              <Button size="lg" className="gap-2">
                <MapPin className="h-5 w-5" />
                Request New Area
              </Button>
            </Link>
          </div>
        </Card>
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
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Requested Areas</h1>
          <p className="text-lg text-muted-foreground">
            Manage and track your area requests for survey assignments
          </p>
        </div>
        <Link href="/area/request">
          <Button size="lg" className="w-full gap-2 sm:w-auto">
            <MapPin className="h-5 w-5" />
            Request New Area
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(data as RequestedArea[]).map((area) => (
          <AreaWithdrawCard
            key={area.areaId}
            area={area}
            onWithdraw={async (areaId, userid) => {
              setWithdrawingAreaId(areaId);
              await withdrawAreaMutation.mutateAsync({
                areaId,
                userId: userid,
              });
            }}
            isWithdrawing={
              withdrawAreaMutation.isLoading &&
              withdrawingAreaId === area.areaId
            }
          />
        ))}
      </div>
    </div>
  );
};

export default RequestedAreasPage;
