import { redirect } from "next/navigation";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import * as React from "react";
import { Parts } from "../_components/parts";
import { PartsSkeleton } from "../_components/parts-sekeleton";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { myPartsSchema } from "@/server/api/routers/part/part.input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlusIcon } from "@/components/icons";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Parts",
  description: "Manage your parts here",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { page, perPage } = myPartsSchema.parse(searchParams);

  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  /**
   * Passing multiple promises to `Promise.all` to fetch data in parallel to prevent waterfall requests.
   * Passing promises to the `Posts` component to make them hot promises (they can run without being awaited) to prevent waterfall requests.
   * @see https://www.youtube.com/shorts/A7GGjutZxrs
   * @see https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching
   */
  const promises = Promise.all([api.part.myParts.query({ page, perPage })]);

  return (
    <div>
      <div className="mb-6 flex w-[1000px] items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Parts</h1>
          <p className="text-sm text-muted-foreground">Manage your parts here</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/parts/create" className="flex items-center gap-2">
            <FilePlusIcon className="h-4 w-4" />
            Create New Part
          </Link>
        </Button>
      </div>
      <React.Suspense fallback={<PartsSkeleton />}>
        <Parts promises={promises} />
      </React.Suspense>
    </div>
  );
}
