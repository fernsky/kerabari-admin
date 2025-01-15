import React from "react";
import { EnumeratorsList } from "@/components/dashboard/enumerators-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const EnumeratorsPage: React.FC = () => {
  return (
    <ContentLayout
      title="Enumerators"
      actions={
        <Link href="/enumerators/create">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Enumerator
          </Button>
        </Link>
      }
    >
      <div className="container px-0">
        <EnumeratorsList />
      </div>
    </ContentLayout>
  );
};

export default EnumeratorsPage;
