import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { areas, users, areaRequests } from "@/server/db/schema/basic";
import { and, eq, ilike, sql } from "drizzle-orm";
import { Area, createAreaSchema } from "./area.schema";
import { assignAreaToEnumeratorSchema } from "./area.schema";
import {
  updateAreaSchema,
  createAreaRequestSchema,
  updateAreaRequestStatusSchema,
} from "./area.schema";
import { nanoid } from "nanoid";
import { BuildingToken, buildingTokens } from "@/server/db/schema/building";

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

  getAreasByWardforRequest: protectedProcedure
    .input(z.object({ wardNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const wardAreas = await ctx.db.execute(
        sql`SELECT 
        a.id as "id",
        a.code as "code",
        a.ward as "wardNumber",
        a.assigned_to as "assignedTo",
        ST_AsGeoJSON(a.geometry) as "geometry"
      FROM ${areas} a
      LEFT JOIN ${areaRequests} ar 
        ON a.id = ar.area_id 
        AND ar.user_id = ${ctx.user!.id}
        AND ar.status = 'pending'
      WHERE a.ward = ${input.wardNumber}
      AND ar.area_id IS NULL
      ORDER BY a.code`,
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

  getAllAreaRequests: protectedProcedure
    .input(
      z.object({
        filters: z
          .object({
            code: z.number().optional(),
            wardNumber: z.number().optional(),
            enumeratorId: z.string().optional(),
            status: z.enum(["pending", "approved", "rejected"]).optional(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        sortBy: z
          .enum(["created_at", "status", "ward_number"])
          .default("created_at"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { filters, limit, offset, sortBy, sortOrder } = input;

      let conditions = sql`TRUE`;
      if (filters) {
        const filterConditions = [];
        if (filters.code) {
          filterConditions.push(eq(areas.code, filters.code));
        }
        if (filters.wardNumber) {
          filterConditions.push(eq(areas.wardNumber, filters.wardNumber));
        }
        if (filters.enumeratorId) {
          filterConditions.push(eq(areaRequests.userId, filters.enumeratorId));
        }
        if (filters.status) {
          filterConditions.push(eq(areaRequests.status, filters.status));
        }
        if (filterConditions.length > 0) {
          const andCondition = and(...filterConditions);
          if (andCondition) conditions = andCondition;
        }
      }

      const [requests, totalCount] = await Promise.all([
        ctx.db
          .select({
            request: areaRequests,
            user: {
              name: users.name,
              phoneNumber: users.phoneNumber,
              wardNumber: users.wardNumber,
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
          .where(conditions)
          .orderBy(sql`${sql.identifier(sortBy)} ${sql.raw(sortOrder)}`)
          .limit(limit)
          .offset(offset),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(areaRequests)
          .leftJoin(users, eq(areaRequests.userId, users.id))
          .leftJoin(areas, eq(areaRequests.areaId, areas.id))
          .where(conditions)
          .then((result) => result[0].count),
      ]);

      return {
        data: requests,
        pagination: {
          total: totalCount,
          pageSize: limit,
          offset,
        },
      };
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
            .set({ assignedTo: userId, areaStatus: "newly_assigned" })
            .where(eq(areas.id, areaId));

          // Once approved delete all requests for that area
          await tx
            .delete(areaRequests)
            .where(sql`${areaRequests.areaId} = ${areaId}`);

          // Also delete all other requests for the user
          await tx
            .delete(areaRequests)
            .where(sql`${areaRequests.userId} = ${userId}`);
        } else if (status === "rejected") {
          await tx
            .delete(areaRequests)
            .where(
              sql`${areaRequests.areaId} = ${areaId} AND ${areaRequests.userId} = ${userId}`,
            );
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

  getTokenStatsByAreaId: protectedProcedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const totalTokens = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(buildingTokens)
        .where(eq(buildingTokens.areaId, input.areaId))
        .then((result) => result[0].count);

      const allocatedTokens = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(buildingTokens)
        .where(
          and(
            eq(buildingTokens.areaId, input.areaId),
            eq(buildingTokens.status, "allocated"),
          ),
        )
        .then((result) => result[0].count);

      const unallocatedTokens = totalTokens - allocatedTokens;

      return {
        totalTokens,
        allocatedTokens,
        unallocatedTokens,
      };
    }),

  getAreaTokens: protectedProcedure
    .input(
      z.object({
        areaId: z.string(),
        status: z.enum(["allocated", "unallocated"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(buildingTokens.areaId, input.areaId)];
      if (input.status) {
        conditions.push(eq(buildingTokens.status, input.status));
      }

      const [tokens, totalCount] = await Promise.all([
        ctx.db
          .select()
          .from(buildingTokens)
          .where(and(...conditions))
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(buildingTokens.token),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(buildingTokens)
          .where(and(...conditions))
          .then((result) => result[0].count),
      ]);

      return {
        tokens,
        pagination: {
          total: totalCount,
          pageSize: input.limit,
          offset: input.offset,
        },
      };
    }),
});
