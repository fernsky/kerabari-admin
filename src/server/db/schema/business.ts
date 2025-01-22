import {
  pgTable,
  timestamp,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

export const stagingBusiness = pgTable("staging_buddhashanti_business", {
  id: varchar("id", { length: 48 }).primaryKey(),
  // Enumerator Information
  enumeratorName: varchar("enumerator_name", { length: 255 }),
  enumeratorId: varchar("enumerator_id", { length: 48 }),
  phone: varchar("phone", { length: 20 }),
  buildingToken: varchar("building_token", { length: 48 }),

  // Business Basic Information
  businessName: varchar("business_name", { length: 255 }),
  wardNo: integer("ward_no"),
  areaCode: integer("area_code"),
  businessNo: varchar("business_no", { length: 48 }),
  locality: varchar("locality", { length: 255 }),

  // Operator Details
  operatorName: varchar("operator_name", { length: 255 }),
  operatorPhone: varchar("operator_phone", { length: 20 }),
  operatorAge: integer("operator_age"),
  operatorGender: varchar("operator_gender", { length: 20 }),
  operatorEducation: varchar("operator_education", { length: 100 }),

  // Business Classification
  businessNature: varchar("business_nature", { length: 100 }),
  businessNatureOther: varchar("business_nature_other", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  businessTypeOther: varchar("business_type_other", { length: 255 }),

  // Registration and Legal Information
  registrationStatus: boolean("registration_status"),
  registeredBodies: varchar("registered_bodies", { length: 255 }),
  registeredBodiesOther: varchar("registered_bodies_other", { length: 255 }),
  statutoryStatus: varchar("statutory_status", { length: 100 }),
  statutoryStatusOther: varchar("statutory_status_other", { length: 255 }),
  panStatus: boolean("pan_status"),
  panNumber: varchar("pan_number", { length: 50 }),

  // Location Data
  gps: varchar("gps", { length: 100 }),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  gpsAccuracy: decimal("gps_accuracy", { precision: 10, scale: 2 }),

  // Financial and Property Information
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }),
  businessLocationOwnership: varchar("business_location_ownership", {
    length: 100,
  }),
  businessLocationOwnershipOther: varchar("business_location_ownership_other", {
    length: 255,
  }),

  // Employee Information
  hasPartners: boolean("has_partners"),
  totalPartners: integer("total_partners"),
  nepaliMalePartners: integer("nepali_male_partners"),
  nepaliFemalePartners: integer("nepali_female_partners"),
  hasForeignPartners: boolean("has_foreign_partners"),
  foreignMalePartners: integer("foreign_male_partners"),
  foreignFemalePartners: integer("foreign_female_partners"),

  hasInvolvedFamily: boolean("has_involved_family"),
  totalInvolvedFamily: integer("total_involved_family"),
  maleInvolvedFamily: integer("male_involved_family"),
  femaleInvolvedFamily: integer("female_involved_family"),

  hasPermanentEmployees: boolean("has_permanent_employees"),
  totalPermanentEmployees: integer("total_permanent_employees"),
  nepaliMalePermanentEmployees: integer("nepali_male_permanent_employees"),
  nepaliFemalePermanentEmployees: integer("nepali_female_permanent_employees"),
  hasForeignPermanentEmployees: boolean("has_foreign_permanent_employees"),
  foreignMalePermanentEmployees: integer("foreign_male_permanent_employees"),
  foreignFemalePermanentEmployees: integer(
    "foreign_female_permanent_employees",
  ),

  hasTemporaryEmployees: boolean("has_temporary_employees"),
  totalTemporaryEmployees: integer("total_temporary_employees"),
  nepaliMaleTemporaryEmployees: integer("nepali_male_temporary_employees"),
  nepaliFemaleTemporaryEmployees: integer("nepali_female_temporary_employees"),
  hasForeignTemporaryEmployees: boolean("has_foreign_temporary_employees"),
  foreignMaleTemporaryEmployees: integer("foreign_male_temporary_employees"),
  foreignFemaleTemporaryEmployees: integer(
    "foreign_female_temporary_employees",
  ),

  // Aquaculture Information
  aquacultureWardNo: integer("aquaculture_ward_no"),
  pondCount: integer("pond_count"),
  pondArea: decimal("pond_area", { precision: 10, scale: 2 }),
  fishProduction: decimal("fish_production", { precision: 10, scale: 2 }),
  fingerlingNumber: integer("fingerling_number"),
  totalInvestment: decimal("total_investment", { precision: 10, scale: 2 }),
  annualIncome: decimal("annual_income", { precision: 10, scale: 2 }),
  employmentCount: integer("employment_count"),

  // Apiculture Information
  apicultureWardNo: integer("apiculture_ward_no"),
  hiveCount: integer("hive_count"),
  honeyProduction: decimal("honey_production", { precision: 10, scale: 2 }),
  hasApiculture: boolean("has_apiculture"),
});

export const businessStatusEnum = pgEnum("business_status_enum", [
  "approved",
  "pending",
  "requested_for_edit",
  "rejected",
]);

export const business = pgTable("buddhashanti_business", {
  id: varchar("id", { length: 48 }).primaryKey(),
  // Enumerator Information
  enumeratorName: varchar("enumerator_name", { length: 255 }),
  enumeratorId: varchar("enumerator_id", { length: 48 }),
  phone: varchar("phone", { length: 20 }),
  buildingToken: varchar("building_token", { length: 48 }),

  // Business Basic Information
  businessName: varchar("business_name", { length: 255 }),
  wardNo: integer("ward_no"),
  areaCode: integer("area_code"),
  businessNo: varchar("business_no", { length: 48 }),
  locality: varchar("locality", { length: 255 }),

  // Operator Details
  operatorName: varchar("operator_name", { length: 255 }),
  operatorPhone: varchar("operator_phone", { length: 20 }),
  operatorAge: integer("operator_age"),
  operatorGender: varchar("operator_gender", { length: 20 }),
  operatorEducation: varchar("operator_education", { length: 100 }),

  // Business Classification
  businessNature: varchar("business_nature", { length: 100 }),
  businessNatureOther: varchar("business_nature_other", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  businessTypeOther: varchar("business_type_other", { length: 255 }),

  // Registration and Legal Information
  registrationStatus: boolean("registration_status"),
  registeredBodies: varchar("registered_bodies", { length: 255 }),
  registeredBodiesOther: varchar("registered_bodies_other", { length: 255 }),
  statutoryStatus: varchar("statutory_status", { length: 100 }),
  statutoryStatusOther: varchar("statutory_status_other", { length: 255 }),
  panStatus: boolean("pan_status"),
  panNumber: varchar("pan_number", { length: 50 }),

  // Location Data
  gps: varchar("gps", { length: 100 }),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  gpsAccuracy: decimal("gps_accuracy", { precision: 10, scale: 2 }),

  // Financial and Property Information
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }),
  businessLocationOwnership: varchar("business_location_ownership", {
    length: 100,
  }),
  businessLocationOwnershipOther: varchar("business_location_ownership_other", {
    length: 255,
  }),

  // Employee Information
  hasPartners: boolean("has_partners"),
  totalPartners: integer("total_partners"),
  nepaliMalePartners: integer("nepali_male_partners"),
  nepaliFemalePartners: integer("nepali_female_partners"),
  hasForeignPartners: boolean("has_foreign_partners"),
  foreignMalePartners: integer("foreign_male_partners"),
  foreignFemalePartners: integer("foreign_female_partners"),

  hasInvolvedFamily: boolean("has_involved_family"),
  totalInvolvedFamily: integer("total_involved_family"),
  maleInvolvedFamily: integer("male_involved_family"),
  femaleInvolvedFamily: integer("female_involved_family"),

  hasPermanentEmployees: boolean("has_permanent_employees"),
  totalPermanentEmployees: integer("total_permanent_employees"),
  nepaliMalePermanentEmployees: integer("nepali_male_permanent_employees"),
  nepaliFemalePermanentEmployees: integer("nepali_female_permanent_employees"),
  hasForeignPermanentEmployees: boolean("has_foreign_permanent_employees"),
  foreignMalePermanentEmployees: integer("foreign_male_permanent_employees"),
  foreignFemalePermanentEmployees: integer(
    "foreign_female_permanent_employees",
  ),

  hasTemporaryEmployees: boolean("has_temporary_employees"),
  totalTemporaryEmployees: integer("total_temporary_employees"),
  nepaliMaleTemporaryEmployees: integer("nepali_male_temporary_employees"),
  nepaliFemaleTemporaryEmployees: integer("nepali_female_temporary_employees"),
  hasForeignTemporaryEmployees: boolean("has_foreign_temporary_employees"),
  foreignMaleTemporaryEmployees: integer("foreign_male_temporary_employees"),
  foreignFemaleTemporaryEmployees: integer(
    "foreign_female_temporary_employees",
  ),

  // Aquaculture Information
  aquacultureWardNo: integer("aquaculture_ward_no"),
  pondCount: integer("pond_count"),
  pondArea: decimal("pond_area", { precision: 10, scale: 2 }),
  fishProduction: decimal("fish_production", { precision: 10, scale: 2 }),
  fingerlingNumber: integer("fingerling_number"),
  totalInvestment: decimal("total_investment", { precision: 10, scale: 2 }),
  annualIncome: decimal("annual_income", { precision: 10, scale: 2 }),
  employmentCount: integer("employment_count"),

  // Apiculture Information
  apicultureWardNo: integer("apiculture_ward_no"),
  hiveCount: integer("hive_count"),
  honeyProduction: decimal("honey_production", { precision: 10, scale: 2 }),
  hasApiculture: boolean("has_apiculture"),
});

// Table for building edit requests
export const businessEditRequests = pgTable(
  "buddhashanti_business_edit_requests",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    businessId: varchar("business_id", { length: 48 }).references(
      () => business.id,
    ),
    message: text("message").notNull(),
    requestedAt: timestamp("requested_at").defaultNow(),
  },
);

export type BusinessEditRequest = typeof businessEditRequests.$inferSelect;

export type StagingBusiness = typeof stagingBusiness.$inferSelect;
export type BusinessSchema = typeof business.$inferSelect;
