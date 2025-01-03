import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { sections, paragraphs, tables } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import {
  createSectionSchema,
  updateSectionSchema,
  sectionIdSchema,
  chapterIdSchema,
  updateDisplaySchemaSchema,
} from "./section.schema";
import {
  type ContentItem,
  type TableColorScheme,
  type TableDisplayConfig,
  type TableDisplayMode,
  type DisplaySchema,
} from "@/types/section";

export const sectionRouter = createTRPCRouter({
  create: protectedProcedure.input(createSectionSchema).mutation(async ({ ctx, input }) => {
    const id = generateId(15);
    await ctx.db.insert(sections).values({
      id,
      title_en: input.title_en,
      title_ne: input.title_ne,
      chapter_id: input.chapter_id,
    });
    return { id };
  }),

  update: protectedProcedure.input(updateSectionSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    await ctx.db.update(sections).set(data).where(eq(sections.id, id));
    return { success: true };
  }),

  delete: protectedProcedure.input(sectionIdSchema).mutation(async ({ ctx, input }) => {
    const [hasParagraphs, hasTables] = await Promise.all([
      ctx.db.select().from(paragraphs).where(eq(paragraphs.section_id, input.id)),
      ctx.db.select().from(tables).where(eq(tables.section_id, input.id)),
    ]);

    if (hasParagraphs.length > 0 || hasTables.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete section with existing paragraphs or tables",
      });
    }

    await ctx.db.delete(sections).where(eq(sections.id, input.id));
    return { success: true };
  }),

  get: protectedProcedure.input(sectionIdSchema).query(async ({ ctx, input }) => {
    const section = await ctx.db
      .select()
      .from(sections)
      .where(eq(sections.id, input.id))
      .then((res) => res[0]);

    if (!section) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Section not found",
      });
    }
    return section;
  }),

  getByChapterId: protectedProcedure.input(chapterIdSchema).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(sections)
      .where(eq(sections.chapter_id, input.chapterId))
      .orderBy(sections.createdAt);
  }),

  updateDisplaySchema: protectedProcedure
    .input(updateDisplaySchemaSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(sections)
        .set({ displaySchema: input.displaySchema })
        .where(eq(sections.id, input.id));
      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(sections).orderBy(sections.createdAt);
  }),

  getWithContent: protectedProcedure.input(sectionIdSchema).query(async ({ ctx, input }) => {
    const section = await ctx.db
      .select()
      .from(sections)
      .where(eq(sections.id, input.id))
      .then((res) => res[0]);

    if (!section) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Section not found",
      });
    }

    const [sectionParagraphs, sectionTables] = await Promise.all([
      ctx.db
        .select()
        .from(paragraphs)
        .where(eq(paragraphs.section_id, input.id))
        .orderBy(paragraphs.createdAt),
      ctx.db.select().from(tables).where(eq(tables.section_id, input.id)).orderBy(tables.createdAt),
    ]);

    // Sort content based on displaySchema if it exists
    const content = (section.displaySchema as DisplaySchema)?.content
      ?.reduce(
        (
          acc: Array<
            ((typeof sectionParagraphs)[0] | (typeof sectionTables)[0]) & {
              type: "paragraph" | "table";
              order: number;
              displayMode?: TableDisplayMode;
              colorScheme?: TableColorScheme[];
            }
          >,
          item: ContentItem | TableDisplayConfig,
        ) => {
          if (item.type === "paragraph") {
            const paragraph = sectionParagraphs.find((p) => p.id === item.id);
            if (paragraph) acc.push({ ...paragraph, type: "paragraph", order: item.order });
          } else if (item.type === "table") {
            const table = sectionTables.find((t) => t.id === item.id);
            const tableItem = item as TableDisplayConfig;
            if (table) {
              acc.push({
                ...table,
                type: "table",
                order: tableItem.order,
                displayMode: tableItem.displayMode,
                colorScheme: tableItem.colorScheme,
              });
            }
          }
          return acc;
        },
        [],
      )
      ?.sort((a, b) => a.order - b.order);

    return {
      ...section,
      content,
    };
  }),
});
