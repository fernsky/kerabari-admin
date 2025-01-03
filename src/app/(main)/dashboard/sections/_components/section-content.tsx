"use client";

import { api } from "@/trpc/react";
import { type Paragraph, type Table } from "@/server/db/schema";
import { NewParagraphForm } from "./new-paragraph-form";
import { NewTableForm } from "./new-table-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface SectionContentProps {
  sectionId: string;
}

type ContentItem = (Paragraph | Table) & {
  type: "paragraph" | "table";
  order: number;
  displayMode?: string;
  colorScheme?: Array<{ key: string; color: string }>;
};

export function SectionContent({ sectionId }: SectionContentProps) {
  const [addingContent, setAddingContent] = useState<"paragraph" | "table" | null>(null);
  const { data: sectionWithContent } = api.section.getWithContent.useQuery({ id: sectionId });

  const content = sectionWithContent?.content ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => setAddingContent("paragraph")}>Add Paragraph</Button>
          </SheetTrigger>
          <SheetContent>
            <NewParagraphForm sectionId={sectionId} onSuccess={() => setAddingContent(null)} />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => setAddingContent("table")}>Add Table</Button>
          </SheetTrigger>
          <SheetContent>
            <NewTableForm sectionId={sectionId} onSuccess={() => setAddingContent(null)} />
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="space-y-8">
          {content.map((item: ContentItem, index) => (
            <div key={item.id}>
              {index > 0 && <Separator className="my-4" />}
              {item.type === "paragraph" && (
                <div className="space-y-2">
                  <div className="font-medium">Paragraph {index + 1}</div>
                  <div>{item.content_en}</div>
                  <div>{item.content_ne}</div>
                </div>
              )}
              {item.type === "table" && (
                <div className="space-y-2">
                  <div className="font-medium">Table {index + 1}</div>
                  <div>{item.title_en}</div>
                  <div>{item.title_ne}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
