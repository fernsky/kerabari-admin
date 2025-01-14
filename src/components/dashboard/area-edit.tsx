"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { updateAreaSchema } from "@/server/api/routers/areas/area.schema";
import type { z } from "zod";
import { Form, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { CreateAreaMap } from "./create-area";
import { useMapContext } from "@/lib/map-state";

export const AreaEdit = ({ id }: { id: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { geometry, setGeometry } = useMapContext();

  const updateArea = api.area.updateArea.useMutation();
  const { data: areaData, isLoading: isLoadingArea } =
    api.area.getAreaById.useQuery({
      id,
    });

  const form = useForm<z.infer<typeof updateAreaSchema>>({
    resolver: zodResolver(updateAreaSchema),
  });

  useEffect(() => {
    if (areaData) {
      form.reset({
        id: areaData.id,
        code: areaData.code,
        wardNumber: areaData.wardNumber,
        geometry: areaData.geometry,
      });
      setGeometry(
        // @ts-ignore
        areaData.geometry as string,
      );
    }
  }, [areaData, form]);

  const handleGeometryChange = (newGeometry: any) => {
    console.log(newGeometry, typeof newGeometry);
    setGeometry(newGeometry);
  };

  async function onSubmit(values: z.infer<typeof updateAreaSchema>) {
    setIsLoading(true);
    try {
      await updateArea.mutateAsync({
        ...values,
        geometry: geometry,
      });
      toast.success("Area geometry updated successfully");
      router.push("/area");
    } catch (error) {
      toast.error("Failed to update area geometry");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingArea) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-muted/40 pb-4">
        <CardTitle className="text-2xl font-semibold text-primary">
          Edit Geometry
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6 p-4 mb-6 bg-muted/20 rounded-lg border">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Ward Number
            </h3>
            <p className="text-2xl font-bold text-primary">
              {areaData?.wardNumber}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Area Code
            </h3>
            <p className="text-2xl font-bold text-primary">{areaData?.code}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel>Area Geometry</FormLabel>
              <CreateAreaMap
                id={areaData?.id!}
                onGeometryChange={handleGeometryChange}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingButton /> : "Update Geometry"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
