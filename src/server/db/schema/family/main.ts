import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { geometry } from "../../geographical";

const buddhashantiFamilyTable = pgTable("buddhashanti_family", {
  id: text("id").primaryKey().notNull(),
  tenantId: text("tenant_id").default("buddhashanti"),
  deviceId: text("device_id"),

  // Enumerator Information
  enumeratorName: text("enumerator_name"),
  enumeratorPhone: text("enumerator_phone"),
  enumeratorId: text("enumerator_id"),
  buildingToken: text("building_token"),

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
  waterSource: text("water_source"),
  waterSourceOther: text("water_source_other"),
  waterPurificationMethods: text("water_purification_methods"),
  toiletType: text("toilet_type"),
  solidWaste: text("solid_waste"),
  solidWasteOther: text("solid_waste_other"),

  // Energy and Facilities
  primaryCookingFuel: text("primary_cooking_fuel"),
  primaryEnergySource: text("primary_energy_source"),
  primaryEnergySourceOther: text("primary_energy_source_other"),
  facilities: text("facilities"),

  // Economic Details
  femaleProperties: text("female_properties"),
  loanedOrganizations: text("loaned_organizations"),
  loanUse: text("loan_use"),
  hasBank: text("has_bank"),
  hasInsurance: text("has_insurance"),
  healthOrg: text("health_org"),
  healthOrgOther: text("health_org_other"),
  incomeSources: text("income_sources"),
  municipalSuggestions: text("municipal_suggestions"),
  municipalSuggestionsOther: text("municipal_suggestions_other"),

  // History Information
  caste: text("caste"),
  casteOther: text("caste_other"),
  ancestrialLanguage: text("ancestrial_language"),
  ancestrialLanguageOther: text("ancestrial_language_other"),
  motherTonguePrimary: text("mother_tongue_primary"),
  motherTonguePrimaryOther: text("mother_tongue_primary_other"),
  religion: text("religion"),
  religionOther: text("religion_other"),

  // Additional Data
  hasRemittance: boolean("has_remittance"),
  remittanceExpenses: text("remittance_expenses"),

  // System Fields
  submissionDate: timestamp("submission_date"),
  updatedAt: timestamp("updated_at"),
  submitterId: text("submitter_id"),
  submitterName: text("submitter_name"),
  attachmentsPresent: integer("attachments_present"),
  attachmentsExpected: integer("attachments_expected"),
  status: text("status"),
  reviewState: text("review_state"),
  formVersion: text("form_version"),
});

export default buddhashantiFamilyTable;
