import { protectedProcedure } from "@/server/api/trpc";
import { buildings, buildingEditRequests } from "@/server/db/schema/building";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

export const approve = protectedProcedure
  .input(z.object({ buildingId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only admins can approve buildings",
      });
    }

    const building = await ctx.db.query.buildings.findFirst({
      where: eq(buildings.id, input.buildingId),
      columns: { status: true },
    });

    if (!building || building.status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending buildings can be approved",
      });
    }

    await ctx.db
      .update(buildings)
      .set({ status: "approved" })
      .where(eq(buildings.id, input.buildingId));

    return { success: true };
  });

export const requestEdit = protectedProcedure
  .input(z.object({ buildingId: z.string(), message: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user?.role || ctx.user.role !== "superadmin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only admins can request edits",
      });
    }

    const building = await ctx.db.query.buildings.findFirst({
      where: eq(buildings.id, input.buildingId),
      columns: { status: true },
    });

    if (!building || building.status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending buildings can be requested for edit",
      });
    }

    await ctx.db.transaction(async (tx) => {
      await tx
        .update(buildings)
        .set({ status: "requested_for_edit" })
        .where(eq(buildings.id, input.buildingId));

      await tx.insert(buildingEditRequests).values({
        id: uuidv4(),
        buildingId: input.buildingId,
        message: input.message,
      });
    });

    return { success: true };
  });

export const reject = protectedProcedure
  .input(z.object({ buildingId: z.string(), message: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only admins can reject buildings",
      });
    }

    const building = await ctx.db.query.buildings.findFirst({
      where: eq(buildings.id, input.buildingId),
      columns: { status: true },
    });

    if (!building || building.status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending buildings can be rejected",
      });
    }

    await ctx.db
      .update(buildings)
      .set({ status: "rejected" })
      .where(eq(buildings.id, input.buildingId));

    await ctx.db.insert(buildingEditRequests).values({
      id: uuidv4(),
      buildingId: input.buildingId,
      message: input.message,
    });

    return { success: true };
  });

export const getStatusHistory = protectedProcedure
  .input(z.object({ buildingId: z.string() }))
  .query(async ({ ctx, input }) => {
    const history = await ctx.db
      .select()
      .from(buildingEditRequests)
      .where(eq(buildingEditRequests.buildingId, input.buildingId))
      .orderBy(desc(buildingEditRequests.requestedAt));

    return history;
  });
