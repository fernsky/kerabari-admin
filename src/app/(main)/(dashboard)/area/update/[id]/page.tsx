import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AreaEdit } from "@/components/dashboard/area-edit";
import { AreaWrapper } from "@/components/dashboard/area-wrapper";

export default function UpdateAreaPage({ params }: { params: { id: string } }) {
  return (
    <ContentLayout title="Update Area">
      <AreaWrapper>
        <AreaEdit id={params.id} />
      </AreaWrapper>
    </ContentLayout>
  );
}
