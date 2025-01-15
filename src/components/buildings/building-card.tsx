import { BuildingSchema } from "@/server/db/schema";
import { Building2, MapPin, Users } from "lucide-react";
import Link from "next/link";

export function BuildingCard({ building }: { building: BuildingSchema }) {
  return (
    <Link href={`/buildings/${building.id}`}>
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="rounded-md bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <span
            className={`text-sm ${
              building.mapStatus === "map_passed"
                ? "text-green-600"
                : building.mapStatus === "map_failed"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}
          >
            {building.mapStatus?.replace("_", " ")}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ward {building.wardNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{building.totalFamilies} families</span>
          </div>

          {building.locality && (
            <p className="text-sm text-muted-foreground">{building.locality}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
