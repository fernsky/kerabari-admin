import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { areas } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createAreaSchema } from "./area.schema";
import { assignAreaToEnumeratorSchema } from "./area.schema";


export const areaRouter = createTRPCRouter({

      createArea: protectedProcedure
        .input(createAreaSchema)
        .mutation(async ({ ctx, input }) => {
            const newArea = await ctx.db.insert(areas).values(input).returning();
            return newArea;
        }),

    getAreas: protectedProcedure.query(async ({ ctx }) => {
        const allAreas = await ctx.db.select().from(areas);
        return allAreas;
    }),


    getAreaByCode: protectedProcedure
        .input(z.object({ code: z.number() }))
        .query(async ({ ctx, input }) => {
            const area = await ctx.db
                .select()
                .from(areas)
                .where(eq(areas.code, input.code))
                .limit(1);
            return area[0];
        }),

    assignAreaToEnumerator: protectedProcedure
        .input(assignAreaToEnumeratorSchema)
        .mutation(async ({ ctx, input }) => {
            const updatedArea = await ctx.db
                .update(areas)
                .set({ assignedTo: input.enumeratorId })
                .where(eq(areas.code, input.areaCode))
                .returning();
            return updatedArea;
        })
  
});