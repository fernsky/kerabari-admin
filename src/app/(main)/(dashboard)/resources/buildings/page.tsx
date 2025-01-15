import React from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Buildings: React.FC = () => {
  return (
    <ContentLayout title="Buildings">
      <div className="flex justify-end mb-4">
        <Link href="/resources/buildings/create">
          <Button type="button">Create Building</Button>
        </Link>
      </div>
    </ContentLayout>
  );
};

export default Buildings;
