import {
  pgTable,
  varchar,
  integer,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { business } from "./business";

export const stagingBusinessAnimals = pgTable(
  "staging_buddhashanti_business_animals",
  {
    businessId: varchar("business_id", { length: 48 }),
    wardNo: integer("ward_no"),
    animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
    animalName: varchar("animal_name", { length: 255 }),
    totalCount: integer("total_count"),
    salesCount: integer("sales_count"),
    production: decimal("production", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
  (t) => ({
    pk: primaryKey(t.businessId, t.animalName),
  }),
);

export const businessAnimals = pgTable(
  "buddhashanti_business_animals",
  {
    businessId: varchar("business_id", { length: 48 }).references(
      () => business.id,
    ),
    wardNo: integer("ward_no"),
    animalType: varchar("animal_type", { length: 100 }), // e.g., "cattle", "poultry", "fish"
    animalName: varchar("animal_name", { length: 255 }),
    totalCount: integer("total_count"),
    salesCount: integer("sales_count"),
    production: decimal("production", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
  (t) => ({
    pk: primaryKey(t.businessId, t.animalName),
  }),
);

export type BusinessAnimal = typeof businessAnimals.$inferSelect;
export type StagingBusinessAnimal = typeof stagingBusinessAnimals.$inferSelect;
