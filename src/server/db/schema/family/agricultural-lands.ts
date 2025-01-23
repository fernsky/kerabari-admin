import { pgTable, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { geometry } from "../../geographical";

const buddhashantiAgriculturalLand = pgTable("buddhashanti_agricultural_land", {
  id: varchar("id", { length: 48 }).primaryKey().notNull(),
  parentId: varchar("parent_id", { length: 48 }).notNull(),
  wardNo: integer("ward_no").notNull(),
  tenantId: varchar("tenant_id", { length: 48 }).default("buddhashanti"),
  deviceId: varchar("device_id", { length: 48 }).notNull(),
  landOwnershipType: varchar("land_ownership_type", { length: 100 }),
  landArea: decimal("land_area", { precision: 10, scale: 2 }),
  isLandIrrigated: varchar("is_land_irrigated", { length: 100 }),
  irrigatedLandArea: decimal("irrigated_land_area", {
    precision: 10,
    scale: 2,
  }),
  irrigationSource: varchar("irrigation_source", { length: 100 }),
  geom: geometry("geom", { type: "Point" }),
});

export default buddhashantiAgriculturalLand;
