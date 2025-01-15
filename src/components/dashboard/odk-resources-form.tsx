"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FetchSubmissions } from "./fetch-submissions";

const formSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  siteEndpoint: z.string().url().optional(),
  odkFormId: z.string().max(255),
  odkProjectId: z.number().int().nonnegative(),
  userName: z.string().optional(),
  password: z.string().optional(),
  updateInterval: z.number().int().positive().default(7200),
  attachmentPaths: z
    .array(
      z.object({
        path: z.string().optional(),
        type: z.enum([
          "audio_monitoring",
          "building_image",
          "building_selfie",
          "family_head_image",
          "family_head_selfie",
          "business_image",
          "business_selfie",
        ]),
      }),
    )
    .optional(),
});

export const ODKResourcesForm = ({ formId }: { formId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<z.infer<typeof formSchema>>();
  const createOrUpdateForm =
    api.superadmin.createOrUpdateResourceForm.useMutation();
  const formData = api.superadmin.getForm.useQuery({ id: formId });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachmentPaths",
  });

  useEffect(() => {
    if (formData.data) {
      const initialData = {
        ...formData.data,
        siteEndpoint: formData.data.siteEndpoint as string | undefined,
        odkFormId: formData.data.odkFormId ?? "",
        odkProjectId: formData.data.odkProjectId ?? 0,
        userName: formData.data.userName as string | undefined,
        password: formData.data.password as string | undefined,
        updateInterval: formData.data.updateInterval ?? 7200,
        attachmentPaths: formData.data.attachmentPaths?.map((ap) => ({
          //@ts-ignore
          path: ap.path,
          //@ts-ignore
          type: ap.type ?? "building_image",
        })),
      };
      setInitialData({ ...initialData });
      form.reset({ ...initialData });
    }
  }, [formData.data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createOrUpdateForm.mutateAsync({ ...values, id: formId });
      toast.success("Form saved successfully");
      router.push("/forms");
    } catch (error) {
      toast.error("Failed to save form");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="max-w[600px] pt-10">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {/* Form Fields */}
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }: { field: any }) => (
                    <FormControl>
                      <div>
                        <FormLabel>Form Name</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <FormField
                  name="siteEndpoint"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>Site Endpoint</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <FormField
                  name="odkFormId"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>ODK Form ID</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <FormField
                  name="odkProjectId"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>ODK Project ID</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <FormField
                  name="userName"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>Username</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>Password</FormLabel>
                        <Input type="password" {...field} />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                {/* Update Interval Field */}
                <FormField
                  name="updateInterval"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <div>
                        <FormLabel>Update Interval (seconds)</FormLabel>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                {/* Attachment Paths Section */}
                <div className="grid gap-2">
                  <Button
                    type="button"
                    onClick={() => append({ path: "", type: "building_image" })}
                    variant="secondary"
                    className="mt-2"
                  >
                    Add Attachment Path
                  </Button>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <FormField
                        name={`attachmentPaths.${index}.path`}
                        control={form.control}
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} placeholder="Path" />
                          </FormControl>
                        )}
                      />
                      <FormField
                        name={`attachmentPaths.${index}.type`}
                        control={form.control}
                        render={({ field }) => (
                          <FormControl>
                            <Select
                              defaultValue={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="audio_monitoring">
                                    Audio Monitoring
                                  </SelectItem>
                                  <SelectItem value="building_image">
                                    Building Image
                                  </SelectItem>
                                  <SelectItem value="building_selfie">
                                    Building Image Selfie
                                  </SelectItem>
                                  <SelectItem value="family_head_image">
                                    Family Head Image
                                  </SelectItem>
                                  <SelectItem value="family_head_selfie">
                                    Family Head Selfie
                                  </SelectItem>
                                  <SelectItem value="business_image">
                                    Business Image
                                  </SelectItem>
                                  <SelectItem value="business_selfie">
                                    Business Image Selfie
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        )}
                      />
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <LoadingButton /> : "Save Form"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FetchSubmissions formId={formId} />
    </div>
  );
};
