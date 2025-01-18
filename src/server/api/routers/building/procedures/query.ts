import { publicProcedure } from "@/server/api/trpc";
import { buildingQuerySchema } from "../building.schema";
import { buildings } from "@/server/db/schema/building";
import { surveyAttachments } from "@/server/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

export const getAll = publicProcedure
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
  });

export const getById = publicProcedure
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
          building[0].surveyAudioRecording = await ctx.minio.presignedGetObject(
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
  });

export const getStats = publicProcedure.query(async ({ ctx }) => {
  const stats = await ctx.db
    .select({
      totalBuildings: sql<number>`count(*)`,
      totalFamilies: sql<number>`sum(${buildings.totalFamilies})`,
      avgBusinesses: sql<number>`avg(${buildings.totalBusinesses})`,
    })
    .from(buildings);

  return stats[0];
});
