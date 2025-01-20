import { pgTable, uuid, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { business } from "./business";

export const businessCrops = pgTable("buddhashanti_business_crops", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").references(() => business.id),
  wardNo: integer("ward_no"),
  cropType: varchar("crop_type", { length: 100 }), // e.g., "fcrop", "pulse", "oseed", "vtable", "fruit", "spice", "ccrop"
  cropName: varchar("crop_name", { length: 255 }),

  // Land measurements
  bigha: decimal("bigha", { precision: 10, scale: 2 }),
  kattha: decimal("kattha", { precision: 10, scale: 2 }),
  dhur: decimal("dhur", { precision: 10, scale: 2 }),
  area: decimal("area", { precision: 10, scale: 2 }),
  treesCount: integer("trees_count"), // For fruits/special crops

  // Production and sales
  production: decimal("production", { precision: 10, scale: 2 }),
  sales: decimal("sales", { precision: 10, scale: 2 }),
});

export type BusinessCrop = typeof businessCrops.$inferSelect;
