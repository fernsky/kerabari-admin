import { jsonToPostgres } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { RawFamily } from "./family/types";
import { processGPSData } from "../utils";
import {
  decodeMultipleChoices,
  decodeSingleChoice,
} from "@/lib/resources/utils";
import { familyChoices } from "@/lib/resources/family";

/**
 * Parses raw family survey data into normalized database structure
 *
 * @param r - Raw family data from ODK
 * @returns Normalized family data matching database schema
 */
export async function parseAndInsertInStaging(r: RawFamily, ctx: any) {
  try {
    // Process GPS data
    const gpsData = processGPSData(r.id.tmp_location);

    try {
      const mainFamilyTable = {
        // Unique Identifier
        id: r.__id,

        // Enumerator Information
        enumerator_name: r.enumerator_introduction.enumerator_name,
        enumerator_phone: r.enumerator_introduction.enumerator_phone,
        enumerator_id: r.enumerator_introduction.enumerator_id,
        building_token: r.enumerator_introduction.building_token,

        // Location Details
        ward_no: r.id.ward_no,
        area_code: r.id.area_code,
        house_token_number: r.id.house_token_number,
        family_symbol_no: r.id.fam_symno,
        locality: r.id.locality,
        dev_org: r.id.dev_org,
        gps: gpsData.gps,
        altitude: gpsData.altitude,
        gps_accuracy: gpsData.gpsAccuracy,

        // Family Basic Information
        head_name: r.id.head_name,
        head_phone: r.id.head_ph,
        total_members: r.id.members.total_mem,
        is_sanitized: r.id.members.is_sanitized === "yes",

        // House Details
        house_ownership: decodeSingleChoice(
          r.hh.h_oship,
          familyChoices.house_ownership,
        ),
        house_ownership_other: r.hh.h_oship_oth,
        is_house_safe: r.hh.is_safe === "yes",
        water_source: decodeMultipleChoices(
          r.hh.wsrc,
          familyChoices.drinking_water_source,
        ),
        water_source_other: r.hh.water_src_oth,
        water_purification_methods: decodeMultipleChoices(
          r.hh.water_puri,
          familyChoices.water_purification,
        ),
        toilet_type: decodeSingleChoice(
          r.hh.toilet_type,
          familyChoices.toilet_type,
        ),
        solid_waste: decodeSingleChoice(
          r.hh.solid_waste,
          familyChoices.solid_waste,
        ),
        solid_waste_other: r.hh.solid_waste_oth,

        // Energy and Facilities
        primary_cooking_fuel: decodeSingleChoice(
          r.hh.primary_cf,
          familyChoices.cooking_fuel,
        ),
        primary_energy_source: decodeSingleChoice(
          r.hh.primary_es,
          familyChoices.energy_source,
        ),
        primary_energy_source_other: r.hh.primary_es_oth,
        facilities: decodeMultipleChoices(
          r.hh.facilitites,
          familyChoices.facilities,
        ),

        // Economic Details
        female_properties: decodeSingleChoice(
          r.hh.fem_prop,
          familyChoices.elsewhere_properties,
        ),
        loaned_organizations: decodeMultipleChoices(
          r.hh.loaned_organization,
          familyChoices.financial_organization,
        ),
        loan_use: decodeMultipleChoices(r.hh.loan_use, familyChoices.loan_use),
        has_bank: decodeMultipleChoices(
          r.hh.has_bacc,
          familyChoices.financial_organization,
        ),
        has_insurance: r.hh.has_insurance,
        health_org: decodeSingleChoice(
          r.hh.health_org,
          familyChoices.health_organization,
        ),
        health_org_other: r.hh.heatlth_org_oth,
        income_sources: decodeMultipleChoices(
          r.hh.income_sources,
          familyChoices.income_sources,
        ),
        municipal_suggestions: decodeMultipleChoices(
          r.hh.municipal_suggestions,
          familyChoices.municipal_suggestions,
        ),
        municipal_suggestions_other: r.hh.municipal_suggestions_oth,

        // History Information
        caste: decodeSingleChoice(
          r.family_history_info.caste,
          familyChoices.castes,
        ),
        caste_other: r.family_history_info.caste_oth,
        ancestrial_language: decodeSingleChoice(
          r.family_history_info.ancestrial_lang,
          familyChoices.languages,
        ),
        ancestrial_language_other: r.family_history_info.ancestrial_lang_oth,
        mother_tongue_primary: decodeSingleChoice(
          r.family_history_info.mother_tounge_primary,
          familyChoices.languages,
        ),
        mother_tongue_primary_other:
          r.family_history_info.mother_tounge_primary_oth,
        religion: decodeSingleChoice(
          r.family_history_info.religion,
          familyChoices.religions,
        ),
        religion_other: r.family_history_info.religion_other,

        // Additional Data
        has_remittance: r.has_remittance === "yes",
        remittance_expenses: decodeMultipleChoices(
          r.remittance_expenses,
          familyChoices.remittance_expenses,
        ),

        // System Fields
        submission_date: r.__system.submissionDate,
        submitter_id: r.__system.submitterId,
        submitter_name: r.__system.submitterName,
        attachments_present: r.__system.attachmentsPresent,
        attachments_expected: r.__system.attachmentsExpected,
        status: r.__system.status,
        review_state: r.__system.reviewState,
        form_version: r.__system.formVersion,
      };

      try {
        const mainStatement = jsonToPostgres(
          "staging_buddhashanti_family",
          mainFamilyTable,
        );
        if (mainStatement) {
          await ctx.db.execute(sql.raw(mainStatement));
        }

        // Parse and insert individuals
        if (r.individual && r.individual.length > 0) {
          for (const i of r.individual) {
            const individual = {
              id: i.__id,
              parent_id: r.__id,
              ward_no: r.id.ward_no,
              tenant_id: "buddhashanti",
              device_id: r.__system.deviceId,
              name: i.name,
              gender: decodeSingleChoice(i.gender, familyChoices.genders),
              age: i.age,
              family_role: decodeSingleChoice(
                i.fam_role,
                familyChoices.family_role,
              ),
              citizen_of: decodeSingleChoice(
                i.citizenof,
                familyChoices.local_countries,
              ),
              citizen_of_other: i.citizenof_oth,
              caste: decodeSingleChoice(i.caste, familyChoices.castes),
              caste_other: i.caste_oth,
              ancestor_language: decodeSingleChoice(
                i.ancestrial_lang,
                familyChoices.languages,
              ),
              ancestor_language_other: i.ancestrial_lang_oth,
              primary_mother_tongue: decodeSingleChoice(
                i.mother_tounge_primary,
                familyChoices.languages,
              ),
              primary_mother_tongue_other: i.mother_tounge_primary_oth,
              religion: decodeSingleChoice(i.religion, familyChoices.religions),
              religion_other: i.religion_other,
            };

            // Add marriage details if applicable
            if (i.age >= 10) {
              individual.marital_status = decodeSingleChoice(
                i.mrd.marital_status,
                familyChoices.marital_status,
              );
              if (i.mrd.marital_status !== "1") {
                individual.married_age = i.mrd.married_age;
              }
            }

            // Add health details if available
            if (r.health?.length > 0) {
              const healthRecord = r.health.find(
                (j) =>
                  i.name === j.health_name && i.age === parseInt(j.health_age),
              );
              if (healthRecord) {
                individual.has_chronic_disease = decodeSingleChoice(
                  healthRecord.chronic.has_chronic_disease,
                  familyChoices.true_false,
                );
                if (healthRecord.chronic.has_chronic_disease === "yes") {
                  individual.primary_chronic_disease = decodeSingleChoice(
                    healthRecord.chronic.primary_chronic_disease,
                    familyChoices.chronic_diseases,
                  );
                }
                individual.is_sanitized = decodeSingleChoice(
                  healthRecord.is_sanitized,
                  familyChoices.true_false,
                );
                individual.is_disabled = decodeSingleChoice(
                  healthRecord.is_disabled,
                  familyChoices.true_false,
                );
                if (healthRecord.is_disabled === "yes") {
                  individual.disability_type = decodeSingleChoice(
                    healthRecord.disability.disability_type,
                    familyChoices.disability_types,
                  );
                  individual.disability_cause = decodeSingleChoice(
                    healthRecord.disability.disability_cause,
                    familyChoices.disability_causes,
                  );
                }
              }
            }

            // Add fertility details if applicable
            if (r.fertility?.length > 0) {
              const fertilityRecord = r.fertility.find(
                (j) =>
                  i.name === j.fertility_name &&
                  i.age === parseInt(j.fertility_age),
              );
              if (fertilityRecord?.ftd) {
                individual.gave_live_birth = decodeSingleChoice(
                  fertilityRecord.ftd.gave_live_birth,
                  familyChoices.true_false,
                );
                if (fertilityRecord.ftd.gave_live_birth === "yes") {
                  individual.alive_sons = fertilityRecord.ftd.alive_sons;
                  individual.alive_daughters =
                    fertilityRecord.ftd.alive_daughters;
                  individual.total_born_children =
                    fertilityRecord.ftd.total_born_children;
                }
              }
            }

            // Add education details if applicable
            if (r.education?.length > 0) {
              const educationRecord = r.education.find(
                (j) => j.edu_name === i.name && parseInt(j.edu_age) === i.age,
              );
              if (educationRecord) {
                individual.literacy_status = decodeSingleChoice(
                  educationRecord.edd.is_literate,
                  familyChoices.literacy_status,
                );
                individual.educational_level = decodeSingleChoice(
                  educationRecord.edd.edu_level,
                  familyChoices.educational_level,
                );
                individual.goes_school = decodeSingleChoice(
                  educationRecord.goes_school,
                  familyChoices.true_false,
                );
              }
            }

            // Insert individual into staging
            try {
              const individualStatement = jsonToPostgres(
                "staging_buddhashanti_individual",
                individual,
                "ON CONFLICT(id) DO UPDATE SET",
              );
              if (individualStatement) {
                await ctx.db.execute(sql.raw(individualStatement));
              }
            } catch (error) {
              console.error(`Error inserting individual ${i.name}:`, error);
            }
          }
        }

        // ... continue with other data insertions ...
      } catch (error) {
        console.error("Error processing family data:", error);
        throw new Error(`Failed to process family data: ${error}`);
      }

      // Insert related data for individual, death, crops etc
      // Similar to how it's done in parse-business.ts
      // Add implementation for other related tables here...
    } catch (error) {
      console.error("Error processing family data:", error);
      throw new Error(`Failed to process family data: ${error}`);
    }
  } catch (error) {
    console.error("Fatal error in parseAndInsertInStaging:", error);
    throw new Error(`Fatal error in family data processing: ${error}`);
  }
}
