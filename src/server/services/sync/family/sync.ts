import { and, eq, sql } from "drizzle-orm";
import {
  areas,
  buildingTokens,
  stagingToProduction,
  users,
  wards,
} from "../../../db/schema";
import { family, stagingFamily } from "@/server/db/schema/family/family";
import {
  stagingBuddhashantiIndividual,
  buddhashantiIndividual,
} from "@/server/db/schema/family/individual";
import {
  stagingBuddhashantiDeath,
  buddhashantiDeath,
} from "@/server/db/schema/family/deaths";
import {
  stagingBuddhashantiCrop,
  buddhashantiCrop,
} from "@/server/db/schema/family/crops";
import {
  stagingBuddhashantiAnimal,
  buddhashantiAnimal,
} from "@/server/db/schema/family/animals";
import {
  stagingBuddhashantiAnimalProduct,
  buddhashantiAnimalProduct,
} from "@/server/db/schema/family/animal-products";

export async function syncFamilySurvey(recordId: string, data: any, ctx: any) {
  try {
    await performFamilySync(ctx, recordId);

    const wardNumber = data.id.ward_no;
    const areaCode = data.id.area_code;
    const buildingToken = data.enumerator_introduction.building_token;
    const enumeratorId = data.enumerator_introduction.enumerator_id;

    // Handle validations using existing helper functions
    try {
      const enumerator = await handleEnumerator(ctx, enumeratorId, recordId);
      await handleWardNumber(ctx, wardNumber, recordId);
      await handleAreaCode(ctx, areaCode, recordId);
      await handleBuildingToken(ctx, buildingToken, recordId);
      await updateAreaStatus(ctx, enumerator?.[0]?.id, areaCode);
    } catch (error) {
      console.error(`[Validation Error] Record ${recordId}:`, error);
    }
  } catch (error) {
    console.error(`[Sync Family Survey Error] Record ${recordId}:`, error);
  }
}

async function handleEnumerator(
  ctx: any,
  enumeratorId: string,
  recordId: string,
) {
  try {
    if (!enumeratorId) throw new Error("Enumerator ID is required");

    const enumerator = await ctx.db
      .select()
      .from(users)
      .where(
        eq(
          sql`UPPER(SUBSTRING(${users.id}::text, 1, 8))`,
          enumeratorId.substring(0, 8).toUpperCase(),
        ),
      )
      .limit(1);

    await ctx.db
      .update(family)
      .set({
        enumeratorId: enumerator.length > 0 ? enumerator[0].id : null,
        isEnumeratorValid: enumerator.length > 0,
      })
      .where(eq(family.id, recordId));

    return enumerator;
  } catch (error) {
    console.error(`[Enumerator Query Error] Record ${recordId}:`, error);
    throw error;
  }
}

async function handleWardNumber(
  ctx: any,
  wardNumber: number,
  familyId: string,
) {
  const ward = await ctx.db
    .select({ wardNumber: wards.wardNumber })
    .from(wards)
    .where(eq(wards.wardNumber, wardNumber))
    .limit(1);

  await ctx.db
    .update(family)
    .set({
      wardId: ward.length > 0 ? ward[0].wardNumber : null,
      isWardValid: ward.length > 0,
    })
    .where(eq(family.id, familyId));

  return ward;
}

async function handleAreaCode(ctx: any, areaCode: number, familyId: string) {
  try {
    if (!areaCode) throw new Error("Area code is required");

    const area = await ctx.db
      .select({ id: areas.id })
      .from(areas)
      .where(eq(areas.code, areaCode))
      .limit(1);

    await ctx.db
      .update(family)
      .set({
        areaId: area.length > 0 ? area[0].id : null,
        isAreaValid: area.length > 0,
      })
      .where(eq(family.id, familyId));

    return area;
  } catch (error) {
    console.error(`[Area Code Error] Family ${familyId}:`, error);
    throw error;
  }
}

async function updateAreaStatus(
  ctx: any,
  userId: string | undefined,
  areaCode: string,
) {
  if (!userId) return;

  const area = await ctx.db
    .select({
      code: areas.code,
      areaStatus: areas.areaStatus,
      assignedTo: areas.assignedTo,
    })
    .from(areas)
    .where(and(eq(areas.assignedTo, userId)))
    .limit(1);

  if (
    area.length > 0 &&
    area[0].code === areaCode &&
    area[0].areaStatus === "newly_assigned"
  ) {
    await ctx.db
      .update(areas)
      .set({ areaStatus: "ongoing_survey" })
      .where(eq(areas.code, parseInt(areaCode, 10)));
  }
}

async function handleBuildingToken(
  ctx: any,
  buildingToken: string,
  recordId: string,
) {
  try {
    if (!buildingToken) throw new Error("Building token is required");

    const validToken = await ctx.db
      .select()
      .from(buildingTokens)
      .where(
        eq(
          sql`UPPER(SUBSTRING(${buildingTokens.token}, 1, 8))`,
          buildingToken.substring(0, 8).toUpperCase(),
        ),
      )
      .limit(1);

    await ctx.db
      .update(family)
      .set({
        buildingToken: validToken.length > 0 ? validToken[0].token : null,
        isBuildingTokenValid: validToken.length > 0,
      })
      .where(eq(family.id, recordId));

    if (validToken.length > 0) {
      await ctx.db
        .update(buildingTokens)
        .set({ status: "allocated", token: buildingToken })
        .where(eq(buildingTokens.token, validToken[0].token));
    }
  } catch (error) {
    console.error(`[Building Token Error] Record ${recordId}:`, error);
    throw error;
  }
}

async function performFamilySync(ctx: any, recordId: string) {
  try {
    // Get staging data
    const familyData = await ctx.db
      .select()
      .from(stagingFamily)
      .where(eq(stagingFamily.id, recordId))
      .limit(1);

    if (!familyData.length) {
      throw new Error(`No staging record found for ID: ${recordId}`);
    }

    // Get related data
    const individuals = await ctx.db
      .select()
      .from(stagingBuddhashantiIndividual)
      .where(eq(stagingBuddhashantiIndividual.familyId, recordId));

    const deaths = await ctx.db
      .select()
      .from(stagingBuddhashantiDeath)
      .where(eq(stagingBuddhashantiDeath.familyId, recordId));

    const crops = await ctx.db
      .select()
      .from(stagingBuddhashantiCrop)
      .where(eq(stagingBuddhashantiCrop.familyId, recordId));

    const animals = await ctx.db
      .select()
      .from(stagingBuddhashantiAnimal)
      .where(eq(stagingBuddhashantiAnimal.familyId, recordId));

    const animalProducts = await ctx.db
      .select()
      .from(stagingBuddhashantiAnimalProduct)
      .where(eq(stagingBuddhashantiAnimalProduct.familyId, recordId));

    // Begin transaction
    await ctx.db.transaction(async (tx: any) => {
      // Insert family data
      await tx
        .insert(family)
        .values({
          id: familyData[0].id,

          // Enumerator Information
          enumeratorName: familyData[0].enumeratorName,
          enumeratorPhone: familyData[0].enumeratorPhone,

          // Location Details
          wardNo: familyData[0].wardNo,
          areaCode: familyData[0].areaCode,
          locality: familyData[0].locality,
          devOrg: familyData[0].devOrg,
          geom: familyData[0].gps,
          altitude: familyData[0].altitude,
          gpsAccuracy: familyData[0].gpsAccuracy,

          // Family Details
          headName: familyData[0].headName,
          headPhone: familyData[0].headPhone,
          totalMembers: familyData[0].totalMembers,
          isSanitized: familyData[0].isSanitized === "yes",

          // House Details
          houseOwnership: familyData[0].houseOwnership,
          houseOwnershipOther: familyData[0].houseOwnershipOther,
          feels_safe: familyData[0].feelsSafe,
          waterSource: familyData[0].waterSource,
          waterSourceOther: familyData[0].waterSourceOther,
          waterPurificationMethods: familyData[0].waterPurificationMethods,
          toiletType: familyData[0].toiletType,
          solidWaste: familyData[0].solidWaste,
          solidWasteOther: familyData[0].solidWasteOther,

          // Energy and Facilities
          primaryCookingFuel: familyData[0].primaryCookingFuel,
          primaryEnergySource: familyData[0].primaryEnergySource,
          primaryEnergySourceOther: familyData[0].primaryEnergySourceOther,
          facilities: familyData[0].facilities,

          // Economic Details
          femaleProperties: familyData[0].femaleProperties,
          loanedOrganizations: familyData[0].loanedOrganizations,
          loanUse: familyData[0].loanUse,
          hasBank: familyData[0].hasBank,
          hasInsurance: familyData[0].hasInsurance,
          healthOrg: familyData[0].healthOrg,
          healthOrgOther: familyData[0].healthOrgOther,
          incomeSources: familyData[0].incomeSources,
          municipalSuggestions: familyData[0].municipalSuggestions,
          municipalSuggestionsOther: familyData[0].municipalSuggestionsOther,

          // Additional Data
          hasRemittance: familyData[0].hasRemittance,
          remittanceExpenses: familyData[0].remittanceExpenses,

          tmpAreaCode: familyData[0].areaCode,
          tmpWardNumber: familyData[0].wardNo,
          tmpEnumeratorId: familyData[0].enumeratorId,
          tmpBuildingToken: familyData[0].buildingToken,

          // Status
          status: "pending",
        })
        .onConflictDoNothing();

      // Insert individuals
      if (individuals.length > 0) {
        await tx
          .insert(buddhashantiIndividual)
          .values(individuals)
          .onConflictDoNothing();
      }

      // Insert deaths
      if (deaths.length > 0) {
        await tx.insert(buddhashantiDeath).values(deaths).onConflictDoNothing();
      }

      // Insert crops
      if (crops.length > 0) {
        await tx.insert(buddhashantiCrop).values(crops).onConflictDoNothing();
      }

      // Insert animals
      if (animals.length > 0) {
        await tx
          .insert(buddhashantiAnimal)
          .values(animals)
          .onConflictDoNothing();
      }

      // Insert animal products
      if (animalProducts.length > 0) {
        await tx
          .insert(buddhashantiAnimalProduct)
          .values(animalProducts)
          .onConflictDoNothing();
      }

      // Track the sync operation
      await tx
        .insert(stagingToProduction)
        .values({
          staging_table: "staging_buddhashanti_family",
          production_table: "buddhashanti_family",
          recordId: recordId,
        })
        .onConflictDoNothing();
    });
  } catch (error) {
    console.error(`Error syncing family ${recordId}:`, error);
    throw error;
  }
}
