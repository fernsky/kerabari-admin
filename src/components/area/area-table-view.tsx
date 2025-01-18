import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ActionHandlerProps } from "./types";
import { MapPin, User, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AreaTableView({ data, onAction }: ActionHandlerProps) {
  return (
    <Card className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Ward</TableHead>
            <TableHead>Area Code</TableHead>
            <TableHead>Enumerator</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((area) => (
            <TableRow key={area.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Ward {area.wardNumber}
                </div>
              </TableCell>
              <TableCell>{area.code}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {area.assignedTo ? area.assignedTo.name : "Unassigned"}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    area.areaStatus?.includes("revision")
                      ? "destructive"
                      : "default"
                  }
                  className="capitalize"
                >
                  {area.areaStatus?.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onAction(
                        area.id,
                        area.areaStatus ?? "unassigned",
                        "approve",
                      )
                    }
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onAction(
                        area.id,
                        area.areaStatus ?? "unassigned",
                        "reject",
                      )
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
