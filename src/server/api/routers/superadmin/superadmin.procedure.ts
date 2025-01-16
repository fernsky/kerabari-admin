import { fetchSubmissionsSchema, surveyFormSchema } from "./superadmin.schema";
import { eq, and } from "drizzle-orm";
import { surveyForms } from "@/server/db/schema";
import { createTRPCRouter, superAdminProcedure } from "../../trpc";
import axios from "axios";
import dotenv from "dotenv";
import { FormAttachment } from "@/types";
import * as z from "zod";
import { fetchSurveySubmissions } from "@/server/utils";
import { updateSyncInterval } from "@/server/jobs";

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
  getSurveyForms: superAdminProcedure.query(async ({ ctx }) => {
    const allSurveyForms = await ctx.db.select().from(surveyForms);
    return allSurveyForms;
  }),

  /**
   * Retrieves a specific survey form by ID.
   *
   * @param {string} id - The ID of the survey form.
   * @returns {Promise<Object>} A promise that resolves to the survey form.
   */
  getForm: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db
        .select()
        .from(surveyForms)
        .where(eq(surveyForms.id, input.id))
        .limit(1);

      if (!form.length) {
        throw new Error("Survey form not found");
      }

      return form[0];
    }),

  /**
   * Creates a new survey form.
   *
   * @param {Object} input - The input data for the new survey form.
   * @returns {Promise<Object>} A promise that resolves to the newly created survey form.
   */
  createSurveyForm: superAdminProcedure
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
  updateSurveyForm: superAdminProcedure
    .input(surveyFormSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedSurveyForm = await ctx.db
        .update(surveyForms)
        .set(input)
        .where(eq(surveyForms.id, input.id))
        .returning();

      // Update job interval if updateInterval has changed
      if (input.updateInterval) {
        await updateSyncInterval(input.id, input.updateInterval);
      }

      return updatedSurveyForm;
    }),

  /**
   * Creates or updates a survey form based on whether the ID exists.
   *
   * @param {Object} input - The input data for creating/updating the survey form.
   * @returns {Promise<Object>} A promise that resolves to the created/updated survey form.
   */
  createOrUpdateResourceForm: superAdminProcedure
    .input(surveyFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if form exists
      const existingForm = await ctx.db
        .select()
        .from(surveyForms)
        .where(eq(surveyForms.id, input.id))
        .limit(1);

      if (existingForm.length === 0) {
        // Form doesn't exist, create new
        const newForm = await ctx.db
          .insert(surveyForms)
          .values(input)
          .returning();

        // Set up initial job interval
        if (input.updateInterval) {
          await updateSyncInterval(input.id, input.updateInterval);
        }

        return newForm[0];
      } else {
        // Form exists, update it
        const updatedForm = await ctx.db
          .update(surveyForms)
          .set(input)
          .where(eq(surveyForms.id, input.id))
          .returning();

        // Update job interval if updateInterval has changed
        if (input.updateInterval) {
          await updateSyncInterval(input.id, input.updateInterval);
        }

        return updatedForm[0];
      }
    }),

  fetchSurveySubmissions: superAdminProcedure
    .input(fetchSubmissionsSchema)
    .mutation(async ({ ctx, input }) => {
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

      await fetchSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as FormAttachment[],
          formId: input.id,
          startDate: input.startDate,
          endDate: input.endDate,
          count: input.count,
        },
        ctx,
      );
    }),
});
