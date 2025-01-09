import { fetchSubmissionsSchema, surveyFormSchema } from "./superadmin.schema";
import { eq } from "drizzle-orm";
import { surveyAttachments, surveyData, surveyForms } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import axios from "axios";
import dotenv from "dotenv";
import { FormAttachment } from "@/types";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

/**
 * Router for superadmin procedures related to survey forms.
 */
export const superadminRouter = createTRPCRouter({
  /**
   * Retrieves all survey forms.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of all survey forms.
   */
  getSurveyForms: protectedProcedure.query(async ({ ctx }) => {
    const allSurveyForms = await ctx.db.select().from(surveyForms);
    return allSurveyForms;
  }),

  /**
   * Creates a new survey form.
   *
   * @param {Object} input - The input data for the new survey form.
   * @returns {Promise<Object>} A promise that resolves to the newly created survey form.
   */
  createSurveyForm: protectedProcedure
    .input(surveyFormSchema)
    .mutation(async ({ ctx, input }) => {
      const newSurveyForm = await ctx.db
        .insert(surveyForms)
        .values(input)
        .returning();
      return newSurveyForm;
    }),

  /**
   * Updates an existing survey form.
   *
   * @param {Object} input - The input data for updating the survey form.
   * @returns {Promise<Object>} A promise that resolves to the updated survey form.
   */
  updateSurveyForm: protectedProcedure
    .input(surveyFormSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedSurveyForm = await ctx.db
        .update(surveyForms)
        .set(input)
        .where(eq(surveyForms.id, input.id))
        .returning();
      return updatedSurveyForm;
    }),

  fetchSurveySubmissions: protectedProcedure
    .input(fetchSubmissionsSchema)
    .mutation(async ({ ctx, input }) => {
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

      // For some field like 'id.name.first_name', get the value from the initial object
      /*
        {
            id : {
                name: {
                    first_name: 
                }
            }
        }
        Get the value at first_name by passing this object.
    */
      const getValueFromNestedField = (data: any, fieldPath: string): any => {
        return fieldPath.split(".").reduce((acc, part) => {
          if (acc === undefined || acc === null) return undefined;

          // Check if the part includes an array index
          const arrayIndexMatch = part.match(/(\w+)\[(\d+)\]/);

          if (arrayIndexMatch) {
            const [, property, index] = arrayIndexMatch;
            return acc[property][parseInt(index, 10)];
          }
          return acc[part];
        }, data);
      };

      // Fetch the username, password, form url, site url based on input
      const surveyForm = await ctx.db
        .select()
        .from(surveyForms)
        .where(eq(surveyForms.id, input.id))
        .limit(1);

      if (!surveyForm.length) {
        throw new Error("Survey form not found");
      }

      const {
        userName,
        password,
        odkFormId,
        odkProjectId,
        siteEndpoint,
        attachmentPaths,
      } = surveyForm[0];
      const { startDate, endDate, count } = input;

      // First get the token
      const token = getODKToken(
        siteEndpoint as string,
        userName as string,
        password as string,
      );

      // Set up the default start and end dates, one day apart from today's date
      const today = new Date();
      const defaultStartDate = new Date(today);
      defaultStartDate.setDate(today.getDate() - 1);
      const defaultEndDate = new Date(today);

      // Set up the query params
      const queryParams = {
        $top: count ?? 100,
        $skip: 0,
        $expand: "*",
        $count: true,
        $wkt: true,
        $filter: `__system/submissionDate ge ${startDate ?? defaultStartDate.toISOString()} and __system/submissionDate le ${endDate ?? defaultEndDate.toISOString()}`,
      };

      try {
        const queryString = Object.entries(queryParams)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&");
        const response = await axios.get(
          `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}.svc/Submissions?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${await token}`,
            },
          },
        );
        const submissions = response.data.value;
        for (let submission of submissions) {
          await ctx.db.insert(surveyData).values({
            id: submission.__id,
            formId: input.id,
            data: submission,
          });

          if (attachmentPaths) {
            for (let attachmentPath of attachmentPaths as FormAttachment[]) {
              const attachmentName = getValueFromNestedField(
                submission,
                attachmentPath.path,
              );
              const attachmentUrl = `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}/submissions/${submission.__id}/attachments/${attachmentName}`;
              const attachment = await axios.get(attachmentUrl, {
                headers: {
                  Authorization: `Bearer ${await token}`,
                },
              });

              if (!process.env.BUCKET_NAME)
                throw new Error("Bucket name not found");

              await ctx.minio.putObject(
                process.env.BUCKET_NAME,
                attachmentName,
                attachment.data,
              );

              await ctx.db.insert(surveyAttachments).values({
                id: uuidv4(),
                dataId: submission.__id,
                type: attachmentPath.type,
                name: attachmentName,
              });
            }
          }
        }
      } catch (error) {
        throw new Error(`Failed to get submissions: ${(error as any).message}`);
      }
    }),
});
