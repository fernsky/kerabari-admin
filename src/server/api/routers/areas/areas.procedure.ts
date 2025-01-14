import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { areas, users, areaRequests } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Area, createAreaSchema } from "./area.schema";
import { assignAreaToEnumeratorSchema } from "./area.schema";
import {
  updateAreaSchema,
  createAreaRequestSchema,
  updateAreaRequestStatusSchema,
} from "./area.schema";
import { nanoid } from "nanoid";

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
        id: nanoid(),
        ...input,
        geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
      });
      return newArea;
    }),

  getAreas: protectedProcedure.query(async ({ ctx }) => {
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
  }),

  getAreaById: protectedProcedure
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
    }),

  getAreasByWard: protectedProcedure
    .input(z.object({ wardNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const wardAreas = await ctx.db.execute(
        sql`SELECT 
          ${areas.id} as "id",
          ${areas.code} as "code",
          ${areas.wardNumber} as "wardNumber",
          ${areas.assignedTo} as "assignedTo",
          ST_AsGeoJSON(${areas.geometry}) as "geometry"
        FROM ${areas}
        WHERE ${areas.wardNumber} = ${input.wardNumber}
        ORDER BY ${areas.code}`,
      );

      return wardAreas.map((area) => {
        try {
          return {
            ...area,
            geometry: area.geometry
              ? JSON.parse(area.geometry as string)
              : null,
          };
        } catch (e) {
          console.error(`Error parsing geometry for area ${area.id}:`, e);
          return {
            ...area,
            geometry: null,
          };
        }
      }) as Area[];
    }),

  assignAreaToEnumerator: protectedProcedure
    .input(assignAreaToEnumeratorSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedArea = await ctx.db
        .update(areas)
        .set({ assignedTo: input.enumeratorId })
        .where(eq(areas.id, input.id));

      return { success: true };
    }),

  updateArea: protectedProcedure
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
    }),

  getUnassignedWardAreasofEnumerator: protectedProcedure.query(
    async ({ ctx }) => {
      const fetchedUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user!.id))
        .limit(1);

      if (!fetchedUser[0]) {
        throw new Error("User not found");
      }
      const user = fetchedUser[0];

      const surveyableAreas = await ctx.db.execute(
        sql`SELECT ${areas.id} as "id", 
        ${areas.code} as "code", 
        ${areas.wardNumber} as "wardNumber",
        ST_AsGeoJSON(${areas.geometry}) as "geometry"
        FROM ${areas} 
        WHERE ${areas.wardNumber} = ${user.wardNumber} AND
        ${areas.assignedTo} IS NULL ORDER BY ${areas.code}`,
      );
      return surveyableAreas as unknown as Area[];
    },
  ),

  requestArea: protectedProcedure
    .input(createAreaRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.insert(areaRequests).values({
        areaId: input.areaId,
        userId: ctx.user!.id,
        message: input.message,
      });
      return request;
    }),

  getUserAreaRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select()
      .from(areaRequests)
      .where(eq(areaRequests.userId, ctx.user!.id))
      .orderBy(areaRequests.createdAt);
    return requests;
  }),

  getAllAreaRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select({
        request: areaRequests,
        user: {
          name: users.name,
          phoneNumber: users.phoneNumber,
        },
        area: {
          id: areas.id,
          code: areas.code,
          wardNumber: areas.wardNumber,
          geometry: sql`ST_AsGeoJSON(${areas.geometry})`,
        },
      })
      .from(areaRequests)
      .leftJoin(users, eq(areaRequests.userId, users.id))
      .leftJoin(areas, eq(areaRequests.areaId, areas.id))
      .orderBy(areaRequests.createdAt);
    return requests;
  }),

  updateAreaRequestStatus: protectedProcedure
    .input(updateAreaRequestStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { areaId, userId, status } = input;

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(areaRequests)
          .set({ status, updatedAt: new Date() })
          .where(
            sql`${areaRequests.areaId} = ${areaId} AND ${areaRequests.userId} = ${userId}`,
          );

        if (status === "approved") {
          await tx
            .update(areas)
            .set({ assignedTo: userId })
            .where(eq(areas.id, areaId));
        } else if (status === "rejected" || status === "pending") {
          await tx
            .update(areas)
            .set({ assignedTo: null })
            .where(eq(areas.id, areaId));
        }
      });

      return { success: true };
    }),

  getAvailableAreaCodes: protectedProcedure
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
    }),
});
