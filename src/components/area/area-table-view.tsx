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

export function AreaTableView({ data, onAction }: ActionHandlerProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ward</TableHead>
            <TableHead>Area Code</TableHead>
            <TableHead>Enumerator</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((area) => (
            <TableRow key={area.id}>
              <TableCell>Ward {area.wardNumber}</TableCell>
              <TableCell>{area.code}</TableCell>
              <TableCell>{area.assignedTo?.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {area.areaStatus?.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onAction(area.id, area.areaStatus!, "approve")
                    }
                    className="text-green-600 hover:text-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onAction(area.id, area.areaStatus!, "reject")
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
