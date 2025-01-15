import {
  pgTable,
  varchar,
  integer,
  timestamp,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { geometry } from "../geographical";

/*
We need to create two tables.
One to store the staging data that is parsed from the JSON given from ODK.
Another to store the actual data where modification happens.

This is done because, staging data is a subject to change on each reload and the actual
modification that happens should happen on the actual table.
There must be an option to Restore Survey Data while modifying in the actual buildings data.
*/

export const stagingBuildings = pgTable("staging_buddhashanti_buildings", {
  id: varchar("id", { length: 255 }).primaryKey(), // Unique identifier for the record
  surveyDate: timestamp("survey_date"),
  enumeratorName: varchar("enumerator_name", { length: 255 }),
  enumeratorId: varchar("enumerator_id", { length: 255 }),

  // Location & general information
  areaCode: varchar("area_code", { length: 255 }),
  wardNumber: integer("ward_number"),
  locality: varchar("locality", { length: 255 }),

  // Family and business details
  totalFamilies: integer("total_families"),
  totalBusinesses: integer("total_businesses"),

  // Media (audio & images stored as bucket keys)
  surveyAudioRecording: varchar("survey_audio_recording", { length: 255 }),
  gps: geometry("gps", { type: "Point" }),
  altitude: decimal("altitude"),
  gpsAccuracy: decimal("gps_accuracy"),
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
});

export const buildings = pgTable("buddhashanti_buildings", {
  id: varchar("id", { length: 255 }).primaryKey(), // Unique identifier for the record
  surveyDate: timestamp("survey_date"),
  enumeratorName: varchar("enumerator_name", { length: 255 }),
  enumeratorId: varchar("enumerator_id", { length: 255 }),

  // Location & general information
  areaCode: varchar("area_code", { length: 255 }),
  wardNumber: integer("ward_number"),
  locality: varchar("locality", { length: 255 }),

  // Family and business details
  totalFamilies: integer("total_families"),
  totalBusinesses: integer("total_businesses"),

  // Media (audio & images stored as bucket keys)
  surveyAudioRecording: varchar("survey_audio_recording", { length: 255 }),
  gps: geometry("gps", { type: "Point" }),
  altitude: decimal("altitude"),
  gpsAccuracy: decimal("gps_accuracy"),
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
});
