import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WardsList } from "@/components/dashboard/wards-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WardPage() {
  return (
    <ContentLayout title="Wards">
      <div className="flex justify-end mb-4">
        <Link href="/ward/create">
          <Button type="button">Create Ward</Button>
        </Link>
      </div>
      <WardsList />
    </ContentLayout>
  );
}
