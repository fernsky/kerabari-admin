import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { users } from "@/server/db/schema/basic";
import { eq, and, ilike, desc, asc, sql, AnyColumn } from "drizzle-orm";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  getEnumerators: protectedProcedure
    .input(
      z.object({
        pageIndex: z.number().default(0),
        pageSize: z.number().default(10),
        filters: z
          .object({
            search: z.string().optional(),
            wardNumber: z.number().optional(),
            status: z.enum(["active", "inactive"]).optional(),
          })
          .optional(),
        sorting: z
          .object({
            field: z.enum(["name", "wardNumber", "createdAt", "status"]),
            order: z.enum(["asc", "desc"]),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageIndex, pageSize, filters, sorting } = input;
      const offset = pageIndex * pageSize;

      let conditions = [eq(users.role, "enumerator")];

      if (filters?.search) {
        conditions.push(ilike(users.name, `%${filters.search}%`));
      }

      if (filters?.wardNumber !== undefined) {
        conditions.push(eq(users.wardNumber, filters.wardNumber));
      }

      if (filters?.status) {
        conditions.push(eq(users.isActive, filters.status === "active"));
      }

      const baseQuery = ctx.db
        .select()
        .from(users)
        .where(and(...conditions));

      const [totalCount] = await ctx.db
        .select({ count: sql<number>`count(${users.id})` })
        .from(baseQuery.as("base"));

      const sortField = sorting?.field ?? "name";
      const sortOrder = sorting?.order ?? "asc";
      const sortFn = sortOrder === "desc" ? desc : asc;

      const sortableFields: Record<string, AnyColumn> = {
        name: users.name,
        wardNumber: users.wardNumber,
        createdAt: users.createdAt,
        status: users.isActive,
      };

      const data = await baseQuery
        .orderBy(sortFn(sortableFields[sortField]))
        .limit(pageSize)
        .offset(offset);

      return {
        data,
        pageCount: Math.ceil(Number(totalCount.count) / pageSize),
        totalCount: Number(totalCount.count),
      };
    }),
});
