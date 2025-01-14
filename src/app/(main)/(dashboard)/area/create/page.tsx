"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  CreateAreaMap,
  MapStateProvider,
} from "@/components/dashboard/create-area";

const wards = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
];

const createAreaSchema = z.object({
  code: z.number().int().min(1, "Area code is required"),
  wardNumber: z.number().int().min(1, "Ward number is required"),
  geometry: z.any().optional(),
});

const CreateAreaPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const { data: availableAreaCodes } = api.area.getAvailableAreaCodes.useQuery(
    { wardNumber: selectedWard ?? 0 },
    { enabled: !!selectedWard },
  );
  const createArea = api.area.createArea.useMutation();

  const form = useForm<z.infer<typeof createAreaSchema>>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      code: 0,
      wardNumber: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createAreaSchema>) {
    setIsLoading(true);
    try {
      const dataToSend = {
        ...values,
        code: parseInt(values.code as unknown as string),
      };
      await createArea.mutateAsync(dataToSend);
      toast.success("Area created successfully");
      router.push("/area");
    } catch (error) {
      toast.error("Failed to create area");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ContentLayout title="Create Area">
      <MapStateProvider>
        <Card className="pt-10">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wardNumber">Ward Number</Label>
                    <Controller
                      name="wardNumber"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            const wardNum = parseInt(value);
                            setSelectedWard(wardNum);
                            field.onChange(wardNum);
                            form.setValue("code", 0); // Reset area code when ward changes
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward first" />
                          </SelectTrigger>
                          <SelectContent className="z-[10000]">
                            <SelectGroup>
                              {wards.map((ward) => (
                                <SelectItem key={ward.value} value={ward.value}>
                                  {ward.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <FormField
                    name="code"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <div>
                          <FormLabel>Area Code</FormLabel>
                          <Select
                            disabled={!selectedWard}
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select area code" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] z-[10000]">
                              <SelectGroup>
                                {availableAreaCodes?.map((code) => (
                                  <SelectItem
                                    key={code}
                                    value={code.toString()}
                                  >
                                    {code}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormControl>
                    )}
                  />
                </div>

                <CreateAreaMap
                  id="new-area"
                  onGeometryChange={(geometry) =>
                    form.setValue("geometry", geometry)
                  }
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <LoadingButton /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </MapStateProvider>
    </ContentLayout>
  );
};

export default CreateAreaPage;
