"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AreaNavigation } from "@/components/area/area-navigation";

const AreaPage = () => {
  return (
    <ContentLayout title="Area Management">
      <div className="container mx-auto space-y-8 px-4 lg:px-8">
        <AreaNavigation />
      </div>
    </ContentLayout>
  );
};

export default AreaPage;
