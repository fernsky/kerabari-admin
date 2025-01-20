import { pgTable, uuid, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { business } from "./business";

export const businessAnimals = pgTable(
  "buddhashanti_business_animal_products",
  {
    id: uuid("id").primaryKey(),
    businessId: uuid("business_id").references(() => business.id),
    wardNo: integer("ward_no"),
    animalProduct: varchar("animal_product", { length: 100 }),
    unit: varchar("unit", { length: 255 }),
    production: decimal("production", { precision: 10, scale: 2 }),
    sales: decimal("sales", { precision: 10, scale: 2 }),
    revenue: decimal("revenue", { precision: 10, scale: 2 }),
  },
);

export type BusinessAnimal = typeof businessAnimals.$inferSelect;
