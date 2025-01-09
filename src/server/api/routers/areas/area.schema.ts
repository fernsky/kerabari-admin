import { FeatureCollection, Polygon } from "geojson";
import { z } from "zod";

export const assignAreaToEnumeratorSchema = z.object({
  areaCode: z.number(),
  enumeratorId: z.string(),
});
export const createAreaSchema = z.object({
  code: z.number().int(),
  wardNumber: z.number().int(),
  geometry: z.any().optional(),
});

export const updateAreaSchema = z.object({
  code: z.number().int(),
  wardNumber: z.number().int(),
  geometry: z.any().optional(),
});

export interface Area {
  code: number;
  wardNumber: number;
  geometry?: JSON | FeatureCollection<Polygon>;
}
