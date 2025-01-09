import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { wards } from "@/server/db/schema";
import {
  createWardSchema,
  updateWardAreaCodeSchema,
} from "@/server/api/routers/ward/ward.schema";
import { eq } from "drizzle-orm";

export const wardRouter = createTRPCRouter({
  getWards: protectedProcedure.query(async ({ ctx }) => {
    const allWards = await ctx.db.select().from(wards);
    return allWards;
  }),

  getWardByNumber: protectedProcedure
    .input(z.object({ wardNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const ward = await ctx.db
        .select()
        .from(wards)
        .where(eq(wards.wardNumber, input.wardNumber))
        .limit(1);
      return ward[0];
    }),

  createWard: protectedProcedure
    .input(createWardSchema)
    .mutation(async ({ ctx, input }) => {
      const newWard = await ctx.db.insert(wards).values(input).returning();
      return newWard;
    }),

  updateWard: protectedProcedure
    .input(updateWardAreaCodeSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedWard = await ctx.db
        .update(wards)
        .set(input)
        .where(eq(wards.wardNumber, input.wardNumber))
        .returning();
      return updatedWard;
    }),
});
