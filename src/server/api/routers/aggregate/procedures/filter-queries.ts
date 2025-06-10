import { publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { kerabariAggregateBuilding } from "@/server/db/schema/aggregate-building";

export const getDistinctWardNumbers = publicProcedure.query(async ({ ctx }) => {
  const results = await ctx.db
    .selectDistinct({
      wardNumber: kerabariAggregateBuilding.ward_number,
    })
    .from(kerabariAggregateBuilding)
    .where(sql`${kerabariAggregateBuilding.ward_number} IS NOT NULL`)
    .orderBy(kerabariAggregateBuilding.ward_number);

  return results
    .filter(({ wardNumber }) => wardNumber !== null)
    .map(({ wardNumber }) => ({
      id: wardNumber!.toString(),
      wardNumber: wardNumber!,
    }));
});

export const getDistinctAreaCodes = publicProcedure.query(async ({ ctx }) => {
  const results = await ctx.db
    .selectDistinct({
      areaCode: kerabariAggregateBuilding.area_code,
    })
    .from(kerabariAggregateBuilding)
    .where(sql`${kerabariAggregateBuilding.area_code} IS NOT NULL`)
    .orderBy(kerabariAggregateBuilding.area_code);

  return results
    .filter(({ areaCode }) => areaCode !== null)
    .map(({ areaCode }) => ({
      id: areaCode!.toString(),
      areaCode: areaCode!,
    }));
});

export const getDistinctEnumerators = publicProcedure.query(async ({ ctx }) => {
  const results = await ctx.db
    .selectDistinct({
      enumeratorId: kerabariAggregateBuilding.enumerator_id,
      enumeratorName: kerabariAggregateBuilding.enumerator_name,
    })
    .from(kerabariAggregateBuilding)
    .where(sql`${kerabariAggregateBuilding.enumerator_id} IS NOT NULL`)
    .orderBy(kerabariAggregateBuilding.enumerator_name);

  return results
    .filter(({ enumeratorId }) => enumeratorId !== null)
    .map(({ enumeratorId, enumeratorName }) => ({
      id: enumeratorId!,
      name: enumeratorName || "Unknown Enumerator",
    }));
});

export const getDistinctMapStatuses = publicProcedure.query(async ({ ctx }) => {
  const results = await ctx.db
    .selectDistinct({
      mapStatus: kerabariAggregateBuilding.map_status,
    })
    .from(kerabariAggregateBuilding)
    .where(sql`${kerabariAggregateBuilding.map_status} IS NOT NULL`)
    .orderBy(kerabariAggregateBuilding.map_status);

  return results
    .filter(({ mapStatus }) => mapStatus !== null)
    .map(({ mapStatus }) => ({
      id: mapStatus!,
      name: mapStatus!,
    }));
});

export const getDistinctBuildingOwnerships = publicProcedure.query(
  async ({ ctx }) => {
    const results = await ctx.db
      .selectDistinct({
        buildingOwnership: kerabariAggregateBuilding.building_ownership_status,
      })
      .from(kerabariAggregateBuilding)
      .where(
        sql`${kerabariAggregateBuilding.building_ownership_status} IS NOT NULL`,
      )
      .orderBy(kerabariAggregateBuilding.building_ownership_status);

    return results
      .filter(({ buildingOwnership }) => buildingOwnership !== null)
      .map(({ buildingOwnership }) => ({
        id: buildingOwnership!,
        name: buildingOwnership!.replace(/_/g, " "),
      }));
  },
);

export const getDistinctBuildingBases = publicProcedure.query(
  async ({ ctx }) => {
    const results = await ctx.db
      .selectDistinct({
        buildingBase: kerabariAggregateBuilding.building_base,
      })
      .from(kerabariAggregateBuilding)
      .where(sql`${kerabariAggregateBuilding.building_base} IS NOT NULL`)
      .orderBy(kerabariAggregateBuilding.building_base);

    return results
      .filter(({ buildingBase }) => buildingBase !== null)
      .map(({ buildingBase }) => ({
        id: buildingBase!,
        name: buildingBase!.replace(/_/g, " "),
      }));
  },
);
