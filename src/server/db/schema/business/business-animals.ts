import { pgTable, uuid, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { business, stagingBusiness } from "./business";

export const stagingBusinessAnimals = pgTable(
  "staging_buddhashanti_business_animals",
  {
    id: uuid("id").primaryKey(),
    businessId: uuid("business_id").references(() => stagingBusiness.id),
    wardNo: integer("ward_no"),
    animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
    count: integer("count"),
    production: decimal("production", { precision: 10, scale: 2 }),
    sales: decimal("sales", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
);

export const businessAnimals = pgTable("buddhashanti_business_animals", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").references(() => business.id),
  wardNo: integer("ward_no"),
  animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
  count: integer("count"),
  production: decimal("production", { precision: 10, scale: 2 }),
  sales: decimal("sales", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
});

export type BusinessAnimal = typeof businessAnimals.$inferSelect;
export type StagingBusinessAnimal = typeof stagingBusinessAnimals.$inferSelect;
