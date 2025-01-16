import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { buildings } from "@/server/db/schema/building";
import { and, eq, ilike, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  createBuildingSchema,
  updateBuildingSchema,
  buildingQuerySchema,
} from "./building.schema";

export const buildingRouter = createTRPCRouter({
  // Create new building
  create: publicProcedure
    .input(createBuildingSchema)
    .mutation(async ({ ctx, input }) => {
      const id = uuidv4();
      const { gps, altitude, gpsAccuracy, naturalDisasters, ...restInput } =
        input;
      await ctx.db.insert(buildings).values({
        ...restInput,
        id,
        surveyDate: new Date(input.surveyDate),
        gps: sql`ST_GeomFromText(${gps})`,
        naturalDisasters: Array.isArray(naturalDisasters)
          ? naturalDisasters
          : [naturalDisasters],
      });
      return { id };
    }),

  // Get all buildings with pagination, sorting and filtering
  getAll: publicProcedure
    .input(buildingQuerySchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, sortBy, sortOrder, filters } = input;

      let conditions = sql`TRUE`;
      if (filters) {
        const filterConditions = [];
        if (filters.wardNumber) {
          filterConditions.push(eq(buildings.wardNumber, filters.wardNumber));
        }
        if (filters.locality) {
          filterConditions.push(
            ilike(buildings.locality, `%${filters.locality}%`),
          );
        }
        if (filters.mapStatus) {
          filterConditions.push(eq(buildings.mapStatus, filters.mapStatus));
        }
        if (filterConditions.length > 0) {
          const andCondition = and(...filterConditions);
          if (andCondition) conditions = andCondition;
        }
      }

      const [data, totalCount] = await Promise.all([
        ctx.db
          .select()
          .from(buildings)
          .where(conditions)
          .orderBy(sql`${sql.identifier(sortBy)} ${sql.raw(sortOrder)}`)
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(buildings)
          .where(conditions)
          .then((result) => result[0].count),
      ]);

      return {
        data,
        pagination: {
          total: totalCount,
          pageSize: limit,
          offset,
        },
      };
    }),

  // Get single building by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const building = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, input.id))
        .limit(1);
      console.log(building, input.id);
      if (!building.length) {
        throw new Error("Building not found");
      }

      return building[0];
    }),

  // Update building
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateBuildingSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      const { gps, ...restData } = data;
      const transformedData = {
        ...restData,
        surveyDate: restData.surveyDate
          ? new Date(restData.surveyDate)
          : undefined,
        gps: gps ? sql`ST_GeomFromText(${gps})` : undefined,
        naturalDisasters: restData.naturalDisasters
          ? Array.isArray(restData.naturalDisasters)
            ? restData.naturalDisasters
            : [restData.naturalDisasters]
          : undefined,
      };

      await ctx.db
        .update(buildings)
        .set(transformedData)
        .where(eq(buildings.id, id));

      return { success: true };
    }),

  // Delete building
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(buildings).where(eq(buildings.id, input.id));

      return { success: true };
    }),

  // Get stats/summary (optional but useful)
  getStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        totalBuildings: sql<number>`count(*)`,
        totalFamilies: sql<number>`sum(${buildings.totalFamilies})`,
        avgBusinesses: sql<number>`avg(${buildings.totalBusinesses})`,
      })
      .from(buildings);

    return stats[0];
  }),
});
