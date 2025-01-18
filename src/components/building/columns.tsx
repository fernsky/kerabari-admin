import { ColumnDef } from "@tanstack/react-table";
import { BuildingSchema } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export const buildingColumns: ColumnDef<BuildingSchema>[] = [
  {
    accessorKey: "wardNumber",
    header: "Ward",
  },
  {
    accessorKey: "areaCode",
    header: "Area Code",
  },
  {
    accessorKey: "enumeratorName",
    header: "Collected By",
  },
  {
    accessorKey: "base",
    header: "Building Base",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("base") || "—"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/buildings/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
