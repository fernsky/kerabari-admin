"use client";

import { useState, useEffect } from "react";
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

interface ChapterEditorProps {
  chapterId: string;
}

export function ChapterEditor({ chapterId }: ChapterEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: chapter, isLoading: isChapterLoading } = api.chapter.get.useQuery({
    id: chapterId,
  });
  const { data: parts } = api.part.list.useQuery({});
  const updateChapter = api.chapter.update.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: "",
      title_ne: "",
      part_id: "",
    },
  });

  useEffect(() => {
    if (chapter) {
      form.reset({
        title_en: chapter.title_en,
        title_ne: chapter.title_ne,
        part_id: chapter.part_id,
      });
    }
  }, [chapter, form]);

  const partOptions =
    parts?.map((part) => ({
      label: `${part.title_en} / ${part.title_ne}`,
      value: part.id,
      searchTerms: [part.title_en.toLowerCase(), part.title_ne.toLowerCase()],
    })) ?? [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateChapter.mutateAsync({ id: chapterId, ...values });
      toast.success("Chapter updated successfully");
      router.push("/dashboard/chapters");
    } catch (error) {
      toast.error("Failed to update chapter");
    } finally {
      setIsLoading(false);
    }
  }

  if (isChapterLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="space-y-2">
        <CardTitle>Edit Chapter</CardTitle>
        <CardDescription>Update the details of the chapter</CardDescription>
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
                {isLoading ? <LoadingButton /> : "Update Chapter"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
