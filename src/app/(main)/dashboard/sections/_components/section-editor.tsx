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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionContent } from "./section-content";

const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ne: z.string().min(1, "Nepali title is required"),
});

interface SectionEditorProps {
  sectionId: string;
}

export function SectionEditor({ sectionId }: SectionEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: section } = api.section.get.useQuery({ id: sectionId });
  const updateSection = api.section.update.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: section?.title_en ?? "",
      title_ne: section?.title_ne ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateSection.mutateAsync({ id: sectionId, ...values });
      toast.success("Section updated successfully");
      router.push("/dashboard/sections");
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-[1000px]">
        <CardHeader className="space-y-2">
          <CardTitle>Edit Section</CardTitle>
          <CardDescription>Update the section details</CardDescription>
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
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <LoadingButton /> : "Update Section"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-[1000px]">
        <CardHeader className="space-y-2">
          <CardTitle>Section Content</CardTitle>
          <CardDescription>Manage paragraphs and tables in this section</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4">
              <SectionContent sectionId={sectionId} />
            </TabsContent>
            <TabsContent value="layout" className="space-y-4">
              {/* Add SectionLayout component here */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
