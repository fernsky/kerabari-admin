import { protectedProcedure } from "../../../trpc";
import { areas, users, Area } from "@/server/db/schema/basic";
import { eq, sql } from "drizzle-orm";
import { assignAreaToEnumeratorSchema } from "../area.schema";
import * as z from "zod";

export const assignAreaToEnumerator = protectedProcedure
  .input(assignAreaToEnumeratorSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedArea = await ctx.db
      .update(areas)
      .set({ assignedTo: input.enumeratorId })
      .where(eq(areas.id, input.id));

    return { success: true };
  });

export const getUnassignedWardAreasofEnumerator = protectedProcedure.query(
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
      sql`SELECT ${areas.id} as "id", 
            ${areas.code} as "code", 
            ${areas.wardNumber} as "wardNumber",
            ST_AsGeoJSON(${areas.geometry}) as "geometry"
            FROM ${areas} 
            WHERE ${areas.wardNumber} = ${user.wardNumber} AND
            ${areas.assignedTo} IS NULL ORDER BY ${areas.code}`,
    );
    return surveyableAreas as unknown as Area[];
  },
);

export const getAreaDetails = protectedProcedure
  .input(z.object({ areaId: z.string() }))
  .query(async ({ ctx, input }) => {
    const areaWithEnumerator = await ctx.db
      .select({
        id: areas.id,
        code: areas.code,
        wardNumber: areas.wardNumber,
        enumerator: {
          id: users.id,
          name: users.name,
          phoneNumber: users.phoneNumber,
          wardNumber: users.wardNumber,
        },
      })
      .from(areas)
      .leftJoin(users, eq(areas.assignedTo, users.id))
      .where(eq(areas.id, input.areaId))
      .limit(1);

    if (!areaWithEnumerator[0]) {
      throw new Error("Area not found");
    }

    return areaWithEnumerator[0];
  });
