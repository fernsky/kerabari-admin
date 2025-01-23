import { protectedProcedure } from "@/server/api/trpc";
import { business } from "@/server/db/schema/business/business";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema";

export const assignToEnumerator = protectedProcedure
  .input(z.object({ businessId: z.string(), enumeratorId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const businessEntity = await ctx.db.query.business.findFirst({
      where: eq(business.id, input.businessId),
    });

    if (!businessEntity) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Business not found",
      });
    }

    const enumerator = await ctx.db.query.users.findFirst({
      where: eq(users.id, input.enumeratorId),
    });

    if (!enumerator) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Enumerator not found",
      });
    }

    await ctx.db
      .update(business)
      .set({
        enumeratorId: input.enumeratorId,
        enumeratorName: enumerator.name,
        isEnumeratorValid: true, // Set the enumerator validation flag
      })
      .where(eq(business.id, input.businessId));

    return { success: true };
  });
