import { z } from "zod";

const tableColorSchemeSchema = z.object({
  key: z.string(),
  color: z.string(),
});

const contentItemSchema = z.object({
  id: z.string(),
  type: z.enum(["paragraph", "table"]),
  order: z.number(),
});

const tableDisplayConfigSchema = contentItemSchema.extend({
  type: z.literal("table"),
  displayMode: z.enum(["table", "pie", "bar"]),
  colorScheme: z.array(tableColorSchemeSchema),
});

const paragraphDisplayConfigSchema = contentItemSchema.extend({
  type: z.literal("paragraph"),
});

const displaySchemaSchema = z.object({
  content: z.array(
    z.discriminatedUnion("type", [tableDisplayConfigSchema, paragraphDisplayConfigSchema]),
  ),
});

export const createSectionSchema = z.object({
  title_en: z.string().min(1),
  title_ne: z.string().min(1),
  chapter_id: z.string().min(1),
  displaySchema: displaySchemaSchema.optional(),
});

export const updateSectionSchema = z.object({
  id: z.string().min(1),
  title_en: z.string().min(1),
  title_ne: z.string().min(1),
  displaySchema: displaySchemaSchema.optional(),
});

export const sectionIdSchema = z.object({
  id: z.string().min(1),
});

export const chapterIdSchema = z.object({
  chapterId: z.string().min(1),
});

export const updateDisplaySchemaSchema = z.object({
  id: z.string().min(1),
  displaySchema: displaySchemaSchema,
});
