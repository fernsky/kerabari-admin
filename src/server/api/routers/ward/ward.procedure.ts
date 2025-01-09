import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { wards } from "@/server/db/schema";
import {
  createWardSchema,
  updateWardAreaCodeSchema,
  Ward,
} from "@/server/api/routers/ward/ward.schema";
import { eq, sql } from "drizzle-orm";

export const wardRouter = createTRPCRouter({
  getWards: protectedProcedure.query(async ({ ctx }) => {
    const allWards = await ctx.db.execute(
      sql`SELECT ${wards.wardNumber} as "wardNumber", 
      ${wards.wardAreaCode} as "wardAreaCode"  
      FROM ${wards} ORDER BY ${wards.wardNumber}`,
    );
    return allWards as unknown as Ward[];
  }),

  getWardByNumber: protectedProcedure
    .input(z.object({ wardNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const ward = await ctx.db.execute(
        sql`SELECT ${wards.wardNumber} as "wardNumber", 
        ${wards.wardAreaCode} as "wardAreaCode", 
        ST_AsGeoJSON(${wards.geometry}) as "geometry"
        FROM ${wards} WHERE ${wards.wardNumber} = ${input.wardNumber} LIMIT 1`,
      );
      return ward[0] as unknown as Ward;
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
