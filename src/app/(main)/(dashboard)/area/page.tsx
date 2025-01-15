import { ContentLayout } from "@/components/admin-panel/content-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AreaList } from "@/components/dashboard/area-list";
import { Plus } from "lucide-react";

export default function AreaPage() {
  return (
    <ContentLayout
      title="Areas"
      subtitle="Manage and organize municipality areas"
      actions={
        <Link href="/area/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Area
          </Button>
        </Link>
      }
    >
      <div className="container px-0">
        <AreaList />
      </div>
    </ContentLayout>
  );
}
