import { FormAttachment } from "@/types";
import axios from "axios";
import { and, eq, sql } from "drizzle-orm";
import {
  surveyData,
  surveyAttachments,
  attachmentTypesEnum,
  stagingToProduction,
} from "./db/schema";
import {
  getBuildingStagingToProdStatement,
  parseBuilding,
} from "@/lib/parser/buddhashanti/parse-buildings";

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

const getPostgresStagingProductionSyncStatement = (
  formId: string,
  recordId: string,
) => {
  switch (formId) {
    case "buddhashanti_building_survey":
      return getBuildingStagingToProdStatement(recordId);
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
              const syncStatement = getPostgresStagingProductionSyncStatement(
                formId,
                submission.__id,
              );
              if (syncStatement) {
                await ctx.db.execute(sql.raw(syncStatement));
              }
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
    }
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to get submissions: ${(error as any).message}`);
  }
};
