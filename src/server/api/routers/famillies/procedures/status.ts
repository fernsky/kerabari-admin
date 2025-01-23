import { protectedProcedure } from "@/server/api/trpc";
import { family, familyEditRequests } from "@/server/db/schema/family/family";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

export const approve = protectedProcedure
  .input(z.object({ familyId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only admins can approve families",
      });
    }

    const familyEntity = await ctx.db
      .select()
      .from(family)
      .where(eq(family.id, input.familyId))
      .limit(1);

    if (!familyEntity[0] || familyEntity[0].status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending families can be approved",
      });
    }

    // ...rest remains the same...
  });

export const requestEdit = protectedProcedure
  .input(z.object({ familyId: z.string(), message: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user?.role || ctx.user.role !== "superadmin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only admins can request edits",
      });
    }

    const familyEntity = await ctx.db
      .select()
      .from(family)
      .where(eq(family.id, input.familyId))
      .limit(1);

    if (!familyEntity[0] || familyEntity[0].status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending families can be requested for edit",
      });
    }

    // ...rest remains the same...
  });

// ...rest of the file remains the same...

