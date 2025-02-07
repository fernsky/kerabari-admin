import { publicProcedure } from "@/server/api/trpc";
import { familyQuerySchema } from "../families.schema";
import { family } from "@/server/db/schema/family/family";
import { kerabariAnimal } from "@/server/db/schema/family/animals";
import { kerabariAnimalProduct } from "@/server/db/schema/family/animal-products";
import { kerabariCrop } from "@/server/db/schema/family/crops";
import { kerabariIndividual } from "@/server/db/schema/family/individual";
import { surveyAttachments } from "@/server/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { FamilyResult } from "../types";
import kerabariAgriculturalLand from "@/server/db/schema/family/agricultural-lands";

export const getAll = publicProcedure
  .input(familyQuerySchema)
  .query(async ({ ctx, input }) => {
    const { limit, offset, sortBy = "id", sortOrder = "desc", filters } = input;

    const validSortColumns = [
      "id",
      "headName",
      "wardNo",
      "areaCode",
      "enumeratorName",
      "status",
    ];
    const actualSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

    let conditions = sql`TRUE`;
    if (filters) {
      const filterConditions = [];
      if (filters.wardNo) {
        filterConditions.push(eq(family.wardNo, filters.wardNo));
      }
      if (filters.areaCode) {
        filterConditions.push(eq(family.areaCode, filters.areaCode));
      }
      if (filters.enumeratorId) {
        filterConditions.push(eq(family.enumeratorId, filters.enumeratorId));
      }
      if (filters.status && filters.status !== "all") {
        filterConditions.push(eq(family.status, filters.status));
      }

      if (filterConditions.length > 0) {
        const andCondition = and(...filterConditions);
        if (andCondition) conditions = andCondition;
      }
    }

    const [data, totalCount] = await Promise.all([
      ctx.db
        .select()
        .from(family)
        .where(conditions)
        .orderBy(sql`${sql.identifier(actualSortBy)} ${sql.raw(sortOrder)}`)
        .limit(limit)
        .offset(offset),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(family)
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
    const familyEntity = await ctx.db
      .select()
      .from(family)
      .where(eq(family.id, input.id))
      .limit(1);

    const [
      familyAgriculturalLandData,
      familyAnimalsData,
      familyAnimalProductsData,
      familyFarmingCropsData,
      familyIndividualsData,
    ] = await Promise.all([
      ctx.db
        .select()
        .from(kerabariAgriculturalLand)
        .where(eq(kerabariAgriculturalLand.familyId, input.id)),
      ctx.db
        .select()
        .from(kerabariAnimal)
        .where(eq(kerabariAnimal.familyId, input.id)),
      ctx.db
        .select()
        .from(kerabariAnimalProduct)
        .where(eq(kerabariAnimalProduct.familyId, input.id)),
      ctx.db
        .select()
        .from(kerabariCrop)
        .where(eq(kerabariCrop.familyId, input.id)),
      ctx.db
        .select()
        .from(kerabariIndividual)
        .where(eq(kerabariIndividual.familyId, input.id)),
    ]);

    const attachments = await ctx.db.query.surveyAttachments.findMany({
      where: eq(surveyAttachments.dataId, input.id),
    });

    if (!familyEntity[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Family not found",
      });
    }

    try {
      // Process the attachments and create presigned URLs
      for (const attachment of attachments) {
        if (attachment.type === "family_head_image") {
          familyEntity[0].familyImage = await ctx.minio.presignedGetObject(
            env.BUCKET_NAME,
            attachment.name,
            24 * 60 * 60, // 24 hours expiry
          );
        }
        if (attachment.type === "family_head_selfie") {
          familyEntity[0].enumeratorSelfie = await ctx.minio.presignedGetObject(
            env.BUCKET_NAME,
            attachment.name,
            24 * 60 * 60,
          );
        }
        if (attachment.type === "audio_monitoring") {
          familyEntity[0].surveyAudioRecording =
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

    const result: FamilyResult = {
      ...familyEntity[0],
      agriculturalLands: familyAgriculturalLandData,
      animals: familyAnimalsData,
      animalProducts: familyAnimalProductsData,
      crops: familyFarmingCropsData,
      individuals: familyIndividualsData,
    };

    return result;
  });

export const getByAreaCode = publicProcedure
  .input(z.object({ areaCode: z.string() }))
  .query(async ({ ctx, input }) => {
    const familyDetails = await ctx.db
      .select({
        id: family.id,
        headName: family.headName,
        wardNo: family.wardNo,
        lat: sql<number>`ST_Y(${family.gps}::geometry)`,
        lng: sql<number>`ST_X(${family.gps}::geometry)`,
        gpsAccuracy: family.gpsAccuracy,
        enumeratorName: family.enumeratorName,  // Add this line
      })
      .from(family)
      .where(eq(family.areaCode, input.areaCode));

    return familyDetails.map(family => ({
      id: family.id,
      type: "family",  // Add this line
      familyHeadName: family.headName,
      wardNo: family.wardNo,
      enumeratorName: family.enumeratorName,  // Add this line
      gpsPoint: family.lat && family.lng ? {
        lat: family.lat,
        lng: family.lng,
        accuracy: family.gpsAccuracy ?? 0
      } : null
    }));
  });

export const getStats = publicProcedure.query(async ({ ctx }) => {
  const stats = await ctx.db
    .select({
      totalFamilies: sql<number>`count(*)`,
      totalMembers: sql<number>`sum(${family.totalMembers})`,
      avgMembersPerFamily: sql<number>`avg(${family.totalMembers})`,
    })
    .from(family);

  return stats[0];
});
