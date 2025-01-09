import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ShowForm } from "@/app/(main)/_components/show-form";

const ShowFormPage = ({ params }: { params: { id: string } }) => {
  return (
    <ContentLayout title="Show Form">
      <ShowForm formId={params.id} />
    </ContentLayout>
  );
};

export default ShowFormPage;
