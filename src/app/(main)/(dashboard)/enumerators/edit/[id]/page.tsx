import { ContentLayout } from "@/components/admin-panel/content-layout";
import { EditEnumerator } from "@/components/dashboard/edit-enumerator";

export default function EditEnumeratorPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ContentLayout title="Edit Enumerator">
      <EditEnumerator enumeratorId={params.id} />
    </ContentLayout>
  );
}
