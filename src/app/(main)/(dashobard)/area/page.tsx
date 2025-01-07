import React from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AreaList from "../../_components/area-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AreaPage: React.FC = () => {
  return (
    <ContentLayout title="Areas">
      <div className="flex justify-end mb-4">
        <Link href="/area/create">
          <Button type="button">Create Area</Button>
        </Link>
      </div>
      <AreaList />
    </ContentLayout>
  );
};

export default AreaPage;
