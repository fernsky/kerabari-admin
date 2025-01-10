"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { updateAreaSchema } from "@/server/api/routers/areas/area.schema";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { CreateAreaMap } from "./create-area";
import { useMapContext } from "@/lib/map-state";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AreaEdit = ({ areaCode }: { areaCode: number }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { geometry, setGeometry } = useMapContext();

  const updateArea = api.area.updateArea.useMutation();
  const { data: areaData, isLoading: isLoadingArea } =
    api.area.getAreaByCode.useQuery({
      code: areaCode,
    });

  const form = useForm<z.infer<typeof updateAreaSchema>>({
    resolver: zodResolver(updateAreaSchema),
  });

  const wards = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
  ];
  const [wardNumber, setWardNumber] = useState<number | null>(null);

  useEffect(() => {
    if (areaData) {
      form.reset({
        code: areaData.code,
        wardNumber: areaData.wardNumber,
        geometry: areaData.geometry,
      });
      setWardNumber(areaData.wardNumber);
      setGeometry(
        // @ts-ignore
        JSON.parse(areaData.geometry as string),
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
      toast.success("Area updated successfully");
      router.push("/area");
    } catch (error) {
      toast.error("Failed to update area");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingArea) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Area {areaCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Area Code</FormLabel>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />
            <FormField
              name="wardNumber"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Ward Number</FormLabel>
                    <Select
                      value={wardNumber?.toString()}
                      defaultValue={field.value?.toString()}
                      onValueChange={(value) => {
                        if (value) {
                          setWardNumber(parseInt(value));
                          field.onChange(parseInt(value));
                        }
                      }}
                      required
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Select your ward" />
                      </SelectTrigger>
                      <SelectContent className="z-[1000]">
                        <SelectGroup>
                          {wards.map((ward) => {
                            return (
                              <SelectItem key={ward.value} value={ward.value}>
                                {ward.label}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />
            <div>
              <FormLabel>Area Geometry</FormLabel>
              <CreateAreaMap onGeometryChange={handleGeometryChange} />
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
                {isLoading ? <LoadingButton /> : "Update Area"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
