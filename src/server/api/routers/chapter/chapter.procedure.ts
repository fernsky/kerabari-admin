import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { chapters, sections } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import {
  createChapterSchema,
  updateChapterSchema,
  chapterIdSchema,
  partIdSchema,
} from "./chapter.schema";

export const chapterRouter = createTRPCRouter({
  create: protectedProcedure.input(createChapterSchema).mutation(async ({ ctx, input }) => {
    const id = generateId(15);
    await ctx.db.insert(chapters).values({
      id,
      title_en: input.title_en,
      title_ne: input.title_ne,
      part_id: input.part_id,
    });

    return { id };
  }),

  update: protectedProcedure.input(updateChapterSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await ctx.db.update(chapters).set(data).where(eq(chapters.id, id));
    return { success: true };
  }),

  delete: protectedProcedure.input(chapterIdSchema).mutation(async ({ ctx, input }) => {
    // First check if chapter has any sections
    const relatedSections = await ctx.db
      .select()
      .from(sections)
      .where(eq(sections.chapter_id, input.id));

    if (relatedSections.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete chapter with existing sections",
      });
    }

    await ctx.db.delete(chapters).where(eq(chapters.id, input.id));
    return { success: true };
  }),

  get: protectedProcedure.input(chapterIdSchema).query(async ({ ctx, input }) => {
    const chapter = await ctx.db
      .select()
      .from(chapters)
      .where(eq(chapters.id, input.id))
      .then((res) => res[0]);

    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
      });
    }

    return chapter;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(chapters);
  }),

  getByPartId: protectedProcedure.input(partIdSchema).query(async ({ ctx, input }) => {
    return await ctx.db
      .select()
      .from(chapters)
      .where(eq(chapters.part_id, input.partId))
      .orderBy(chapters.createdAt);
  }),

  // Get chapter with all its sections
  getWithSections: protectedProcedure.input(chapterIdSchema).query(async ({ ctx, input }) => {
    const chapter = await ctx.db
      .select()
      .from(chapters)
      .where(eq(chapters.id, input.id))
      .then((res) => res[0]);

    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
      });
    }

    const chapterSections = await ctx.db
      .select()
      .from(sections)
      .where(eq(sections.chapter_id, input.id))
      .orderBy(sections.createdAt);

    return {
      ...chapter,
      sections: chapterSections,
    };
  }),
});
