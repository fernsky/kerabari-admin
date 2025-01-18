"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AreaSidebar } from "@/components/area/area-sidebar";

const AreaPage = () => {
  return (
    <ContentLayout title="Area Management">
      <div className="container mx-auto space-y-8 px-4 lg:px-8">
        <AreaSidebar />
      </div>
    </ContentLayout>
  );
};

export default AreaPage;
