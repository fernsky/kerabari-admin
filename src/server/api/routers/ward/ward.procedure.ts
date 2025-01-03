import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { wards } from "@/server/db/schema";
import { createWardSchema, updateWardAreaCodeSchema } from "@/server/api/routers/ward/ward.schema";
import { eq } from "drizzle-orm";

export const wardRouter = createTRPCRouter({
    getWards: protectedProcedure.query(async ({ ctx }) => {
        const allWards = await ctx.db.select().from(wards);
        return allWards;
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