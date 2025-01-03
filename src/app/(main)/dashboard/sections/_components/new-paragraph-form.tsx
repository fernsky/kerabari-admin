"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  content_en: z.string().min(1, "English content is required"),
  content_ne: z.string().min(1, "Nepali content is required"),
});

interface NewParagraphFormProps {
  sectionId: string;
  onSuccess: () => void;
}

export function NewParagraphForm({ sectionId, onSuccess }: NewParagraphFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const paragraph = api.paragraph.create.useMutation();
  const updateSchema = api.section.updateDisplaySchema.useMutation();
  const { data: section } = api.section.get.useQuery({ id: sectionId });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content_en: "",
      content_ne: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { id } = await paragraph.mutateAsync({
        ...values,
        section_id: sectionId,
      });

      // Update display schema
      const currentSchema = section?.displaySchema ?? { content: [] };
      const updatedSchema = {
        content: [
          ...currentSchema.content,
          {
            id,
            type: "paragraph" as const,
            order: currentSchema.content.length,
          },
        ],
      };

      await updateSchema.mutateAsync({
        id: sectionId,
        displaySchema: updatedSchema,
      });

      toast.success("Paragraph added successfully");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to add paragraph");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Add Paragraph</h3>
        <p className="text-sm text-muted-foreground">
          Add a new paragraph in both English and Nepali.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="content_en"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <div className="space-y-2">
                  <FormLabel>English Content</FormLabel>
                  <Textarea rows={4} {...field} />
                  <FormMessage />
                </div>
              </FormControl>
            )}
          />
          <FormField
            name="content_ne"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <div className="space-y-2">
                  <FormLabel>Nepali Content</FormLabel>
                  <Textarea rows={4} {...field} />
                  <FormMessage />
                </div>
              </FormControl>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingButton /> : "Add Paragraph"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
