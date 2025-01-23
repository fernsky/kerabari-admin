import { publicProcedure } from "@/server/api/trpc";
import { familyQuerySchema } from "../families.schema";
import { family } from "@/server/db/schema/family/family";
import { surveyAttachments } from "@/server/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

export const getAll = publicProcedure
  .input(familyQuerySchema)
  .query(async ({ ctx, input }) => {
    const { limit, offset, sortBy = "id", sortOrder = "desc", filters } = input;

    // Validate sortBy field exists in family table
    const validSortColumns = ["id", "head_name", "wardNo", "totalMembers", "status"];
    const actualSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";

    let conditions = sql`TRUE`;
    if (filters) {
      const filterConditions = [];
      if (filters.wardNo) {
        filterConditions.push(eq(family.wardNo, filters.wardNo));
      }
      if (filters.locality) {
        filterConditions.push(
          ilike(family.locality, `%${filters.locality}%`),
        );
      }
      if (filters.enumeratorId) {
        filterConditions.push(eq(family.enumeratorId, filters.enumeratorId));
      }
      if (filters.status) {
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

    if (!familyEntity[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Family not found",
      });
    }

    return familyEntity[0];
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
