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

export const createAreaRequestSchema = z.object({
  areaCode: z.number(),
  message: z.string().max(500).optional(),
});

export const updateAreaRequestStatusSchema = z.object({
  areaCode: z.number(),
  userId: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export interface Area {
  code: number;
  wardNumber: number;
  geometry?: JSON | FeatureCollection<Polygon>;
}

export interface AreaRequest {
  id: string;
  areaCode: number;
  userId: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: Date;
  updatedAt?: Date;
}
