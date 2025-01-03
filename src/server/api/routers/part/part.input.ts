import { z } from "zod";

export const listPartsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type ListPartsInput = z.infer<typeof listPartsSchema>;

export const getPartSchema = z.object({
  id: z.string(),
});
export type GetPartInput = z.infer<typeof getPartSchema>;

export const createPartSchema = z.object({
  title_en: z.string().min(3).max(255),
  title_ne: z.string().min(3).max(255),
});
export type CreatePartInput = z.infer<typeof createPartSchema>;

export const updatePartSchema = createPartSchema.extend({
  id: z.string(),
});
export type UpdatePartInput = z.infer<typeof updatePartSchema>;

export const deletePartSchema = z.object({
  id: z.string(),
});
export type DeletePartInput = z.infer<typeof deletePartSchema>;

export const myPartsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type MyPartsInput = z.infer<typeof myPartsSchema>;
