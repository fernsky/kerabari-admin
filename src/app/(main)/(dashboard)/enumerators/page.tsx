import React from "react";
import { EnumeratorsList } from "@/components/dashboard/enumerators-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";

const EnumeratorsPage: React.FC = () => {
  return (
    <ContentLayout title="Enumerators">
      <div className="container">
        <EnumeratorsList />
      </div>
    </ContentLayout>
  );
};

export default EnumeratorsPage;
