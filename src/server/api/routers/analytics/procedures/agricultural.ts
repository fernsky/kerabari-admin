import { sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { and, count, eq } from "drizzle-orm";
import kerabariAgriculturalLand from "@/server/db/schema/family/agricultural-lands";
import { kerabariCrop } from "@/server/db/schema/family/crops";
import { kerabariAnimal } from "@/server/db/schema/family/animals";
import { kerabariAnimalProduct } from "@/server/db/schema/family/animal-products";

export const getAgriculturalLandStats = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        ownershipType: kerabariAgriculturalLand.landOwnershipType,
        totalArea: sql<number>`sum(${kerabariAgriculturalLand.landArea})::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(kerabariAgriculturalLand);

    if (input.wardNumber) {
      query.where(eq(kerabariAgriculturalLand.wardNo, input.wardNumber));
    }

    return await query.groupBy(kerabariAgriculturalLand.landOwnershipType);
  });

export const getIrrigationStats = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        isIrrigated: kerabariAgriculturalLand.isLandIrrigated,
        totalArea: sql<number>`sum(${kerabariAgriculturalLand.irrigatedLandArea})::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(kerabariAgriculturalLand);

    if (input.wardNumber) {
      query.where(eq(kerabariAgriculturalLand.wardNo, input.wardNumber));
    }

    return await query.groupBy(kerabariAgriculturalLand.isLandIrrigated);
  });

export const getCropStats = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        cropType: kerabariCrop.cropType,
        cropName: kerabariCrop.cropName,
        totalArea: sql<number>`sum(${kerabariCrop.cropArea})::float`,
        totalProduction: sql<number>`sum(${kerabariCrop.cropProduction})::float`,
        totalRevenue: sql<number>`sum(${kerabariCrop.cropRevenue})::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(kerabariCrop);

    if (input.wardNumber) {
      query.where(eq(kerabariCrop.wardNo, input.wardNumber));
    }

    return await query.groupBy(kerabariCrop.cropType, kerabariCrop.cropName);
  });

export const getAnimalStats = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        animalName: kerabariAnimal.animalName,
        totalCount: sql<number>`sum(${kerabariAnimal.totalAnimals})::int`,
        totalSales: sql<number>`sum(${kerabariAnimal.animalSales})::float`,
        totalRevenue: sql<number>`sum(${kerabariAnimal.animalRevenue})::float`,
        householdCount: sql<number>`count(*)::int`,
      })
      .from(kerabariAnimal);

    if (input.wardNumber) {
      query.where(eq(kerabariAnimal.wardNo, input.wardNumber));
    }

    return await query.groupBy(kerabariAnimal.animalName);
  });

export const getAnimalProductStats = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        productName: kerabariAnimalProduct.animalProductName,
        unit: kerabariAnimalProduct.animalProductUnit,
        totalProduction: sql<number>`sum(${kerabariAnimalProduct.animalProductProduction})::float`,
        totalSales: sql<number>`sum(${kerabariAnimalProduct.animalProductSales})::float`,
        totalRevenue: sql<number>`sum(${kerabariAnimalProduct.animalProductRevenue})::float`,
        householdCount: sql<number>`count(*)::int`,
      })
      .from(kerabariAnimalProduct);

    if (input.wardNumber) {
      query.where(eq(kerabariAnimalProduct.wardNo, input.wardNumber));
    }

    return await query.groupBy(
      kerabariAnimalProduct.animalProductName,
      kerabariAnimalProduct.animalProductUnit
    );
  });

export const getAgriculturalLandOverview = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .select({
        totalLandArea: sql<number>`sum(${kerabariAgriculturalLand.landArea})::float`,
        totalIrrigatedArea: sql<number>`sum(${kerabariAgriculturalLand.irrigatedLandArea})::float`,
        householdCount: sql<number>`count(distinct ${kerabariAgriculturalLand.familyId})::int`,
      })
      .from(kerabariAgriculturalLand);

    if (input.wardNumber) {
      query.where(eq(kerabariAgriculturalLand.wardNo, input.wardNumber));
    }

    return (await query)[0];
  });

export const getAgricultureOverview = publicProcedure
  .input(z.object({ wardNumber: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const baseWhere = input.wardNumber
      ? sql`ward_no = ${input.wardNumber}`
      : sql`1=1`;

    const [crops, animals, products] = await Promise.all([
      ctx.db.execute(sql`
        SELECT 
          COUNT(DISTINCT family_id)::int as total_households,
          SUM(crop_revenue)::float as total_revenue,
          SUM(crop_area)::float as total_area
        FROM ${kerabariCrop}
        WHERE ${baseWhere}
      `),
      ctx.db.execute(sql`
        SELECT 
          COUNT(DISTINCT family_id)::int as total_households,
          SUM(animal_revenue)::float as total_revenue,
          SUM(total_animals)::int as total_count
        FROM ${kerabariAnimal}
        WHERE ${baseWhere}
      `),
      ctx.db.execute(sql`
        SELECT 
          COUNT(DISTINCT family_id)::int as total_households,
          SUM(animal_product_revenue)::float as total_revenue
        FROM ${kerabariAnimalProduct}
        WHERE ${baseWhere}
      `),
    ]);

    return {
      crops: crops[0],
      animals: animals[0],
      animalProducts: products[0],
    };
  });
