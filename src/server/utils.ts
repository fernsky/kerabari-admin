import { FormAttachment } from "@/types";
import axios from "axios";
import { and, eq, sql } from "drizzle-orm";
import {
  surveyData,
  surveyAttachments,
  attachmentTypesEnum,
  stagingToProduction,
  areas,
  buildingTokens,
  buildings,
  users,
} from "./db/schema";
import { parseBuilding } from "@/lib/parser/buddhashanti/parse-buildings";

const getODKToken = async (
  siteUrl: string,
  username: string,
  password: string,
) => {
  try {
    const response = await axios.post(`${siteUrl}/v1/sessions`, {
      email: username,
      password: password,
    });
    return response.data.token;
  } catch (error) {
    console.error("Error fetching ODK token:", error);
    throw new Error("Failed to fetch ODK token");
  }
};

const getValueFromNestedField = (data: any, fieldPath: string): any => {
  return fieldPath.split(".").reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;

    const arrayIndexMatch = part.match(/(\w+)\[(\d+)\]/);

    if (arrayIndexMatch) {
      const [, property, index] = arrayIndexMatch;
      return acc[property][parseInt(index, 10)];
    }
    return acc[part];
  }, data);
};

const getPostgresInsertStatement = (formId: string, data: any) => {
  switch (formId) {
    case "buddhashanti_building_survey":
      return parseBuilding(data);
  }
  return null;
};

/**
 * Synchronizes data from staging to production tables based on the form type.
 * Currently supports the 'buddhashanti_building_survey' form type.
 *
 * @param formId - The identifier of the form type being synchronized
 * @param recordId - The unique identifier of the record being synchronized
 * @param data - The form data object containing survey information
 * @param ctx - The context object containing database connection and execution methods
 *
 * For buddhashanti_building_survey:
 * - Executes building-specific staging to production SQL statements
 * - Updates the user ID in buildings table by matching enumerator ID patterns
 * - Uses first 8 characters of IDs for matching users
 *
 * @remarks
 * The function expects the context object to have a db property with an execute method
 * for running SQL statements.
 *
 * @throws May throw database errors if SQL execution fails
 *
 * @example
 * await syncStagingToProduction(
 *   "buddhashanti_building_survey",
 *   "record123",
 *   { enumerator_id: "USER123" },
 *   context
 * );
 */
const syncStagingToProduction = async (
  formId: string,
  recordId: string,
  data: any,
  ctx: any,
) => {
  try {
    switch (formId) {
      case "buddhashanti_building_survey":
        const areaCode = getValueFromNestedField(data, "area_code");
        const buildingToken = getValueFromNestedField(data, "building_token");

        // Update user statement
        const enumeratorId = getValueFromNestedField(data, "enumerator_id");
        if (!enumeratorId) {
          throw new Error(`No enumerator_id found for record ${recordId}`);
        }

        const enumerator = await ctx.db
          .select()
          .from(users)
          .where(
            eq(
              sql`UPPER(SUBSTRING(${users.id}::text, 1, 8))`,
              enumeratorId.substring(0, 8).toUpperCase(),
            ),
          )
          .limit(1);

        // If enumerator ID is not valid, user_id is NULL
        // and hence those records where user_id is NULL
        // are known as invalid records.
        // Such invalid records must be assigned to a particular
        // enumerator manually by the admin.

        // if (!enumerator || enumerator.length === 0) {
        //   throw new Error(`No valid enumerator ID ${enumeratorId}`);
        // }

        /*
      First check if the enumerator is assigned to that particular areaCode
      If he/she is assigned to that particular area code, and if the status
      of that area is newly_assigned convert it to ongoing_survey else do nothing
      */
        const area = await ctx.db
          .select({
            id: areas.id,
            code: areas.code,
            status: areas.areaStatus,
            assignedTo: areas.assignedTo,
          })
          .from(areas)
          .where(and(eq(areas.assignedTo, enumerator[0].id)))
          .limit(1);

        if (area.length > 0) {
          if (
            area[0].code === areaCode &&
            area[0].status === "newly_assigned"
          ) {
            await ctx.db
              .update(areas)
              .set({ status: "ongoing_survey" })
              .where(eq(areas.code, areaCode));
          }
        }

        /* 
      Now mark the building token as allocated if the uppercased first 8 
      letters match.
       */
        const matchedToken = await ctx.db
          .select()
          .from(buildingTokens)
          .where(
            eq(
              sql`UPPER(SUBSTRING(${buildingTokens.token}, 1, 8))`,
              buildingToken.substring(0, 8).toUpperCase(),
            ),
          )
          .limit(1);

        if (matchedToken.length > 0) {
          console.log("Token matched: ", matchedToken[0].token);
          await ctx.db
            .update(buildingTokens)
            .set({
              status: "allocated",
              token: buildingToken, // Update with actual full token
            })
            .where(eq(buildingTokens.token, matchedToken[0].token));
        }

        try {
          // First statement: Insert into buildings
          const insertStatement = sql.raw(`
            INSERT INTO buddhashanti_buildings (
              id,
              survey_date,
              enumerator_name,
              enumerator_id,
              area_code,
              ward_number,
              locality,
              total_families, 
              total_businesses,
              survey_audio_recording,
              gps,
              altitude,
              gps_accuracy,
              building_image,
              enumerator_selfie,
              land_ownership,
              base,
              outer_wall,
              roof,
              floor,
              map_status,
              natural_disasters,
              time_to_market,
              time_to_active_road,
              time_to_public_bus,
              time_to_health_organization,
              time_to_financial_organization,
              road_status
            )
            SELECT 
              id::UUID,
              survey_date,
              enumerator_name,
              enumerator_id,
              area_code,
              ward_number,
              locality,
              total_families,
              total_businesses,
              survey_audio_recording,
              gps,
              altitude,
              gps_accuracy,
              building_image,
              enumerator_selfie,
              land_ownership,
              base,
              outer_wall,
              roof,
              floor,
              map_status,
              natural_disasters,
              time_to_market,
              time_to_active_road,
              time_to_public_bus,
              time_to_health_organization,
              time_to_financial_organization,
              road_status
            FROM staging_buddhashanti_buildings 
            WHERE id = '${recordId.replace("uuid:", "")}'
            ON CONFLICT (id) DO NOTHING`);
          await ctx.db.execute(insertStatement);

          console.log("Length of area: ", area.length);
          if (area.length > 0) {
            await ctx.db
              .update(buildings)
              .set({ areaId: area[0].id })
              .where(eq(buildings.id, recordId.replace("uuid:", "")));
          } else {
            await ctx.db
              .update(buildings)
              .set({ areaId: null })
              .where(eq(buildings.id, recordId.replace("uuid:", "")));
          }

          // First check if the token belongs to the area
          const validToken = await ctx.db
            .select()
            .from(buildingTokens)
            .where(
              and(
                eq(buildingTokens.areaId, area[0]?.id),
                eq(
                  sql`UPPER(SUBSTRING(${buildingTokens.token}, 1, 8))`,
                  buildingToken.substring(0, 8).toUpperCase(),
                ),
              ),
            )
            .limit(1);

          console.log(buildingToken);

          // Validate building token
          if (validToken.length > 0) {
            console.log(validToken[0].token);
            await ctx.db
              .update(buildings)
              .set({
                buildingToken: validToken[0].token,
              })
              .where(eq(buildings.id, recordId.replace("uuid:", "")));
          } else {
            await ctx.db
              .update(buildings)
              .set({
                buildingToken: "none",
              })
              .where(eq(buildings.id, recordId.replace("uuid:", "")));
            throw new Error(
              `Building token ${buildingToken} does not belong to area ${area[0]?.id}`,
            );
          }
        } catch (error) {
          console.error(
            `Error in buildings insert for record ${recordId}:`,
            error,
          );
          throw error;
        }

        try {
          // Second statement: Insert into staging_to_production
          const trackingStatement = sql`
            INSERT INTO ${stagingToProduction} (staging_table, production_table, record_id)
            VALUES ('staging_buddhashanti_buildings', 'buddhashanti_buildings', ${recordId})`;
          await ctx.db.execute(trackingStatement);
        } catch (error) {
          console.error(
            `Error in staging_to_production insert for record ${recordId}:`,
            error,
          );
          throw error;
        }

        try {
          await ctx.db
            .update(buildings)
            .set({ userId: enumerator[0].id })
            .where(eq(buildings.id, recordId.replace("uuid:", "")));

          console.log("User updated successfully.");
        } catch (error) {
          console.error(`Error in user update for record ${recordId}:`, error);
          throw error;
        }

        break;
      default:
        throw new Error(`Unknown form type: ${formId}`);
    }
  } catch (error) {
    console.error(
      `Failed to sync record ${recordId} from staging to production:`,
      error,
    );
    throw error;
  }
};

const performPostProcessing = async (formId: string, data: any, ctx: any) => {
  switch (formId) {
    case "buddhashanti_building_survey":
  }
};

/**
 * Fetches survey submissions from ODK.
 *
 * @param {Object} params - The parameters for fetching survey submissions.
 * @param {string} params.siteEndpoint - The site endpoint URL.
 * @param {string} params.userName - The username for authentication.
 * @param {string} params.password - The password for authentication.
 * @param {string} params.odkFormId - The ODK form ID.
 * @param {number} params.odkProjectId - The ODK project ID.
 * @param {Array} params.attachmentPaths - The attachment paths.
 * @param {string} params.formId - The form ID.
 * @param {string} [params.startDate] - The start date for fetching submissions.
 * @param {string} [params.endDate] - The end date for fetching submissions.
 * @param {number} [params.count] - The number of submissions to fetch.
 * @param {Object} ctx - The context object.
 * @returns {Promise<void>} A promise that resolves when the submissions are fetched.
 */
export const fetchSurveySubmissions = async (
  {
    siteEndpoint,
    userName,
    password,
    odkFormId,
    odkProjectId,
    attachmentPaths,
    formId,
    startDate,
    endDate,
    count,
  }: {
    siteEndpoint: string;
    userName: string;
    password: string;
    odkFormId: string;
    odkProjectId: number;
    attachmentPaths: FormAttachment[];
    formId: string;
    startDate?: string;
    endDate?: string;
    count?: number;
  },
  ctx: any,
) => {
  // Get authentication token from ODK server
  const token = await getODKToken(siteEndpoint, userName, password);

  // Set default date ranges if not provided
  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() - 1);
  const defaultEndDate = new Date(today);

  // Configure query parameters for ODK API
  const queryParams = {
    $top: count ?? 100, // Number of records to fetch, default 100
    $skip: 0, // Start from beginning
    $expand: "*", // Expand all relationships
    $count: true, // Include total count
    $wkt: false, // Don't use WKT format for geometries
    $filter: `__system/submissionDate ge ${startDate ?? defaultStartDate.toISOString()} and __system/submissionDate le ${endDate ?? defaultEndDate.toISOString()}`,
  };

  try {
    // Build query string from parameters
    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    // Fetch submissions from ODK API
    const response = await axios.get(
      `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}.svc/Submissions?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const submissions = response.data.value;

    // Process each submission
    for (let submission of submissions) {
      // Insert submission data into survey_data table
      await ctx.db
        .insert(surveyData)
        .values({
          id: submission.__id,
          formId: formId,
          data: submission,
        })
        .onConflictDoNothing();

      // Process attachments if any are specified
      if (attachmentPaths) {
        for (let attachmentPath of attachmentPaths) {
          // Get attachment name from submission data using path
          const attachmentName = getValueFromNestedField(
            submission,
            attachmentPath.path,
          );

          if (attachmentName) {
            // Check if attachment already exists in database
            const existingAttachment = await ctx.db
              .select()
              .from(surveyAttachments)
              .where(
                and(
                  eq(surveyAttachments.dataId, submission.__id),
                  eq(surveyAttachments.name, attachmentName),
                ),
              )
              .limit(1);

            // Generate and execute any form-specific database operations
            const insertStatement = getPostgresInsertStatement(
              formId,
              submission,
            );
            console.log(insertStatement);
            if (insertStatement) {
              await ctx.db.execute(sql.raw(insertStatement));
            }

            const productionInsert = await ctx.db
              .select()
              .from(stagingToProduction)
              .where(eq(stagingToProduction.recordId, submission.__id))
              .limit(1);

            if (productionInsert.length === 0) {
              await syncStagingToProduction(
                formId,
                submission.__id,
                submission,
                ctx,
              );
            }

            // Skip if attachment already exists
            if (existingAttachment.length > 0) {
              console.log(
                `Attachment ${attachmentName} for submission ${submission.__id} already exists in the database.`,
              );
              continue;
            }

            // Download attachment from ODK
            const attachmentUrl = `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}/submissions/${submission.__id}/attachments/${attachmentName}`;
            const attachment = await axios.get(attachmentUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              responseType: "arraybuffer",
            });

            // Validate bucket configuration
            if (!process.env.BUCKET_NAME)
              throw new Error("Bucket name not found");

            // Generate unique attachment name using last 7 digits of submission ID
            const lastSevenDigits = submission.__id.slice(-7);
            const newAttachmentName = `${lastSevenDigits}_${attachmentName}`;

            // Upload attachment to MinIO storage
            await ctx.minio.putObject(
              process.env.BUCKET_NAME,
              newAttachmentName,
              attachment.data,
            );

            // Record attachment in database
            await ctx.db
              .insert(surveyAttachments)
              .values({
                dataId: submission.__id,
                type: attachmentPath.type as (typeof attachmentTypesEnum.enumValues)[number],
                name: newAttachmentName,
              })
              .onConflictDoNothing();
          }
        }
      }
      performPostProcessing(formId, submission, ctx);
    }
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to get submissions: ${(error as any).message}`);
  }
};
