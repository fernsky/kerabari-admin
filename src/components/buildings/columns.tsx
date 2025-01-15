import { Building } from "@/server/api/routers/building/building.schema";
import { createColumns } from "../shared/data-table/columns";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";

export const buildingColumns = createColumns<Building>([
  {
    header: "Ward",
    accessorKey: "wardNumber",
    sortable: true,
  },
  {
    header: "Locality",
    accessorKey: "locality",
    sortable: true,
  },
  {
    header: "Status",
    accessorKey: "mapStatus",
    cell: ({ row }) => <Badge>{row.original.mapStatus}</Badge>,
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Link href={`/resources/buildings/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </div>
    ),
  },
]);
