import { and, eq, sql } from "drizzle-orm";
import { areas, buildings, buildingTokens, users } from "../../../db/schema";

export async function syncBuildingSurvey(
  recordId: string,
  data: any,
  ctx: any,
) {
  const areaCode = data.area_code;
  const buildingToken = data.building_token;
  const enumeratorId = data.enumerator_id;

  if (!enumeratorId) {
    throw new Error(`No enumerator_id found for record ${recordId}`);
  }

  // Find enumerator
  const enumerator = await findEnumerator(ctx, enumeratorId);

  // Update area status if needed
  await updateAreaStatus(ctx, enumerator?.[0]?.id, areaCode);

  // Handle building token allocation
  await handleBuildingToken(ctx, buildingToken);

  // Perform main building sync
  await performBuildingSync(ctx, recordId);

  // Update building with area and token info
  await updateBuildingMetadata(ctx, recordId, {
    enumeratorId: enumerator?.[0]?.id,
    areaCode,
    buildingToken,
  });
}

async function findEnumerator(ctx: any, enumeratorId: string) {
  return await ctx.db
    .select()
    .from(users)
    .where(
      eq(
        sql`UPPER(SUBSTRING(${users.id}::text, 1, 8))`,
        enumeratorId.substring(0, 8).toUpperCase(),
      ),
    )
    .limit(1);
}

async function updateAreaStatus(
  ctx: any,
  userId: string | undefined,
  areaCode: string,
) {
  if (!userId) return;

  const area = await ctx.db
    .select()
    .from(areas)
    .where(and(eq(areas.assignedTo, userId)))
    .limit(1);

  if (
    area.length > 0 &&
    area[0].code === areaCode &&
    area[0].status === "newly_assigned"
  ) {
    await ctx.db
      .update(areas)
      .set({ status: "ongoing_survey" })
      .where(eq(areas.code, parseInt(areaCode, 10)));
  }
}

async function handleBuildingToken(ctx: any, buildingToken: string) {
  const matchedToken = await ctx.db
    .select()
    .from(buildingTokens)
    .where(
      eq(
        sql`UPPER(SUBSTRING(${buildingTokens.token}, 1, 8))`,
        buildingToken.substring(0, 8).toUpperCase(),
      ),
    )
    .limit(1);

  if (matchedToken.length > 0) {
    await ctx.db
      .update(buildingTokens)
      .set({
        status: "allocated",
        token: buildingToken,
      })
      .where(eq(buildingTokens.token, matchedToken[0].token));
  }
}

async function performBuildingSync(ctx: any, recordId: string) {
  const insertStatement = sql.raw(`
        INSERT INTO buddhashanti_buildings (
            id,
            survey_date,
            enumerator_name,
            enumerator_id,
            area_code,
            ward_number,
            locality,
            total_families, 
            total_businesses,
            survey_audio_recording,
            gps,
            altitude,
            gps_accuracy,
            building_image,
            enumerator_selfie,
            land_ownership,
            base,
            outer_wall,
            roof,
            floor,
            map_status,
            natural_disasters,
            time_to_market,
            time_to_active_road,
            time_to_public_bus,
            time_to_health_organization,
            time_to_financial_organization,
            road_status
        )
        SELECT 
            id::UUID,
            survey_date,
            enumerator_name,
            enumerator_id,
            area_code,
            ward_number,
            locality,
            total_families,
            total_businesses,
            survey_audio_recording,
            gps,
            altitude,
            gps_accuracy,
            building_image,
            enumerator_selfie,
            land_ownership,
            base,
            outer_wall,
            roof,
            floor,
            map_status,
            natural_disasters,
            time_to_market,
            time_to_active_road,
            time_to_public_bus,
            time_to_health_organization,
            time_to_financial_organization,
            road_status
        FROM staging_buddhashanti_buildings 
        WHERE id = '${recordId.replace("uuid:", "")}'
        ON CONFLICT (id) DO NOTHING`);

  await ctx.db.execute(insertStatement);
}

async function updateBuildingMetadata(
  ctx: any,
  recordId: string,
  {
    enumeratorId,
    areaCode,
    buildingToken,
  }: {
    enumeratorId?: string;
    areaCode: string;
    buildingToken: string;
  },
) {
  const area = await ctx.db
    .select()
    .from(areas)
    .where(eq(areas.code, parseInt(areaCode, 10)))
    .limit(1);

  if (area.length > 0) {
    await ctx.db
      .update(buildings)
      .set({ areaId: area[0].id })
      .where(eq(buildings.id, recordId.replace("uuid:", "")));

    const validToken = await ctx.db
      .select()
      .from(buildingTokens)
      .where(
        and(
          eq(buildingTokens.areaId, area[0].id),
          eq(
            sql`UPPER(SUBSTRING(${buildingTokens.token}, 1, 8))`,
            buildingToken.substring(0, 8).toUpperCase(),
          ),
        ),
      )
      .limit(1);

    if (validToken.length > 0) {
      await ctx.db
        .update(buildings)
        .set({ buildingToken: validToken[0].token })
        .where(eq(buildings.id, recordId.replace("uuid:", "")));
    } else {
      await ctx.db
        .update(buildings)
        .set({ buildingToken: "none" })
        .where(eq(buildings.id, recordId.replace("uuid:", "")));
    }
  }

  if (enumeratorId) {
    await ctx.db
      .update(buildings)
      .set({ userId: enumeratorId })
      .where(eq(buildings.id, recordId.replace("uuid:", "")));
  }
}
