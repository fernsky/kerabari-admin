"use client";

import { type RouterOutputs } from "@/trpc/shared";
import * as React from "react";

import { PartCard } from "./part-card";

interface PartsProps {
  promises: Promise<[RouterOutputs["part"]["myParts"]]>;
}

export function Parts({ promises }: PartsProps) {
  const [parts] = React.use(promises);

  const [optimisticParts, setOptimisticParts] = React.useOptimistic(
    parts,
    (
      state,
      {
        action,
        part,
      }: {
        action: "add" | "delete" | "update";
        part: RouterOutputs["part"]["myParts"][number];
      },
    ) => {
      switch (action) {
        case "delete":
          return state.filter((p) => p.id !== part.id);
        case "update":
          return state.map((p) => (p.id === part.id ? part : p));
        default:
          return [...state, part];
      }
    },
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {optimisticParts.map((part) => (
        <PartCard key={part.id} part={part} setOptimisticParts={setOptimisticParts} />
      ))}
    </div>
  );
}
