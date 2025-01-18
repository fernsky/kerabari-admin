import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

import { and, eq, ilike, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  createBuildingSchema,
  updateBuildingSchema,
  buildingQuerySchema,
} from "./building.schema";
import { TRPCError } from "@trpc/server";
import { buildings, buildingEditRequests } from "@/server/db/schema/building";
import { surveyAttachments } from "@/server/db/schema";
import { env } from "@/env";

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
        // Add enumerator filter
        if (filters.enumeratorId) {
          filterConditions.push(eq(buildings.userId, filters.enumeratorId));
        }
        // Add status filter
        if (filters.status) {
          filterConditions.push(eq(buildings.status, filters.status));
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

      const attachments = await ctx.db.query.surveyAttachments.findMany({
        where: eq(surveyAttachments.dataId, `uuid:${input.id}`),
      });

      if (!building[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building not found",
        });
      }

      try {
        // Process the attachments and create presigned URLs
        for (const attachment of attachments) {
          if (attachment.type === "building_image") {
            console.log("Fetching building image");
            building[0].buildingImage = await ctx.minio.presignedGetObject(
              env.BUCKET_NAME,
              attachment.name,
              24 * 60 * 60, // 24 hours expiry
            );
          }
          if (attachment.type === "building_selfie") {
            building[0].enumeratorSelfie = await ctx.minio.presignedGetObject(
              env.BUCKET_NAME,
              attachment.name,
              24 * 60 * 60,
            );
          }
          if (attachment.type === "audio_monitoring") {
            building[0].surveyAudioRecording =
              await ctx.minio.presignedGetObject(
                env.BUCKET_NAME,
                attachment.name,
                24 * 60 * 60,
              );
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate presigned URLs",
          cause: error,
        });
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

  // Approve building
  approve: protectedProcedure
    .input(z.object({ buildingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can approve buildings",
        });
      }

      const building = await ctx.db.query.buildings.findFirst({
        where: eq(buildings.id, input.buildingId),
        columns: { status: true },
      });

      if (!building || building.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending buildings can be approved",
        });
      }

      await ctx.db
        .update(buildings)
        .set({ status: "approved" })
        .where(eq(buildings.id, input.buildingId));

      return { success: true };
    }),

  // Request building data edit
  requestEdit: protectedProcedure
    .input(
      z.object({
        buildingId: z.string(),
        message: z.string(), // Reason for edit request
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.role || ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can request edits",
        });
      }

      const building = await ctx.db.query.buildings.findFirst({
        where: eq(buildings.id, input.buildingId),
        columns: { status: true },
      });

      if (!building || building.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending buildings can be requested for edit",
        });
      }

      // Start a transaction
      await ctx.db.transaction(async (tx) => {
        // Update building status
        await tx
          .update(buildings)
          .set({ status: "requested_for_edit" })
          .where(eq(buildings.id, input.buildingId));

        // Create edit request record
        await tx.insert(buildingEditRequests).values({
          id: uuidv4(),
          buildingId: input.buildingId,
          message: input.message,
        });
      });

      return { success: true };
    }),

  // Reject building
  reject: protectedProcedure
    .input(
      z.object({
        buildingId: z.string(),
        message: z.string(), // Rejection reason
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can reject buildings",
        });
      }

      const building = await ctx.db.query.buildings.findFirst({
        where: eq(buildings.id, input.buildingId),
        columns: { status: true },
      });

      if (!building || building.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending buildings can be rejected",
        });
      }

      await ctx.db
        .update(buildings)
        .set({
          status: "rejected",
        })
        .where(eq(buildings.id, input.buildingId));

      // Store rejection reason
      await ctx.db.insert(buildingEditRequests).values({
        id: uuidv4(),
        buildingId: input.buildingId,
        message: input.message,
      });

      return { success: true };
    }),

  // Get building status history
  getStatusHistory: protectedProcedure
    .input(z.object({ buildingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db
        .select()
        .from(buildingEditRequests)
        .where(eq(buildingEditRequests.buildingId, input.buildingId))
        .orderBy(desc(buildingEditRequests.requestedAt));

      return history;
    }),
});
