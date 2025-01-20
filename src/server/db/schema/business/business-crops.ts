import { pgTable, uuid, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { business, stagingBusiness } from "./business";

export const stagingBusinessCrops = pgTable(
  "staging_buddhashanti_business_crops",
  {
    id: uuid("id").primaryKey(),
    businessId: uuid("business_id").references(() => stagingBusiness.id),
    wardNo: integer("ward_no"),
    cropType: varchar("crop_type", { length: 100 }), // e.g., "fcrop", "pulse", "oseed", "vtable", "fruit", "spice", "ccrop"
    cropName: varchar("crop_name", { length: 255 }),

    // Land measurements
    area: decimal("area", { precision: 10, scale: 2 }),
    treesCount: integer("trees_count"), // For fruits/special crops

    // Production and sales
    production: decimal("production", { precision: 10, scale: 2 }),
    sales: decimal("sales", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
);

export const businessCrops = pgTable("buddhashanti_business_crops", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").references(() => business.id),
  wardNo: integer("ward_no"),
  cropType: varchar("crop_type", { length: 100 }), // e.g., "fcrop", "pulse", "oseed", "vtable", "fruit", "spice", "ccrop"
  cropName: varchar("crop_name", { length: 255 }),

  // Land measurements
  area: decimal("area", { precision: 10, scale: 2 }),
  treesCount: integer("trees_count"), // For fruits/special crops

  // Production and sales
  production: decimal("production", { precision: 10, scale: 2 }),
  sales: decimal("sales", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
});

export type BusinessCrop = typeof businessCrops.$inferSelect;
export type StagingBusinessCrop = typeof stagingBusinessCrops.$inferSelect;
