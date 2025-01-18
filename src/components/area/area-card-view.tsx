import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ActionHandlerProps } from "./types";
import { MapPin, User, CheckCircle, XCircle, Hash } from "lucide-react";

export function AreaCardView({ data, onAction }: ActionHandlerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((area) => (
        <Card key={area.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Ward {area.wardNumber}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>{area.code}</span>
                  </div>
                </div>
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
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Enumerator: </span>
                <span className="font-medium">
                  {area.assignedTo ? area.assignedTo.name : "Unassigned"}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(area.id, area.areaStatus, "approve")}
                  className="flex-1 text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(area.id, area.areaStatus!, "reject")}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
