import { pgTable, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { business } from "./business";

export const businessPartners = pgTable("buddhashanti_business_partners", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").references(() => business.id),
  totalPartners: integer("total_partners"),
  nepaliMalePartners: integer("nepali_male_partners"),
  nepaliFemalePartners: integer("nepali_female_partners"),
  hasForeignPartners: boolean("has_foreign_partners"),
  foreignMalePartners: integer("foreign_male_partners"),
  foreignFemalePartners: integer("foreign_female_partners"),

  // Family members involved
  hasInvolvedFamily: boolean("has_involved_family"),
  totalInvolvedFamily: integer("total_involved_family"),
  maleInvolvedFamily: integer("male_involved_family"),
  femaleInvolvedFamily: integer("female_involved_family"),

  // Permanent employees
  hasPermanentEmployees: boolean("has_permanent_employees"),
  totalPermanentEmployees: integer("total_permanent_employees"),
  nepaliMalePermanent: integer("nepali_male_permanent"),
  nepaliFemalePermanent: integer("nepali_female_permanent"),
  foreignMalePermanent: integer("foreign_male_permanent"),
  foreignFemalePermanent: integer("foreign_female_permanent"),

  // Temporary employees
  hasTemporaryEmployees: boolean("has_temporary_employees"),
  totalTemporaryEmployees: integer("total_temporary_employees"),
  nepaliMaleTemporary: integer("nepali_male_temporary"),
  nepaliFemaleTemporary: integer("nepali_female_temporary"),
  foreignMaleTemporary: integer("foreign_male_temporary"),
  foreignFemaleTemporary: integer("foreign_female_temporary"),
});

export type BusinessPartner = typeof businessPartners.$inferSelect;
