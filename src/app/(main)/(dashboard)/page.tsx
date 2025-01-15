import { ContentLayout } from "@/components/admin-panel/content-layout";
import { EnumeratorArea } from "@/components/dashboard/enumerator-area";

const DashboardPage = () => {
  return (
    <ContentLayout title="Dashboard">
      <EnumeratorArea />
    </ContentLayout>
  );
};

export default DashboardPage;
