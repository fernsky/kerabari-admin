import { sql } from "drizzle-orm";
import { stagingToProduction } from "../../db/schema";
import { syncBuildingSurvey } from "./building";

export async function syncStagingToProduction(
  formId: string,
  recordId: string,
  data: any,
  ctx: any,
) {
  try {
    switch (formId) {
      case "buddhashanti_building_survey":
        await syncBuildingSurvey(recordId, data, ctx);
        // Track staging to production sync
        await ctx.db.execute(sql`
        INSERT INTO ${stagingToProduction} (staging_table, production_table, record_id)
        VALUES ('staging_buddhashanti_buildings', 'buddhashanti_buildings', ${recordId})
      `);
        break;
      case "buddhashanti_business_survey":
        // TODO: Implement business survey sync
        break;
      default:
        throw new Error(`Unknown form type: ${formId}`);
    }
  } catch (error) {
    console.error(
      `Failed to sync record ${recordId} from staging to production:`,
      error,
    );
    throw error;
  }
}
