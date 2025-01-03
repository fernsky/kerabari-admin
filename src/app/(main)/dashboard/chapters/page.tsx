import { redirect } from "next/navigation";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import * as React from "react";
import { ChaptersList } from "../_components/chapters-list";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlusIcon } from "@/components/icons";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Chapters",
  description: "Manage your chapters here",
};

export default async function ChaptersPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const chapters = await api.chapter.getAll.query();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">Chapters</h1>
        <Button asChild>
          <Link href="/dashboard/chapters/create">
            <FilePlusIcon className="mr-2 h-4 w-4" />
            New Chapter
          </Link>
        </Button>
      </div>
      <ChaptersList chapters={chapters} />
    </div>
  );
}
