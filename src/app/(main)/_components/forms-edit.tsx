import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";

const formSchema = z.object({
  id: z.string().min(1, "Form ID is required"),
  name: z.string().min(1, "Form name is required"),
  siteEndpoint: z.string().url().optional(),
  odkFormId: z.string().length(255),
  odkProjectId: z.number().int().nonnegative(),
  userName: z.string().optional(),
  password: z.string().optional(),
  attachmentPaths: z
    .array(
      z.object({
        path: z.string().optional(),
        type: z.enum(["audio_monitoring", "survey_image"]).optional(),
      }),
    )
    .optional(),
});

export const FormsEdit = ({ formId }: { formId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<z.infer<typeof formSchema>>();
  const updateForm = api.superadmin.updateSurveyForm.useMutation();
  const getForm = api.superadmin.getSurveyForms.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachmentPaths",
  });

  useEffect(() => {
    async function fetchData() {
      const formData = await getForm.refetch();
      const formToEdit = formData.data?.find((form) => form.id === formId);
      if (formToEdit) {
        const initialData = {
          ...formToEdit,
          siteEndpoint: formToEdit.siteEndpoint as string | undefined,
          odkFormId: formToEdit.odkFormId ?? "",
          odkProjectId: formToEdit.odkProjectId ?? 0,
          userName: formToEdit.userName as string | undefined,
          password: formToEdit.password as string | undefined,
          attachmentPaths: formToEdit.attachmentPaths as
            | { path?: string; type?: "audio_monitoring" | "survey_image" }[]
            | undefined,
        };
        setInitialData(initialData);
        form.reset(initialData);
      }
    }
    fetchData();
  }, [formId, form, getForm]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateForm.mutateAsync(values);
      toast.success("Form updated successfully");
      router.push("/forms");
    } catch (error) {
      toast.error("Failed to update form");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w[600px] pt-10">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                name="id"
                control={form.control}
                render={({ field }: { field: any }) => (
                  <FormControl>
                    <div>
                      <FormLabel>Form Id</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </div>
                  </FormControl>
                )}
              />
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
                      <Input type="number" {...field} />
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
              <div>
                <FormLabel>Attachment Paths</FormLabel>
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
                          <Input {...field} placeholder="Type" />
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
                <Button
                  type="button"
                  onClick={() => append({ path: "", type: "survey_image" })}
                  variant="secondary"
                >
                  Add Attachment Path
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingButton /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
