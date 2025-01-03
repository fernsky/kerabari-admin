"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { type Section } from "@/server/db/schema";

export function SectionList() {
  const router = useRouter();
  const { data: sections, refetch } = api.section.list.useQuery();
  const deleteSection = api.section.delete.useMutation({
    onSuccess: () => {
      toast.success("Section deleted");
      refetch();
    },
    onError: () => toast.error("Failed to delete section"),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteSection.mutateAsync({ id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/sections/editor/${id}`);
  };

  const columns: ColumnDef<Section>[] = [
    {
      accessorKey: "title_en",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          English Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "title_ne",
      header: "Nepali Title",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const section = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(section.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/sections/create")}>Create Section</Button>
      </div>
      <DataTable columns={columns} data={sections ?? []} />
    </div>
  );
}
