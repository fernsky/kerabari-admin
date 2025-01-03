import { z } from "zod";

export const createTableSchema = z.object({
  title_en: z.string().min(1),
  title_ne: z.string().min(1),
  data_en: z.array(z.any()),
  data_ne: z.array(z.any()),
  section_id: z.string().min(1),
});

export const updateTableSchema = z.object({
  id: z.string().min(1),
  title_en: z.string().min(1),
  title_ne: z.string().min(1),
  data_en: z.array(z.any()),
  data_ne: z.array(z.any()),
});

export const tableIdSchema = z.object({
  id: z.string().min(1),
});

export const sectionIdSchema = z.object({
  sectionId: z.string().min(1),
});
