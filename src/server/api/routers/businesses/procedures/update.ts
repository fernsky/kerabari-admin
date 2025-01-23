// import { publicProcedure } from "@/server/api/trpc";
// import { updateBusinessSchema } from "../business.schema";
// import { business, businessEditRequests } from "@/server/db/schema/business/business";
// import { buildingTokens } from "@/server/db/schema/building";
// import { and, eq, sql } from "drizzle-orm";
// import { z } from "zod";
// import { TRPCError } from "@trpc/server";

// export const update = publicProcedure
//   .input(z.object({ id: z.string(), data: updateBusinessSchema }))
//   .mutation(async ({ ctx, input }) => {
//     const { id, data } = input;

//     // Prevent setting building token without area ID
//     if (data.buildingToken && !data.areaId) {
//       throw new TRPCError({
//         code: "BAD_REQUEST",
//         message: "Cannot set building token without a valid area ID",
//       });
//     }

//     // If buildingToken is being updated, validate it belongs to the area
//     if (data.buildingToken && data.areaId) {
//       const validToken = await ctx.db
//         .select()
//         .from(buildingTokens)
//         .where(
//           and(
//             eq(buildingTokens.areaId, data.areaId),
//             eq(buildingTokens.token, data.buildingToken),
//           ),
//         )
//         .limit(1);

//       if (validToken.length === 0) {
//         throw new TRPCError({
//           code: "BAD_REQUEST",
//           message: `Building token ${data.buildingToken} does not belong to area ${data.areaId}`,
//         });
//       }
//     }

//     const { gps, registeredBodies, ...restData } = data;
//     const transformedData = {
//       ...restData,
//       gps: gps ? sql`ST_GeomFromText(${gps})` : undefined,
//       registeredBodies: registeredBodies
//         ? Array.isArray(registeredBodies)
//           ? registeredBodies
//           : [registeredBodies]
//         : undefined,
//     };

//     await ctx.db
//       .update(business)
//       .set(transformedData)
//       .where(eq(business.id, id));

//     return { success: true };
//   });

// export const deleteBusiness = publicProcedure
//   .input(z.object({ id: z.string() }))
//   .mutation(async ({ ctx, input }) => {
//     // First delete any edit requests for this business
//     await ctx.db
//       .delete(businessEditRequests)
//       .where(eq(businessEditRequests.businessId, input.id));

//     // Then delete the business
//     await ctx.db
//       .delete(business)
//       .where(eq(business.id, input.id));

//     return { success: true };
//   });
