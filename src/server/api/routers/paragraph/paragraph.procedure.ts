import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { paragraphs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import {
  createParagraphSchema,
  updateParagraphSchema,
  paragraphIdSchema,
  sectionIdSchema,
} from "./paragraph.schema";

export const paragraphRouter = createTRPCRouter({
  create: protectedProcedure.input(createParagraphSchema).mutation(async ({ ctx, input }) => {
    const id = generateId(15);
    await ctx.db.insert(paragraphs).values({
      id,
      content_en: input.content_en,
      content_ne: input.content_ne,
      section_id: input.section_id,
    });
    return { id };
  }),

  update: protectedProcedure.input(updateParagraphSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await ctx.db.update(paragraphs).set(data).where(eq(paragraphs.id, id));
    return { success: true };
  }),

  delete: protectedProcedure.input(paragraphIdSchema).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(paragraphs).where(eq(paragraphs.id, input.id));
    return { success: true };
  }),

  get: protectedProcedure.input(paragraphIdSchema).query(async ({ ctx, input }) => {
    const paragraph = await ctx.db
      .select()
      .from(paragraphs)
      .where(eq(paragraphs.id, input.id))
      .then((res) => res[0]);

    if (!paragraph) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Paragraph not found",
      });
    }
    return paragraph;
  }),

  getBySectionId: protectedProcedure.input(sectionIdSchema).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(paragraphs)
      .where(eq(paragraphs.section_id, input.sectionId))
      .orderBy(paragraphs.createdAt);
  }),
});
