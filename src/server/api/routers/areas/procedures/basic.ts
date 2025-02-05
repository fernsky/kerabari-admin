import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { z } from "zod";
import { areas, users } from "@/server/db/schema/basic";
import { and, eq, sql } from "drizzle-orm";
import {
  Area,
  areaQuerySchema,
  createAreaSchema,
  updateAreaSchema,
} from "../area.schema";
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
  
export const getAreas = protectedProcedure
  .input(areaQuerySchema)
  .query(async ({ ctx, input }) => {
    let conditions = sql`TRUE`;
    const filterConditions = [];

    if (input.wardNumber) {
      filterConditions.push(eq(areas.wardNumber, input.wardNumber));
    }
    if (input.code) {
      filterConditions.push(eq(areas.code, input.code));
    }
    if (input.status && input.status !== "all") {
      filterConditions.push(eq(areas.areaStatus, input.status));
    }
    if (input.assignedTo) {
      filterConditions.push(eq(areas.assignedTo, input.assignedTo));
    }

    if (filterConditions.length > 0) {
      const andCondition = and(...filterConditions);
      if (andCondition) conditions = andCondition;
    }
    const allAreas = await ctx.db
      .select({
        area: {
          id: areas.id,
          code: areas.code,
          wardNumber: areas.wardNumber,
          assignedTo: areas.assignedTo,
          areaStatus: areas.areaStatus,
          geometry: sql`ST_AsGeoJSON(${areas.geometry})`,
          centroid: sql`ST_AsGeoJSON(ST_Centroid(${areas.geometry}))`,
        },
        user: {
          name: users.name,
        },
      })
      .from(areas)
      .leftJoin(users, eq(areas.assignedTo, users.id))
      .where(conditions)
      .orderBy(areas.code);

    return allAreas.map((result) => {
      try {
        return {
          ...result.area,
          assignedTo: result.user
            ? { id: result.area.assignedTo, name: result.user.name }
            : null,
          geometry: result.area.geometry
            ? JSON.parse(result.area.geometry as string)
            : null,
          centroid: result.area.centroid
            ? JSON.parse(result.area.centroid as string)
            : null,
        };
      } catch (e) {
        console.error(`Error parsing geometry for area ${result.area.id}:`, e);
        return {
          ...result.area,
          assignedTo: null,
          geometry: null,
          centroid: null,
        };
      }
    });
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

export const getAvailableAreaCodes = protectedProcedure
  .input(z.object({ wardNumber: z.number() }))
  .query(async ({ ctx, input }) => {
    const startCode = input.wardNumber * 1000 + 1;
    const endCode = input.wardNumber * 1000 + 999;

    // Get all used codes for this ward
    const usedCodes = await ctx.db
      .select({ code: areas.code })
      .from(areas)
      .where(eq(areas.wardNumber, input.wardNumber));

    const usedCodesSet = new Set(usedCodes.map((a) => a.code));

    // Generate available codes
    const availableCodes = Array.from(
      { length: endCode - startCode + 1 },
      (_, i) => startCode + i,
    ).filter((code) => !usedCodesSet.has(code));

    return availableCodes;
  });

export const getLayerAreas = protectedProcedure.query(async ({ ctx }) => {
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

export const getAreaBoundaryByCode = protectedProcedure
  .input(z.object({ code: z.number() }))
  .query(async ({ ctx, input }) => {
    const area = await ctx.db.execute(
      sql`SELECT 
          ${areas.id} as "id",
          ${areas.code} as "code",
          ${areas.wardNumber} as "wardNumber",
          ST_AsGeoJSON(${areas.geometry}) as "boundary"
          FROM ${areas} 
          WHERE ${areas.code} = ${input.code} 
          LIMIT 1`
    );

    if (!area[0]) {
      throw new Error("Area not found");
    }

    return {
      ...area[0],
      boundary: area[0].boundary ? JSON.parse(area[0].boundary as string) : null,
    };
  });

export const getAreasWithSubmissionCounts = protectedProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = sql`
      SELECT 
        a.id,
        a.code,
        COUNT(b.id) as "submissionCount"
      FROM ${areas} a
      LEFT JOIN ${buildingTokens} b ON a.id = b.area_id
      WHERE b.status = 'submitted'
      ${input.wardNumber ? sql`AND a.ward_number = ${input.wardNumber}` : sql``}
      GROUP BY a.id, a.code
      ORDER BY a.code
    `;

    const result = await ctx.db.execute(query);
    return result;
  });
