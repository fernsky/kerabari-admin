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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@monaco-editor/react";

const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ne: z.string().min(1, "Nepali title is required"),
  data_en: z.string().min(1, "English data is required"),
  data_ne: z.string().min(1, "Nepali data is required"),
  displayMode: z.enum(["table", "pie", "bar"]),
});

interface NewTableFormProps {
  sectionId: string;
  onSuccess: () => void;
}

export function NewTableForm({ sectionId, onSuccess }: NewTableFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const table = api.table.create.useMutation();
  const updateSchema = api.section.updateDisplaySchema.useMutation();
  const { data: section } = api.section.get.useQuery({ id: sectionId });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: "",
      title_ne: "",
      data_en: "[]",
      data_ne: "[]",
      displayMode: "table",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Validate JSON data
      const dataEn = JSON.parse(values.data_en);
      const dataNe = JSON.parse(values.data_ne);

      const { id } = await table.mutateAsync({
        title_en: values.title_en,
        title_ne: values.title_ne,
        data_en: dataEn,
        data_ne: dataNe,
        section_id: sectionId,
      });

      // Generate color scheme based on data
      const colorScheme = Object.keys(dataEn[0] || {}).map((key, index) => ({
        key,
        color: getColorForIndex(index),
      }));

      // Update display schema
      const currentSchema = section?.displaySchema ?? { content: [] };
      const updatedSchema = {
        content: [
          ...currentSchema.content,
          {
            id,
            type: "table" as const,
            order: currentSchema.content.length,
            displayMode: values.displayMode,
            colorScheme,
          },
        ],
      };

      await updateSchema.mutateAsync({
        id: sectionId,
        displaySchema: updatedSchema,
      });

      toast.success("Table added successfully");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Invalid JSON data or failed to add table");
    } finally {
      setIsLoading(false);
    }
  }

  // Get a color from a predefined palette
  const getColorForIndex = (index: number) => {
    const colors = [
      "#2563eb",
      "#dc2626",
      "#16a34a",
      "#ca8a04",
      "#9333ea",
      "#0891b2",
      "#be123c",
      "#15803d",
      "#854d0e",
      "#7c3aed",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add Table</h3>
        <p className="text-sm text-muted-foreground">
          Add a new table with data in both English and Nepali.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="title_en"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <FormLabel>Nepali Title</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />
          </div>

          <FormField
            name="displayMode"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <div className="space-y-2">
                  <FormLabel>Display Mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              </FormControl>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="data_en"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <div className="space-y-2">
                    <FormLabel>English Data (JSON)</FormLabel>
                    <div className="h-[300px] rounded-md border">
                      <Editor
                        height="300px"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={field.value}
                        onChange={field.onChange}
                        options={{
                          minimap: { enabled: false },
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                      />
                    </div>
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />
            <FormField
              name="data_ne"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <div className="space-y-2">
                    <FormLabel>Nepali Data (JSON)</FormLabel>
                    <div className="h-[300px] rounded-md border">
                      <Editor
                        height="300px"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={field.value}
                        onChange={field.onChange}
                        options={{
                          minimap: { enabled: false },
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                      />
                    </div>
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingButton /> : "Add Table"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
