"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ne: z.string().min(1, "Nepali title is required"),
});

export function NewPartForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const part = api.part.create.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: "",
      title_ne: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await part.mutateAsync(values);
      toast.success("Part created successfully");
      router.push(`/dashboard/parts/editor/${result.id}`);
    } catch (error) {
      toast.error("Failed to create part");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-gray-800">Create</CardTitle>
        <CardDescription>Create a new part with English and Nepali titles.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title_en"
              render={({ field }) => (
                <div className="grid gap-2">
                  <FormLabel>English Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="title_ne"
              render={({ field }) => (
                <div className="grid gap-2">
                  <FormLabel>Nepali Title</FormLabel>
                  <FormControl>
                    <Input placeholder="नेपाली शीर्षक लेख्नुहोस्" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            />

            <div className="mt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" className="w-[160px]" loading={isLoading}>
                Create Part
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
