"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function EnumeratorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: enumerator, isLoading } = api.enumerator.getById.useQuery(
    params.id,
  );

  if (isLoading) {
    return (
      <ContentLayout title="Enumerator Details">
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      </ContentLayout>
    );
  }

  if (!enumerator) {
    return <div>Enumerator not found</div>;
  }

  return (
    <ContentLayout
      title="Enumerator Details"
      subtitle={`ID: ${params.id}`}
      actions={
        <Button onClick={() => router.push(`/enumerators/${params.id}/edit`)}>
          Edit Enumerator
        </Button>
      }
    >
      <div className="space-y-6 px-2 lg:px-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-gray-500">Name</div>
              <div className="mt-1">{enumerator.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                Phone Number
              </div>
              <div className="mt-1">{enumerator.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Email</div>
              <div className="mt-1">{enumerator.email || "-"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                Ward Number
              </div>
              <div className="mt-1">{enumerator.wardNumber}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-gray-500">Username</div>
              <div className="mt-1">{enumerator.userName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1">
                {enumerator.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
