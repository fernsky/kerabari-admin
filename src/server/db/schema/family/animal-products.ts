import { pgTable, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { geometry } from "../../geographical";

const buddhashantiAnimalProduct = pgTable("buddhashanti_animal_product", {
  id: varchar("id", { length: 48 }).primaryKey().notNull(),
  parentId: varchar("parent_id", { length: 48 }).notNull(),
  wardNo: integer("ward_no").notNull(),
  tenantId: varchar("tenant_id", { length: 48 }).default("buddhashanti"),
  deviceId: varchar("device_id", { length: 48 }).notNull(),
  animalProductName: varchar("animal_product_name", { length: 100 }),
  animalProductNameOther: varchar("animal_product_name_other", { length: 100 }),
  animalProductUnit: varchar("animal_product_unit", { length: 100 }),
  animalProductUnitOther: varchar("animal_product_unit_other", { length: 100 }),
  animalProductSales: decimal("animal_product_sales", {
    precision: 10,
    scale: 2,
  }),
  animalProductProduction: decimal("animal_product_production", {
    precision: 10,
    scale: 2,
  }),
  animalProductProductionMonths: integer("animal_product_production_months"),
  animalProductRevenue: decimal("animal_product_revenue", {
    precision: 10,
    scale: 2,
  }),
  geom: geometry("geom", { type: "Point" }),
});

export default buddhashantiAnimalProduct;
