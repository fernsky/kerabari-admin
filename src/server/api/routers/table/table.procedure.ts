import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tables } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import {
  createTableSchema,
  updateTableSchema,
  tableIdSchema,
  sectionIdSchema,
} from "./table.schema";

export const tableRouter = createTRPCRouter({
  create: protectedProcedure.input(createTableSchema).mutation(async ({ ctx, input }) => {
    const id = generateId(15);
    await ctx.db.insert(tables).values({
      id,
      title_en: input.title_en,
      title_ne: input.title_ne,
      data_en: input.data_en,
      data_ne: input.data_ne,
      section_id: input.section_id,
    });
    return { id };
  }),

  update: protectedProcedure.input(updateTableSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await ctx.db.update(tables).set(data).where(eq(tables.id, id));
    return { success: true };
  }),

  delete: protectedProcedure.input(tableIdSchema).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(tables).where(eq(tables.id, input.id));
    return { success: true };
  }),

  get: protectedProcedure.input(tableIdSchema).query(async ({ ctx, input }) => {
    const table = await ctx.db
      .select()
      .from(tables)
      .where(eq(tables.id, input.id))
      .then((res) => res[0]);

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Table not found",
      });
    }
    return table;
  }),

  getBySectionId: protectedProcedure.input(sectionIdSchema).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(tables)
      .where(eq(tables.section_id, input.sectionId))
      .orderBy(tables.createdAt);
  }),
});
