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
    const { limit, offset, sortBy, sortOrder, filters } = input;

    let conditions = sql`TRUE`;
    if (filters) {
      const filterConditions = [];
      if (filters.wardNo) {
        filterConditions.push(eq(business.wardNo, filters.wardNo));
      }
      if (filters.businessNature) {
        filterConditions.push(
          ilike(business.businessNature, `%${filters.businessNature}%`)
        );
      }
      if (filters.businessType) {
        filterConditions.push(
          ilike(business.businessType, `%${filters.businessType}%`)
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
        .orderBy(sql`${sql.identifier(sortBy)} ${sql.raw(sortOrder)}`)
        .limit(limit)
        .offset(offset),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(business)
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
    const businessEntity = await ctx.db
      .select()
      .from(business)
      .where(eq(business.id, input.id))
      .limit(1);

    if (!businessEntity[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Business not found",
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
