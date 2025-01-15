import { pgTable, varchar, integer, date, boolean } from "drizzle-orm/pg-core";

export const buildings = pgTable("buildings", {
  id: varchar("id", { length: 255 }).primaryKey(), // Unique identifier for the record
  surveyDate: date("survey_date"),
  enumerator: varchar("enumerator", { length: 255 }),

  // Location & general information
  areaCode: varchar("area_code", { length: 255 }),
  wardNumber: varchar("ward_number", { length: 255 }),
  locality: varchar("locality", { length: 255 }),

  // Family and business details
  totalFamilies: integer("total_families"),
  totalBusinesses: integer("total_businesses"),

  // Media (audio & images stored as bucket keys)
  surveyAudioRecording: varchar("survey_audio_recording", { length: 255 }),
  gps: varchar("gps", { length: 255 }),
  buildingImage: varchar("building_image", { length: 255 }),
  enumeratorSelfie: varchar("enumerator_selfie", { length: 255 }),

  // Building materials
  landOwnership: varchar("land_ownership", { length: 255 }), // e.g., Private, Public
  base: varchar("base", { length: 255 }),
  outerWall: varchar("outer_wall", { length: 255 }),
  roof: varchar("roof", { length: 255 }),
  floor: varchar("floor", { length: 255 }),

  // Map and disaster-related info
  mapStatus: varchar("map_status", { length: 255 }), // e.g., Passed, Pending
  naturalDisasters: varchar("natural_disasters", { length: 255 }), // e.g., Flood, Landslide

  // Accessibility
  timeToMarket: varchar("time_to_market", { length: 255 }), // e.g., Under 15 minutes
  timeToActiveRoad: varchar("time_to_active_road", { length: 255 }),
  timeToPublicBus: varchar("time_to_public_bus", { length: 255 }),
  timeToHealthOrganization: varchar("time_to_health_organization", {
    length: 255,
  }),
  timeToFinancialOrganization: varchar("time_to_financial_organization", {
    length: 255,
  }),
  roadStatus: varchar("road_status", { length: 255 }), // e.g., Graveled, Paved

  // Financial remittance
  acceptedRemittance: boolean("accepted_remittance"), // Yes/No
  remittanceExpenses: varchar("remittance_expenses", { length: 255 }), // e.g., Marriage, Education, Work
});
