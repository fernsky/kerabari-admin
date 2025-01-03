import { z } from "zod";

export const createWardSchema = z.object({
  wardNumber: z.number().int(),
  wardAreaCode: z.number().int()
});

export const updateWardAreaCodeSchema = z.object({
    wardNumber: z.number().int(),
    wardAreaCode: z.number().int()
  });