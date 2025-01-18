import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { z } from "zod";
import { areas } from "@/server/db/schema/basic";
import { eq, sql } from "drizzle-orm";
import { Area, createAreaSchema, updateAreaSchema } from "../area.schema";
import { nanoid } from "nanoid";
import { BuildingToken, buildingTokens } from "@/server/db/schema/building";

export const createArea = protectedProcedure
  .input(createAreaSchema)
  .mutation(async ({ ctx, input }) => {
    const geoJson = JSON.stringify(input.geometry.geometry);
    console.log(geoJson);
    try {
      JSON.parse(geoJson);
    } catch (error) {
      throw new Error("Invalid GeoJSON representation");
    }
    const id = nanoid();
    const newArea = await ctx.db.insert(areas).values({
      id,
      ...input,
      geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
    });
    // Create 200 tokens for the newly created area
    const tokens = Array.from({ length: 200 }, () => ({
      token: nanoid(),
      areaId: id as string,
      status: "unallocated",
    })) as BuildingToken[];

    await ctx.db.insert(buildingTokens).values(tokens);
    return newArea;
  });

export const getAreas = protectedProcedure.query(async ({ ctx }) => {
  const allAreas = await ctx.db.execute(
    sql`SELECT 
            ${areas.id} as "id",
            ${areas.code} as "code",
            ${areas.wardNumber} as "wardNumber",
            ${areas.assignedTo} as "assignedTo",
            ST_AsGeoJSON(${areas.geometry}) as "geometry",
            ST_AsGeoJSON(ST_Centroid(${areas.geometry})) as "centroid"
          FROM ${areas}
          ORDER BY ${areas.code}`,
  );

  return allAreas.map((area) => {
    try {
      return {
        ...area,
        geometry: area.geometry ? JSON.parse(area.geometry as string) : null,
        centroid: area.centroid ? JSON.parse(area.centroid as string) : null,
      };
    } catch (e) {
      console.error(`Error parsing geometry for area ${area.id}:`, e);
      return {
        ...area,
        geometry: null,
        centroid: null,
      };
    }
  }) as Area[];
});

export const getAreaById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const area = await ctx.db.execute(
      sql`SELECT ${areas.id} as "id", 
          ${areas.code} as "code", 
          ${areas.wardNumber} as "wardNumber", 
          ST_AsGeoJSON(${areas.geometry}) as "geometry"
          FROM ${areas} WHERE ${areas.id} = ${input.id} LIMIT 1`,
    );
    return {
      ...area[0],
      geometry: area[0].geometry
        ? JSON.parse(area[0].geometry as string)
        : null,
    } as Area;
  });

export const updateArea = protectedProcedure
  .input(updateAreaSchema)
  .mutation(async ({ ctx, input }) => {
    if (input.geometry.geometry) {
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
        .where(eq(areas.id, input.id));
      return { success: true };
    }

    const { geometry, ...payload } = input;
    console.log(payload);
    const updatedArea = await ctx.db
      .update(areas)
      .set({
        wardNumber: payload.wardNumber,
        code: payload.code,
      })
      .where(eq(areas.id, input.id));
    return { success: true };
  });
