import { ColumnDef } from "@tanstack/react-table";
import { FamilySchema } from "@/server/db/schema/family/family";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const familyColumns: ColumnDef<FamilySchema>[] = [
  {
    accessorKey: "headName",
    header: "Head Name",
  },
  {
    accessorKey: "wardNo",
    header: "Ward No.",
  },
  {
    accessorKey: "locality",
    header: "Locality",
  },
  {
    accessorKey: "totalMembers",
    header: "Members",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "approved"
              ? "secondary"
              : status === "rejected"
                ? "destructive"
                : "default"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const family = row.original;
      return (
        <Link href={`/families/${family.id}`}>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
