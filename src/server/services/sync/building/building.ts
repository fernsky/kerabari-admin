import { parseBuilding } from "@/lib/parser/buddhashanti/parse-buildings";
import { stagingToProduction } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { syncBuildingSurvey } from "./sync";

export const handleBuildingFlow = async (buildingSubmission: any, ctx: any) => {
  // First regardless of the status, store it in the staging database
  // Generate and execute any form-specific database operations
  const insertStatement = parseBuilding(buildingSubmission);
  console.log(insertStatement);
  if (insertStatement) {
    await ctx.db.execute(sql.raw(insertStatement));
  }

  const productionInsert = await ctx.db
    .select()
    .from(stagingToProduction)
    .where(eq(stagingToProduction.recordId, buildingSubmission.__id))
    .limit(1);

  if (productionInsert.length === 0) {
    await syncBuildingSurvey(buildingSubmission.__id, buildingSubmission, ctx);
  }
};
