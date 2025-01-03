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
import { ComboboxSearchable } from "@/components/ui/combobox-searchable";

const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ne: z.string().min(1, "Nepali title is required"),
  part_id: z.string().min(1, "Part is required"),
});

export function NewChapterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const chapter = api.chapter.create.useMutation();
  const { data: parts } = api.part.list.useQuery({});

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
      await chapter.mutateAsync(values);
      toast.success("Chapter created successfully");
      router.push("/dashboard/chapters");
    } catch (error) {
      toast.error("Failed to create chapter");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="space-y-2">
        <CardTitle>Create Chapter</CardTitle>
        <CardDescription>Fill the details to create a new chapter</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                name="title_en"
                control={form.control}
                render={({ field }) => (
                  <FormControl>
                    <div>
                      <FormLabel>English Title</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </div>
                  </FormControl>
                )}
              />
              <FormField
                name="title_ne"
                control={form.control}
                render={({ field }) => (
                  <FormControl>
                    <div>
                      <FormLabel>Nepali Title</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </div>
                  </FormControl>
                )}
              />
              <FormField
                name="part_id"
                control={form.control}
                render={({ field }) => (
                  <FormControl>
                    <div>
                      <FormLabel>Part</FormLabel>
                      <ComboboxSearchable
                        className="w-[952px]"
                        options={partOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a part..."
                      />
                      <FormMessage />
                    </div>
                  </FormControl>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingButton /> : "Create Chapter"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
