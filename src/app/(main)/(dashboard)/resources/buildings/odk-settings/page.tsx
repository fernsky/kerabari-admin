import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ODKResourcesForm } from "@/components/dashboard/odk-resources-form";

const EditFormPage = ({ params }: { params: { id: string } }) => {
  return (
    <ContentLayout title="Edit Form">
      <ODKResourcesForm formId={"buddhashanti_building_survey"} />
    </ContentLayout>
  );
};

export default EditFormPage;
