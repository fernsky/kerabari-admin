import {
  pgTable,
  text,
  integer,
  boolean,
  varchar,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";
import { geometry } from "../../geographical";
import { areas, users, wards } from "../basic";
import { buildingTokens } from "../building";

export const stagingFamily = pgTable("staging_buddhashanti_family", {
  id: text("id").primaryKey().notNull(),

  // Enumerator Information
  enumeratorName: text("enumerator_name"),
  enumeratorPhone: text("enumerator_phone"),
  enumeratorId: text("enumerator_id"),
  buildingToken: text("building_token"),
  surveyDate: text("survey_date"),

  // Location Details
  wardNo: integer("ward_no").notNull(),
  areaCode: text("area_code"),
  locality: text("locality"),
  devOrg: text("dev_org"),
  gps: geometry("gps", { type: "Point" }),
  altitude: decimal("altitude"),
  gpsAccuracy: decimal("gps_accuracy"),

  // Family Details
  headName: text("head_name"),
  headPhone: text("head_phone"),
  totalMembers: integer("total_members"),
  isSanitized: text("is_sanitized"),

  // House Details
  houseOwnership: text("house_ownership"),
  houseOwnershipOther: text("house_ownership_other"),
  feelsSafe: boolean("feels_safe"),
  waterSource: text("water_source").array(),
  waterSourceOther: text("water_source_other"),
  waterPurificationMethods: text("water_purification_methods").array(),
  toiletType: text("toilet_type"),
  solidWaste: text("solid_waste"),
  solidWasteOther: text("solid_waste_other"),

  // Energy and Facilities
  primaryCookingFuel: text("primary_cooking_fuel"),
  primaryEnergySource: text("primary_energy_source"),
  primaryEnergySourceOther: text("primary_energy_source_other"),
  facilities: text("facilities").array(),

  // Economic Details
  femaleProperties: text("female_properties"),
  loanedOrganizations: text("loaned_organizations").array(),
  loanUse: text("loan_use").array(),
  hasBank: text("has_bank"),
  hasInsurance: text("has_insurance"),
  healthOrg: text("health_org"),
  healthOrgOther: text("health_org_other"),
  incomeSources: text("income_sources").array(),
  municipalSuggestions: text("municipal_suggestions").array(),
  municipalSuggestionsOther: text("municipal_suggestions_other"),

  // Additional Data
  hasRemittance: boolean("has_remittance"),
  remittanceExpenses: text("remittance_expenses").array(),
});

export const familyStatusEnum = pgEnum("family_status_enum", [
  "approved",
  "pending",
  "requested_for_edit",
  "rejected",
]);

export const family = pgTable("buddhashanti_family", {
  id: text("id").primaryKey().notNull(),
  tenantId: text("tenant_id").default("buddhashanti"),
  deviceId: text("device_id"),

  // Enumerator Information
  enumeratorName: text("enumerator_name"),
  enumeratorPhone: text("enumerator_phone"),

  // Location Details
  wardNo: integer("ward_no").notNull(),
  areaCode: text("area_code"),
  houseTokenNumber: text("house_token_number"),
  familySymbolNo: text("family_symbol_no"),
  locality: text("locality"),
  devOrg: text("dev_org"),
  location: text("location"),
  geom: geometry("geom", { type: "Point" }),
  altitude: integer("altitude"),
  gpsAccuracy: integer("gps_accuracy"),

  // Family Details
  headName: text("head_name"),
  headPhone: text("head_phone"),
  totalMembers: integer("total_members"),
  isSanitized: boolean("is_sanitized"),

  // House Details
  houseOwnership: text("house_ownership"),
  houseOwnershipOther: text("house_ownership_other"),
  isHouseSafe: boolean("is_house_safe"),
  waterSource: text("water_source").array(),
  waterSourceOther: text("water_source_other"),
  waterPurificationMethods: text("water_purification_methods").array(),
  toiletType: text("toilet_type"),
  solidWaste: text("solid_waste"),
  solidWasteOther: text("solid_waste_other"),

  // Energy and Facilities
  primaryCookingFuel: text("primary_cooking_fuel"),
  primaryEnergySource: text("primary_energy_source"),
  primaryEnergySourceOther: text("primary_energy_source_other"),
  facilities: text("facilities").array(),

  // Economic Details
  femaleProperties: text("female_properties"),
  loanedOrganizations: text("loaned_organizations").array(),
  loanUse: text("loan_use"),
  hasBank: text("has_bank"),
  hasInsurance: text("has_insurance"),
  healthOrg: text("health_org"),
  healthOrgOther: text("health_org_other"),
  incomeSources: text("income_sources").array(),
  municipalSuggestions: text("municipal_suggestions"),
  municipalSuggestionsOther: text("municipal_suggestions_other"),

  // Additional Data
  hasRemittance: boolean("has_remittance"),
  remittanceExpenses: text("remittance_expenses").array(),

  // Foreign keys that satisfy the building constraints
  areaId: varchar("area_id", { length: 255 }).references(() => areas.id),
  enumeratorId: varchar("user_id", { length: 21 }).references(() => users.id),
  wardId: integer("ward_id").references(() => wards.wardNumber),
  buildingToken: varchar("building_token", { length: 255 }).references(
    () => buildingTokens.token,
  ),

  // Flags to identify the correctness of given input data
  isAreaValid: boolean("is_area_invalid").default(false),
  isWardValid: boolean("is_ward_invalid").default(false),
  isBuildingTokenValid: boolean("is_building_token_invalid").default(false),
  isEnumeratorValid: boolean("is_enumerator_invalid").default(false),

  status: familyStatusEnum("status").default("pending"),
});
