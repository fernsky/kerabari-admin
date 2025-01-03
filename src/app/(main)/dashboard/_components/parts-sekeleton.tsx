import { PartCardSkeleton } from "./part-card-skeleton";

export function PartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <PartCardSkeleton key={i} />
      ))}
    </div>
  );
}
