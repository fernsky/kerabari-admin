import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ODKResourcesForm } from "@/components/dashboard/odk-resources-form";
import Link from "next/link";

const EditFormPage = ({ params }: { params: { id: string } }) => {
  return (
    <ContentLayout
      title="Edit Form"
      actions={
        <div className="flex gap-2">
          <Link href={"/businesses"}>Back to List</Link>
        </div>
      }
    >
      <ODKResourcesForm formId={"buddhashanti_business_survey"} />
    </ContentLayout>
  );
};

export default EditFormPage;
