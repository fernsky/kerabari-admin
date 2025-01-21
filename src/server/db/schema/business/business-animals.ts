import { pgTable, uuid, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { business } from "./business";

export const stagingBusinessAnimals = pgTable(
  "staging_buddhashanti_business_animals",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    businessId: varchar("business_id", { length: 48 }),
    wardNo: integer("ward_no"),
    animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
    count: integer("count"),
    production: decimal("production", { precision: 10, scale: 2 }),
    sales: decimal("sales", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
);

export const businessAnimals = pgTable("buddhashanti_business_animals", {
  id: varchar("id", { length: 48 }).primaryKey(),
  businessId: varchar("business_id", { length: 48 }).references(
    () => business.id,
  ),
  wardNo: integer("ward_no"),
  animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
  count: integer("count"),
  production: decimal("production", { precision: 10, scale: 2 }),
  sales: decimal("sales", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
});

export type BusinessAnimal = typeof businessAnimals.$inferSelect;
export type StagingBusinessAnimal = typeof stagingBusinessAnimals.$inferSelect;
