"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { type RouterOutputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { Pencil2Icon } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  part: RouterOutputs["part"]["get"];
}

export const PartEditor = ({ part }: Props) => {
  if (!part) return null;
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const updatePart = api.part.update.useMutation();

  const checkDirty = () => {
    const form = document.getElementById("part-form") as HTMLFormElement;
    const titleEn = (form.elements.namedItem("title_en") as HTMLInputElement).value;
    const titleNe = (form.elements.namedItem("title_ne") as HTMLInputElement).value;
    setIsDirty(titleEn !== part.title_en || titleNe !== part.title_ne);
  };

  const handleRestore = () => {
    setError(undefined);
    const form = document.getElementById("part-form") as HTMLFormElement;
    const titleEn = form.elements.namedItem("title_en") as HTMLInputElement;
    const titleNe = form.elements.namedItem("title_ne") as HTMLInputElement;
    titleEn.value = part.title_en;
    titleNe.value = part.title_ne;
    setIsDirty(false);
  };

  async function handleSubmit(formData: FormData) {
    try {
      if (!part) return;
      await updatePart.mutateAsync({
        id: part.id,
        title_en: formData.get("title_en") as string,
        title_ne: formData.get("title_ne") as string,
      });
      toast.success("Part updated successfully");
      router.refresh();
    } catch (error) {
      const message = "Failed to update part";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Pencil2Icon className="h-5 w-5" />
          <CardTitle className="text-gray-800">Edit Part</CardTitle>
        </div>
        <CardDescription>Edit part titles in English and Nepali.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="part-form" action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title_en">English Title</Label>
            <Input
              id="title_en"
              name="title_en"
              defaultValue={part.title_en}
              placeholder="Enter title in English"
              required
              onChange={checkDirty}
              onBlur={checkDirty}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title_ne">Nepali Title</Label>
            <Input
              id="title_ne"
              name="title_ne"
              defaultValue={part.title_ne}
              placeholder="नेपाली शीर्षक लेख्नुहोस्"
              required
              onChange={checkDirty}
              onBlur={checkDirty}
            />
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleRestore} disabled={!isDirty}>
              Restore
            </Button>
            <SubmitButton disabled={!isDirty} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    <Button type="submit" className="w-[160px]" disabled={disabled || pending}>
      {pending ? "Updating..." : "Update Part"}
    </Button>
  );
}
