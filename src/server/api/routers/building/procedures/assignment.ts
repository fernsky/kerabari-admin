import { protectedProcedure } from "@/server/api/trpc";
import { buildings } from "@/server/db/schema/building";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const assignToEnumerator = protectedProcedure
  .input(z.object({ buildingId: z.string(), enumeratorId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const building = await ctx.db.query.buildings.findFirst({
      where: eq(buildings.id, input.buildingId),
    });

    if (!building) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Building not found",
      });
    }

    await ctx.db
      .update(buildings)
      .set({
        enumeratorId: input.enumeratorId,
      })
      .where(eq(buildings.id, input.buildingId));

    return { success: true };
  });
