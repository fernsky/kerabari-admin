import { ColumnDef } from "@tanstack/react-table";
import { BuildingSchema } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BusinessSchema } from "@/server/db/schema/business/business";

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

export const businessColumns: ColumnDef<BusinessSchema>[] = [
  {
    accessorKey: "wardId",
    header: "Ward",
  },
  {
    accessorKey: "businessName",
    header: "Business Name",
  },
  {
    accessorKey: "locality",
    header: "Location",
  },
  {
    accessorKey: "businessNature",
    header: "Nature",
  },
  {
    accessorKey: "operatorName",
    header: "Operator",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/businesses/${row.original.id}`}>
        <Button size="sm" variant="ghost">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
