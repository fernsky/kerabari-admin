import { ColumnDef } from "@tanstack/react-table";
import { FamilySchema } from "@/server/db/schema/family/family";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MapPin,
  Binary,
  Users,
  Phone,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Clock,
  User,
} from "lucide-react";

export const familyColumns = (
  onSort: (field: string) => void,
): ColumnDef<FamilySchema>[] => [
  {
    accessorKey: "wardNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 text-left font-medium"
        onClick={() => {
          onSort("wardNo");
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
        Ward
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium">
        Ward {row.getValue("wardNo")}
      </Badge>
    ),
  },
  {
    accessorKey: "areaCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 text-left font-medium"
        onClick={() => {
          onSort("areaCode");
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        <Binary className="mr-2 h-4 w-4 text-muted-foreground" />
        Area Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {row.getValue("areaCode") || "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "headName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 text-left font-medium"
        onClick={() => {
          onSort("headName");
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        <User className="mr-2 h-4 w-4 text-muted-foreground" />
        Head Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("headName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "headPhone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("headPhone")}</span>
      </div>
    ),
  },
  {
    accessorKey: "enumeratorName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 text-left font-medium"
        onClick={() => {
          onSort("enumeratorName");
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
        Collected By
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("enumeratorName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap = {
        pending: {
          label: "Pending",
          icon: Clock,
          class: "bg-yellow-100 text-yellow-800",
        },
        approved: {
          label: "Approved",
          icon: CheckCircle2,
          class: "bg-green-100 text-green-800",
        },
        rejected: {
          label: "Rejected",
          icon: AlertCircle,
          class: "bg-red-100 text-red-800",
        },
        requested_for_edit: {
          label: "Edit Requested",
          icon: Edit2,
          class: "bg-blue-100 text-blue-800",
        },
      };

      const statusInfo =
        statusMap[status as keyof typeof statusMap] || statusMap.pending;
      const StatusIcon = statusInfo.icon;

      return (
        <Badge className={`${statusInfo.class} gap-1`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
      );
    },
  },
];
