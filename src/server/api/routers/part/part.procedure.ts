import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./part.input";
import * as services from "./part.service";

export const partRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listPartsSchema)
    .query(({ ctx, input }) => services.listParts(ctx, input)),

  get: protectedProcedure
    .input(inputs.getPartSchema)
    .query(({ ctx, input }) => services.getPart(ctx, input)),

  create: protectedProcedure
    .input(inputs.createPartSchema)
    .mutation(({ ctx, input }) => services.createPart(ctx, input)),

  update: protectedProcedure
    .input(inputs.updatePartSchema)
    .mutation(({ ctx, input }) => services.updatePart(ctx, input)),

  delete: protectedProcedure
    .input(inputs.deletePartSchema)
    .mutation(async ({ ctx, input }) => services.deletePart(ctx, input)),

  myParts: protectedProcedure
    .input(inputs.myPartsSchema)
    .query(({ ctx, input }) => services.myParts(ctx, input)),
});
