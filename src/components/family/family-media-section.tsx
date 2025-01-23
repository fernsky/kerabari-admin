import Image from "next/image";

interface FamilyMediaSectionProps {
  // Note: Add more media props here as they become available in the family schema
  documents?: string[];
}

export function FamilyMediaSection({ documents }: FamilyMediaSectionProps) {
  if (!documents?.length) return null;

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          <h3 className="font-semibold">Family Documents</h3>
          <p className="text-xs text-muted-foreground">
            Supporting documents for family verification
          </p>
        </div>
        <div className="grid gap-4 p-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border"
            >
              <Image
                src={doc}
                alt={`Family Document ${index + 1}`}
                fill
                className="object-cover transition-all hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
