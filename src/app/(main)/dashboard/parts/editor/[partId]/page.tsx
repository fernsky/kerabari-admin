import React from "react";
import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import { PartEditor } from "./_components/part-editor";
import { ArrowLeftIcon } from "@/components/icons";
import Link from "next/link";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

interface Props {
  params: {
    partId: string;
  };
}

export default async function EditPostPage({ params }: Props) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const part = await api.part.get.query({ id: params.partId });
  if (!part) notFound();

  return (
    <main className="min-h-[calc(100vh-160px)] w-[1000px]">
      <Link
        href="/dashboard/parts"
        className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> Back to Dashboard
      </Link>

      <PartEditor part={part} />
    </main>
  );
}
