import { TRPCError } from "@trpc/server";
import { Scrypt } from "lucia";
import { generateId } from "lucia";
import { and, eq, is, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createEnumeratorSchema,
  resetEnumeratorPasswordSchema,
  updateEnumeratorSchema,
} from "./enumerators.schema";
import { Area, areaRequests, areas, users } from "@/server/db/schema/basic";
import * as z from "zod";

export const enumeratorRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createEnumeratorSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be an admin to manage enumerators",
        });
      }

      const existingUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.userName, input.userName),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      const hashedPassword = await new Scrypt().hash(input.password);
      const userId = generateId(21);

      await ctx.db.insert(users).values({
        id: userId,
        ...input,
        hashedPassword,
        role: "enumerator",
      });

      return { success: true };
    }),

  resetPassword: protectedProcedure
    .input(resetEnumeratorPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be an admin to reset passwords",
        });
      }

      const hashedPassword = await new Scrypt().hash(input.password);
      console.log("Ressting password", input.enumeratorId, hashedPassword);
      await ctx.db
        .update(users)
        .set({ hashedPassword })
        .where(eq(users.id, input.enumeratorId));

      return { success: true };
    }),

  update: protectedProcedure
    .input(updateEnumeratorSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be an admin to update enumerator details",
        });
      }

      const { enumeratorId, ...updateData } = input;

      if (updateData.userName) {
        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) =>
            updateData.userName
              ? eq(users.userName, updateData.userName)
              : undefined,
        });

        if (existingUser && existingUser.id !== enumeratorId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already exists",
          });
        }
      }

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, enumeratorId));

      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be an admin to view enumerator details",
        });
      }

      const enumerator = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          userName: users.userName,
          role: users.role,
          phoneNumber:users.phoneNumber,
          email: users.email,
          isActive: users.isActive,
          wardNumber: users.wardNumber,
          area: {
        id: areas.id,
        code: areas.code,
        wardNumber: areas.wardNumber,
        areaStatus: areas.areaStatus,
          }
        })
        .from(users)
        .leftJoin(areas, eq(areas.assignedTo, users.id))
        .where(eq(users.id, input));

      if (!enumerator || enumerator.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enumerator not found",
        });
      }

      return enumerator[0];
    }),

     getRequestedAreas: protectedProcedure.query(async ({ ctx }) => {
    const requestedAreas = await ctx.db.execute(
      sql`SELECT 
        ${areaRequests.userId} as "userid",
        ${areaRequests.areaId} as "areaId",
        ${areas.code} as "code",
        ${areas.wardNumber} as "wardNumber",
        ${areas.areaStatus} as "areaStatus",
        ST_AsGeoJSON(${areas.geometry}) as "geometry",
        ST_AsGeoJSON(ST_Centroid(${areas.geometry})) as "centroid"
      FROM ${areaRequests}
      LEFT JOIN ${areas} ON ${areas.id} = ${areaRequests.areaId}
      WHERE ${areaRequests.userId} = ${ctx.user.id}
      `
    );


    return requestedAreas.map(area => ({
      ...area,
      geometry: area.geometry ? JSON.parse(area.geometry as string) : null,
      centroid: area.centroid ? JSON.parse(area.centroid as string) : null,
    }));
    }),

     withdrawArea: protectedProcedure
    .input(
      z.object({
        areaId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .delete(areaRequests)
          .where(
            and(
              eq(areaRequests.areaId, input.areaId),
              eq(areaRequests.userId, input.userId)
            )
          );

        return {
          success: true,
          message: "Area request withdrawn successfully",
        };
      } catch (error) {
        throw new Error("Failed to withdraw area request");
      }
    }),

    getAssignedArea: protectedProcedure.query(async ({ ctx }) => {
    const assignedArea = await ctx.db.execute(
      sql`SELECT 
          ${areas.id} as "id",
          ${areas.code} as "code",
          ${areas.wardNumber} as "wardNumber",
          ${areas.areaStatus} as "areaStatus",
          ${areas.assignedTo} as "assignedTo",
          ST_AsGeoJSON(${areas.geometry}) as "geometry",
          ST_AsGeoJSON(ST_Centroid(${areas.geometry})) as "centroid"
        FROM ${areas}
        WHERE ${areas.assignedTo} = ${ctx.user.id}
        LIMIT 1`,
    );



    if (assignedArea.length === 0) return null;

    return {
      ...assignedArea[0],
      geometry: assignedArea[0].geometry
        ? JSON.parse(assignedArea[0].geometry as string)
        : null,
      centroid: assignedArea[0].centroid
        ? JSON.parse(assignedArea[0].centroid as string)
        : null,
    } as unknown as Area;
  }),

  requestCompletion: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "enumerator") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only enumerators can request completion",
      });
    }

    const area = await ctx.db.query.areas.findFirst({
      columns: {
        id: true,
        areaStatus: true,
      },
      where: (areas, { eq }) => eq(areas.assignedTo, ctx.user.id),
    });

    if (!area) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No assigned area found",
      });
    }

    await ctx.db
      .update(areas)
      .set({ areaStatus: "asked_for_completion" })
      .where(eq(areas.id, area.id));

    return { success: true };
  }),

  requestRevisionCompletion: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "enumerator") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only enumerators can request revision completion",
      });
    }

    const area = await ctx.db.query.areas.findFirst({
      columns: {
        id: true,
        areaStatus: true,
      },
      where: (areas, { eq }) => eq(areas.assignedTo, ctx.user.id),
    });

    if (!area || area.areaStatus !== "revision") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Area must be in revision status",
      });
    }

    await ctx.db
      .update(areas)
      .set({ areaStatus: "asked_for_revision_completion" })
      .where(eq(areas.id, area.id));

    return { success: true };
  }),

  requestWithdrawal: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "enumerator") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only enumerators can request withdrawal",
      });
    }
    const area = await ctx.db.query.areas.findFirst({
      columns: {
        id: true,
        areaStatus: true,
      },
      where: (areas, { eq }) => eq(areas.assignedTo, ctx.user.id),
    });

    if (!area) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No assigned area found",
      });
    }
  
    await ctx.db
      .update(areas)
      .set({ areaStatus: "asked_for_withdrawl" })
      .where(eq(areas.id, area.id));

    return { success: true };
  }),
});
