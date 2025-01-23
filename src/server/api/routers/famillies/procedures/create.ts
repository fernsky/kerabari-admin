import { publicProcedure } from "@/server/api/trpc";
import { createFamilySchema } from "../families.schema";
import { family } from "@/server/db/schema/family/family";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const create = publicProcedure
  .input(createFamilySchema)
  .mutation(async ({ ctx, input }) => {
    const id = uuidv4();
    const {
      gps,
      altitude,
      gpsAccuracy,
      waterSource,
      waterPurificationMethods,
      facilities,
      loanedOrganizations,
      incomeSources,
      remittanceExpenses,
      ...restInput
    } = input;

    await ctx.db.insert(family).values({
      ...restInput,
      id,
      geom: sql`ST_GeomFromText(${gps})`,
      waterSource: Array.isArray(waterSource) ? waterSource : [waterSource],
      waterPurificationMethods: Array.isArray(waterPurificationMethods)
        ? waterPurificationMethods
        : [waterPurificationMethods],
      facilities: Array.isArray(facilities) ? facilities : [facilities],
      loanedOrganizations: Array.isArray(loanedOrganizations)
        ? loanedOrganizations
        : [loanedOrganizations],
      incomeSources: Array.isArray(incomeSources)
        ? incomeSources
        : [incomeSources],
      remittanceExpenses: Array.isArray(remittanceExpenses)
        ? remittanceExpenses
        : [remittanceExpenses],
    });

    return { id };
  });

