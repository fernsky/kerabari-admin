"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil2Icon, TrashIcon } from "@/components/icons";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { LoadingButton } from "@/components/loading-button";

interface Props {
  promises: Promise<any>[];
}

export function ChaptersList({ promises }: Props) {
  const router = useRouter();
  const [chapters] = api.useQueries((t) => [t.chapter.getAll()]);
  const deleteChapter = api.chapter.delete.useMutation();

  if (!chapters.data?.length) {
    return <div className="text-center text-muted-foreground">No chapters found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>English Title</TableHead>
            <TableHead>Nepali Title</TableHead>
            <TableHead>Part</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.data.map((chapter) => (
            <TableRow key={chapter.id}>
              <TableCell>{chapter.title_en}</TableCell>
              <TableCell>{chapter.title_ne}</TableCell>
              <TableCell>{chapter.part_id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/chapters/editor/${chapter.id}`)}
                  >
                    <Pencil2Icon className="h-4 w-4" />
                  </Button>
                  <DeleteChapterDialog chapterId={chapter.id} onSuccess={router.refresh} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DeleteChapterDialog({
  chapterId,
  onSuccess,
}: {
  chapterId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const deleteChapter = api.chapter.delete.useMutation();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteChapter.mutateAsync({ id: chapterId });
      toast.success("Chapter deleted successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to delete chapter");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the chapter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton onClick={handleDelete} variant="destructive" loading={isLoading}>
            Delete
          </LoadingButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
