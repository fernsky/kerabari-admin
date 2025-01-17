"use server";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AreaActionHandler } from "@/components/area/area-action-handler";

const DashboardPage = async () => {
  return (
    <ContentLayout title="Area Actions">
      <AreaActionHandler />
    </ContentLayout>
  );
};

export default DashboardPage;
