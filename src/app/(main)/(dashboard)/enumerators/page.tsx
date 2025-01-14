import React from "react";
import { EnumeratorsList } from "@/components/dashboard/enumerators-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EnumeratorsPage: React.FC = () => {
  return (
    <ContentLayout title="Enumerators">
      <div className="flex w-full justify-end mb-4">
        <Link href="/enumerators/create">
          <Button>Add Enumerator</Button>
        </Link>
      </div>
      <div className="container">
        <EnumeratorsList />
      </div>
    </ContentLayout>
  );
};

export default EnumeratorsPage;
