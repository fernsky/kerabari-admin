import {
  pgTable,
  timestamp,
  pgEnum,
  text,
  uuid,
  varchar,
  integer,
  geometry,
  boolean,
} from "drizzle-orm/pg-core";
import { buildings } from "../building";

export const stagingBusiness = pgTable("staging_buddhashanti_business", {
  id: uuid("id").primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id),
  businessName: text("business_name"),
  wardNo: integer("ward_no"),
  areaCode: varchar("area_code", { length: 255 }),
  businessNo: integer("business_no"),
  locality: varchar("locality", { length: 255 }),

  // Operator details
  operatorName: varchar("operator_name", { length: 255 }),
  operatorPhone: varchar("operator_phone", { length: 255 }),
  operatorAge: integer("operator_age"),
  operatorGender: varchar("operator_gender", { length: 50 }),
  operatorEducation: varchar("operator_education", { length: 100 }),

  // Business details
  businessNature: varchar("business_nature", { length: 255 }),
  isRegistered: varchar("is_registered", { length: 10 }),
  registeredBodies: text("registered_bodies").array(),
  hasPan: varchar("has_pan", { length: 10 }),
  panNo: varchar("pan_no", { length: 255 }),
  investment: integer("investment"),
  businessLocationOwnership: text("business_location_ownership"),

  // Employees
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

  // Location and media
  location: geometry("location", { type: "Point" }),
  businessImage: varchar("business_image", { length: 255 }),
  businessImageSelfie: varchar("business_image_selfie", { length: 255 }),
  audioMonitoring: varchar("audio_monitoring", { length: 255 }),
});

export const businessStatusEnum = pgEnum("business_status_enum", [
  "approved",
  "pending",
  "requested_for_edit",
  "rejected",
]);

export const business = pgTable("buddhashanti_business", {
  id: uuid("id").primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id),
  businessName: text("business_name"),
  wardNo: integer("ward_no"),
  areaCode: varchar("area_code", { length: 255 }),
  businessNo: integer("business_no"),
  locality: varchar("locality", { length: 255 }),

  // Operator details
  operatorName: varchar("operator_name", { length: 255 }),
  operatorPhone: varchar("operator_phone", { length: 255 }),
  operatorAge: integer("operator_age"),
  operatorGender: varchar("operator_gender", { length: 50 }),
  operatorEducation: varchar("operator_education", { length: 100 }),

  // Business details
  businessNature: varchar("business_nature", { length: 255 }),
  isRegistered: varchar("is_registered", { length: 10 }),
  registeredBodies: text("registered_bodies").array(),
  hasPan: varchar("has_pan", { length: 10 }),
  panNo: varchar("pan_no", { length: 255 }),
  investment: integer("investment"),
  businessLocationOwnership: text("business_location_ownership"),

  // Employees
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

  // Location and media
  location: geometry("location", { type: "Point" }),
  businessImage: varchar("business_image", { length: 255 }),
  businessImageSelfie: varchar("business_image_selfie", { length: 255 }),
  audioMonitoring: varchar("audio_monitoring", { length: 255 }),
  status: businessStatusEnum("status").default("pending"),
});

// Table for building edit requests
export const businessEditRequests = pgTable(
  "buddhashanti_business_edit_requests",
  {
    id: uuid("id").primaryKey(),
    businessId: uuid("business_id").references(() => business.id),
    message: text("message").notNull(),
    requestedAt: timestamp("requested_at").defaultNow(),
  },
);

export type BusinessEditRequest = typeof businessEditRequests.$inferSelect;

export type StagingBusiness = typeof stagingBusiness.$inferSelect;
export type BusinessSchema = typeof business.$inferSelect;
