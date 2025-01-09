import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { areas } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Area, createAreaSchema } from "./area.schema";
import { assignAreaToEnumeratorSchema } from "./area.schema";
import { updateAreaSchema } from "./area.schema";

export const areaRouter = createTRPCRouter({
  createArea: protectedProcedure
    .input(createAreaSchema)
    .mutation(async ({ ctx, input }) => {
      const geoJson = JSON.stringify(input.geometry.geometry);
      console.log(geoJson);
      try {
        JSON.parse(geoJson);
      } catch (error) {
        throw new Error("Invalid GeoJSON representation");
      }
      const newArea = await ctx.db.insert(areas).values({
        ...input,
        geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
      });
      return newArea;
    }),

  getAreas: protectedProcedure.query(async ({ ctx }) => {
    const allAreas = await ctx.db.execute(
      sql`SELECT ${areas.code} as "code", 
      ${areas.wardNumber} as "wardNumber"
      FROM ${areas} ORDER BY ${areas.code}`,
    );
    return allAreas as unknown as Area[];
  }),

  getAreaByCode: protectedProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ ctx, input }) => {
      const area = await ctx.db.execute(
        sql`SELECT ${areas.code} as "code", 
            ${areas.wardNumber} as "wardNumber", 
            ST_AsGeoJSON(${areas.geometry}) as "geometry"
            FROM ${areas} WHERE ${areas.code} = ${input.code} LIMIT 1`,
      );
      return area[0] as unknown as Area;
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
    }),

  updateArea: protectedProcedure
    .input(updateAreaSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.geometry) {
        const geoJson = JSON.stringify(input.geometry.geometry);
        try {
          JSON.parse(geoJson);
        } catch (error) {
          throw new Error("Invalid GeoJSON representation");
        }

        const updatedArea = await ctx.db
          .update(areas)
          .set({
            wardNumber: input.wardNumber,
            geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
          })
          .where(eq(areas.code, input.code))
          .returning();
        return updatedArea;
      }

      const updatedArea = await ctx.db
        .update(areas)
        .set({
          wardNumber: input.wardNumber,
        })
        .where(eq(areas.code, input.code))
        .returning();
      return updatedArea;
    }),
});
