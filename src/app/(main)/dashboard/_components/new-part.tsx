"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface NewPartProps {
  isEligible: boolean;
  setOptimisticParts: (action: {
    action: "add" | "delete" | "update";
    part: RouterOutputs["part"]["myParts"][number];
  }) => void;
}

export const NewPart = ({ isEligible, setOptimisticParts }: NewPartProps) => {
  const router = useRouter();
  const part = api.part.create.useMutation();
  const [isCreatePending, startCreateTransaction] = React.useTransition();

  const createPart = () => {
    if (!isEligible) {
      toast.message("You've reached the limit of parts for your current plan", {
        description: "Upgrade to create more parts",
      });
      return;
    }

    startCreateTransaction(async () => {
      await part.mutateAsync(
        {
          title_en: "Untitled Part",
          title_ne: "शीर्षकहीन भाग",
        },
        {
          onSettled: () => {
            setOptimisticParts({
              action: "add",
              part: {
                id: crypto.randomUUID(),
                title_en: "Untitled Part",
                title_ne: "शीर्षकहीन भाग",
                createdAt: new Date(),
              },
            });
          },
          onSuccess: ({ id }) => {
            toast.success("Part created");
            router.refresh();
            // This is a workaround for a bug in navigation because of router.refresh()
            setTimeout(() => {
              router.push(`/dashboard/parts/editor/${id}`);
            }, 100);
          },
          onError: () => {
            toast.error("Failed to create part");
          },
        },
      );
    });
  };

  return (
    <Button
      onClick={createPart}
      className="flex h-full cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
      disabled={isCreatePending}
    >
      <div className="flex flex-col items-center gap-4">
        <FilePlusIcon className="h-10 w-10" />
        <p className="text-sm">New Part</p>
      </div>
    </Button>
  );
};
