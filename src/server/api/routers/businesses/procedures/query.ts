import { publicProcedure } from "@/server/api/trpc";
import { businessQuerySchema } from "../business.schema";
import { business } from "@/server/db/schema/business/business";
import { surveyAttachments } from "@/server/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

export const getAll = publicProcedure
  .input(businessQuerySchema)
  .query(async ({ ctx, input }) => {
    const { limit, offset, sortBy = "id", sortOrder = "desc", filters } = input;

    // Validate sortBy field exists in business table
    const validSortColumns = [
      "id",
      "businessNature",
      "businessType",
      "wardNo",
      "status",
      "registrationNo",
    ];
    const actualSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

    let conditions = sql`TRUE`;
    if (filters) {
      const filterConditions = [];
      if (filters.wardNo) {
        filterConditions.push(eq(business.wardNo, filters.wardNo));
      }
      if (filters.businessNature) {
        filterConditions.push(
          ilike(business.businessNature, `%${filters.businessNature}%`),
        );
      }
      if (filters.businessType) {
        filterConditions.push(
          ilike(business.businessType, `%${filters.businessType}%`),
        );
      }
      if (filters.enumeratorId) {
        filterConditions.push(eq(business.enumeratorId, filters.enumeratorId));
      }
      if (filters.status) {
        filterConditions.push(eq(business.status, filters.status));
      }
      if (filterConditions.length > 0) {
        const andCondition = and(...filterConditions);
        if (andCondition) conditions = andCondition;
      }
    }

    const [data, totalCount] = await Promise.all([
      ctx.db
        .select()
        .from(business)
        .where(conditions)
        .orderBy(sql`${sql.identifier(actualSortBy)} ${sql.raw(sortOrder)}`)
        .limit(limit)
        .offset(offset),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(business)
        .where(conditions)
        .then((result) => result[0].count),
    ]);
    console.log(filters, data);
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
    const businessEntity = await ctx.db
      .select()
      .from(business)
      .where(eq(business.id, input.id))
      .limit(1);

    const attachments = await ctx.db.query.surveyAttachments.findMany({
      where: eq(surveyAttachments.dataId, input.id),
    });

    if (!businessEntity[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Business not found",
      });
    }

    try {
      // Process the attachments and create presigned URLs
      for (const attachment of attachments) {
        if (attachment.type === "business_image") {
          console.log("Fetching business image");
          businessEntity[0].businessImage = await ctx.minio.presignedGetObject(
            env.BUCKET_NAME,
            attachment.name,
            24 * 60 * 60, // 24 hours expiry
          );
        }
        if (attachment.type === "business_selfie") {
          businessEntity[0].enumeratorSelfie =
            await ctx.minio.presignedGetObject(
              env.BUCKET_NAME,
              attachment.name,
              24 * 60 * 60,
            );
        }
        if (attachment.type === "audio_monitoring") {
          businessEntity[0].surveyAudioRecording =
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

    return businessEntity[0];
  });

export const getStats = publicProcedure.query(async ({ ctx }) => {
  const stats = await ctx.db
    .select({
      totalBusinesses: sql<number>`count(*)`,
      avgInvestmentAmount: sql<number>`avg(${business.investmentAmount})`,
      totalEmployees: sql<number>`
        sum(
          coalesce(${business.totalPermanentEmployees}, 0) + 
          coalesce(${business.totalTemporaryEmployees}, 0)
        )
      `,
      totalPartners: sql<number>`sum(coalesce(${business.totalPartners}, 0))`,
    })
    .from(business);

  return stats[0];
});
