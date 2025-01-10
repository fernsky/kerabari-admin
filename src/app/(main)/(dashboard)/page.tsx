import React from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  return (
    <ContentLayout title="Account">
      <div className="flex">
        <div className="flex justify-end w-full">
          <Link href="/area/request">
            <Button>Request an Area</Button>
          </Link>
        </div>
      </div>
    </ContentLayout>
  );
};
export default DashboardPage;
