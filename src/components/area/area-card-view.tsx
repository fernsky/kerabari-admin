import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ActionHandlerProps } from "./types";

export function AreaCardView({ data, onAction }: ActionHandlerProps) {
  return (
    <div className="grid gap-4">
      {data.map((area) => (
        <Card key={area.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Ward {area.wardNumber}</h3>
                  <p className="text-sm text-muted-foreground">{area.code}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {area.areaStatus?.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Enumerator: </span>
                {area.assignedTo?.name}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(area.id, area.areaStatus!, "approve")}
                  className="flex-1 text-green-600 hover:text-green-700"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(area.id, area.areaStatus!, "reject")}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
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
