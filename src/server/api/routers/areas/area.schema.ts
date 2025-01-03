import { z } from "zod";

export const createAreaSchema = z.object({
  code: z.number().int(),
  wardNumber: z.number().int()
});

// export const updateWardAreaCodeSchema = z.object({
//     wardNumber: z.number().int(),
//     wardAreaCode: z.number().int()
//   });