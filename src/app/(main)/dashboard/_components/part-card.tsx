"use client";

import { Pencil2Icon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface PartCardProps {
  part: RouterOutputs["part"]["myParts"][number];
  userName?: string;
  setOptimisticParts: (action: {
    action: "add" | "delete" | "update";
    part: RouterOutputs["part"]["myParts"][number];
  }) => void;
}

export const PartCard = ({ part, userName, setOptimisticParts }: PartCardProps) => {
  const router = useRouter();
  const partMutation = api.part.delete.useMutation();
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">{part.title_en}</CardTitle>
        <CardDescription className="line-clamp-1 text-sm">
          {userName ? <span>{userName} at</span> : null}
          {new Date(part.createdAt.toJSON()).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3 text-sm">{part.title_ne}</CardContent>
      <CardFooter className="flex-row-reverse gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/dashboard/parts/editor/${part.id}`}>
            <Pencil2Icon className="mr-1 h-4 w-4" />
            <span>Edit</span>
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => {
            startDeleteTransition(async () => {
              await partMutation.mutateAsync(
                { id: part.id },
                {
                  onSettled: () => {
                    setOptimisticParts({
                      action: "delete",
                      part,
                    });
                  },
                  onSuccess: () => {
                    toast.success("Part deleted");
                    router.refresh();
                  },
                  onError: () => {
                    toast.error("Failed to delete part");
                  },
                },
              );
            });
          }}
          disabled={isDeletePending}
        >
          <TrashIcon className="h-5 w-5" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
