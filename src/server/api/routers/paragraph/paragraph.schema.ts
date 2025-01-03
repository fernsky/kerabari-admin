import { z } from "zod";

export const createParagraphSchema = z.object({
  content_en: z.string().min(1),
  content_ne: z.string().min(1),
  section_id: z.string().min(1),
});

export const updateParagraphSchema = z.object({
  id: z.string().min(1),
  content_en: z.string().min(1),
  content_ne: z.string().min(1),
});

export const paragraphIdSchema = z.object({
  id: z.string().min(1),
});

export const sectionIdSchema = z.object({
  sectionId: z.string().min(1),
});
