"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ComboboxSearchable } from "@/components/ui/combobox-searchable";

const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ne: z.string().min(1, "Nepali title is required"),
  part_id: z.string().min(1, "Part selection is required"),
});

export function NewChapterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: parts } = api.part.list.useQuery({});
  const createChapter = api.chapter.create.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: "",
      title_ne: "",
      part_id: "",
    },
  });

  const partOptions =
    parts?.map((part) => ({
      label: `${part.title_en} / ${part.title_ne}`,
      value: part.id,
      searchTerms: [part.title_en.toLowerCase(), part.title_ne.toLowerCase()],
    })) ?? [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createChapter.mutateAsync(values);
      toast.success("Chapter created successfully");
      router.push(`/dashboard/chapters/editor/${result.id}`);
    } catch (error) {
      toast.error("Failed to create chapter");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader>
        <CardTitle>Create Chapter</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="part_id"
              render={({ field }) => (
                <div>
                  <FormLabel>Select Part</FormLabel>
                  <ComboboxSearchable
                    className="w-[920px]"
                    options={partOptions}
                    {...field}
                    placeholder="Search for a part..."
                  />
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="title_en"
              render={({ field }) => (
                <div>
                  <FormLabel>English Title</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="title_ne"
              render={({ field }) => (
                <div>
                  <FormLabel>Nepali Title</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </div>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Chapter"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
