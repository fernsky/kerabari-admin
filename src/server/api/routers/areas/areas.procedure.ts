import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { areas, users, areaRequests } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Area, createAreaSchema } from "./area.schema";
import { assignAreaToEnumeratorSchema } from "./area.schema";
import {
  updateAreaSchema,
  createAreaRequestSchema,
  updateAreaRequestStatusSchema,
} from "./area.schema";
import { nanoid } from "nanoid";

export const areaRouter = createTRPCRouter({
  createArea: protectedProcedure
    .input(createAreaSchema)
    .mutation(async ({ ctx, input }) => {
      const geoJson = JSON.stringify(input.geometry.geometry);
      console.log(geoJson);
      try {
        JSON.parse(geoJson);
      } catch (error) {
        throw new Error("Invalid GeoJSON representation");
      }
      const newArea = await ctx.db.insert(areas).values({
        ...input,
        geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
      });
      return newArea;
    }),

  getAreas: protectedProcedure.query(async ({ ctx }) => {
    const allAreas = await ctx.db
      .select({
        code: areas.code,
        wardNumber: areas.wardNumber,
        assignedTo: areas.assignedTo,
      })
      .from(areas)
      .orderBy(areas.code);
    return allAreas as unknown as Area[];
  }),

  getAreaByCode: protectedProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ ctx, input }) => {
      const area = await ctx.db.execute(
        sql`SELECT ${areas.code} as "code", 
            ${areas.wardNumber} as "wardNumber", 
            ST_AsGeoJSON(${areas.geometry}) as "geometry"
            FROM ${areas} WHERE ${areas.code} = ${input.code} LIMIT 1`,
      );
      return area[0] as unknown as Area;
    }),

  assignAreaToEnumerator: protectedProcedure
    .input(assignAreaToEnumeratorSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedArea = await ctx.db
        .update(areas)
        .set({ assignedTo: input.enumeratorId })
        .where(eq(areas.code, input.areaCode));

      return { success: true };
    }),

  updateArea: protectedProcedure
    .input(updateAreaSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.geometry.geometry) {
        const geoJson = JSON.stringify(input.geometry.geometry);
        try {
          JSON.parse(geoJson);
        } catch (error) {
          throw new Error("Invalid GeoJSON representation");
        }

        const updatedArea = await ctx.db
          .update(areas)
          .set({
            wardNumber: input.wardNumber,
            geometry: sql`ST_GeomFromGeoJSON(${geoJson})`,
          })
          .where(eq(areas.code, input.code));
        return { success: true };
      }

      const { geometry, ...payload } = input;
      console.log(payload);
      const updatedArea = await ctx.db
        .update(areas)
        .set({
          wardNumber: payload.wardNumber,
          code: payload.code,
        })
        .where(eq(areas.code, input.code));
      return { success: true };
    }),

  getUnassignedWardAreasofEnumerator: protectedProcedure.query(
    async ({ ctx }) => {
      const fetchedUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user!.id))
        .limit(1);

      if (!fetchedUser[0]) {
        throw new Error("User not found");
      }
      const user = fetchedUser[0];

      const surveyableAreas = await ctx.db.execute(
        sql`SELECT ${areas.code} as "code", 
        ${areas.wardNumber} as "wardNumber",
        ST_AsGeoJSON(${areas.geometry}) as "geometry"
        FROM ${areas} 
        WHERE ${areas.wardNumber} = ${user.wardNumber} AND
        ${areas.assignedTo} IS NULL ORDER BY ${areas.code}`,
      );
      return surveyableAreas as unknown as Area[];
    },
  ),

  requestArea: protectedProcedure
    .input(createAreaRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.insert(areaRequests).values({
        areaCode: input.areaCode,
        userId: ctx.user!.id,
        message: input.message,
      });
      return request;
    }),

  getUserAreaRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select()
      .from(areaRequests)
      .where(eq(areaRequests.userId, ctx.user!.id))
      .orderBy(areaRequests.createdAt);
    return requests;
  }),

  getAllAreaRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select({
        request: areaRequests,
        user: {
          name: users.name,
          phoneNumber: users.phoneNumber,
        },
        area: {
          code: areas.code,
          wardNumber: areas.wardNumber,
          geometry: sql`ST_AsGeoJSON(${areas.geometry})`,
        },
      })
      .from(areaRequests)
      .leftJoin(users, eq(areaRequests.userId, users.id))
      .leftJoin(areas, eq(areaRequests.areaCode, areas.code))
      .orderBy(areaRequests.createdAt);
    return requests;
  }),

  updateAreaRequestStatus: protectedProcedure
    .input(updateAreaRequestStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { areaCode, userId, status } = input;

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(areaRequests)
          .set({ status, updatedAt: new Date() })
          .where(
            sql`${areaRequests.areaCode} = ${areaCode} AND ${areaRequests.userId} = ${userId}`,
          );

        if (status === "approved") {
          await tx
            .update(areas)
            .set({ assignedTo: userId })
            .where(eq(areas.code, areaCode));
        } else if (status === "rejected" || status === "pending") {
          await tx
            .update(areas)
            .set({ assignedTo: null })
            .where(eq(areas.code, areaCode));
        }
      });

      return { success: true };
    }),
});
